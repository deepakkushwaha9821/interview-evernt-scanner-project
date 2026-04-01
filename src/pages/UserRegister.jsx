import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE } from "../services/apiBase";

export default function UserRegister() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: "user" })
      });

      const data = await res.json();
      // Replace alert with a smoother UX if possible, but keeping logic:
      alert(data.message);
      if (res.ok) navigate("/user-login");
    } catch (error) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%)",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
    },
    card: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(16px)",
      padding: "40px",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    },
    input: {
      width: "100%",
      padding: "14px",
      marginBottom: "20px",
      borderRadius: "10px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "#fff",
      fontSize: "1rem",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.3s ease",
    },
    button: {
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "none",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      color: "#fff",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.4)",
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "10px", textAlign: "center" }}>Create Account</h2>
        <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "30px" }}>Join the AI Interview platform</p>

        <motion.input
          whileFocus={{ borderColor: "#6366f1", backgroundColor: "rgba(255,255,255,0.1)" }}
          placeholder="Username"
          style={styles.input}
          onChange={(e) => setUsername(e.target.value)}
        />

        <motion.input
          whileFocus={{ borderColor: "#6366f1", backgroundColor: "rgba(255,255,255,0.1)" }}
          type="password"
          placeholder="Password"
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.98 }}
          style={styles.button}
          onClick={register}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </motion.button>

        <p 
          onClick={() => navigate("/user-login")}
          style={{ marginTop: "20px", textAlign: "center", color: "#94a3b8", cursor: "pointer", fontSize: "0.9rem" }}
        >
          Already have an account? <span style={{ color: "#6366f1" }}>Login</span>
        </p>
      </motion.div>
    </div>
  );
}