// let socket = null;

// export function connectMobile(pairCode) {

//   socket = new WebSocket("ws://127.0.0.1:8000/ws");

//   socket.onopen = () => {

//     console.log("Mobile connected");

//     socket.send(JSON.stringify({
//       pairCode: pairCode,
//       role: "mobile"
//     }));

//   };

//   socket.onerror = (err) => {
//     console.log("WebSocket error:", err);
//   };

//   return socket;
// }


import { WS_BASE } from "../services/apiBase";

export function connectMobile(pairCode, handlers = {}) {

  let socket = null;
  let reconnectTimer = null;
  let closedByUser = false;

  const reconnectDelayMs = 1500;

  const openSocket = () => {
    socket = new WebSocket(`${WS_BASE}/ws`);

    socket.onopen = () => {

      console.log("Mobile websocket connected");

      socket.send(JSON.stringify({
        type: "init",
        pairCode,
        role: "mobile"
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

    socket.onerror = (err) => {
      console.log("Mobile socket error:", err);
      if (typeof handlers.onError === "function") {
        handlers.onError(err);
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
    isOpen() {
      return Boolean(socket && socket.readyState === WebSocket.OPEN);
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