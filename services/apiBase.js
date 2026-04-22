const base = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV
    ? "http://localhost:8000"
    : window.location.origin
);

export const API_BASE = base.replace(/\/$/, "");
export const WS_BASE = API_BASE.startsWith("https")
  ? API_BASE.replace(/^https/, "wss")
  : API_BASE.replace(/^http/, "ws");
