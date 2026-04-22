import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CandidateProfile() {
  const navigate = useNavigate();
  const storedUsername = useMemo(() => localStorage.getItem("candidate_username") || "Candidate", []);

  const [candidateName, setCandidateName] = useState(storedUsername);
  const [selectedTopic, setSelectedTopic] = useState("python");
  const [maxQuestions, setMaxQuestions] = useState(5);

  const start = () => {
    localStorage.setItem("candidate_username", candidateName || "Candidate");
    const params = new URLSearchParams({
      topic: selectedTopic,
      candidate: candidateName || "Candidate",
      maxQuestions: String(maxQuestions),
    });
    navigate(`/interview?${params.toString()}`);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "radial-gradient(circle at 5% 10%, #7c2d12 0%, #0f172a 45%, #020617 100%)",
      color: "#f8fafc",
      fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
      padding: "28px",
      boxSizing: "border-box",
    },
    shell: {
      width: "100%",
      maxWidth: "1240px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: "22px",
    },
    panel: {
      borderRadius: "22px",
      border: "1px solid rgba(248, 250, 252, 0.14)",
      background: "linear-gradient(145deg, rgba(2, 6, 23, 0.78), rgba(15, 23, 42, 0.92))",
      boxShadow: "0 24px 70px rgba(0, 0, 0, 0.45)",
    },
    hero: {
      padding: "34px",
      display: "grid",
      gap: "18px",
      minHeight: "520px",
      alignContent: "start",
    },
    form: {
      padding: "34px",
      display: "grid",
      gap: "18px",
      minHeight: "520px",
      alignContent: "start",
    },
    title: {
      margin: 0,
      fontSize: "2.5rem",
      lineHeight: 1.05,
      fontWeight: 900,
      letterSpacing: "0.01em",
    },
    text: {
      margin: 0,
      color: "#d1d5db",
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    metricGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "10px",
      marginTop: "8px",
    },
    metric: {
      borderRadius: "12px",
      padding: "12px",
      border: "1px solid rgba(248, 250, 252, 0.16)",
      background: "rgba(15, 23, 42, 0.45)",
      textAlign: "center",
    },
    label: {
      margin: 0,
      color: "#cbd5e1",
      fontSize: "0.9rem",
      fontWeight: 600,
    },
    input: {
      width: "100%",
      padding: "13px 14px",
      borderRadius: "11px",
      border: "1px solid rgba(248, 250, 252, 0.2)",
      background: "rgba(15, 23, 42, 0.55)",
      color: "#f8fafc",
      fontSize: "1rem",
      boxSizing: "border-box",
      outline: "none",
    },
    topicGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },
    startBtn: {
      border: "none",
      borderRadius: "13px",
      background: "linear-gradient(90deg, #ef4444, #f59e0b)",
      color: "#fff",
      fontWeight: 800,
      fontSize: "1rem",
      padding: "13px 18px",
      cursor: "pointer",
      marginTop: "8px",
    },
  };

  return (
    <div style={styles.page}>
      <motion.div
        style={styles.shell}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <section style={{ ...styles.panel, ...styles.hero }}>
          <p style={{ margin: 0, color: "#fb7185", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem" }}>
            CANDIDATE WORKSPACE
          </p>
          <h1 style={styles.title}>Build Your Interview Profile</h1>
          <p style={styles.text}>
            Select topic and interview length. The engine adapts difficulty after each answer so
            the session feels like a real interviewer.
          </p>

          <div style={styles.metricGrid}>
            <div style={styles.metric}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>2</div>
              <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Topics</div>
            </div>
            <div style={styles.metric}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>AI</div>
              <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Evaluation</div>
            </div>
            <div style={styles.metric}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>Live</div>
              <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Adaptive</div>
            </div>
          </div>

          <div style={{ marginTop: "8px", border: "1px dashed rgba(248,250,252,0.25)", borderRadius: "12px", padding: "12px" }}>
            <p style={{ margin: 0, color: "#e2e8f0", fontSize: "0.9rem" }}>
              Tip: choose <b>5 questions</b> for balanced difficulty progression.
            </p>
          </div>
        </section>

        <section style={{ ...styles.panel, ...styles.form }}>
          <div>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.9rem" }}>Candidate Name</p>
            <input
              style={styles.input}
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <p style={styles.label}>Select Topic</p>
            <div style={styles.topicGrid}>
              {[
                { key: "python", title: "Python Interview", desc: "Core language + coding concepts" },
                { key: "llm", title: "LLM Interview", desc: "Prompting, tuning, and safety" },
              ].map((topic) => (
                <motion.button
                  key={topic.key}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedTopic(topic.key)}
                  style={{
                    textAlign: "left",
                    borderRadius: "12px",
                    border: selectedTopic === topic.key ? "1px solid #f59e0b" : "1px solid rgba(248, 250, 252, 0.16)",
                    background: selectedTopic === topic.key ? "rgba(245, 158, 11, 0.16)" : "rgba(15, 23, 42, 0.48)",
                    color: "#f8fafc",
                    padding: "14px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "1rem", fontWeight: 700 }}>{topic.title}</div>
                  <div style={{ fontSize: "0.84rem", color: "#cbd5e1", marginTop: "5px" }}>{topic.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p style={styles.label}>Questions Count</p>
            <select
              style={styles.input}
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(Number(e.target.value))}
            >
              <option value={3}>3 questions</option>
              <option value={5}>5 questions</option>
              <option value={7}>7 questions</option>
            </select>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.startBtn} onClick={start}>
            Start Interview
          </motion.button>
        </section>
      </motion.div>
    </div>
  );
}
