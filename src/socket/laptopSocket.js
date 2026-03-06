export function connectLaptop(pairCode) {

  const socket =new WebSocket("wss://deedrop1140-event-project.hf.space/ws");

  socket.onopen = () => {
    console.log("WebSocket connected");

    socket.send(JSON.stringify({
      pairCode: pairCode,
      role: "laptop"
    }));
  };

  socket.onmessage = (event) => {
    console.log("Message from server:", event.data);
  };

  socket.onerror = (error) => {
    console.log("WebSocket error:", error);
  };

  return socket;

}
