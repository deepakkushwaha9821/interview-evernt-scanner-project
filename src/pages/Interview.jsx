// import { useEffect, useRef, useState } from "react";
// import { startInterview, submitAnswer } from "../services/interviewApi";
// import { speak } from "../utils/speak";
// import { listen } from "../utils/listen";
// import { startLaptopCamera } from "../camera/laptopCamera";

// function Interview({ setPage, setResult }) {
//   const videoRef = useRef(null);

//   const [started, setStarted] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [status, setStatus] = useState("idle");
//   // idle | asking | waiting | listening | verifying

//   // 🔐 Ask permissions once
//   const requestPermissions = async () => {
//     try {
//       await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true
//       });
//       return true;
//     } catch {
//       alert("Camera & microphone permission required");
//       return false;
//     }
//   };

//   // ▶️ Start Interview
//   const start = async () => {
//     const ok = await requestPermissions();
//     if (!ok) return;

//     setStarted(true);
//     setStatus("asking");

//     await startLaptopCamera(videoRef);

//     const res = await startInterview();
//     setSessionId(res.session_id);
//     setQuestion(res.question);

//     speak(res.question);

//     setStatus("waiting");
//   };

//   // 🎤 Speak Answer (USER ACTION)
//   const speakAnswer = () => {
//     setStatus("listening");
//     listen((text) => {
//       setAnswer(text);
//     });
//   };

//   // 🧠 Verify Answer when captured
//   useEffect(() => {
//     if (!answer || status !== "listening") return;

//     const verify = async () => {
//       setStatus("verifying");

//       const res = await submitAnswer(sessionId, answer);

//       // Interview finished
//       if (res.done) {
//         speak(
//           `Interview completed. ${res.final_verdict}. 
//            You scored ${res.score_percentage} percent. 
//            ${res.summary}`
//         );
//         setResult(res);
//         setPage("result");
//         return;
//       }

//       // Next question
//       setAnswer("");
//       setQuestion(res.next_question);

//       setStatus("asking");
//       speak(res.next_question);

//       setStatus("waiting");
//     };

//     verify();
//   }, [answer]);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>AI Interview</h2>

//       {/* Camera */}
//       {started && (
//         <video
//           ref={videoRef}
//           autoPlay
//           muted
//           style={{ width: "60%", borderRadius: "8px" }}
//         />
//       )}

//       {/* Start Button */}
//       {!started && (
//         <button onClick={start} style={{ fontSize: "18px" }}>
//           ▶️ Start Interview
//         </button>
//       )}

//       {/* Question */}
//       {started && (
//         <>
//           <h3 style={{ marginTop: "20px" }}>{question}</h3>

//           {/* Speak Button */}
//           {status === "waiting" && (
//             <button onClick={speakAnswer}>
//               🎤 Speak Answer
//             </button>
//           )}

//           {/* Captured Answer */}
//           {answer && (
//             <p>
//               <b>Your Answer:</b> {answer}
//             </p>
//           )}

//           {/* Status */}
//           <p>
//             {status === "asking" && "🗣️ Asking question..."}
//             {status === "waiting" && "🎧 Click Speak Answer and reply"}
//             {status === "listening" && "🎤 Listening..."}
//             {status === "verifying" && "🧠 Verifying answer..."}
//           </p>
//         </>
//       )}
//     </div>
//   );
// }

// export default Interview;
// import { useEffect, useState } from "react";
// import { startInterview, submitAnswer } from "../services/interviewApi";
// import { speak } from "../utils/speak";
// import { listen } from "../utils/listen";

// function Interview({ setPage, setResult }) {
//   const [sessionId, setSessionId] = useState(null);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // ▶️ Start interview
//   useEffect(() => {
//     const start = async () => {
//       const res = await startInterview();
//       setSessionId(res.session_id);
//       setQuestion(res.question);
//       speak(res.question);
//     };
//     start();
//   }, []);

//   // ▶️ Submit answer
//   const handleSubmit = async () => {
//     if (!answer.trim() || !sessionId) return;

//     setIsSubmitting(true);

//     try {
//       const res = await submitAnswer(sessionId, answer);
//       setAnswer("");

//       console.log("BACKEND RESPONSE:", res);

//       // 🟢 Interview finished
//       if (res.done === true) {
//         speak(
//           `Interview completed. ${res.final_verdict}. 
//            You scored ${res.score_percentage} percent. 
//            ${res.summary}`
//         );

//         setResult(res);
//         setPage("result");
//         return;
//       }

//       // 🟢 Next question
//       if (res.next_question) {
//         setQuestion(res.next_question);
//         speak(res.next_question);
//       }
//     } catch (err) {
//       console.error(err);
//       speak("Something went wrong.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div>
//       <h3>{question}</h3>

//       <button onClick={() => listen(setAnswer)}>
//         🎤 Speak Answer
//       </button>

//       <p><b>Captured:</b> {answer}</p>

//       <button onClick={handleSubmit} disabled={isSubmitting}>
//         {isSubmitting ? "Checking..." : "Submit"}
//       </button>
//     </div>
//   );
// }

// export default Interview;


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

function Interview({ setPage, setResult }) {
  const laptopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null); // 🔥 placeholder only

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [pairCode] = useState(generatePairCode());
  const [mobileConnected, setMobileConnected] = useState(false);

  // ▶️ Start interview + laptop camera (UNCHANGED)
  useEffect(() => {
    const start = async () => {
      await startLaptopCamera(laptopVideoRef);

      const res = await startInterview();
      setSessionId(res.session_id);
      setQuestion(res.question);
      speak(res.question);
    };

    start();
  }, []);

  // 🔌 Listen for mobile connection (NO backend needed)
  useEffect(() => {
    const interval = setInterval(() => {
      const connectedCode = localStorage.getItem("MOBILE_CONNECTED_CODE");

      if (connectedCode === pairCode) {
        setMobileConnected(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pairCode]);

  // ▶️ Submit answer (UNCHANGED)
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

      {/* 🔥 MAIN CAMERA GRID */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Laptop Camera */}
        <div>
          <h4>Front View (Laptop)</h4>
          <video
            ref={laptopVideoRef}
            autoPlay
            muted
            style={{ width: "400px", borderRadius: "8px" }}
          />
        </div>

        {/* Mobile Camera Placeholder */}
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
              color: "gray",
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

      {/* 🔢 PAIRING CODE */}
      <div style={{ marginTop: "15px" }}>
        <h3>Connect Mobile Camera</h3>
        <p>
          Open <b>/mobile</b> on your phone and enter code:
        </p>
        <h1 style={{ letterSpacing: "4px" }}>{pairCode}</h1>
        <p>Status: {mobileConnected ? "✅ Connected" : "❌ Not connected"}</p>
      </div>

      <hr />

      {/* INTERVIEW SECTION */}
      <h3>{question}</h3>

      <button onClick={() => listen(setAnswer)}>
        🎤 Speak Answer
      </button>

      <p>
        <b>Captured:</b> {answer}
      </p>

      <button onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

export default Interview;
