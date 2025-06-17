import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Pagina404() {
  const navigate = useNavigate();

  // Colores consistentes con tu tema
  const primaryColor = "#FF4500";
  const accentColor = "#FF7043";
  const backgroundColor = "#121212";
  const cardColor = "#1e1e1e";
  const textColor = "#e1e1e1";
  const lightTextColor = "#a0a0a0";
  const borderColor = "#2d2d2d";

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        backgroundColor: backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: cardColor,
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${borderColor}`,
        }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            fontSize: "6rem",
            fontWeight: "bold",
            color: primaryColor,
            marginBottom: "1rem",
          }}
        >
          404
        </motion.div>

        <h1 style={{ color: textColor, fontSize: "2rem", marginBottom: "1rem" }}>
          ¡Página no encontrada!
        </h1>
        
        <p style={{ color: lightTextColor, marginBottom: "2rem", fontSize: "1.1rem" }}>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoHome}
            style={{
              background: primaryColor,
              color: "white",
              border: "none",
              borderRadius: "50px",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Volver al inicio
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            style={{
              background: "transparent",
              color: primaryColor,
              border: `1px solid ${primaryColor}`,
              borderRadius: "50px",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Volver atrás
          </motion.button>
        </div>

        <div style={{ marginTop: "3rem", color: lightTextColor, fontSize: "0.9rem" }}>
          <p>Si crees que esto es un error, por favor contacta a soporte.</p>
          <a href="mailto:sportter.network@gmail.com" style={{ color: accentColor, marginTop: "0.5rem" }}>
            sportter.network@gmail.com
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default Pagina404;