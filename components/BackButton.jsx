import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenRoutes = new Set([
    "/",
    "/mobile",
    "/interview/mobile",
    "/candidate-profile",
    "/admin",
  ]);

  if (hiddenRoutes.has(location.pathname)) {
    return null;
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <button
      onClick={handleBack}
      style={{
        position: "fixed",
        top: "16px",
        left: "16px",
        zIndex: 9999,
        border: "1px solid #d4d4d8",
        background: "#ffffff",
        color: "#111827",
        borderRadius: "10px",
        padding: "8px 12px",
        fontWeight: 600,
        fontSize: "14px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
      aria-label="Go back"
    >
      Back
    </button>
  );
}
