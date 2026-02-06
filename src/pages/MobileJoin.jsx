import { useRef } from "react";
import { startMobileCamera } from "../camera/mobileCamera";

function MobileJoin() {
  const videoRef = useRef(null);

  return (
    <div style={{ padding: "10px" }}>
      <h2>Mobile Camera (Side View)</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline   // 🔥 REQUIRED for iOS
        style={{ width: "100%", borderRadius: "8px" }}
      />

      <button
        style={{ marginTop: "10px", fontSize: "16px" }}
        onClick={() => startMobileCamera(videoRef)}
      >
        📷 Start Mobile Camera
      </button>

      <p style={{ marginTop: "10px" }}>
        Place phone sideways to capture environment
      </p>
    </div>
  );
}

export default MobileJoin;
