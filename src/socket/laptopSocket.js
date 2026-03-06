export function connectLaptop(pairCode) {

  const socket = new WebSocket("ws://127.0.0.1:8000/ws");

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