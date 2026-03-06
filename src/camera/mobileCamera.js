// export async function startMobileCamera(videoRef) {
//   if (!videoRef.current) return;

//   const stream = await navigator.mediaDevices.getUserMedia({
//     video: { facingMode: "environment" },
//     audio: false
//   });

//   videoRef.current.srcObject = stream;
// }


export const startMobileCamera = async (videoRef) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      audio: false
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    return stream;
  } catch (err) {
    console.error("Mobile camera error:", err);
  }
};