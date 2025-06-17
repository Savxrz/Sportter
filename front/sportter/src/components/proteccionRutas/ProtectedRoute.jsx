import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';

function ProtectedRoute({ children }) {
  const location = useLocation();
  
  useEffect(() => {
    console.log("[DEBUG] ProtectedRoute montado");
  }, []);

  // Verificación más robusta del usuario
  const getUserData = () => {
    try {
      const data = localStorage.getItem("userData");
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Verifica que los datos mínimos existan
      if (!parsed?.id || !parsed?.correoElectronico) return null;
      return parsed;
    } catch (error) {
      console.error("Error al leer userData:", error);
      return null;
    }
  };

  const userData = getUserData();
  console.log("[DEBUG] Datos de usuario:", userData);

  if (!userData) {
    console.log("[DEBUG] Redirigiendo a login desde:", location.pathname);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;