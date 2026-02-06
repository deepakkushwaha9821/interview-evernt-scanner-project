export async function startLaptopCamera(videoRef) {
  if (!videoRef.current) return;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });

  videoRef.current.srcObject = stream;
}