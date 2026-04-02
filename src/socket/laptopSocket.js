import { WS_BASE } from "../services/apiBase";

export function connectLaptop(pairCode, handlers = {}) {

  let socket = null;
  let reconnectTimer = null;
  let closedByUser = false;

  const reconnectDelayMs = 1500;

  const openSocket = () => {
    socket = new WebSocket(`${WS_BASE}/ws`);

    socket.onopen = () => {
      console.log("Laptop websocket connected");

      socket.send(JSON.stringify({
        type: "init",
        pairCode,
        role: "laptop"
      }));

      if (typeof handlers.onOpen === "function") {
        handlers.onOpen();
      }
    };

    socket.onmessage = (event) => {
      if (typeof handlers.onMessage === "function") {
        handlers.onMessage(event);
      }
    };

    socket.onerror = (error) => {
      console.log("Laptop websocket error:", error);
      if (typeof handlers.onError === "function") {
        handlers.onError(error);
      }
    };

    socket.onclose = () => {
      if (typeof handlers.onClose === "function") {
        handlers.onClose();
      }

      if (!closedByUser) {
        reconnectTimer = setTimeout(openSocket, reconnectDelayMs);
      }
    };
  };

  openSocket();

  return {
    send(payload) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    },
    close() {
      closedByUser = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (socket) {
        socket.close();
      }
    }
  };
}