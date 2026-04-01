// export async function startLaptopCamera(videoRef) {
//   if (!videoRef.current) return;

//   const stream = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: false
//   });

//   videoRef.current.srcObject = stream;
// }



export const startLaptopCamera = async (videoRef) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    return stream;
  } catch (err) {
    console.error("Laptop camera error:", err);
    return null;
  }
};