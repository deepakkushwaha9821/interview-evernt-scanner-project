import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  // Animation variants for the container
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.3 } 
    }
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Modern Styles
  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%)",
      color: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden",
    },
    card: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(12px)",
      padding: "60px",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      textAlign: "center",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    },
    title: {
      fontSize: "3.5rem",
      fontWeight: "800",
      letterSpacing: "-1px",
      marginBottom: "10px",
      background: "linear-gradient(to right, #fff, #94a3b8)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      color: "#94a3b8",
      marginBottom: "40px",
      fontSize: "1.1rem",
    },
    buttonGroup: {
      display: "flex",
      gap: "20px",
      justifyContent: "center",
    },
    btnBase: {
      padding: "16px 32px",
      fontSize: "1rem",
      fontWeight: "600",
      borderRadius: "12px",
      cursor: "pointer",
      border: "none",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    btnAdmin: {
      background: "rgba(255, 255, 255, 0.1)",
      color: "#fff",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    btnUser: {
      background: "#6366f1",
      color: "#fff",
      boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.5)",
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decorative Glow */}
      <div style={{
        position: "absolute", width: "400px", height: "400px",
        background: "rgba(99, 102, 241, 0.15)", filter: "blur(100px)",
        borderRadius: "50%", top: "20%", left: "30%"
      }} />

      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="visible"
        style={styles.card}
      >
        <motion.h1 variants={itemVars} style={styles.title}>
          AI Interview System
        </motion.h1>
        
        <motion.p variants={itemVars} style={styles.subtitle}>
          Select your portal to continue
        </motion.p>

        <motion.div variants={itemVars} style={styles.buttonGroup}>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            style={{ ...styles.btnBase, ...styles.btnAdmin }}
            onClick={() => navigate("/admin-login")}
          >
            Admin Portal
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
            whileTap={{ scale: 0.98 }}
            style={{ ...styles.btnBase, ...styles.btnUser }}
            onClick={() => navigate("/user-login")}
          >
            Candidate Login
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}