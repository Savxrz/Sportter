import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0); // Reset progress when component mounts
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 30, 100));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#121212",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        gap: "1.5rem"
      }}
    >
      {/* Resto del código del loader permanece igual */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }}
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "#FF4500",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <img
          src="https://i.imgur.com/vVkxceM.png"
          alt="icono"
          width="45"
          height="45"
          style={{ filter: "invert(1)" }}
        />
      </motion.div>

      <motion.h2
        style={{ color: "#FF4500", margin: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Sportter
      </motion.h2>

      <div style={{
        width: "200px",
        height: "6px",
        backgroundColor: "#2d2d2d",
        borderRadius: "3px",
        overflow: "hidden"
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            height: "100%",
            backgroundColor: "#FF4500",
            borderRadius: "3px"
          }}
        />
      </div>

      <motion.p
        style={{ color: "#a0a0a0", margin: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Cargando...
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;