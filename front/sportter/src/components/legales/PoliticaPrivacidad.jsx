import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function PoliticaPrivacidad() {
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
            Política de Privacidad
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

        {/* Contenido */}
        <div style={{ lineHeight: "1.6" }}>
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              1. Información que Recopilamos
            </h2>
            <p style={{ color: textColor, marginBottom: "1rem" }}>
              En nuestra aplicación, recopilamos los siguientes tipos de información:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Información de registro:</strong> Nombre, email y datos de perfil cuando creas una cuenta.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Datos de uso:</strong> Cómo interactúas con la aplicación, incluyendo tiempos de sesión y características utilizadas.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Contenido generado:</strong> Mensajes, publicaciones y cualquier contenido que compartas.
              </li>
              <li>
                <strong>Datos técnicos:</strong> Dirección IP, tipo de navegador y versión, configuración regional.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              2. Cómo Usamos Tu Información
            </h2>
            <p style={{ color: textColor }}>
              Utilizamos tus datos para:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>Proveer y mantener nuestro servicio</li>
              <li style={{ marginBottom: "0.5rem" }}>Notificarte sobre cambios en la aplicación</li>
              <li style={{ marginBottom: "0.5rem" }}>Permitirte participar en características interactivas</li>
              <li style={{ marginBottom: "0.5rem" }}>Proveer soporte al cliente</li>
              <li style={{ marginBottom: "0.5rem" }}>Mejorar y personalizar la experiencia</li>
              <li>Detectar y prevenir actividades fraudulentas</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              3. Compartir Información
            </h2>
            <p style={{ color: textColor }}>
              No vendemos ni alquilamos tus datos personales. Podemos compartir información con:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Proveedores de servicios:</strong> Para operar y mantener la aplicación.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Cumplimiento legal:</strong> Cuando sea requerido por ley.
              </li>
              <li>
                <strong>Transferencias de negocio:</strong> En caso de fusión o adquisición.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              4. Seguridad de Datos
            </h2>
            <p style={{ color: textColor }}>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales. Sin embargo, ninguna transmisión por Internet o almacenamiento electrónico es 100% seguro.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              5. Tus Derechos
            </h2>
            <p style={{ color: textColor }}>
              Tienes derecho a:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>Acceder a tus datos personales</li>
              <li style={{ marginBottom: "0.5rem" }}>Solicitar corrección de datos incorrectos</li>
              <li style={{ marginBottom: "0.5rem" }}>Pedir eliminación de tus datos</li>
              <li style={{ marginBottom: "0.5rem" }}>Oponerte al procesamiento de datos</li>
              <li>Solicitar transferencia de datos a otro servicio</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              6. Cookies y Tecnologías Similares
            </h2>
            <p style={{ color: textColor }}>
              Utilizamos cookies para mejorar tu experiencia. Puedes configurar tu navegador para rechazar todas las cookies, pero algunas características podrían no funcionar correctamente.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              7. Cambios a esta Política
            </h2>
            <p style={{ color: textColor }}>
              Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios significativos. La versión actualizada será efectiva inmediatamente después de su publicación.
            </p>
          </section>

          <section>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              8. Contacto
            </h2>
            <p style={{ color: textColor }}>
              Para preguntas sobre esta política, contáctanos en:{" "}
              <span style={{ color: primaryColor }}>sportter.network@gmail.com</span>
            </p>
            <p style={{ color: lightTextColor, fontSize: "0.9rem", marginTop: "2rem" }}>
              <em>Última actualización: {new Date().toLocaleDateString()}</em>
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

export default PoliticaPrivacidad;