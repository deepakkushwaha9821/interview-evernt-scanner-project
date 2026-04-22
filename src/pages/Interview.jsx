import { useEffect, useRef, useState } from "react";
import { startInterview, stopInterview, submitAnswer } from "../services/interviewApi";
import { speak } from "../utils/speak";
import { listen } from "../utils/listen";
import { startLaptopCamera } from "../camera/laptopCamera";
import { generatePairCode } from "../utils/generateQR";
import { startLaptopRecording } from "../utils/recordLaptop";
import { detectTabSwitch } from "../proctoring/tabSwitchDetector";
import { detectScreenSwitch } from "../proctoring/screenSwitchDetector";
import { detectVoice } from "../proctoring/voiceDetector";
import { connectLaptop } from "../socket/laptopSocket";
import { API_BASE } from "../services/apiBase";
import { useNavigate, useSearchParams } from "react-router-dom";

function Interview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const laptopVideoRef = useRef(null);
  const laptopStreamRef = useRef(null);
  const laptopRecorderRef = useRef(null);
  const wsClientRef = useRef(null);
  const laptopFrameIntervalRef = useRef(null);
  const rafIdRef = useRef(null);
  const detectorCleanupRef = useRef([]);
  const stoppedRef = useRef(false);

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [feedback, setFeedback] = useState("");

  const topic = (searchParams.get("topic") || "python").toLowerCase();
  const candidate = searchParams.get("candidate") || localStorage.getItem("candidate_username") || "Candidate";
  const maxQuestions = Number(searchParams.get("maxQuestions") || 5);

  const [pairCode] = useState(generatePairCode());
  const [mobileConnected, setMobileConnected] = useState(false);

  const [cheatingScore, setCheatingScore] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [verdict, setVerdict] = useState("Clean");

  // Auto-update verdict whenever cheating score changes
  useEffect(() => {
    if (cheatingScore >= 8) setVerdict("Disqualified");
    else if (cheatingScore >= 5) setVerdict("Critical");
    else if (cheatingScore >= 3) setVerdict("Suspicious");
    else setVerdict("Clean");
  }, [cheatingScore]);

  // Auto-terminate if laptop cheating score reaches 10
  useEffect(() => {
    if (cheatingScore >= 10 && !stoppedRef.current) {
      setWarningMessage("🚨 Interview terminated: cheating score limit reached.");
      speak("Interview terminated due to cheating detected.");
      handleStopInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheatingScore]);

  const [mobileFrame, setMobileFrame] = useState(null);
  const [detection, setDetection] = useState(null);
  const [feedStatus, setFeedStatus] = useState("Waiting for mobile stream...");
  const [proctoringStopped, setProctoringStopped] = useState(false);

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
  const sendEvent = (event) => {
    if (stoppedRef.current || !wsClientRef.current || !sessionId) {
      return;
    }

    wsClientRef.current.send({
      type: "cheating_event",
      payload: {
        sessionId,
        timestamp: Date.now(),
        ...event
      }
    });
  };

  const cleanupInterviewResources = (reason = "manual_stop") => {
    if (stoppedRef.current) {
      return;
    }

    stoppedRef.current = true;
    setProctoringStopped(true);

    if (laptopFrameIntervalRef.current) {
      clearInterval(laptopFrameIntervalRef.current);
      laptopFrameIntervalRef.current = null;
    }

    detectorCleanupRef.current.forEach((cleanup) => {
      try {
        cleanup?.();
      } catch (error) {
        console.error("Detector cleanup failed:", error);
      }
    });
    detectorCleanupRef.current = [];

    const wsClient = wsClientRef.current;
    wsClientRef.current = null;
    if (wsClient) {
      wsClient.close();
    }

    const recorder = laptopRecorderRef.current;
    laptopRecorderRef.current = null;
    if (recorder) {
      recorder.stop().catch((error) => {
        console.error("Laptop stop/upload failed:", error);
      });
    }

    const stream = laptopStreamRef.current;
    laptopStreamRef.current = null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (laptopVideoRef.current) {
      laptopVideoRef.current.srcObject = null;
    }

    setMobileConnected(false);
    setFeedStatus(`Proctoring stopped (${reason})`);
  };

  const exitInterview = (route) => {
    cleanupInterviewResources(`exit_to_${route.replace("/", "") || "home"}`);
    navigate(route);
  };

  // -------------------------
  // START INTERVIEW
  // -------------------------
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await startLaptopCamera(laptopVideoRef);
        laptopStreamRef.current = stream || null;
        const res = await startInterview({
          topic,
          candidateName: candidate,
          maxQuestions,
        });
        setSessionId(res.session_id);
        setQuestion(res.question);
        setDifficulty(res.difficulty || "medium");
        speak(res.question);

        // --- Live FaceMesh Detection (loaded from CDN at runtime) ---
        rafIdRef.current = null;
        let mesh = null;
        let warningCounter = 0;
        let score10 = false;
        let score25 = false;
        let score50 = false;
        const video = laptopVideoRef.current;
        if (video && stream) {
          // Load MediaPipe from CDN dynamically to avoid Vite bundling issues
          const loadFaceMesh = () => new Promise((resolve) => {
            if (window.FaceMesh) { resolve(window.FaceMesh); return; }
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
            script.crossOrigin = "anonymous";
            script.onload = () => resolve(window.FaceMesh);
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
          });

          const FaceMeshClass = await loadFaceMesh();
          if (FaceMeshClass) {
            mesh = new FaceMeshClass({
              locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });
            mesh.setOptions({
              maxNumFaces: 1,
              refineLandmarks: true,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
            mesh.onResults((results) => {
              if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];
                const nose = landmarks[1];
                const leftEye = landmarks[33];
                const rightEye = landmarks[263];
                const headTurned = nose.x < 0.35 || nose.x > 0.65;
                const eyesTilted = Math.abs(leftEye.y - rightEye.y) > 0.04;
                if (headTurned || eyesTilted) {
                  warningCounter++;
                  setWarningCount((prev) => prev + 1);
                  if (warningCounter === 10 && !score10) {
                    setCheatingScore((prev) => prev + 1);
                    setWarningMessage("First warning: Please keep your head and eyes forward.");
                    score10 = true;
                  } else if (warningCounter === 25 && !score25) {
                    setCheatingScore((prev) => prev + 2);
                    setWarningMessage("Second warning: Cheating detected. Please focus on the screen.");
                    score25 = true;
                  } else if (warningCounter === 50 && !score50) {
                    setCheatingScore((prev) => prev + 5);
                    setWarningMessage("Final warning: Cheating score increased. Interview at risk.");
                    score50 = true;
                  }
                }
              }
            });
            const detectFrame = async () => {
              if (!video || stoppedRef.current) return;
              await mesh.send({ image: video });
              rafIdRef.current = requestAnimationFrame(detectFrame);
            };
            video.onloadeddata = () => {
              rafIdRef.current = requestAnimationFrame(detectFrame);
            };
            // If video already loaded, start immediately
            if (video.readyState >= 2) {
              rafIdRef.current = requestAnimationFrame(detectFrame);
            }
          }
        }
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.addEventListener("ended", () => {
              if (!stoppedRef.current) {
                cleanupInterviewResources("camera_ended");
              }
            });
          });

          laptopRecorderRef.current = await startLaptopRecording(pairCode, stream);

          if (laptopFrameIntervalRef.current) {
            clearInterval(laptopFrameIntervalRef.current);
          }

          laptopFrameIntervalRef.current = setInterval(async () => {
            try {
              const video = laptopVideoRef.current;
              if (!video || !video.videoWidth || !video.videoHeight) return;

              const hasLiveTrack = stream.getVideoTracks().some((track) => track.readyState === "live");
              if (!hasLiveTrack) {
                cleanupInterviewResources("camera_blocked");
                return;
              }

              const canvas = document.createElement("canvas");
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;

              ctx.drawImage(video, 0, 0);
              const image = canvas.toDataURL("image/jpeg", 0.7);

              const res = await fetch(`${API_BASE}/proctor/laptop-frame`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  pairCode,
                  image
                })
              });
              const data = await res.json();
              if (data && typeof data.warnings === "number") {
                setWarningCount(data.warnings);
              }
              // Use backend's authoritative running total score
              if (data && typeof data.cheating_score === "number") {
                setCheatingScore(data.cheating_score);
              }
              // Show warning message when suspicious activity detected this frame
              if (data && data.cheating_score_delta > 0) {
                if (data.face_count === 0) {
                  setWarningMessage("⚠️ No face detected — please stay in frame!");
                } else if (data.cheating_score_delta >= 2) {
                  setWarningMessage("⚠️ Suspicious activity detected — please look at the screen.");
                } else {
                  setWarningMessage("⚠️ Attention warning — minor head/gaze deviation.");
                }
              }
            } catch (error) {
              console.error("Laptop frame upload failed:", error);
            }
          }, 10000); // every 10 seconds for more frequent detection
        } else {
          console.warn("Laptop camera not available; continuing without laptop recording");
        }

        wsClientRef.current = connectLaptop(pairCode, {
          onOpen: () => {
            setFeedStatus("Waiting for mobile stream...");
          },
          onClose: () => {
            setMobileConnected(false);
            setFeedStatus("Socket disconnected, reconnecting...");
          },
          onMessage: (event) => {
            try {
              const msg = JSON.parse(event.data);

              if (msg.type === "mobile_joined") {
                setMobileConnected(true);
                setFeedStatus("Mobile connected");
                return;
              }

              if (msg.type === "mobile_disconnected") {
                setMobileConnected(false);
                setFeedStatus("Mobile not linked");
                return;
              }

              if (msg.type === "frame_update") {
                setMobileConnected(Boolean(msg.connected));
                setMobileFrame(msg.image || null);
                setDetection(msg.detection || null);
                setFeedStatus(msg.connected ? "Live mobile feed" : "Mobile not linked");
                return;
              }

              if (msg.type === "cheating_update") {
                if (typeof msg.score === "number") {
                  setCheatingScore(msg.score);
                }
              }

              // Mobile detection → immediate termination
              if (msg.type === "terminate_interview") {
                const d = msg.detection || {};
                let reason = "Cheating detected on mobile camera.";
                if (d.phone) reason = "🚨 Phone detected! Interview terminated.";
                else if (d.face === "multiple_people") reason = "🚨 Multiple people detected! Interview terminated.";
                else if (d.face === "no_face") reason = "🚨 Candidate left frame! Interview terminated.";
                else if (d.looking_away) reason = "🚨 Looking away detected! Interview terminated.";
                setWarningMessage(reason);
                speak(reason.replace(/[🚨⚠️]/g, ""));
                // Small delay so the warning renders before navigating
                setTimeout(() => handleStopInterview(), 1500);
              }
            } catch (error) {
              console.error("Failed to parse socket message", error);
            }
          }
        });
      } catch (error) {
        console.error("Interview initialization failed:", error);
      }
    };
    start();

    return () => {
      cleanupInterviewResources("unmount");
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [pairCode, topic, candidate, maxQuestions]);


  // -------------------------
  // PROCTORING DETECTORS
  // -------------------------
  useEffect(() => {
    const tabCleanup = detectTabSwitch(sendEvent);
    const screenCleanup = detectScreenSwitch(sendEvent);
    detectorCleanupRef.current.push(tabCleanup, screenCleanup);

    detectVoice(sendEvent).catch((error) => {
      console.warn("Voice detection unavailable:", error);
      return null;
    }).then((voiceCleanup) => {
      if (voiceCleanup) {
        detectorCleanupRef.current.push(voiceCleanup);
      }
    });

    return () => {
      detectorCleanupRef.current.forEach((cleanup) => {
        try {
          cleanup?.();
        } catch (error) {
          console.error("Detector cleanup failed:", error);
        }
      });
      detectorCleanupRef.current = [];
    };
  }, []);


  // -------------------------
  // SUBMIT ANSWER
  // -------------------------
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const res = await submitAnswer(sessionId, answer, pairCode);
    setAnswer("");
    if (res.evaluation?.feedback) {
      setFeedback(res.evaluation.feedback);
    }

    if (res.done) {
      cleanupInterviewResources("interview_done");
      speak(
        `Interview completed. ${res.final_verdict}. You scored ${res.score_percentage} percent.`
      );
      navigate("/result", { state: { result: res } });
      return;
    }

    setQuestion(res.next_question);
    setDifficulty(res.next_difficulty || "medium");
    speak(res.next_question);
  };

  const handleStopInterview = async () => {
    try {
      if (wsClientRef.current) {
        wsClientRef.current.send({
          type: "stop_interview",
          pairCode,
          reason: "manual_stop",
        });
      }

      let result = null;
      if (sessionId) {
        result = await stopInterview(sessionId, pairCode);
      }

      cleanupInterviewResources("manual_stop");

      if (result && !result.error) {
        navigate("/result", { state: { result } });
        return;
      }

      navigate("/");
    } catch (error) {
      console.error("Failed to stop interview:", error);
      cleanupInterviewResources("manual_stop_error");
      navigate("/");
    }
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
          <p style={{ color: colors.warning, fontSize: "0.9rem", marginTop: "8px" }}>
            Warnings: {warningCount}
          </p>
          <p style={{ color: colors.accent, fontSize: "0.9rem", marginTop: "4px" }}>
            Cheating Score: {cheatingScore}
          </p>
          {warningMessage && (
            <p style={{ color: colors.danger, fontSize: "0.95rem", marginTop: "8px", fontWeight: 600 }}>
              {warningMessage}
            </p>
          )}
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

          {/* Mobile Join Button */}
          <section>
            <label style={{ fontSize: "0.7rem", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Mobile Camera
            </label>
            <button
              onClick={() => window.open(`${window.location.origin}/mobile`, "_blank")}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "700",
                letterSpacing: "0.02em",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
              }}
            >
              📱 Open Mobile Link
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/mobile`);
              }}
              style={{
                marginTop: "6px",
                width: "100%",
                padding: "8px",
                background: "transparent",
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
            >
              Copy Link
            </button>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "0.7rem", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Exit Interview
            </label>


            <button
              onClick={() => exitInterview("/candidate-profile")}
              style={{
                padding: "10px 12px",
                background: "transparent",
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "600",
                textAlign: "left"
              }}
            >
              Back to Candidate
            </button>
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
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.85rem" }}>
            {candidate} | Topic: {topic.toUpperCase()} | Difficulty: {difficulty}
          </p>

          <h3 style={{ fontSize: "1.25rem", fontWeight: "500", lineHeight: "1.6", margin: 0 }}>
            {question || "Initializing interview..."}
          </h3>

          {feedback && (
            <p style={{ margin: 0, color: "#86efac", fontSize: "0.88rem" }}>
              Last feedback: {feedback}
            </p>
          )}

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
                disabled={proctoringStopped}
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

              <button
                onClick={handleStopInterview}
                disabled={proctoringStopped}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  color: proctoringStopped ? colors.textSecondary : colors.danger,
                  border: `1px solid ${proctoringStopped ? colors.border : colors.danger}`,
                  borderRadius: "8px",
                  cursor: proctoringStopped ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600"
                }}
              >
                {proctoringStopped ? "Proctoring Stopped" : "Stop Proctoring"}
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
                  onError={() => {
                    setMobileFrame(null);
                    setFeedStatus("Frame unavailable, waiting for next upload...");
                  }}
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
                  {feedStatus}
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
