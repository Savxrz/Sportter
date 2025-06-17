import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function TerminosServicio() {
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
            Términos de Servicio
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
          <p style={{ color: textColor, fontStyle: "italic" }}>
            Al acceder y utilizar nuestra aplicación, aceptas cumplir con estos Términos de Servicio. 
            Si no estás de acuerdo con alguno de estos términos, por favor no utilices nuestro servicio.
          </p>
        </div>

        {/* Contenido */}
        <div style={{ lineHeight: "1.6" }}>
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              1. Uso del Servicio
            </h2>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>
                Debes tener al menos 13 años para utilizar este servicio.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                No puedes utilizar el servicio para actividades ilegales o no autorizadas.
              </li>
              <li>
                Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              2. Contenido del Usuario
            </h2>
            <p style={{ color: textColor, marginBottom: "1rem" }}>
              Eres responsable del contenido que publiques en nuestra plataforma:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>
                No publiques contenido ilegal, difamatorio, obsceno o que viole derechos de terceros.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                Conservas los derechos de autor sobre tu contenido, pero nos otorgas una licencia para mostrarlo en nuestro servicio.
              </li>
              <li>
                Podemos eliminar contenido que consideremos inapropiado sin previo aviso.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              3. Conducta Prohibida
            </h2>
            <p style={{ color: textColor }}>
              Al usar el servicio, aceptas no:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>Hacer ingeniería inversa o descompilar la aplicación</li>
              <li style={{ marginBottom: "0.5rem" }}>Enviar spam o contenido malicioso</li>
              <li style={{ marginBottom: "0.5rem" }}>Suplantar la identidad de otros usuarios</li>
              <li style={{ marginBottom: "0.5rem" }}>Interferir con la seguridad del servicio</li>
              <li>Recolectar datos de otros usuarios sin consentimiento</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              4. Propiedad Intelectual
            </h2>
            <p style={{ color: textColor }}>
              Todos los derechos de propiedad intelectual relacionados con la plataforma son nuestros o de nuestros licenciantes. 
              Estos términos no te otorgan derechos sobre nuestra propiedad intelectual.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              5. Limitación de Responsabilidad
            </h2>
            <p style={{ color: textColor, marginBottom: "1rem" }}>
              El servicio se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que:
            </p>
            <ul style={{ paddingLeft: "1.5rem", color: lightTextColor }}>
              <li style={{ marginBottom: "0.5rem" }}>El servicio esté siempre disponible o libre de errores</li>
              <li style={{ marginBottom: "0.5rem" }}>Los resultados obtenidos sean precisos o confiables</li>
              <li>La calidad de los productos o servicios cumpla con tus expectativas</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              6. Modificaciones del Servicio
            </h2>
            <p style={{ color: textColor }}>
              Nos reservamos el derecho de modificar o discontinuar el servicio (total o parcialmente) con o sin notificación. 
              No seremos responsables ante ti o terceros por cualquier modificación, suspensión o discontinuación del servicio.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              7. Terminación
            </h2>
            <p style={{ color: textColor }}>
              Podemos terminar o suspender tu acceso al servicio inmediatamente, sin previo aviso ni responsabilidad, 
              si incumples estos términos. Al terminar, tu derecho a usar el servicio cesará inmediatamente.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              8. Ley Aplicable
            </h2>
            <p style={{ color: textColor }}>
              Estos términos se regirán e interpretarán de acuerdo con las leyes del país donde opera nuestra empresa, 
              sin considerar sus disposiciones sobre conflictos de leyes.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              9. Cambios en los Términos
            </h2>
            <p style={{ color: textColor }}>
              Podemos actualizar estos términos ocasionalmente. Te notificaremos sobre cambios significativos. 
              El uso continuado del servicio después de los cambios constituye aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 style={{ color: accentColor, marginBottom: "1rem" }}>
              10. Contacto
            </h2>
            <p style={{ color: textColor }}>
              Para preguntas sobre estos términos, contáctanos en:{" "}
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

export default TerminosServicio;