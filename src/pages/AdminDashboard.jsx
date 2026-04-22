import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../services/apiBase";

/* ─── tiny icon components (inline SVG, no deps) ─────────────────────── */
const IconVideo    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.277A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>;
const IconCamera   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconTrash    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconRefresh  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
const IconLogout   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSession  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const IconWarning  = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconSparkle  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.4l-6.2 4.5 2.4-7.2L2 9.2h7.6z"/></svg>;

/* ─── Skeleton card ───────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={skeletonCard}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={skeletonLine(180, 20)} />
        <div style={skeletonLine(80, 28, 8)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={skeletonBlock(280)} />
        <div style={skeletonBlock(200)} />
      </div>
      <div style={skeletonLine("100%", 14)} />
      <div style={{ ...skeletonLine("70%", 14), marginTop: 8 }} />
    </div>
  );
}

/* ─── Delete Confirmation Modal ──────────────────────────────────────── */
function DeleteModal({ session, onConfirm, onCancel, isDeleting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={overlay}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={modalBox}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ color: "#ff4757", marginBottom: 16 }}><IconWarning /></div>
        <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>
          Delete Session?
        </h3>
        <p style={{ color: "#a4b0be", fontSize: "0.9rem", marginBottom: 6, lineHeight: 1.6 }}>
          This will permanently delete all recordings and frames for:
        </p>
        <div style={sessionPill}>{session}</div>
        <p style={{ color: "#ff4757", fontSize: "0.8rem", marginTop: 12, marginBottom: 24 }}>
          ⚠ This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={cancelBtn} onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <motion.button
            whileHover={{ background: "#ff6b81" }}
            whileTap={{ scale: 0.97 }}
            style={confirmBtn}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Result Panel ───────────────────────────────────────────────────── */
function ResultPanel({ result }) {
  const feedback = Array.isArray(result?.detailed_feedback) ? result.detailed_feedback : [];

  return (
    <div style={resultBox}>
      <div style={resultHeader}>
        <div>
          <div style={{ color: "#cbd5e1", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>
            Interview Result
          </div>
          <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, marginTop: 4 }}>
            {result?.candidate_name || "Candidate"} | {(result?.topic || "python").toUpperCase()}
          </div>
        </div>
        <div style={resultScoreChip}>{result?.score_percentage ?? 0}%</div>
      </div>

      <p style={{ margin: "8px 0 0", color: "#d1d5db", fontSize: "0.9rem" }}>
        <b style={{ color: "#fff" }}>{result?.final_verdict || "Pending"}</b>
        {result?.summary ? ` - ${result.summary}` : ""}
      </p>

      {feedback.length > 0 && (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {feedback.slice(0, 3).map((item, index) => (
            <div key={index} style={resultItem}>
              <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>{item.question}</div>
              <div style={{ color: "#a4b0be", fontSize: "0.8rem", marginTop: 2 }}>
                Score: {item.score ?? 0}/10 | Verdict: {item.verdict || "n/a"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Session Card ───────────────────────────────────────────────────── */
function SessionCard({ session: s, onDelete }) {
  const [expanded, setExpanded]       = useState(true);
  const [isSavingLaptop, setIsSavingLaptop] = useState(false);
  const [isSummarizing, setIsSummarizing]   = useState(false);
  const [summaryError, setSummaryError]     = useState(null);
  const [description, setDescription]       = useState(s.description || "");

  const label = s.session.replace("session_", "Session #");

  const handleAnalyze = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/summarize/${s.session}`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setDescription(data.summary);
      } else {
        setSummaryError(data.detail || "Groq API error");
      }
    } catch (err) {
      setSummaryError("Network error — could not reach backend.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSaveLaptopVideo = async () => {
    if (!s.laptop_video || isSavingLaptop) return;

    setIsSavingLaptop(true);
    try {
      const url = `${API_BASE}/${s.laptop_video}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to download laptop video");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${s.session}_laptop_video.webm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Laptop video save failed:", error);
      alert("Failed to save laptop video.");
    } finally {
      setIsSavingLaptop(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      style={card}
    >
      {/* Card Header */}
      <div style={cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={sessionBadge}><IconSession /></span>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{label}</span>
          {description && (
            <span style={descBadge}>Has Summary</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* ── Analyse with Groq ── */}
          <motion.button
            whileHover={{ background: "rgba(99,102,241,0.18)", borderColor: "rgba(99,102,241,0.4)", color: "#818cf8" }}
            whileTap={{ scale: 0.95 }}
            style={analyzeBtn}
            onClick={handleAnalyze}
            disabled={isSummarizing}
            title="Analyse video with Groq AI"
          >
            {isSummarizing
              ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span> Analysing…</>
              : <><IconSparkle /> Analyse with AI</>}
          </motion.button>
          <motion.button
            whileHover={{ background: "rgba(255,71,87,0.15)", color: "#ff4757" }}
            whileTap={{ scale: 0.95 }}
            style={iconBtn}
            onClick={() => onDelete(s.session)}
            title="Delete session"
          >
            <IconTrash />
          </motion.button>
          <motion.button
            whileHover={{ background: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.95 }}
            style={iconBtn}
            onClick={() => setExpanded(x => !x)}
            title={expanded ? "Collapse" : "Expand"}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1 }}>
              {expanded ? "▲ Hide" : "▼ Show"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Card Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={mediaGrid}>
              {/* Laptop Video */}
              <div style={mediaBlock}>
                <div style={mediaLabel}><IconVideo />&nbsp; Laptop View</div>
                {s.laptop_video ? (
                  <>
                    <video
                      controls
                      style={videoStyle}
                      src={`${API_BASE}/${s.laptop_video}`}
                    />
                    <motion.button
                      whileHover={{ background: "rgba(46,213,115,0.18)", borderColor: "rgba(46,213,115,0.35)" }}
                      whileTap={{ scale: 0.98 }}
                      style={saveVideoBtn}
                      onClick={handleSaveLaptopVideo}
                      disabled={isSavingLaptop}
                    >
                      {isSavingLaptop ? "Saving..." : "Save Laptop Video"}
                    </motion.button>
                  </>
                ) : s.laptop_frame ? (
                  <img
                    src={`${API_BASE}/${s.laptop_frame}`}
                    alt={`Laptop frame for ${s.session}`}
                    style={imgStyle}
                  />
                ) : (
                  <div style={noMedia}>No laptop video recorded</div>
                )}
              </div>

              {/* Mobile Frame */}
              <div style={mediaBlock}>
                <div style={mediaLabel}><IconCamera />&nbsp; Mobile Frame</div>
                {s.latest_frame ? (
                  <img
                    src={`${API_BASE}/${s.latest_frame}`}
                    alt={`Frame for ${s.session}`}
                    style={imgStyle}
                  />
                ) : (
                  <div style={noMedia}>No mobile frame stored</div>
                )}
              </div>

              {/* Mobile Video — full width if present */}
              {(s.mobile_video || s.video) && (
                <div style={{ ...mediaBlock, gridColumn: "1 / -1" }}>
                  <div style={mediaLabel}><IconVideo />&nbsp; Mobile Side View</div>
                  <video
                    controls
                    style={{ ...videoStyle, maxWidth: 500 }}
                    src={`${API_BASE}/${s.mobile_video || s.video}`}
                  />
                </div>
              )}
            </div>

            {/* Summary / Description */}
            {summaryError && (
              <div style={{ ...descBox, background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.25)", marginBottom: 8 }}>
                <div style={{ color: "#ff4757", fontSize: "0.8rem", fontWeight: 700, marginBottom: 4 }}>⚠ GROQ ERROR</div>
                <p style={{ color: "#fca5a5", fontSize: "0.85rem", margin: 0 }}>{summaryError}</p>
              </div>
            )}
            {description && (
              <div style={descBox}>
                <div style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 700, marginBottom: 6, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <IconSparkle /> AI VIDEO SUMMARY
                </div>
                <p style={{ color: "#dfe6e9", fontSize: "0.88rem", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                  {description}
                </p>
              </div>
            )}

            {!!(s.laptop_frames?.length || s.mobile_frames?.length) && (
              <div style={historySection}>
                <div style={historyTitle}>Frame History</div>

                {s.laptop_frames?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={historySubTitle}>Laptop Frames ({s.laptop_frames.length})</div>
                    <div style={historyGrid}>
                      {s.laptop_frames.map((framePath, idx) => (
                        <a key={`l-${idx}`} href={`${API_BASE}/${framePath}`} target="_blank" rel="noreferrer" style={thumbLink}>
                          <img src={`${API_BASE}/${framePath}`} alt={`Laptop frame ${idx + 1}`} style={thumbImg} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {s.mobile_frames?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={historySubTitle}>Mobile Frames ({s.mobile_frames.length})</div>
                    <div style={historyGrid}>
                      {s.mobile_frames.map((framePath, idx) => (
                        <a key={`m-${idx}`} href={`${API_BASE}/${framePath}`} target="_blank" rel="noreferrer" style={thumbLink}>
                          <img src={`${API_BASE}/${framePath}`} alt={`Mobile frame ${idx + 1}`} style={thumbImg} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Interview Result ── */}
            {s.result ? (
              <ResultPanel result={s.result} />
            ) : (
              <div style={noResultBox}>
                <span style={{ fontSize: "1.3rem" }}>⏳</span>
                <span>No interview result yet — test not completed or still in progress.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [toDelete, setToDelete]       = useState(null);   // session string
  const [isDeleting, setIsDeleting]   = useState(false);
  const [toast, setToast]             = useState(null);

  /* fetch sessions */
  const fetchSessions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res  = await fetch(`${API_BASE}/admin/videos`);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load sessions", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  /* toast helper */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* delete flow */
  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/session/${toDelete}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.session !== toDelete));
        showToast(`${toDelete} deleted`, "success");
      } else {
        showToast(data.detail || "Delete failed", "error");
      }
    } catch {
      showToast("Server error during delete", "error");
    } finally {
      setIsDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div style={page}>
      {/* Background glow */}
      <div style={glow1} />
      <div style={glow2} />

      {/* ── Topbar ── */}
      <div style={topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#ff4757", fontWeight: 900, fontSize: "1.2rem", letterSpacing: 1 }}>⬡</span>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>Interview Monitor</span>
          <span style={topBadge}>ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <motion.button
            whileHover={{ background: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            style={topBtn}
            onClick={() => fetchSessions(true)}
            disabled={refreshing}
            title="Refresh sessions"
          >
            <motion.span
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
              style={{ display: "flex" }}
            >
              <IconRefresh />
            </motion.span>
            <span style={{ fontSize: "0.82rem" }}>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ background: "rgba(255,71,87,0.15)", color: "#ff4757" }}
            whileTap={{ scale: 0.95 }}
            style={topBtn}
            onClick={() => navigate("/admin-login")}
            title="Log out"
          >
            <IconLogout />
            <span style={{ fontSize: "0.82rem" }}>Logout</span>
          </motion.button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={statsBar}>
        <div style={statChip}>
          <span style={{ color: "#ff4757", fontWeight: 700, fontSize: "1.4rem" }}>{sessions.length}</span>
          <span style={{ color: "#a4b0be", fontSize: "0.78rem", marginTop: 2 }}>Total Sessions</span>
        </div>
        <div style={statChip}>
          <span style={{ color: "#2ed573", fontWeight: 700, fontSize: "1.4rem" }}>
            {sessions.filter(s => s.laptop_video).length}
          </span>
          <span style={{ color: "#a4b0be", fontSize: "0.78rem", marginTop: 2 }}>Laptop Videos</span>
        </div>
        <div style={statChip}>
          <span style={{ color: "#1e90ff", fontWeight: 700, fontSize: "1.4rem" }}>
            {sessions.filter(s => s.latest_frame).length}
          </span>
          <span style={{ color: "#a4b0be", fontSize: "0.78rem", marginTop: 2 }}>Mobile Frames</span>
        </div>
        <div style={statChip}>
          <span style={{ color: "#ffa502", fontWeight: 700, fontSize: "1.4rem" }}>
            {sessions.filter(s => s.mobile_video || s.video).length}
          </span>
          <span style={{ color: "#a4b0be", fontSize: "0.78rem", marginTop: 2 }}>Mobile Videos</span>
        </div>
      </div>

      {/* ── Sessions ── */}
      <div style={content}>
        {loading ? (
          [1, 2].map(i => <SkeletonCard key={i} />)
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={emptyState}
          >
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📂</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
              No Sessions Found
            </div>
            <div style={{ color: "#57606f", fontSize: "0.9rem" }}>
              Session recordings will appear here after interviews complete.
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {sessions.map(s => (
              <SessionCard
                key={s.session}
                session={s}
                onDelete={setToDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {toDelete && (
          <DeleteModal
            session={toDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setToDelete(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            style={{
              ...toastStyle,
              background: toast.type === "error"
                ? "rgba(255,71,87,0.15)"
                : "rgba(46,213,115,0.15)",
              borderColor: toast.type === "error" ? "#ff4757" : "#2ed573",
              color: toast.type === "error" ? "#ff4757" : "#2ed573",
            }}
          >
            {toast.type === "error" ? "✗" : "✓"}&nbsp;&nbsp;{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 20% 20%, #130a1e 0%, #05050a 70%)",
  fontFamily: "'Inter', sans-serif",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
};

const glow1 = {
  position: "fixed", top: "-10%", right: "-5%",
  width: 500, height: 500,
  background: "rgba(255,71,87,0.06)",
  borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none",
};
const glow2 = {
  position: "fixed", bottom: "-15%", left: "-5%",
  width: 600, height: 600,
  background: "rgba(30,144,255,0.05)",
  borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none",
};

const topbar = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "18px 32px",
  background: "rgba(255,255,255,0.03)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  position: "sticky", top: 0, zIndex: 50,
};

const topBadge = {
  background: "rgba(255,71,87,0.15)",
  color: "#ff4757",
  fontSize: "0.65rem",
  fontWeight: 800,
  letterSpacing: 2,
  padding: "3px 8px",
  borderRadius: 4,
  border: "1px solid rgba(255,71,87,0.3)",
};

const topBtn = {
  display: "flex", alignItems: "center", gap: 6,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#a4b0be",
  borderRadius: 8,
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: "0.85rem",
  transition: "all 0.2s",
};

const statsBar = {
  display: "flex", gap: 16, padding: "20px 32px",
  flexWrap: "wrap",
};

const statChip = {
  display: "flex", flexDirection: "column", alignItems: "center",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: "14px 28px",
  minWidth: 110,
};

const content = {
  padding: "0 32px 60px",
  display: "flex", flexDirection: "column", gap: 20,
  maxWidth: 1200, margin: "0 auto",
};

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 24,
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

const cardHeader = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  marginBottom: 20,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(255,255,255,0.07)",
};

const sessionBadge = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32,
  background: "rgba(255,71,87,0.15)",
  borderRadius: 8,
  color: "#ff4757",
};

const descBadge = {
  background: "rgba(46,213,115,0.12)",
  color: "#2ed573",
  fontSize: "0.68rem",
  fontWeight: 700,
  padding: "3px 8px",
  borderRadius: 4,
  border: "1px solid rgba(46,213,115,0.25)",
  letterSpacing: 0.5,
};

const iconBtn = {
  display: "flex", alignItems: "center", gap: 5,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#a4b0be",
  borderRadius: 8,
  padding: "7px 12px",
  cursor: "pointer",
  fontSize: "0.8rem",
  transition: "all 0.2s",
};

const mediaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

const mediaBlock = {
  display: "flex", flexDirection: "column", gap: 10,
};

const mediaLabel = {
  display: "flex", alignItems: "center",
  color: "#a4b0be", fontSize: "0.78rem",
  fontWeight: 600, letterSpacing: 0.5,
  textTransform: "uppercase",
};

const videoStyle = {
  width: "100%", maxWidth: 480,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#000",
  display: "block",
};

const imgStyle = {
  width: "100%", maxWidth: 480,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  objectFit: "cover",
  display: "block",
};

const noMedia = {
  display: "flex", alignItems: "center", justifyContent: "center",
  height: 140,
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#57606f",
  fontSize: "0.85rem",
};

const saveVideoBtn = {
  marginTop: 8,
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(46,213,115,0.28)",
  background: "rgba(46,213,115,0.12)",
  color: "#2ed573",
  fontSize: "0.8rem",
  fontWeight: 700,
  cursor: "pointer",
};

const descBox = {
  background: "rgba(255,71,87,0.06)",
  border: "1px solid rgba(255,71,87,0.15)",
  borderRadius: 10,
  padding: "16px 20px",
  marginTop: 4,
};

const noResultBox = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px dashed rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.03)",
  color: "#a4b0be",
  fontSize: "0.86rem",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const historySection = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
};

const historyTitle = {
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 700,
};

const historySubTitle = {
  color: "#a4b0be",
  fontSize: "0.8rem",
  marginBottom: 8,
};

const historyGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
  gap: 8,
};

const thumbLink = {
  display: "block",
  borderRadius: 8,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.15)",
};

const thumbImg = {
  width: "100%",
  height: "72px",
  objectFit: "cover",
  display: "block",
};

const resultBox = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(46,213,115,0.25)",
  background: "rgba(46,213,115,0.08)",
};

const resultHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const resultScoreChip = {
  color: "#2ed573",
  fontWeight: 800,
  fontSize: "1rem",
  border: "1px solid rgba(46,213,115,0.35)",
  background: "rgba(15,23,42,0.45)",
  borderRadius: 8,
  padding: "6px 10px",
};

const resultItem = {
  background: "rgba(15,23,42,0.4)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "8px 10px",
};

const emptyState = {
  textAlign: "center",
  padding: "80px 20px",
  background: "rgba(255,255,255,0.03)",
  borderRadius: 16,
  border: "1px dashed rgba(255,255,255,0.1)",
};

/* Modal */
const overlay = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 999,
};

const modalBox = {
  background: "#111",
  border: "1px solid rgba(255,71,87,0.25)",
  borderRadius: 16,
  padding: "36px 32px",
  maxWidth: 420, width: "90%",
  textAlign: "center",
  boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
};

const sessionPill = {
  background: "rgba(255,71,87,0.12)",
  border: "1px solid rgba(255,71,87,0.3)",
  color: "#ff4757",
  borderRadius: 8,
  padding: "8px 16px",
  fontSize: "0.88rem",
  fontWeight: 700,
  display: "inline-block",
  marginTop: 10,
};

const cancelBtn = {
  flex: 1, padding: "12px",
  borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent", color: "#a4b0be",
  cursor: "pointer", fontSize: "0.9rem", fontWeight: 600,
};

const confirmBtn = {
  flex: 1, padding: "12px",
  borderRadius: 8, border: "none",
  background: "#ff4757", color: "#fff",
  cursor: "pointer", fontSize: "0.9rem", fontWeight: 700,
  boxShadow: "0 4px 15px rgba(255,71,87,0.4)",
};

const analyzeBtn = {
  display: "flex", alignItems: "center", gap: 6,
  background: "rgba(99,102,241,0.1)",
  border: "1px solid rgba(99,102,241,0.25)",
  color: "#a5b4fc",
  borderRadius: 8,
  padding: "7px 14px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 700,
  transition: "all 0.2s",
  whiteSpace: "nowrap",
};

/* Toast */
const toastStyle = {
  position: "fixed", bottom: 32, left: "50%",
  transform: "translateX(-50%)",
  border: "1px solid",
  borderRadius: 10,
  padding: "12px 24px",
  fontWeight: 700,
  fontSize: "0.9rem",
  backdropFilter: "blur(20px)",
  zIndex: 1000,
  whiteSpace: "nowrap",
};

/* Skeleton helpers */
const skeletonCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: 24,
};

const shimmer = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 6,
};

const skeletonLine = (w, h, r = 6) => ({
  ...shimmer, width: w, height: h, borderRadius: r,
});

const skeletonBlock = (h = 200) => ({
  ...shimmer, width: "100%", height: h, borderRadius: 10,
});