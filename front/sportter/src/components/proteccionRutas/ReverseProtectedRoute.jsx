// components/ReverseProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

function ReverseProtectedRoute({ children }) {
  const location = useLocation();
  
  const getUserData = () => {
    try {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const userData = getUserData();

  // Si hay usuario logueado, redirigir a la pantalla principal
  if (userData) {
    return <Navigate to="/principal" state={{ from: location }} replace />;
  }

  return children;
}

export default ReverseProtectedRoute;