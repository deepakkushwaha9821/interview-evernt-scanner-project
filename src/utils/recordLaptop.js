import { API_BASE } from "../services/apiBase";

export const startLaptopRecording = async (sessionId, stream) => {

  if (!(stream instanceof MediaStream)) {
    throw new Error("Laptop recording requires a valid media stream");
  }

  const recorder = new MediaRecorder(stream);

  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  console.log("Laptop recording started");

  return {

    stop: async () => {

      return new Promise((resolve) => {

        recorder.onstop = async () => {

          const blob = new Blob(chunks, { type: "video/webm" });

          const form = new FormData();
          form.append("session_id", sessionId);
          form.append("role", "laptop");
          form.append("video", blob);

          await fetch(`${API_BASE}/proctor/upload-video`, {
            method: "POST",
            body: form
          });

          console.log("Laptop video uploaded");

          resolve();
        };

        recorder.stop();

      });

    }

  };

};