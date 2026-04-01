import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE } from "../services/apiBase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async () => {
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        alert("Access Denied: Admin credentials required.");
      }
    } catch (error) {
      console.error(error);
      alert("Server error: Unable to connect to the Admin gateway.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
    },
    card: {
      background: "rgba(20, 20, 20, 0.8)",
      backdropFilter: "blur(25px)",
      padding: "50px 45px",
      borderRadius: "16px",
      border: "1px solid rgba(255, 71, 87, 0.3)",
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 0 40px rgba(0, 0, 0, 0.8)",
      zIndex: 1,
    },
    input: {
      width: "100%",
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "6px",
      border: "1px solid #333",
      background: "#000",
      color: "#ff4757", // Text is slightly red-tinted for Admin
      fontSize: "1rem",
      outline: "none",
      boxSizing: "border-box",
      letterSpacing: "0.5px"
    },
    loginBtn: {
      width: "100%",
      padding: "16px",
      borderRadius: "6px",
      border: "none",
      background: "#ff4757",
      color: "#fff",
      fontSize: "1rem",
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: "1px",
      cursor: "pointer",
      boxShadow: "0 6px 20px rgba(255, 71, 87, 0.4)",
    },
    footerLink: {
      marginTop: "25px",
      color: "#57606f",
      fontSize: "0.85rem",
      cursor: "pointer",
      display: "block",
      textDecoration: "none"
    }
  };

  return (
    <div style={styles.container}>
      {/* Structural background elements */}
      <div style={{
        position: "absolute", width: "100%", height: "1px", 
        background: "rgba(255, 71, 87, 0.1)", top: "50%" 
      }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={styles.card}
      >
        <div style={{ color: "#ff4757", fontSize: "0.75rem", letterSpacing: "3px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>
          ADMINISTRATOR ACCESS
        </div>
        
        <h2 style={{ fontSize: "1.8rem", marginBottom: "35px", textAlign: "center", fontWeight: "300" }}>
          System <span style={{ fontWeight: "700" }}>Login</span>
        </h2>

        <motion.input
          whileFocus={{ border: "1px solid #ff4757", boxShadow: "0 0 10px rgba(255, 71, 87, 0.2)" }}
          placeholder="Admin ID"
          style={styles.input}
          onChange={(e) => setUsername(e.target.value)}
        />

        <motion.input
          whileFocus={{ border: "1px solid #ff4757", boxShadow: "0 0 10px rgba(255, 71, 87, 0.2)" }}
          type="password"
          placeholder="Security Key"
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.02, background: "#ff6b81" }}
          whileTap={{ scale: 0.98 }}
          style={styles.loginBtn}
          onClick={login}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "Verifying..." : "Authorize Login"}
        </motion.button>

        <motion.span 
          whileHover={{ color: "#ff4757" }}
          style={styles.footerLink}
          onClick={() => navigate("/admin-register")}
        >
          Request Admin Privileges
        </motion.span>
      </motion.div>
    </div>
  );
}