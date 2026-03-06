// import { useEffect, useRef, useState } from "react";
// import { startInterview, submitAnswer } from "../services/interviewApi";
// import { speak } from "../utils/speak";
// import { listen } from "../utils/listen";
// import { startLaptopCamera } from "../camera/laptopCamera";
// import { generatePairCode } from "../utils/generateQR";

// function Interview({ setPage, setResult }) {
//   const laptopVideoRef = useRef(null);
//   const mobileVideoRef = useRef(null); // 🔥 placeholder

//   const [sessionId, setSessionId] = useState(null);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");

//   const [pairCode] = useState(generatePairCode());
//   const [mobileConnected, setMobileConnected] = useState(false);

//   // ▶️ Start interview + laptop camera
//   useEffect(() => {
//     const start = async () => {
//       await startLaptopCamera(laptopVideoRef);

//       const res = await startInterview();
//       setSessionId(res.session_id);
//       setQuestion(res.question);
//       speak(res.question);
//     };
//     start();
//   }, []);

//   const handleSubmit = async () => {
//     if (!answer.trim()) return;

//     const res = await submitAnswer(sessionId, answer);
//     setAnswer("");

//     if (res.done) {
//       speak(
//         `Interview completed. ${res.final_verdict}. 
//          You scored ${res.score_percentage} percent.`
//       );
//       setResult(res);
//       setPage("result");
//       return;
//     }

//     setQuestion(res.next_question);
//     speak(res.next_question);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>AI Interview</h2>

//       {/* 🔥 MAIN CAMERA GRID */}
//       <div style={{ display: "flex", gap: "20px" }}>
//         {/* Laptop Camera */}
//         <div>
//           <h4>Front View (Laptop)</h4>
//           <video
//             ref={laptopVideoRef}
//             autoPlay
//             muted
//             style={{ width: "400px", borderRadius: "8px" }}
//           />
//         </div>

//         {/* Mobile Camera Placeholder */}
//         <div>
//           <h4>Side View (Mobile)</h4>
//           <div
//             style={{
//               width: "200px",
//               height: "150px",
//               border: "2px dashed gray",
//               borderRadius: "8px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "gray"
//             }}
//           >
//             {mobileConnected ? (
//               <video
//                 ref={mobileVideoRef}
//                 autoPlay
//                 muted
//                 style={{ width: "100%" }}
//               />
//             ) : (
//               "Waiting for mobile..."
//             )}
//           </div>
//         </div>
//       </div>

//       {/* 🔢 PAIRING CODE */}
//       <div style={{ marginTop: "15px" }}>
//         <h3>Connect Mobile Camera</h3>
//         <p>
//           Open <b>/mobile</b> on your phone and enter code:
//         </p>
//         <h1 style={{ letterSpacing: "4px" }}>{pairCode}</h1>
//         <p>Status: {mobileConnected ? "✅ Connected" : "❌ Not connected"}</p>
//       </div>

//       <hr />

//       {/* INTERVIEW SECTION */}
//       <h3>{question}</h3>

//       <button onClick={() => listen(setAnswer)}>
//         🎤 Speak Answer
//       </button>

//       <p><b>Captured:</b> {answer}</p>

//       <button onClick={handleSubmit}>
//         Submit
//       </button>
//     </div>
//   );
// }

// export default Interview;



import { useEffect, useRef, useState } from "react";
import { startInterview, submitAnswer } from "../services/interviewApi";
import { speak } from "../utils/speak";
import { listen } from "../utils/listen";
import { startLaptopCamera } from "../camera/laptopCamera";
import { generatePairCode } from "../utils/generateQR";
import { connectLaptop } from "../socket/laptopSocket";

function Interview({ setPage, setResult }) {

  const laptopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const peerRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [pairCode] = useState(generatePairCode());
  const [mobileConnected, setMobileConnected] = useState(false);

  const [cheatingScore, setCheatingScore] = useState(0);
  const [verdict, setVerdict] = useState("Clean");

  // ▶️ Start interview + laptop camera

useEffect(() => {

  const socket = connectLaptop(pairCode);

}, []);
  useEffect(() => {

    const start = async () => {

      await startLaptopCamera(laptopVideoRef);

      const res = await startInterview();
      setSessionId(res.session_id);
      setQuestion(res.question);
      speak(res.question);

      // connect websocket
      const socket = connectLaptop(pairCode, (data) => {
        setCheatingScore(data.score);
        setVerdict(data.verdict);
      });

      socket.onmessage = async (event) => {

        const msg = JSON.parse(event.data);

        // mobile joined
        if (msg.type === "mobile_joined") {
          setMobileConnected(true);

          peerRef.current = new RTCPeerConnection();

          peerRef.current.ontrack = (event) => {
            if (mobileVideoRef.current) {
              mobileVideoRef.current.srcObject = event.streams[0];
            }
          };

          peerRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              socket.send(JSON.stringify({
                type: "ice",
                code: pairCode,
                candidate: event.candidate
              }));
            }
          };

          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);

          socket.send(JSON.stringify({
            type: "offer",
            code: pairCode,
            offer
          }));
        }

        // answer from mobile
        if (msg.type === "answer") {
          await peerRef.current.setRemoteDescription(msg.answer);
        }

        // ice candidate
        if (msg.type === "ice") {
          await peerRef.current.addIceCandidate(msg.candidate);
        }
      };

    };

    start();

  }, [pairCode]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    const res = await submitAnswer(sessionId, answer);
    setAnswer("");

    if (res.done) {
      speak(
        `Interview completed. ${res.final_verdict}. 
        You scored ${res.score_percentage} percent.`
      );

      setResult(res);
      setPage("result");
      return;
    }

    setQuestion(res.next_question);
    speak(res.next_question);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Interview</h2>

      {/* CAMERA GRID */}
      <div style={{ display: "flex", gap: "20px" }}>

        <div>
          <h4>Front View (Laptop)</h4>
          <video
            ref={laptopVideoRef}
            autoPlay
            muted
            style={{ width: "400px", borderRadius: "8px" }}
          />
        </div>

        <div>
          <h4>Side View (Mobile)</h4>

          <div
            style={{
              width: "200px",
              height: "150px",
              border: "2px dashed gray",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "gray"
            }}
          >
            {mobileConnected ? (
              <video
                ref={mobileVideoRef}
                autoPlay
                muted
                style={{ width: "100%" }}
              />
            ) : (
              "Waiting for mobile..."
            )}
          </div>
        </div>

      </div>

      {/* PAIR CODE */}
      <div style={{ marginTop: "15px" }}>
        <h3>Connect Mobile Camera</h3>

        <p>
          Open <b>/mobile</b> on your phone and enter code:
        </p>

        <h1 style={{ letterSpacing: "4px" }}>
          {pairCode}
        </h1>

        <p>
          Status: {mobileConnected ? "✅ Connected" : "❌ Not connected"}
        </p>
      </div>

      {/* PROCTORING STATUS */}
      <div style={{ marginTop: "10px" }}>
        <h4>Proctoring Status</h4>
        <p>Score: {cheatingScore}</p>
        <p>Verdict: {verdict}</p>
      </div>

      <hr />

      <h3>{question}</h3>

      <button onClick={() => listen(setAnswer)}>
        🎤 Speak Answer
      </button>

      <p><b>Captured:</b> {answer}</p>

      <button onClick={handleSubmit}>
        Submit
      </button>

    </div>
  );
}

export default Interview;