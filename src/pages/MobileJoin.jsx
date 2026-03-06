import { useRef, useState } from "react";
import { startMobileCamera } from "../camera/mobileCamera";
import { connectMobile } from "../socket/mobileSocket";

export default function MobileJoin(){

  const videoRef = useRef(null);
  const [code, setCode] = useState("");

  const joinInterview = async () => {

    // start mobile camera
    await startMobileCamera(videoRef);

    // connect websocket
    const socket = connectMobile(code);

    socket.onopen = () => {

      console.log("Mobile connected");

      socket.send(JSON.stringify({
        type: "mobile_joined",
        pairCode: code
      }));

    };

  };

  return (
    <div>

      <h2>Join Interview</h2>

      <input
        placeholder="Enter Pair Code"
        value={code}
        onChange={(e)=>setCode(e.target.value)}
      />

      <button onClick={joinInterview}>
        Start Mobile Camera
      </button>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{width:"100%", marginTop:"20px"}}
      />

    </div>
  );
}