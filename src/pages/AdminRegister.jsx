import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE } from "../services/apiBase";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const register = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
          role: "admin"
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Admin registered successfully");
        navigate("/admin-login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Server error. Backend may not be running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at top right, #1a1a1a 0%, #050505 100%)",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
    },
    card: {
      background: "rgba(30, 30, 30, 0.6)",
      backdropFilter: "blur(20px)",
      padding: "50px 40px",
      borderRadius: "20px",
      border: "1px solid rgba(255, 71, 87, 0.2)", // Subtle red border for Admin
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      textAlign: "center"
    },
    input: {
      width: "100%",
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "8px",
      border: "1px solid #333",
      background: "#111",
      color: "#fff",
      fontSize: "0.95rem",
      outline: "none",
      boxSizing: "border-box",
    },
    mainBtn: {
      width: "100%",
      padding: "15px",
      borderRadius: "8px",
      border: "none",
      background: "#ff4757", // Admin Red
      color: "#fff",
      fontSize: "1rem",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 8px 15px rgba(255, 71, 87, 0.3)",
    },
    secondaryBtn: {
      marginTop: "20px",
      background: "transparent",
      border: "none",
      color: "#a4b0be",
      cursor: "pointer",
      fontSize: "0.9rem",
      textDecoration: "underline"
    }
  };

  return (
    <div style={styles.container}>
      {/* Red accent glow for Admin side */}
      <div style={{
        position: "absolute", width: "500px", height: "500px",
        background: "rgba(255, 71, 87, 0.05)", filter: "blur(120px)",
        borderRadius: "50%", top: "-10%", right: "-10%"
      }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <div style={{ marginBottom: "10px", color: "#ff4757", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
          Security Portal
        </div>
        <h2 style={{ fontSize: "2rem", marginBottom: "30px", fontWeight: "800" }}>Admin Setup</h2>

        <motion.input
          whileFocus={{ border: "1px solid #ff4757" }}
          placeholder="Admin Username"
          value={username}
          style={styles.input}
          onChange={(e) => setUsername(e.target.value)}
        />

        <motion.input
          whileFocus={{ border: "1px solid #ff4757" }}
          type="password"
          placeholder="Admin Password"
          value={password}
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.02, background: "#ff6b81" }}
          whileTap={{ scale: 0.98 }}
          style={styles.mainBtn}
          onClick={register}
          disabled={isProcessing}
        >
          {isProcessing ? "Creating Account..." : "Register Admin"}
        </motion.button>

        <button 
          style={styles.secondaryBtn} 
          onClick={() => navigate("/admin-login")}
        >
          Already have admin access? Log in
        </button>
      </motion.div>
    </div>
  );
}