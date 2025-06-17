import "./App.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AnimatedRoutes from "./AnimatedRoutes";
import PantallaInicio from "./components/PantallaInicio";
import PantallaPrincipal from "./components/PantallaPrincipal";
import PantallaMensajes from './components/PantallaMensajes';
import PantallaEquipos from "./components/PantallaEquipos";
import PantallaEventos from "./components/PantallaEventos";
import PantallaPerfil from "./components/PantallaPerfil";
import VistaComentarios from "./components/VistaComentarios";
import ProtectedRoute from "./components/proteccionRutas/ProtectedRoute";
import ReverseProtectedRoute from "./components/proteccionRutas/ReverseProtectedRoute";
import PantallaInfoEquipo from "./components/PantallaInfoEquipo";
import PoliticaPrivacidad from "./components/legales/PoliticaPrivacidad";
import TerminosServicio from "./components/legales/TerminosServicio";
import Accesibilidad from "./components/legales/Accesibilidad";
import Pagina404 from "./components/errores/Pagina404";



function App() {
  const [conversations] = useState([]);
  return (
    <Router>
      <AnimatedRoutes>
        <Routes>
          <Route path="/" element={<ReverseProtectedRoute><PantallaInicio /></ReverseProtectedRoute>} />
          <Route path="/principal" element={<ProtectedRoute><PantallaPrincipal /></ProtectedRoute>} />
          <Route path="/publicaciones/:postId" element={<ProtectedRoute><VistaComentarios /></ProtectedRoute>} />
          <Route path="/equipos" element={<ProtectedRoute><PantallaEquipos /></ProtectedRoute>} />
          <Route path="/eventos" element={<ProtectedRoute><PantallaEventos /></ProtectedRoute>} />
          <Route path="/perfil/:id" element={<ProtectedRoute><PantallaPerfil /></ProtectedRoute>} />
          <Route path="/mensajes" element={<ProtectedRoute><PantallaMensajes /></ProtectedRoute>} />
          <Route path="/equipo/:id" element={<ProtectedRoute><PantallaInfoEquipo /></ProtectedRoute>} />
          <Route path="/politicaDePrivacidad" element={<ProtectedRoute><PoliticaPrivacidad /></ProtectedRoute>} />
          <Route path="/terminosDeServicio" element={<ProtectedRoute><TerminosServicio /></ProtectedRoute>} />
          <Route path="accesibilidad" element={<ProtectedRoute><Accesibilidad /></ProtectedRoute>} />
          <Route path="*" element={<ProtectedRoute><Pagina404 /></ProtectedRoute>} />
        </Routes>
      </AnimatedRoutes>
    </Router>
  );
}

export default App;