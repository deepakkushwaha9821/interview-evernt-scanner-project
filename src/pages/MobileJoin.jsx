import { useRef, useState } from "react";

export default function MobileJoin() {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("Tap the button to start camera");

  const startCamera = async () => {
    setMsg("Requesting camera...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setMsg("Camera started ✅");

    } catch (err) {
      console.error(err);
      setMsg("Camera error: " + err.name);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mobile Camera Test</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          background: "#000",
          borderRadius: "10px",
        }}
      />

      <button
        onClick={startCamera}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          fontSize: 16,
        }}
      >
        Start Camera
      </button>

      <p>{msg}</p>
    </div>
  );
}
