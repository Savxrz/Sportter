import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  darLike,
  quitarLike,
  getComentarios,
  crearComentario,
  getPublicacion,
  checkLikeStatusComent,
  darLikeComent,
  quitarLikeComent,
} from "../services/api";

function VistaComentarios() {
  const location = useLocation();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [activeTab, setActiveTab] = useState("inicio");
  const [loading, setLoading] = useState(false);
  // Reemplaza el estado de loading por uno más descriptivo
  const [loadingState, setLoadingState] = useState({
    loading: true,
    error: null,
  });
  const [error, setError] = useState(null);
  const [showSportsMenu, setShowSportsMenu] = useState(false);
  const [selectedSport, setSelectedSport] = useState("General");
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const userData =
    location.state?.user || JSON.parse(localStorage.getItem("userData"));
  const userEmail = userData?.correoElectronico;
  const userName = userData?.nombreUsuario;
  const userId = userData?.id;

  // Estado para la publicación y comentarios
  const [publicacion, setPublicacion] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [loadingComentarios, setLoadingComentarios] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageScroll, setImageScroll] = useState({ top: 0, left: 0 });
  const [zoomAnchor, setZoomAnchor] = useState({ x: 0, y: 0 });

  const handleImageClick = (e, imageSrc) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setZoomAnchor({ x, y });
    setSelectedImage(imageSrc);
    setShowImageModal(true);
    setZoomLevel(1);
  };

  // Colores con tema anaranjado-rojizo
  const primaryColor = "#FF4500";
  const accentColor = "#FF7043";
  const backgroundColor = "#121212";
  const cardColor = "#1e1e1e";
  const textColor = "#e1e1e1";
  const lightTextColor = "#a0a0a0";
  const borderColor = "#2d2d2d";

  useEffect(() => {
    const handleWheel = (e) => {
      if (showImageModal && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleTouchMove = (e) => {
      if (showImageModal && e.touches.length > 1) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    if (showImageModal) {
      // Bloquear zoom con Ctrl+Scroll
      window.addEventListener("wheel", handleWheel, { passive: false });
      // Bloquear gesto de pellizco
      window.addEventListener("touchmove", handleTouchMove, { passive: false });

      // Bloquear el scroll de la página
      document.body.style.overflow = "hidden";
      // Bloquear zoom en móviles
      document.body.style.touchAction = "pan-x pan-y";

      // Bloquear doble tap zoom en móviles
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const originalContent = viewportMeta?.content;
      if (viewportMeta) {
        viewportMeta.content =
          originalContent + ", maximum-scale=1.0, user-scalable=no";
      }

      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchmove", handleTouchMove);
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        if (viewportMeta) {
          viewportMeta.content = originalContent;
        }
      };
    }
  }, [showImageModal]);

  // En el useEffect que carga los datos:
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingState({ loading: true, error: null });

        // Cargar publicación y comentarios en paralelo
        const [publicacionData, comentariosData] = await Promise.all([
          getPublicacion(postId),
          getComentarios(postId),
        ]);

        setPublicacion(publicacionData);
        setComentarios(comentariosData);
        setLoadingState({ loading: false, error: null });
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoadingState({
          loading: false,
          error: "Error al cargar la publicación y comentarios",
        });
      }
    };

    cargarDatos();
  }, [postId]);

  useEffect(() => {
    const cargarEstadoLikes = async () => {
      const actualizados = await Promise.all(
        comentarios.map(async (comentario) => {
          const yaDioLike = await checkLikeStatusComent(
            comentario.id,
            userEmail
          );
          return { ...comentario, yaDioLike };
        })
      );
      setComentarios(actualizados);
    };

    if (userEmail && comentarios.length > 0) {
      cargarEstadoLikes();
    }
  }, [comentarios, userEmail]);

  // Manejar like en la publicación
  const handleLike = async () => {
    if (!publicacion) return;

    try {
      if (publicacion.isLiked) {
        await quitarLike(publicacion.id, userEmail);
        setPublicacion({
          ...publicacion,
          likes: publicacion.likes - 1,
          isLiked: false,
        });
      } else {
        await darLike(publicacion.id, userEmail);
        setPublicacion({
          ...publicacion,
          likes: publicacion.likes + 1,
          isLiked: true,
        });
      }
    } catch (error) {
      console.error("Error al manejar like:", error);
      setError("Error al manejar el like");
    }
  };

  const handleLikeComentario = async (comentario) => {
    try {
      try {
        let response;
        if (comentario.yaDioLike) {
          response = await quitarLikeComent(comentario.id, userEmail);
        } else {
          response = await darLikeComent(comentario.id, userEmail);
        }

        setComentarios((prev) =>
          prev.map((c) =>
            c.id === comentario.id
              ? {
                  ...c,
                  likes: response.likes,
                  yaDioLike: response.likeRealizado,
                }
              : c
          )
        );
      } catch (error) {
        console.error("Error al manejar like en comentario:", error);
      }
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
      }
    }
  };

  // Enviar nuevo comentario
  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    const userData = JSON.parse(localStorage.getItem("userData"));

    try {
      setLoadingComentarios(true);

      const comentarioCreado = await crearComentario({
        contenido: nuevoComentario,
        publicacionId: parseInt(postId),
        usuarioId: userId,
      });

      // Crear objeto de comentario completo para el estado local
      const nuevoComentarioCompleto = {
        id: comentarioCreado.id,
        content: comentarioCreado.contenido,
        time: new Date(comentarioCreado.fechaHora),
        likes: comentarioCreado.likes || 0,
        isLiked: false,
        user: userData.correoElectronico,
        name: userData.nombreUsuario || "Anónimo",
      };

      // Actualizar estados

      setPublicacion((prev) => ({
        ...prev,
        comentarios: prev.comentarios + 1,
      }));
      setComentarios([nuevoComentarioCompleto, ...comentarios]);
      setPublicacion((prev) => ({
        ...prev,
        comments: (prev.comments || 0) + 1,
      }));
      setNuevoComentario("");
    } catch (error) {
      console.error("Error al crear comentario:", error);
      setError("Error al crear el comentario");
    } finally {
      setLoadingComentarios(false);
    }
  };

  // Redirigir al perfil
  const handleIrAPerfil = (userId) => {
    navigate(`/perfil/${userId}`);
  };

  // Detectar si es móvil o tablet
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowLeftSidebar(true);
        setShowRightSidebar(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerOpacity = Math.max(0.7, 1 - Math.min(scrollY / 100, 0.3));

  // Cerrar la barra lateral opuesta cuando se abre una
  const toggleLeftSidebar = () => {
    if (isMobile && showRightSidebar) {
      setShowRightSidebar(false);
    }
    setShowLeftSidebar(!showLeftSidebar);
  };

  const toggleRightSidebar = () => {
    if (isMobile && showLeftSidebar) {
      setShowLeftSidebar(false);
    }
    setShowRightSidebar(!showRightSidebar);
  };

  const formatRelativeTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime()))
      return "ahora";

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 5) return "ahora";
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)}m`;
    return `${Math.floor(diffInSeconds / 31536000)}a`;
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/", { replace: true });
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    setShowSportsMenu(false);
  };

  // Componentes para los iconos de deporte
  const SportIcon = ({ sport, ...props }) => {
    const icons = {
      General: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            color="currentColor"
          >
            <path d="M2 8.571c0-2.155 0-3.232.586-3.902S4.114 4 6 4h12c1.886 0 2.828 0 3.414.67c.586.668.586 1.745.586 3.9v6.858c0 2.155 0 3.232-.586 3.902S19.886 20 18 20H6c-1.886 0-2.828 0-3.414-.67C2 18.662 2 17.585 2 15.43z"></path>
            <circle cx="12" cy="12" r="2"></circle>
            <path d="M12 10V5m0 9v5M22 9h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1H22M2 9h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2"></path>
          </g>
        </svg>
      ),
      Fútbol: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 3.3l1.35-.95a8 8 0 0 1 4.38 3.34l-.39 1.34l-1.35.46L13 6.7zm-3.35-.95L11 5.3v1.4L7.01 9.49l-1.35-.46l-.39-1.34a8.1 8.1 0 0 1 4.38-3.34M7.08 17.11l-1.14.1A7.94 7.94 0 0 1 4 12c0-.12.01-.23.02-.35l1-.73l1.38.48l1.46 4.34zm7.42 2.48c-.79.26-1.63.41-2.5.41s-1.71-.15-2.5-.41l-.69-1.49l.64-1.1h5.11l.64 1.11zM14.27 15H9.73l-1.35-4.02L12 8.44l3.63 2.54zm3.79 2.21l-1.14-.1l-.79-1.37l1.46-4.34l1.39-.47l1 .73c.01.11.02.22.02.34c0 1.99-.73 3.81-1.94 5.21"
          />
        </svg>
      ),
      Baloncesto: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2M5.23 7.75C6.1 8.62 6.7 9.74 6.91 11H4.07a8.1 8.1 0 0 1 1.16-3.25M4.07 13h2.84a5.97 5.97 0 0 1-1.68 3.25A8.1 8.1 0 0 1 4.07 13M11 19.93c-1.73-.22-3.29-1-4.49-2.14A7.95 7.95 0 0 0 8.93 13H11zM11 11H8.93A8 8 0 0 0 6.5 6.2A8.04 8.04 0 0 1 11 4.07zm8.93 0h-2.84c.21-1.26.81-2.38 1.68-3.25c.6.97 1.01 2.07 1.16 3.25M13 4.07c1.73.22 3.29.99 4.5 2.13a8 8 0 0 0-2.43 4.8H13zm0 15.86V13h2.07a8 8 0 0 0 2.42 4.79A8 8 0 0 1 13 19.93m5.77-3.68A6 6 0 0 1 17.09 13h2.84a8.1 8.1 0 0 1-1.16 3.25"
          />
        </svg>
      ),
      Volleyball: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M16 10H8c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1m3-7h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1H8V2c0-.55-.45-1-1-1s-1 .45-1 1v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 16H6c-.55 0-1-.45-1-1V8h14v10c0 .55-.45 1-1 1m-5-5H8c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1"
          />
        </svg>
      ),
      Tenis: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2M5.61 16.78C4.6 15.45 4 13.8 4 12s.6-3.45 1.61-4.78a5.975 5.975 0 0 1 0 9.56M12 20c-1.89 0-3.63-.66-5-1.76c1.83-1.47 3-3.71 3-6.24S8.83 7.23 7 5.76C8.37 4.66 10.11 4 12 4s3.63.66 5 1.76c-1.83 1.47-3 3.71-3 6.24s1.17 4.77 3 6.24A7.96 7.96 0 0 1 12 20m6.39-3.22a5.975 5.975 0 0 1 0-9.56C19.4 8.55 20 10.2 20 12s-.6 3.45-1.61 4.78"
          />
        </svg>
      ),
      Ciclismo: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2M5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5m0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5m5.8-10l2.4-2.4l.8.8c1.06 1.06 2.38 1.78 3.96 2.02c.6.09 1.14-.39 1.14-1c0-.49-.37-.91-.85-.99c-1.11-.18-2.02-.71-2.75-1.43l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4c0 .6.2 1.1.6 1.4L11 14v4c0 .55.45 1 1 1s1-.45 1-1v-4.4c0-.52-.2-1.01-.55-1.38zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5m0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5"
          />
        </svg>
      ),
    };

    return icons[sport] || icons.General;
  };

  // Deportes disponibles
  const availableSports = [
    "General",
    "Fútbol",
    "Baloncesto",
    "Volleyball",
    "Tenis",
    "Ciclismo",
  ];

  if (loading || !publicacion) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      ></div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: backgroundColor,
          flexDirection: "column",
        }}
      >
        <div style={{ color: textColor, marginBottom: "1rem" }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: primaryColor,
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: backgroundColor,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: textColor,
        display: "flex",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Barra lateral izquierda */}
      <motion.div
        initial={{ x: isMobile ? -250 : 0 }}
        animate={{ x: showLeftSidebar ? 0 : isMobile ? -250 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "250px",
          height: "100vh",
          borderRight: `1px solid ${borderColor}`,
          backgroundColor: cardColor,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            width: "50px",
            height: "50px",
            cursor: "pointer",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            backgroundColor: primaryColor,
            padding: "10px",
          }}
          onClick={toggleLeftSidebar}
        >
          <img
            src="https://i.imgur.com/vVkxceM.png"
            alt="Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "invert()",
            }}
          />
        </motion.div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              color: activeTab === "inicio" ? accentColor : textColor,
              backgroundColor: "rgba(255, 112, 67, 0.1)",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
              borderRadius: "8px",
            }}
            onClick={() => {
              setActiveTab("inicio");
              isMobile && setShowLeftSidebar(false);
              navigate("/");
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "0.75rem" }}
            >
              <path
                fill="none"
                stroke="currentColor"
                d="M2 11.5h2a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V6.5h.389a.496.496 0 0 0 .413-.838L6.422.681a.59.59 0 0 0-.844 0L.698 5.662a.496.496 0 0 0 .413.838H1.5V11a.5.5 0 0 0 .5.5z"
              ></path>
            </svg>
            Inicio
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              color: activeTab === "explorar" ? accentColor : textColor,
              backgroundColor: "transparent",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
            }}
            onClick={() => {
              setActiveTab("explorar");
              isMobile && setShowLeftSidebar(false);
              navigate("/equipos");
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "explorar" ? 10 : 0,
                scale: activeTab === "explorar" ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{ marginBottom: "0.20rem" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "0.75rem" }}
              >
                <path
                  fill="currentColor"
                  d="M14.754 10c.966 0 1.75.784 1.75 1.75v4.749a4.501 4.501 0 0 1-9.002 0V11.75c0-.966.783-1.75 1.75-1.75zm0 1.5H9.252a.25.25 0 0 0-.25.25v4.749a3.001 3.001 0 0 0 6.002 0V11.75a.25.25 0 0 0-.25-.25M3.75 10h3.381a2.74 2.74 0 0 0-.618 1.5H3.75a.25.25 0 0 0-.25.25v3.249a2.5 2.5 0 0 0 3.082 2.433c.085.504.24.985.453 1.432Q6.539 18.999 6 19a4 4 0 0 1-4-4.001V11.75c0-.966.784-1.75 1.75-1.75m13.125 0h3.375c.966 0 1.75.784 1.75 1.75V15a4 4 0 0 1-5.03 3.866c.214-.448.369-.929.455-1.433q.277.066.575.067a2.5 2.5 0 0 0 2.5-2.5v-3.25a.25.25 0 0 0-.25-.25h-2.757a2.74 2.74 0 0 0-.618-1.5M12 3a3 3 0 1 1 0 6a3 3 0 0 1 0-6m6.5 1a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5m-13 0a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5m6.5.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m6.5 1a1 1 0 1 0 0 2a1 1 0 0 0 0-2m-13 0a1 1 0 1 0 0 2a1 1 0 0 0 0-2"
                ></path>
              </svg>
            </motion.div>
            Equipos
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              color: activeTab === "eventos" ? accentColor : textColor,
              backgroundColor: "transparent",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
            }}
            onClick={() => {
              setActiveTab("eventos");
              isMobile && setShowLeftSidebar(false);
              navigate("/eventos");
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "eventos" ? 10 : 0,
                scale: activeTab === "eventos" ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{ marginBottom: "0.20rem" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "0.75rem" }}
              >
                <path
                  d="M16 10H8c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1m3-7h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1H8V2c0-.55-.45-1-1-1s-1 .45-1 1v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 16H6c-.55 0-1-.45-1-1V8h14v10c0 .55-.45 1-1 1m-5-5H8c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1"
                  fill={activeTab === "eventos" ? accentColor : textColor}
                />
              </svg>
            </motion.div>
            Eventos
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              color: activeTab === "mensajes" ? accentColor : textColor,
              backgroundColor: "transparent",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
            }}
            onClick={() => {
              setActiveTab("mensajes");
              isMobile && setShowLeftSidebar(false);
              navigate("/mensajes");
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "mensajes" ? 10 : 0,
                scale: activeTab === "mensajes" ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{ marginRight: "0.75rem" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zm-8-7H7m10 4H7"
                ></path>
              </svg>
            </motion.div>
            Mensajes
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              color: activeTab === "perfil" ? accentColor : textColor,
              backgroundColor: "transparent",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
            }}
            onClick={() => {
              setActiveTab("perfil");
              isMobile && setShowLeftSidebar(false);
              navigate("/perfil/" + userData.id);
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "perfil" ? 10 : 0,
                scale: activeTab === "perfil" ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{ marginBottom: "0.20rem" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "0.75rem" }}
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M18 20a6 6 0 0 0-12 0"></path>
                  <circle cx="12" cy="10" r="4"></circle>
                  <circle cx="12" cy="12" r="10"></circle>
                </g>
              </svg>
            </motion.div>
            Perfil
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: primaryColor,
              color: "white",
              borderRadius: "30px",
              border: "none",
              fontSize: "1rem",
              padding: "10px 20px",
              fontWeight: "bold",
              marginTop: "1rem",
              width: "100%",
            }}
            onClick={() => {
              setShowPostModal(true);
              isMobile && setShowLeftSidebar(false);
            }}
          >
            Publicar
          </motion.button>
        </div>

        <div
          style={{
            marginTop: "auto",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            padding: "0.5rem",
            borderRadius: "50px",
            cursor: "pointer",
            ":hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: !userData?.imagen_perfil
                ? primaryColor
                : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "0.5rem",
            }}
          >
            {userData.imagen_perfil ? (
              <img
                src={userData.imagen_perfil}
                style={{
                  borderRadius: "50%",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span style={{ color: "white", fontWeight: "bold" }}>
                {userData.nombreUsuario?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
              {userName.charAt(0).toUpperCase() + userName.slice(1) ||
                "Usuario"}
            </div>
            <div
              data-tooltip-id="tooltip-email"
              data-tooltip-content={userEmail}
              style={{
                maxWidth: "100px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                cursor: "pointer",
              }}
            >
              {userEmail}
            </div>
            <ReactTooltip
              id="tooltip-email"
              place="bottom"
              style={{
                backgroundColor: "rgba(204, 112, 0, 0.27)",
                maxWidth: "244px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "transparent",
              border: "none",
              color: textColor,
              cursor: "pointer",
              padding: "0.5rem",
            }}
            onClick={handleLogout}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3m8 0h9m-12-8v.01m3-7.448v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"
                fill="none"
              />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft: isMobile ? "0" : "250px",
          backgroundColor: backgroundColor,
        }}
      >
        {/* Contenido central */}
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          {/* Encabezado */}
          <motion.div
            style={{
              position: "sticky",
              top: 0,
              padding: "1rem",
              borderBottom: `1px solid ${borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 10,
              backgroundColor: `rgba(30, 30, 30, ${headerOpacity})`,
              transition: "background-color 0.3s ease",
            }}
          >
            {/* Botón para mostrar barra izquierda en móviles */}
            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLeftSidebar}
                style={{
                  background: "transparent",
                  border: "none",
                  color: textColor,
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              style={{
                background: "transparent",
                border: "none",
                color: textColor,
                cursor: "pointer",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                marginRight: "1rem",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                  fill="currentColor"
                />
              </svg>
            </motion.button>

            <motion.h2
              style={{
                fontWeight: "bold",
                margin: 0,
                color: primaryColor,
                flex: 1,
                textAlign: "center",
                opacity: headerOpacity,
              }}
            >
              Publicación
            </motion.h2>

            {/* Espacio para alinear el título */}
            <div style={{ width: "24px", marginLeft: "1rem" }}></div>
          </motion.div>

          {/* Contenido de la publicación y comentarios */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: `${lightTextColor} ${backgroundColor}`,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: backgroundColor,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: lightTextColor,
                borderRadius: "10px",
                border: `2px solid ${backgroundColor}`,
              },
            }}
          >
            {/* Publicación principal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "1rem",
                border: `2px solid ${cardColor}`,
                display: "flex",
                backgroundColor: borderColor,
                margin: "1rem",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: !publicacion?.imagen
                    ? primaryColor
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "0.5rem",
                }}
              >
                {publicacion.imagen ? (
                  <img
                    src={publicacion.imagen}
                    style={{
                      borderRadius: "50%",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "white", fontWeight: "bold" }}>
                    {publicacion.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      marginRight: "0.25rem",
                      color: textColor,
                    }}
                  >
                    {publicacion.name}
                  </span>
                  {!isMobile && (
                    <>
                      <span
                        style={{
                          marginRight: "0.25rem",
                          color: lightTextColor,
                        }}
                      >
                        @{publicacion.user.split("@")[0]}
                      </span>
                    </>
                  )}
                  <span style={{ color: lightTextColor }}>
                    · {formatRelativeTime(new Date(publicacion.time))}
                  </span>
                  {publicacion.sport !== "General" && (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        color: primaryColor,
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <SportIcon
                        sport={publicacion.sport}
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "0.25rem",
                          color: "white",
                        }}
                      />
                      {publicacion.sport}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    color: textColor,
                    wordBreak: "break-word",
                  }}
                >
                  {publicacion.content}
                </p>

                {publicacion?.imagenPost && (
                  <div
                    style={{
                      margin: "1rem 0",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "zoom-in",
                    }}
                    onClick={(e) => handleImageClick(e, publicacion.imagenPost)}
                  >
                    <img
                      src={publicacion.imagenPost}
                      alt="Contenido de la publicación"
                      onError={(e) => {
                        console.error("Error cargando imagen:", {
                          src: publicacion.imagenPost?.substring(0, 50),
                          error: e,
                        });
                        e.target.style.display = "none";
                      }}
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Formulario para nuevo comentario */}
            <div
              style={{
                padding: "1rem",
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: cardColor,
              }}
            >
              <form onSubmit={handleEnviarComentario}>
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: !userData?.imagen_perfil
                        ? primaryColor
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "0.5rem",
                    }}
                  >
                    {userData.imagen_perfil ? (
                      <img
                        src={userData.imagen_perfil}
                        style={{
                          borderRadius: "50%",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "white", fontWeight: "bold" }}>
                        {userData.nombreUsuario?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <textarea
                      placeholder="Escribe un comentario..."
                      rows="2"
                      style={{
                        width: "100%",
                        fontSize: "1rem",
                        resize: "none",
                        backgroundColor: "transparent",
                        color: textColor,
                        border: "none",
                        outline: "none",
                        padding: "0.5rem 0",
                      }}
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "0.5rem",
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    style={{
                      background: nuevoComentario.trim()
                        ? primaryColor
                        : "rgba(255, 69, 0, 0.5)",
                      color: "white",
                      borderRadius: "30px",
                      border: "none",
                      padding: "8px 24px",
                      cursor: nuevoComentario.trim()
                        ? "pointer"
                        : "not-allowed",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                    disabled={!nuevoComentario.trim()}
                  >
                    {loadingComentarios ? "Publicando..." : "Comentar"}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Lista de comentarios */}
            {comentarios.length > 0 ? (
              comentarios.map((comentario) => (
                <motion.div
                  key={comentario.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    padding: "1rem",
                    borderBottom: `1px solid ${borderColor}`,
                    display: "flex",
                    backgroundColor: cardColor,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: !comentario?.imagen
                        ? primaryColor
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "0.5rem",
                    }}
                  >
                    {comentario.imagen ? (
                      <img
                        src={comentario.imagen}
                        style={{
                          borderRadius: "50%",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "white", fontWeight: "bold" }}>
                        {comentario.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          marginRight: "0.25rem",
                          color: textColor,
                        }}
                      >
                        {comentario.name}
                      </span>
                      <span
                        style={{
                          marginRight: "0.25rem",
                          color: lightTextColor,
                        }}
                      >
                        @{comentario.user}
                      </span>
                      <span style={{ color: lightTextColor }}>
                        · {formatRelativeTime(new Date(comentario.time))}
                      </span>
                    </div>
                    <p
                      style={{
                        marginBottom: "0.5rem",
                        color: textColor,
                        wordBreak: "break-word",
                      }}
                    >
                      {comentario.content}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        maxWidth: "100%",
                      }}
                    ></div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: lightTextColor,
                }}
              >
                No hay comentarios todavía. ¡Sé el primero en comentar!
              </div>
            )}
          </div>
        </div>
      </div>
      {showImageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 1000,
            overflow: "auto",
            cursor: "zoom-out",
            // Esto ayuda a prevenir el zoom en móviles
            touchAction: "none",
            // Bloquea el doble tap zoom en móviles
            fontSize: "16px",
          }}
          onClick={() => {
            setShowImageModal(false);
            setZoomLevel(1);
          }}
          // Prevenir eventos táctiles
          onTouchMove={(e) => {
            if (e.touches.length > 1) e.preventDefault();
          }}
        >
          <button
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "2rem",
              cursor: "pointer",
              zIndex: 1001,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(false);
              setZoomLevel(1);
            }}
          >
            ×
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <img
              src={selectedImage}
              alt="Ampliada"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center top",
                transition: "transform 0.2s ease",
                cursor: "zoom-in",
                // Prevenir selección
                userSelect: "none",
                // Prevenir arrastre en móviles
                pointerEvents: zoomLevel === 1 ? "auto" : "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((prev) => (prev === 1 ? 2 : 1));
              }}
              // Prevenir gestos de zoom nativo
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VistaComentarios;
