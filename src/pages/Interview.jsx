import { useEffect, useRef, useState } from "react";
import { startInterview, submitAnswer } from "../services/interviewApi";
import { speak } from "../utils/speak";
import { listen } from "../utils/listen";
import { startLaptopCamera } from "../camera/laptopCamera";
import { generatePairCode } from "../utils/generateQR";
import { startLaptopRecording } from "../utils/recordLaptop";
import { detectTabSwitch } from "../proctoring/tabSwitchDetector";
import { detectScreenSwitch } from "../proctoring/screenSwitchDetector";
import { detectVoice } from "../proctoring/voiceDetector";
import { API_BASE } from "../services/apiBase";

function Interview({ setPage, setResult }) {
  const laptopVideoRef = useRef(null);
  const laptopRecorderRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [pairCode] = useState(generatePairCode());
  const [mobileConnected, setMobileConnected] = useState(false);

  const [cheatingScore, setCheatingScore] = useState(0);
  const [verdict, setVerdict] = useState("Clean");

  const [mobileFrame, setMobileFrame] = useState(null);
  const [detection, setDetection] = useState(null);

  const colors = {
    bg: "#09090b",
    sidebar: "#18181b",
    card: "#18181b",
    border: "#27272a",
    textPrimary: "#fafafa",
    textSecondary: "#a1a1aa",
    accent: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444"
  };

  const fontStack =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  // -------------------------
  // SEND EVENT TO BACKEND
  // -------------------------
  const sendEvent = async (event) => {
    try {
      await fetch(`${API_BASE}/proctor/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          timestamp: Date.now(),
          ...event
        })
      });
    } catch (error) {
      console.error("Event send failed", error);
    }
  };

  // -------------------------
  // START INTERVIEW
  // -------------------------
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await startLaptopCamera(laptopVideoRef);
        const res = await startInterview();
        setSessionId(res.session_id);
        setQuestion(res.question);
        speak(res.question);

        if (stream) {
          laptopRecorderRef.current = await startLaptopRecording(pairCode, stream);
        } else {
          console.warn("Laptop camera not available; continuing without laptop recording");
        }

        // WebSocket updates are disabled for deploy stability; polling handles mobile link state.
      } catch (error) {
        console.error("Interview initialization failed:", error);
      }
    };
    start();
  }, [pairCode]);


  // -------------------------
  // FETCH MOBILE FRAME + DETECTION
  // -------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/proctor/latest/${pairCode}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.frame) {
          setMobileFrame(
            `${API_BASE}${data.frame}?${Date.now()}`
          );
        } else {
          setMobileFrame(null);
        }
        if (data.detection) {
          setDetection(data.detection);
        }
        setMobileConnected(Boolean(data.connected));
      } catch (err) {
        setMobileConnected(false);
        // keep polling even when one request fails
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pairCode]);


  // -------------------------
  // PROCTORING DETECTORS
  // -------------------------
  useEffect(() => {
    detectTabSwitch(sendEvent);
    detectScreenSwitch(sendEvent);
    detectVoice(sendEvent).catch((error) => {
      console.warn("Voice detection unavailable:", error);
    });
  }, []);


  // -------------------------
  // SUBMIT ANSWER
  // -------------------------
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const res = await submitAnswer(sessionId, answer);
    setAnswer("");
    if (res.done) {
      if (laptopRecorderRef.current) {
        await laptopRecorderRef.current.stop();
      }
      speak(
        `Interview completed. ${res.final_verdict}. You scored ${res.score_percentage} percent.`
      );
      setResult(res);
      setPage("result");
      return;
    }
    setQuestion(res.next_question);
    speak(res.next_question);
  };

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      background: colors.bg,
      color: colors.textPrimary,
      fontFamily: fontStack,
      overflow: "hidden"
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: "280px",
        background: colors.sidebar,
        borderRight: `1px solid ${colors.border}`,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "40px"
      }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", letterSpacing: "-0.025em", margin: 0 }}>
            AI Interviewer
          </h2>
          <p style={{ color: colors.textSecondary, fontSize: "0.8rem", marginTop: "4px" }}>
            Proctoring Active
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section>
            <label style={{ fontSize: "0.7rem", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Connection
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: mobileConnected ? colors.success : colors.warning
                }}
              />
              <span style={{ fontSize: "0.9rem" }}>
                {mobileConnected ? "Mobile Linked" : "Mobile not Linked"}
              </span>
            </div>
          </section>

          <section>
            <label style={{ fontSize: "0.7rem", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Session Code
            </label>
            <h2 style={{ fontSize: "1.5rem", letterSpacing: "2px", fontWeight: "700", marginTop: "4px" }}>
              {pairCode}
            </h2>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "0.7rem", color: colors.textSecondary, textTransform: "uppercase" }}>
                Score
              </label>
              <h3 style={{ fontSize: "1.1rem", margin: "4px 0" }}>{cheatingScore}</h3>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: colors.textSecondary, textTransform: "uppercase" }}>
                Verdict
              </label>
              <h3
                style={{
                  fontSize: "1.1rem",
                  margin: "4px 0",
                  color: verdict === "Clean" ? colors.success : colors.danger
                }}
              >
                {verdict}
              </h3>
            </div>
          </section>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "40px",
        gap: "32px",
        overflowY: "auto"
      }}>
        {/* QUESTION */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          padding: "32px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "500", lineHeight: "1.6", margin: 0 }}>
            {question || "Initializing interview..."}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "0.9rem", color: colors.textSecondary, margin: 0 }}>
              <span style={{ fontWeight: "600", color: colors.accent }}>Transcript:</span>{" "}
              {answer || "Listening for answer..."}
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => listen(setAnswer)}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#27272a";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                Record
              </button>

              <button
                onClick={handleSubmit}
                style={{
                  padding: "10px 24px",
                  background: colors.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600"
                }}
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>

        {/* CAMERAS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          flex: 1
        }}>
          {/* Laptop Camera */}
          <div style={{
            flex: 1,
            background: "#000",
            borderRadius: "12px",
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
            position: "relative",
            display: "flex",
            flexDirection: "column"
          }}>
            <label
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: "rgba(0, 0, 0, 0.5)",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.7rem",
                zIndex: 2
              }}
            >
              PRIMARY FEED
            </label>
            <video
              ref={laptopVideoRef}
              autoPlay
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>

          {/* Mobile Camera */}
          <div style={{
            flex: 1,
            background: "#000",
            borderRadius: "12px",
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ flex: 1, position: "relative" }}>
              <label
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: "rgba(0, 0, 0, 0.5)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  zIndex: 2
                }}
              >
                SECONDARY FEED
              </label>
              {mobileFrame ? (
                <img
                  src={mobileFrame}
                  alt="Mobile side camera"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.textSecondary,
                    fontSize: "0.85rem"
                  }}
                >
                  Waiting for mobile stream...
                </div>
              )}
            </div>

            {detection && (
              <div
                style={{
                  background: "rgba(24, 24, 27, 0.9)",
                  padding: "16px",
                  borderTop: `1px solid ${colors.border}`,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                  fontSize: "0.75rem"
                }}
              >
                <div>
                  <span style={{ color: colors.textSecondary }}>Face:</span> {detection.face}
                </div>
                <div style={{ color: detection.phone ? colors.danger : colors.textPrimary }}>
                  <span style={{ color: colors.textSecondary }}>Phone:</span>{" "}
                  {detection.phone ? "Detected" : "None"}
                </div>
                <div style={{ color: detection.looking_away ? colors.warning : colors.textPrimary }}>
                  <span style={{ color: colors.textSecondary }}>Focus:</span>{" "}
                  {detection.looking_away ? "Away" : "Screen"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;