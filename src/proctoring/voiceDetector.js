export async function detectVoice(sendEvent){

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);

  const analyser = audioContext.createAnalyser();
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);

  setInterval(() => {

    analyser.getByteFrequencyData(data)

    const volume = data.reduce((a,b)=>a+b)/data.length

    if(volume > 70){

      sendEvent({
        type:"voice_detected"
      })

    }

  },2000)

}