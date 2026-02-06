import { useRef, useState } from "react";

export default function MobileJoin() {
  const videoRef = useRef(null);
  const [code, setCode] = useState("");
  const [connected, setConnected] = useState(false);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });

    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  };

  const connect = () => {
    if (!code.trim()) return;

    // 🔥 THIS IS THE PAIRING SIGNAL
    localStorage.setItem("MOBILE_CONNECTED_CODE", code.toUpperCase());
    setConnected(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mobile Camera</h2>

      <input
        placeholder="Enter pairing code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ padding: "8px", width: "100%" }}
      />

      <button onClick={connect} style={{ marginTop: "10px" }}>
        Connect
      </button>

      {connected && <p>✅ Connected</p>}

      <hr />

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", borderRadius: "8px" }}
      />

      <button onClick={startCamera} style={{ marginTop: "10px" }}>
        Start Camera
      </button>
    </div>
  );
}
