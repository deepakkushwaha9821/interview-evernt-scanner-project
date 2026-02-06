import { useEffect, useRef } from "react";
import { startMobileCamera } from "../camera/mobileCamera";

function MobileJoin() {
  const videoRef = useRef(null);

  useEffect(() => {
    startMobileCamera(videoRef);
  }, []);

  return (
    <div style={{ padding: "10px" }}>
      <h2>Mobile Camera (Side View)</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "100%", borderRadius: "8px" }}
      />

      <p>Place phone sideways to capture environment</p>
    </div>
  );
}

export default MobileJoin;