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

export function connectMobile(pairCode) {

  const socket = new WebSocket(`${WS_BASE}/ws`);

  socket.onopen = () => {

    console.log("Mobile websocket connected");

    // FIRST MESSAGE → identify client
    socket.send(JSON.stringify({
      pairCode: pairCode,
      role: "mobile"
    }));

  };

  socket.onmessage = (event) => {
    console.log("Server:", event.data);
  };

  socket.onerror = (err) => {
    console.log("Socket error:", err);
  };

  return socket;
}