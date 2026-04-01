// export const recordMobile = async (sessionId) => {

//   const stream = await navigator.mediaDevices.getUserMedia({
//     video: true
//   });

//   const recorder = new MediaRecorder(stream);

//   const chunks = [];

//   recorder.ondataavailable = (e) => {
//     if (e.data.size > 0) {
//       chunks.push(e.data);
//     }
//   };

//   recorder.start();

//   return {

//     stream,
//     recorder,

//     stop: async () => {

//       recorder.stop();

//       recorder.onstop = async () => {

//         const blob = new Blob(chunks, { type: "video/webm" });

//         // 👇 PASTE YOUR CODE HERE
//         const form = new FormData();
//         form.append("session_id", sessionId);
//         form.append("role", "mobile");
//         form.append("video", blob);

//         await fetch("http://localhost:8000/proctor/upload-video", {
//           method: "POST",
//           body: form
//         });

//         console.log("Mobile video uploaded");

//       };

//     }

//   };  

// };  


import { API_BASE } from "../services/apiBase";

export const startMobileRecording = async (sessionId, stream) => {

  if (!(stream instanceof MediaStream)) {
    throw new Error("Mobile recording requires a valid media stream");
  }

  const recorder = new MediaRecorder(stream);

  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  console.log("Mobile recording started");

  return {

    stop: async () => {

      return new Promise((resolve) => {

        recorder.onstop = async () => {

          const blob = new Blob(chunks, { type: "video/webm" });

          const form = new FormData();
          form.append("session_id", sessionId);
          form.append("role", "mobile");
          form.append("video", blob);

          await fetch(`${API_BASE}/proctor/upload-video`, {
            method: "POST",
            body: form
          });

          console.log("Mobile video uploaded");

          resolve();
        };

        recorder.stop();

      });

    }

  };

};