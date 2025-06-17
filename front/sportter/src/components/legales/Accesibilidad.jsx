import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Accesibilidad() {
  const navigate = useNavigate();

  // Colores consistentes con tu tema
  const primaryColor = "#FF4500";
  const accentColor = "#FF7043";
  const backgroundColor = "#121212";
  const cardColor = "#1e1e1e";
  const textColor = "#e1e1e1";
  const lightTextColor = "#a0a0a0";
  const borderColor = "#2d2d2d";

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: "100vh",
        backgroundColor: backgroundColor,
        color: textColor,
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: cardColor,
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            borderBottom: `1px solid ${borderColor}`,
            paddingBottom: "1rem",
          }}
        >
          <h1
            style={{
              color: primaryColor,
              margin: 0,
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            Declaración de Accesibilidad
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            style={{
              background: primaryColor,
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Volver
          </motion.button>
        </div>

        {/* Introducción */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: textColor }}>
            En <span style={{ color: accentColor }}>SPORTTER</span>, 
            nos comprometemos a garantizar que nuestra plataforma sea accesible 
            para todos los usuarios, independientemente de sus capacidades o 
            tecnologías de asistencia que utilicen.
          </p>
        </div>

        {/* Contenido */}
        <div style={{ lineHeight: "1.6" }}>
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              Nuestro Compromiso
            </h2>
            <p style={{ color: textColor }}>
              Nos esforzamos por cumplir con las Pautas de Accesibilidad para el 
              Contenido Web (WCAG) 2.1 Nivel AA, un conjunto de pautas 
              internacionales para la accesibilidad web.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              Características de Accesibilidad
            </h2>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Navegación con teclado:</strong> Toda la funcionalidad está disponible usando solo el teclado.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Contraste adecuado:</strong> Relación de contraste mínimo de 4.5:1 para texto normal.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Texto alternativo:</strong> Imágenes incluyen texto alternativo descriptivo.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Estructura semántica:</strong> Uso adecuado de encabezados y etiquetas ARIA.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Tamaño de texto:</strong> Permite ajustar el tamaño del texto sin perder funcionalidad.
              </li>
              <li>
                <strong>Compatibilidad:</strong> Diseñado para trabajar con lectores de pantalla como JAWS, NVDA y VoiceOver.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              Áreas de Mejora Conocidas
            </h2>
            <p style={{ color: textColor, marginBottom: "1rem" }}>
              Estamos trabajando activamente para mejorar la accesibilidad en las siguientes áreas:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>
                Mejorar la experiencia en modos de alto contraste
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                Optimización para navegadores más antiguos
              </li>
              <li>
                Etiquetado más descriptivo para elementos interactivos complejos
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              Tecnologías de Asistencia Compatibles
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{
                backgroundColor: "rgba(255, 112, 67, 0.1)",
                padding: "1rem",
                borderRadius: "8px",
                flex: "1",
                minWidth: "200px"
              }}>
                <h3 style={{ color: accentColor, marginTop: 0 }}>Lectores de pantalla</h3>
                <ul style={{ paddingLeft: "1.25rem", color: lightTextColor }}>
                  <li>JAWS</li>
                  <li>NVDA</li>
                  <li>VoiceOver</li>
                  <li>TalkBack</li>
                </ul>
              </div>
              <div style={{
                backgroundColor: "rgba(255, 112, 67, 0.1)",
                padding: "1rem",
                borderRadius: "8px",
                flex: "1",
                minWidth: "200px"
              }}>
                <h3 style={{ color: accentColor, marginTop: 0 }}>Ampliadores</h3>
                <ul style={{ paddingLeft: "1.25rem", color: lightTextColor }}>
                  <li>ZoomText</li>
                  <li>Lupa de Windows</li>
                  <li>Magnifier (macOS)</li>
                </ul>
              </div>
              <div style={{
                backgroundColor: "rgba(255, 112, 67, 0.1)",
                padding: "1rem",
                borderRadius: "8px",
                flex: "1",
                minWidth: "200px"
              }}>
                <h3 style={{ color: accentColor, marginTop: 0 }}>Navegación</h3>
                <ul style={{ paddingLeft: "1.25rem", color: lightTextColor }}>
                  <li>Navegación por teclado</li>
                  <li>Conmutadores</li>
                  <li>Control por voz</li>
                </ul>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              Feedback y Asistencia
            </h2>
            <p style={{ color: textColor, marginBottom: "1rem" }}>
              Si encuentras alguna barrera de accesibilidad o necesitas asistencia:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Email:</strong> <span style={{ color: primaryColor }}>sportter.network@gmail.com</span>
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Teléfono:</strong> +34 931 735 348 (24h)
              </li>
             
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              Proceso de Evaluación
            </h2>
            <p style={{ color: textColor }}>
              Evaluamos regularmente nuestra accesibilidad mediante:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>Pruebas automatizadas con herramientas como axe y WAVE</li>
              <li style={{ marginBottom: "0.5rem" }}>Pruebas manuales por expertos en accesibilidad</li>
              <li>Feedback de usuarios con diversas capacidades</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              Fecha de Revisión
            </h2>
            <p style={{ color: textColor }}>
              Esta declaración fue revisada por última vez el{" "}
              <span style={{ color: accentColor }}>{new Date().toLocaleDateString()}</span>.
            </p>
            <p style={{ color: lightTextColor, fontSize: "0.9rem", marginTop: "2rem" }}>
              <em>Nos comprometemos a revisar y actualizar esta política periódicamente.</em>
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

export default Accesibilidad;