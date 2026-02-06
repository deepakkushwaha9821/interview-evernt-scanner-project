import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function MobileJoin() {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const startCamera = async () => {
    setError("");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera not supported on this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // back camera
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStarted(true);
      }
    } catch (err) {
      console.error(err);
      setError(
        "Camera access failed.\n\n" +
        "Make sure:\n" +
        "• You are on HTTPS\n" +
        "• You allowed camera permission\n" +
        "• You are using Chrome or Safari"
      );
    }
  };

  return (
    <div style={{ padding: "16px", fontFamily: "Arial" }}>
      <h2>📱 Mobile Camera</h2>

      <p>
        Use your phone to capture the surrounding environment.
        Keep the phone placed sideways.
      </p>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          borderRadius: "10px",
          background: "#000",
          marginTop: "10px",
        }}
      />

      {!started && (
        <button
          onClick={startCamera}
          style={{
            marginTop: "15px",
            padding: "12px",
            width: "100%",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📷 Start Mobile Camera
        </button>
      )}

      {error && (
        <pre
          style={{
            marginTop: "15px",
            color: "red",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px",
          width: "100%",
          borderRadius: "8px",
        }}
      >
        ⬅ Back to Interview
      </button>
    </div>
  );
}

export default MobileJoin;
