import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE } from "../services/apiBase";

export default function UserLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.role === "user") {
        navigate("/interview");
      } else {
        alert("Login failed: Unauthorized role or credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at center, #1e1e3f 0%, #0c0c14 100%)",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
      overflow: "hidden"
    },
    card: {
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(20px)",
      padding: "50px 40px",
      borderRadius: "28px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 40px 100px rgba(0, 0, 0, 0.6)",
      textAlign: "center"
    },
    input: {
      width: "100%",
      padding: "15px",
      marginBottom: "18px",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(0, 0, 0, 0.2)",
      color: "#fff",
      fontSize: "1rem",
      outline: "none",
      boxSizing: "border-box",
    },
    loginBtn: {
      width: "100%",
      padding: "15px",
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
      color: "#fff",
      fontSize: "1.1rem",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "10px",
      boxShadow: "0 10px 20px rgba(79, 70, 229, 0.3)"
    },
    registerBtn: {
      background: "transparent",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      marginTop: "25px",
      fontSize: "0.9rem",
      width: "100%"
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative background flare */}
      <div style={{
        position: "absolute", width: "300px", height: "300px",
        background: "rgba(124, 58, 237, 0.1)", filter: "blur(80px)",
        borderRadius: "50%", bottom: "10%", right: "10%"
      }} />

      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={styles.card}
      >
        <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "8px" }}>Welcome Back</h2>
        <p style={{ color: "#a1a1aa", marginBottom: "35px" }}>Log in to your candidate dashboard</p>

        <motion.input
          whileFocus={{ scale: 1.02, borderColor: "#7c3aed" }}
          placeholder="Username"
          style={styles.input}
          onChange={(e) => setUsername(e.target.value)}
        />

        <motion.input
          whileFocus={{ scale: 1.02, borderColor: "#7c3aed" }}
          type="password"
          placeholder="Password"
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(79, 70, 229, 0.5)" }}
          whileTap={{ scale: 0.97 }}
          style={styles.loginBtn}
          onClick={login}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Authenticating..." : "Sign In"}
        </motion.button>

        <div style={{ margin: "25px 0", height: "1px", background: "rgba(255,255,255,0.1)" }} />

        <p style={{ color: "#71717a", fontSize: "0.9rem" }}>New here?</p>
        <motion.button 
          whileHover={{ background: "rgba(255,255,255,0.05)" }}
          style={styles.registerBtn}
          onClick={() => navigate("/user-register")}
        >
          Create Candidate Account
        </motion.button>
      </motion.div>
    </div>
  );
}