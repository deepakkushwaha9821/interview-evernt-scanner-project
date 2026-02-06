export async function startMobileCamera(videoRef) {
  if (!videoRef.current) return;

  try {
    // 🔐 request camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" } // safer than strict
      },
      audio: false
    });

    videoRef.current.srcObject = stream;
    videoRef.current.play();

    console.log("✅ Mobile camera started");
  } catch (err) {
    console.error("❌ Mobile camera error:", err);

    alert(
      "Camera permission denied.\n\n" +
      "Please:\n" +
      "1. Allow camera access\n" +
      "2. Use HTTPS\n" +
      "3. Open in Chrome / Safari\n"
    );
  }
}
