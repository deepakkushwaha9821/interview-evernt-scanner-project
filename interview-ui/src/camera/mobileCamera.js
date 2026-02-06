export async function startMobileCamera(videoRef) {
  if (!videoRef.current) return;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  videoRef.current.srcObject = stream;
}