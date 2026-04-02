// import { useRef, useState } from "react";
// import { startMobileCamera } from "../camera/mobileCamera";
// import { connectMobile } from "../socket/mobileSocket";
// import { startMobileRecording } from "../utils/recordMobile";

// export default function MobileJoin(){

//   const videoRef = useRef(null);
//   const [code, setCode] = useState("");

//   const recorderRef = useRef(null);

//   // Send frames for proctoring
//   const sendFrames = (video, pairCode) => {

//     setInterval(async () => {

//       if (!video.videoWidth) return;

//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(video, 0, 0);

//       const image = canvas.toDataURL("image/jpeg", 0.5);

//       await fetch("http://localhost:8000/proctor/mobile-frame", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           pairCode: pairCode,
//           image: image
//         })
//       });

//     }, 2000);

//   };


//   const joinInterview = async () => {

//     // start mobile camera
//     const stream = await startMobileCamera(videoRef);

//     // start recording
//     recorderRef.current = await startMobileRecording(code, stream);

//     // connect websocket
//     const socket = connectMobile(code);

//     socket.onopen = () => {

//       console.log("Mobile connected");

//       socket.send(JSON.stringify({
//         type: "mobile_joined",
//         pairCode: code
//       }));

//       sendFrames(videoRef.current, code);

//     };

//   };


//   const stopRecording = async () => {

//     if (recorderRef.current) {
//       await recorderRef.current.stop();
//       console.log("Mobile recording stopped");
//     }

//   };


//   return (
//     <div>

//       <h2>Join Interview</h2>

//       <input
//         placeholder="Enter Pair Code"
//         value={code}
//         onChange={(e)=>setCode(e.target.value)}
//       />

//       <button onClick={joinInterview}>
//         Start Mobile Camera
//       </button>

//       {/* STOP BUTTON GOES HERE */}
//       <button
//         onClick={stopRecording}
//         style={{marginLeft:"10px"}}
//       >
//         Stop Recording
//       </button>

//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         style={{width:"100%", marginTop:"20px"}}
//       />

//     </div>
//   );
// }



import { useEffect, useRef, useState } from "react";
import { startMobileCamera } from "../camera/mobileCamera";
import { startMobileRecording } from "../utils/recordMobile";
import { connectMobile } from "../socket/mobileSocket";

export default function MobileJoin(){

  const videoRef = useRef(null);
  const [code, setCode] = useState("");
  const [uploadStatus, setUploadStatus] = useState("Enter pair code and start camera");
  const isCodeEntered = code.trim().length > 0;

  const recorderRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const wsClientRef = useRef(null);


  // Send frames for AI detection
  const sendFrames = (video, pairCode) => {

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    frameIntervalRef.current = setInterval(async () => {

      if (!video.videoWidth) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/jpeg", 0.6);

      if (!wsClientRef.current || !wsClientRef.current.isOpen()) {
        setUploadStatus("Socket reconnecting...");
        return;
      }

      wsClientRef.current.send({
        type: "frame",
        image,
        ts: Date.now()
      });

      setUploadStatus("Frames streaming over WebSocket");

    }, 2000);

  };


  const joinInterview = async () => {
    try {
      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) {
        return;
      }

      // start camera
      const stream = await startMobileCamera(videoRef);
      if (!stream) {
        alert("Camera permission is required to join mobile interview.");
        setUploadStatus("Camera permission denied");
        return;
      }

      // start recording
      recorderRef.current = await startMobileRecording(normalizedCode, stream);

      wsClientRef.current = connectMobile(normalizedCode, {
        onOpen: () => {
          setUploadStatus("WebSocket connected");
        },
        onClose: () => {
          setUploadStatus("WebSocket disconnected, reconnecting...");
        },
        onError: () => {
          setUploadStatus("WebSocket error while streaming");
        }
      });

      // start frame sending after camera is ready
      sendFrames(videoRef.current, normalizedCode);
      setUploadStatus("Camera started, sending frames...");
    } catch (error) {
      console.error("Failed to join mobile interview:", error);
      alert("Unable to start mobile recording. Please allow camera access and try again.");
      setUploadStatus("Unable to start mobile interview");
    }

  };


  const stopRecording = async () => {

    if (recorderRef.current) {

      await recorderRef.current.stop();

      console.log("Mobile recording stopped");
      setUploadStatus("Recording stopped");

    }

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (wsClientRef.current) {
      wsClientRef.current.close();
      wsClientRef.current = null;
    }

  };

  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
      if (wsClientRef.current) {
        wsClientRef.current.close();
        wsClientRef.current = null;
      }
    };
  }, []);


  return (
    <div>

      <h2>Join Interview</h2>

      <input
        placeholder="Enter Pair Code"
        value={code}
        onChange={(e)=>setCode(e.target.value)}
      />

      <button onClick={joinInterview} disabled={!isCodeEntered}>
        Start Mobile Camera
      </button>

      <button
        onClick={stopRecording}
        disabled={!isCodeEntered}
        style={{marginLeft:"10px"}}
      >
        Stop Recording
      </button>

      <p style={{marginTop:"12px", color:"#666"}}>{uploadStatus}</p>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{width:"100%", marginTop:"20px"}}
      />

    </div>
  );
}