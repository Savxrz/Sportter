import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { mensajeService } from "../services/api";

import {
  loadPosts,
  darLike,
  quitarLike,
  crearPublicacion,
  getUsers,
  actualizarCompartidos,
} from "../services/api";
import { useConversaciones } from "../components/hooks/useConversaciones";
import { text } from "framer-motion/client";

function PantallaPrincipal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inicio");
  const [loading, setLoading] = useState(false);
  const [showSportsMenu, setShowSportsMenu] = useState(false);
  const [selectedSport, setSelectedSport] = useState("General");
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const stompClientRef = useRef(null);

  const userData =
    location.state?.user || JSON.parse(localStorage.getItem("userData"));
  const userEmail = userData?.correoElectronico;
  const userName = userData?.nombreUsuario;
  const currentUserId = userData?.id;

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentSharedPost, setCurrentSharedPost] = useState(null);
  const [modalSelectedSport, setModalSelectedSport] = useState("General");
  const [showModalSportsMenu, setShowModalSportsMenu] = useState(false);
  const [useEffectd, setUsed] = useState(false);
  const [posts, setPosts] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageScroll, setImageScroll] = useState({ top: 0, left: 0 });
  const [zoomAnchor, setZoomAnchor] = useState({ x: 0, y: 0 });
  const handleImageClick = (e, imageSrc) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // Posición X relativa a la imagen
    const y = e.clientY - rect.top; // Posición Y relativa a la imagen
    setZoomAnchor({ x, y });
    setSelectedImage(imageSrc);
    setShowImageModal(true);
    setZoomLevel(1);
  };

  const [showUserSearchModal, setShowUserSearchModal] = useState(false);

  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState("");

  // Datos de ejemplo para usuarios
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { conversations, loadingConversations } =
    useConversaciones(currentUserId);

  const UserAvatar = ({ usuario }) => {
    const [imgError, setImgError] = useState(false);

    // Si no hay usuario o imagen, mostramos el icono por defecto
    if (!usuario?.imagen_perfil || imgError) {
      return (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "#FF4500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 20 12 20C16.41 20 20 16.41 20 12C20 7.59 16.41 4 12 4Z"
              fill="white"
            />
            <path
              d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z"
              fill="white"
            />
            <path
              d="M6.5 17.5C7.33 15.5 9.5 14 12 14C14.5 14 16.67 15.5 17.5 17.5H6.5Z"
              fill="white"
            />
          </svg>
        </div>
      );
    }

    return (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <img
          src={usuario.imagen_perfil}
          alt={`Avatar de ${usuario.nombreUsuario}`}
          onError={() => {
            console.error("Error cargando imagen de perfil");
            setImgError(true);
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    );
  };

  // Cargar publicaciones al iniciar
  useEffect(() => {
    const fetchAndSetPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await loadPosts();
        if (fetchedPosts && Array.isArray(fetchedPosts)) {
          const resolvedPosts = await Promise.all(fetchedPosts);

          const processedPosts = resolvedPosts
            .filter((post) => post) // Filtra posts nulos
            .map((post) => {
              // Verificación robusta de imagen
              const hasValidImage =
                post.imagen &&
                typeof post.imagen === "string" &&
                post.imagen.startsWith("data:image/") &&
                post.imagen.length > 100;

              return {
                ...post,
                time: new Date(post.time),
                imagen: hasValidImage ? post.imagen : null, // Conserva null si no es válida
              };
            });

          console.log(
            "Posts procesados:",
            processedPosts.map((p) => ({
              id: p.id,
              hasImage: !!p.imagen,
              contentLength: p.content?.length,
              imageLength: p.imagen?.length,
            }))
          );

          setPosts(processedPosts);
        } else {
          console.warn("No se recibieron posts o el array está vacío");
          setPosts([]);
        }
      } catch (error) {
        console.error("Error cargando publicaciones:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetPosts();
  }, []);

  useEffect(() => {
    // Opcional: Recargar publicaciones cada X tiempo
    const interval = setInterval(loadPosts, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userData) {
      localStorage.setItem("userDataMessages", JSON.stringify(userData));
    }
  }, [userData]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const fetchedUsers = await getUsers();

        // Ordenar usuarios alfabéticamente por nombreUsuario
        const sortedUsers = fetchedUsers.sort((a, b) => {
          const nameA = a.nombreUsuario?.toUpperCase() || ""; // Manejo seguro de valores undefined
          const nameB = b.nombreUsuario?.toUpperCase() || "";
          return nameA.localeCompare(nameB);
        });

        console.log("Usuarios ordenados:", sortedUsers); // Debug
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
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

  // Colores con tema anaranjado-rojizo
  const primaryColor = "#FF4500";
  const accentColor = "#FF7043";
  const backgroundColor = "#121212";
  const cardColor = "#1e1e1e";
  const textColor = "#e1e1e1";
  const lightTextColor = "#a0a0a0";
  const borderColor = "#2d2d2d";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setPostImagePreview("");
  };

  // Función para manejar el compartir publicación
  const handleShare = (postId) => {
    setCurrentSharedPost(posts.find((post) => post.id === postId));
    setShowShareModal(true);
    setSelectedUsers([]);
  };

  const handleSendShare = async () => {
    if (selectedUsers.length === 0 || !currentSharedPost) return;

    await actualizarCompartidos(currentSharedPost.id, selectedUsers.length);

    try {
      const messageContent = `💬 ${
        currentSharedPost.content.length > 100
          ? `${currentSharedPost.content.substring(0, 100)}...`
          : currentSharedPost.content
      }"`;

      for (const conversationId of selectedUsers) {
        const mensajeDTO = {
          contenido: messageContent,
          remitenteId: currentUserId,
          destinatarioId: conversations.find((c) => c.id === conversationId)
            ?.destinatarioId,
          conversacionId: conversationId,
          metadata: JSON.stringify({
            type: "shared_post",
            postId: currentSharedPost.id,
          }),
        };

        await mensajeService.enviarMensaje(mensajeDTO);
      }

      setPosts(
        posts.map((post) => {
          if (post.id === currentSharedPost.id) {
            return {
              ...post,
              shares: post.shares + selectedUsers.length,
            };
          }
          return post;
        })
      );

      setShowShareModal(false);
      setCurrentSharedPost(null);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error al compartir publicación:", error);
    }
  };

  // Función para alternar la selección de usuarios
  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  //HASTA AQUI MODIFICACION SARA

  const [newPostContent, setNewPostContent] = useState("");

  const analyzeTrends = () => {
    const hashtagCounts = {};

    // Analizar todos los posts para contar hashtags por deporte
    posts.forEach((post) => {
      // Add null checks for post and post.content
      if (!post || !post.content) return;

      const hashtags = post.content.match(/#\w+/g) || [];
      const sport = post.sport || "General";

      hashtags.forEach((tag) => {
        const key = `${sport.toLowerCase()}_${tag.toLowerCase()}`;
        hashtagCounts[key] = (hashtagCounts[key] || 0) + 1;
      });
    });

    // Agrupar por deporte y seleccionar solo el hashtag más popular por deporte
    const trendsBySport = {};
    Object.keys(hashtagCounts).forEach((key) => {
      const [sport, tag] = key.split("_");
      if (
        !trendsBySport[sport] ||
        hashtagCounts[key] > trendsBySport[sport].count
      ) {
        trendsBySport[sport] = {
          tag,
          count: hashtagCounts[key],
        };
      }
    });

    return trendsBySport;
  };

  const trends = analyzeTrends();

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
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 2.07c3.07.38 5.57 2.52 6.54 5.36L13 5.65zM8 5.08c1.18-.69 3.33-1.06 3-1.02v7.35l-3 1.73zM4.63 15.1c-.4-.96-.63-2-.63-3.1c0-2.02.76-3.86 2-5.27v7.58zm1.01 1.73L12 13.15l3 1.73l-6.98 4.03a7.8 7.8 0 0 1-2.38-2.08M12 20c-.54 0-1.07-.06-1.58-.16l6.58-3.8l1.36.78C16.9 18.75 14.6 20 12 20m1-8.58V7.96l7 4.05c0 1.1-.23 2.14-.63 3.09z"
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

  const handleLike = async (postId) => {
    try {
      const post = posts.find((post) => post.id === postId);

      if (post.isLiked) {
        // Quitar like
        await quitarLike(postId, userEmail);
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.likes - 1,
                isLiked: false,
              };
            }
            return post;
          })
        );
      } else {
        // Dar like
        await darLike(postId, userEmail);
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.likes + 1,
                isLiked: true,
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error al manejar like:", error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!newPostContent.trim() || !modalSelectedSport) return;

    try {
      const nuevaPublicacion = {
        contenido: newPostContent,
        categoriaDeporte: {
          id: getDeporteId(modalSelectedSport), // Función que mapea nombre deporte a ID
        },
        usuario: {
          id: userData.id, // Asegúrate que userData tenga el ID del usuario
        },
        // No necesitas enviar likes, comentarios, compartidos ni fecha - el backend los maneja
      };

      // Llamar a la API para crear la publicación
      const publicacionCreada = await crearPublicacion(nuevaPublicacion);

      // Actualizar el estado local con la nueva publicación
      setPosts([
        {
          id: publicacionCreada.id,
          content: publicacionCreada.contenido,
          user: userEmail,
          name: userName,
          time: new Date(publicacionCreada.fechaHora),
          likes: publicacionCreada.likes || 0,
          comments: publicacionCreada.comentarios || 0,
          shares: publicacionCreada.compartidos || 0,
          isLiked: false,
          sport: modalSelectedSport,
        },
        ...posts,
      ]);

      // Resetear el formulario
      setNewPostContent("");
      setShowPostModal(false);
      setModalSelectedSport("General");
      setPostImage(null);
      setPostImagePreview("");
    } catch (error) {
      console.error("Error al crear publicación:", error);
      // Puedes mostrar un mensaje de error al usuario aquí
      alert("Error al crear la publicación. Por favor intenta nuevamente.");
    }
  };

  // Función auxiliar para mapear deportes a IDs (ajusta según tus categorías)
  const getDeporteId = (deporteNombre) => {
    const deportes = {
      General: 6,
      Fútbol: 1,
      Baloncesto: 2,
      Volleyball: 3,
      Tenis: 4,
      Ciclismo: 5,
    };
    return deportes[deporteNombre] || 6;
  };

  const formatRelativeTime = (date) => {
    // Si no es un objeto Date válido
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Fecha inválida recibida:", date);
      return "ahora";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0) return "ahora"; // Futuro
    if (diffInSeconds < 5) return "ahora";
    if (diffInSeconds < 60) return `${diffInSeconds}s`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}m`;

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}a`;
  };

  const handleLogout = () => {
    // 1. Limpiar datos de autenticación
    localStorage.removeItem("userData");

    // 2. Redirigir al login (con replace para evitar volver atrás)
    navigate("/", { replace: true });
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    setShowSportsMenu(false);
  };

  const filteredPosts =
    selectedSport === "General"
      ? posts.filter(
          (post) =>
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.user.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : posts.filter(
          (post) =>
            post.sport === selectedSport &&
            (post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.user.toLowerCase().includes(searchQuery.toLowerCase()))
        );

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
      {/* Modal para compartir publicación */}
      {showShareModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              padding: "20px",
            }}
          >
            <h3
              style={{ marginTop: 0, margin: "1rem", marginBottom: "1.75rem" }}
            >
              Compartir publicación
            </h3>

            {loadingConversations ? (
              <p style={{ color: "#a0a0a0" }}>Cargando conversaciones...</p>
            ) : conversations.length === 0 ? (
              <p style={{ color: "#a0a0a0" }}>
                No tienes conversaciones activas
              </p>
            ) : (
              <div
                style={{
                  maxHeight: "50vh",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${lightTextColor} ${cardColor}`,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: cardColor,
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: lightTextColor,
                    borderRadius: "10px",
                    border: `2px solid ${cardColor}`,
                  },
                }}
              >
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    style={{
                      padding: "12px",
                      backgroundColor: selectedUsers.includes(conv.id)
                        ? "rgba(255, 69, 0, 0.2)"
                        : "transparent",
                      borderRadius: "2px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #2d2d2d",
                    }}
                    onClick={() => {
                      const updatedSelection = selectedUsers.includes(conv.id)
                        ? selectedUsers.filter((id) => id !== conv.id)
                        : [...selectedUsers, conv.id];
                      setSelectedUsers(updatedSelection);
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: !conv?.avatar
                          ? primaryColor
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "0.5rem",
                      }}
                    >
                      {conv.avatar && conv.avatar.startsWith("data:image") ? (
                        <img
                          src={conv.avatar}
                          alt={`avatar de ${conv.user}`}
                          style={{
                            borderRadius: "50%",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ color: "white", fontWeight: "bold" }}>
                          {conv.user?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{conv.user}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  background: "transparent",
                  border: `1px solid ${lightTextColor}`,
                  color: lightTextColor,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSendShare}
                disabled={selectedUsers.length === 0}
                style={{
                  background:
                    selectedUsers.length === 0 ? "#FF7043" : "#FF4500",
                  border: "none",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  opacity: selectedUsers.length === 0 ? 0.7 : 1,
                }}
              >
                Compartir ({selectedUsers.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Efecto de desenfoque cuando el modal está abierto */}
      {showPostModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(5px)",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: cardColor,
              borderRadius: "16px",
              padding: "1.5rem",
              width: "90%",
              maxWidth: "600px",
              border: `1px solid ${borderColor}`,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                position: "relative",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginLeft: "1rem",
                  flex: 1,
                  textAlign: "left",
                }}
              >
                Crear publicación
              </h3>

              {/* Selector de deportes en el modal */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: primaryColor,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                    marginRight: "0.5rem",
                  }}
                  onClick={() => setShowModalSportsMenu(!showModalSportsMenu)}
                >
                  <SportIcon
                    sport={modalSelectedSport}
                    style={{ width: "24px", height: "24px", color: "white" }}
                  />
                </motion.button>

                {/* Menú desplegable de deportes - solo iconos */}
                {showModalSportsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      position: "absolute",
                      top: "50px",
                      left: 0,
                      backgroundColor: cardColor,
                      borderRadius: "12px",
                      padding: "0.5rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      zIndex: 20,
                      width: "auto",
                      border: `1px solid ${borderColor}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {availableSports
                      .filter((sport) => sport !== modalSelectedSport)
                      .map((sport) => (
                        <motion.button
                          key={sport}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                          }}
                          onClick={() => {
                            setModalSelectedSport(sport);
                            setShowModalSportsMenu(false);
                          }}
                          title={
                            sport === "General"
                              ? "General"
                              : sport.charAt(0).toUpperCase() + sport.slice(1)
                          }
                        >
                          <SportIcon
                            sport={sport}
                            style={{
                              width: "24px",
                              height: "24px",
                              color: "white",
                            }}
                          />
                        </motion.button>
                      ))}
                  </motion.div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowPostModal(false);
                  setModalSelectedSport("General");
                  setNewPostContent("");
                  setPostImage(null);
                  setPostImagePreview("");
                  setShowModalSportsMenu(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: textColor,
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  marginLeft: "1.5rem",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: `${lightTextColor} ${cardColor}`,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: cardColor,
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: lightTextColor,
                  borderRadius: "10px",
                  border: `2px solid ${cardColor}`,
                },
                paddingRight: "8px",
                marginRight: "-8px",
              }}
            >
              <form onSubmit={handlePostSubmit}>
                <div style={{ display: "flex" }}>
                  <UserAvatar usuario={userData} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <textarea
                      placeholder="¿Qué está pasando? ¡Pon un # para clasificar tu contenido!"
                      rows="4"
                      style={{
                        width: "100%",
                        fontSize: "1.2rem",
                        resize: "none",
                        backgroundColor: "transparent",
                        color: textColor,
                        marginTop: "0.4rem",
                        border: "none",
                        outline: "none",
                        padding: 0,
                        paddingRight: "0.5rem",
                        marginLeft: "0.5rem",
                      }}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      autoFocus
                    ></textarea>
                  </div>
                </div>

                {/* Sección para la imagen */}
                {postImagePreview && (
                  <div
                    style={{
                      marginTop: "1rem",
                      position: "relative",
                      width: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={postImagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        maxHeight: "300px",
                      }}
                    />
                    <button
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        border: "none",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "1.5rem",
                        paddingBottom: "0.32rem",
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "1.5rem",
                borderTop: `1px solid ${borderColor}`,
                paddingTop: "1rem",
              }}
            >
              <label
                style={{
                  padding: "0.6rem",
                  borderRadius: "8px",
                  color: "#E1E1E1",
                  cursor: postImagePreview ? "not-allowed" : "pointer",
                  textAlign: "center",
                  opacity: postImagePreview ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1.7em"
                  height="1.7em"
                >
                  <path
                    fill="currentColor"
                    d="M21.02 5H19V2.98c0-.54-.44-.98-.98-.98h-.03c-.55 0-.99.44-.99.98V5h-2.01c-.54 0-.98.44-.99.98v.03c0 .55.44.99.99.99H17v2.01c0 .54.44.99.99.98h.03c.54 0 .98-.44.98-.98V7h2.02c.54 0 .98-.44.98-.98v-.04c0-.54-.44-.98-.98-.98M16 9.01V8h-1.01c-.53 0-1.03-.21-1.41-.58c-.37-.38-.58-.88-.58-1.44c0-.36.1-.69.27-.98H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8.28c-.3.17-.64.28-1.02.28A2 2 0 0 1 16 9.01M15.96 19H6a.5.5 0 0 1-.4-.8l1.98-2.63c.21-.28.62-.26.82.02L10 18l2.61-3.48c.2-.26.59-.27.79-.01l2.95 3.68c.26.33.03.81-.39.81"
                  ></path>
                </svg>
                {!postImagePreview && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                )}
              </label>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                style={{
                  background:
                    newPostContent.trim() && modalSelectedSport
                      ? primaryColor
                      : "rgba(255, 69, 0, 0.5)",
                  color: "white",
                  borderRadius: "30px",
                  border: "none",
                  padding: "8px 24px",
                  cursor:
                    newPostContent.trim() && modalSelectedSport
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
                disabled={!newPostContent.trim() || !modalSelectedSport}
                onClick={handlePostSubmit}
              >
                Publicar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

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

              // Efecto de transición
              document.body.style.overflow = "hidden"; // Bloquea el scroll durante la transición
              setTimeout(() => {
                navigate("/equipos", {
                  state: { user: userEmail },
                  replace: false,
                });
                document.body.style.overflow = ""; // Restaura el scroll
              }, 300);
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "explorar" ? 10 : 0, // Mismo efecto de inclinación de 10 grados
                scale: activeTab === "explorar" ? 1.1 : 1, // Mismo escalado del 10%
              }}
              transition={{ type: "spring", stiffness: 500 }} // Misma animación spring
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

              // Efecto de transición
              document.body.style.overflow = "hidden"; // Bloquea el scroll durante la transición
              setTimeout(() => {
                navigate("/eventos", {
                  state: { user: userEmail },
                  replace: false,
                });
                document.body.style.overflow = ""; // Restaura el scroll
              }, 300);
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "eventos" ? 10 : 0, // Mismo efecto de inclinación de 10 grados
                scale: activeTab === "eventos" ? 1.1 : 1, // Mismo escalado del 10%
              }}
              transition={{ type: "spring", stiffness: 500 }} // Misma animación spring
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

              // Efecto de transición
              document.body.style.overflow = "hidden"; // Bloquea el scroll durante la transición
              setTimeout(() => {
                navigate("/mensajes", {
                  state: { user: userEmail },
                  replace: false,
                });
                document.body.style.overflow = ""; // Restaura el scroll
              }, 300);
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

              // Efecto de transición
              document.body.style.overflow = "hidden"; // Bloquea el scroll durante la transición
              setTimeout(() => {
                navigate(`/perfil/${currentUserId}`, {
                  state: { user: userEmail },
                  replace: false,
                });
                document.body.style.overflow = ""; // Restaura el scroll
              }, 300);
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "perfil" ? 10 : 0, // Mismo efecto de inclinación de 10 grados
                scale: activeTab === "perfil" ? 1.1 : 1, // Mismo escalado del 10%
              }}
              transition={{ type: "spring", stiffness: 500 }} // Misma animación spring
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
              {userName.charAt(0).toUpperCase() + userName.slice(1)}
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
          display: "flex",
        }}
      >
        {/* Contenido central */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: isMobile ? "100%" : "calc(100% - 350px)",
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
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1.5em"
                  height="1.5em"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  ></path>
                </svg>
              </motion.button>
            )}

            <motion.h2
              style={{
                fontWeight: "bold",
                margin: 0,
                color: primaryColor,
                flex: 1,
                textAlign: isMobile ? "center" : "left",
                opacity: headerOpacity,
              }}
            >
              Inicio
            </motion.h2>

            {/* Botón de deportes modificado */}
            <div style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: primaryColor,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                  opacity: headerOpacity,
                }}
                onClick={() => setShowSportsMenu(!showSportsMenu)}
              >
                <SportIcon
                  sport={selectedSport}
                  style={{ width: "24px", height: "24px", color: "white" }}
                />
              </motion.button>

              {/* Menú desplegable de deportes - solo iconos */}
              {showSportsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: 0,
                    backgroundColor: cardColor,
                    borderRadius: "12px",
                    padding: "0.5rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    zIndex: 20,
                    width: "auto",
                    border: `1px solid ${borderColor}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {availableSports
                    .filter((sport) => sport !== selectedSport)
                    .map((sport) => (
                      <motion.button
                        key={sport}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "40px",
                          height: "40px",
                        }}
                        onClick={() => handleSportSelect(sport)}
                        title={
                          sport === "General"
                            ? "General"
                            : sport.charAt(0).toUpperCase() + sport.slice(1)
                        }
                      >
                        <SportIcon
                          sport={sport}
                          style={{
                            width: "24px",
                            height: "24px",
                            color: "white",
                          }}
                        />
                      </motion.button>
                    ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Botón para mostrar barra derecha en móviles */}
          {isMobile && !showRightSidebar && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleRightSidebar}
              style={{
                position: "fixed",
                right: "20px",
                bottom: "20px",
                zIndex: 50,
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: primaryColor,
                border: "none",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.5em"
                height="1.5em"
              >
                <path
                  fill="currentColor"
                  d="M18 3a3 3 0 0 1 2.995 2.824L21 6v12a3 3 0 0 1-2.824 2.995L18 21H6a3 3 0 0 1-2.995-2.824L3 18V6a3 3 0 0 1 2.824-2.995L6 3zm-3 2H6a1 1 0 0 0-.993.883L5 6v12a1 1 0 0 0 .883.993L6 19h9zm-3.293 4.293a1 1 0 0 1 .083 1.32l-.083.094L10.415 12l1.292 1.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.32.083l-.094-.083l-2-2a1 1 0 0 1-.083-1.32l.083-.094l2-2a1 1 0 0 1 1.414 0"
                ></path>
              </svg>
            </motion.button>
          )}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              // Estilos personalizados para el scroll
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
            {/* Crear nuevo post */}
            <div
              style={{
                padding: "1rem",
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: cardColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "8px",
                margin: "1rem",
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowPostModal(true);
                }}
              >
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
                    <input
                      placeholder="¿Qué está pasando?"
                      style={{
                        width: "100%",
                        fontSize: "1.2rem",
                        backgroundColor: "transparent",
                        color: textColor,
                        border: "none",
                        outline: "none",
                        padding: "0.5rem 0",
                      }}
                      readOnly
                      onClick={() => setShowPostModal(true)}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Lista de posts */}

            {filteredPosts.map((post) => {
              console.log(
                "Post time:",
                post.time,
                "Type:",
                typeof post.time,
                "Valid:",
                post.time instanceof Date && !isNaN(post.time.getTime())
              );
              return (
                <motion.div
                  key={post.id}
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
                      backgroundColor: !post.usuario?.imagenPerfil
                        ? primaryColor
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "0.5rem",
                    }}
                  >
                    {post.usuario.imagenPerfil ? (
                      <img
                        src={post.usuario.imagenPerfil}
                        style={{
                          borderRadius: "50%",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "white", fontWeight: "bold" }}>
                        {post.user?.charAt(0).toUpperCase() || "U"}
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
                        {post.name}
                      </span>
                      {!isMobile && (
                        <>
                          <span
                            style={{
                              marginRight: "0.25rem",
                              color: lightTextColor,
                            }}
                          >
                            {post.user}
                          </span>
                        </>
                      )}
                      <span style={{ color: lightTextColor }}>
                        · {formatRelativeTime(new Date(post.time))}
                      </span>
                      {post.sport !== "General" && (
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
                            sport={post.sport}
                            style={{
                              width: "16px",
                              height: "16px",
                              marginRight: "0.25rem",
                              color: "white",
                            }}
                          />
                          {post.sport}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        marginBottom: "0.5rem",
                        color: textColor,
                        wordBreak: "break-word",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(`/publicaciones/${post.id}`, {
                          state: { user: userData },
                        })
                      }
                    >
                      {post.content}
                    </p>
                    {post.imagen && (
                      <div
                        style={{
                          marginTop: "1rem",
                          marginBottom: "0.5rem",
                          backgroundColor: "#181818",
                          border: `1px solid ${borderColor}`,
                          overflow: "hidden",
                          borderRadius: "15px",
                          maxHeight: "400px",
                          maxWidth: "400px",
                          cursor: "pointer",
                          marginLeft: "auto", // ✅ centra horizontalmente
                          marginRight: "auto",

                          // backgroundColor: borderColor
                        }}
                        onClick={(e) => handleImageClick(e, post.imagen)}
                      >
                        <img
                          src={post.imagen}
                          alt="Contenido de la publicación"
                          onError={(e) => {
                            console.error("Error cargando imagen:", e);
                            console.log("Datos imagen:", {
                              id: post.id,
                              startsWithData:
                                post.imagen.startsWith("data:image"),
                              length: post.imagen.length,
                              preview: post.imagen.substring(0, 50) + "...",
                            });
                            e.target.style.display = "none";
                          }}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "300px",
                            display: "block",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        maxWidth: "100%",
                      }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: lightTextColor,
                          cursor: "pointer",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() =>
                          navigate(`/publicaciones/${post.id}`, {
                            state: { user: userData },
                          })
                        }
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M3 10.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 4 7.16 4 9.4 4h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 7.04 21 8.16 21 10.4v1.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 18 16.84 18 14.6 18H7.414a1 1 0 0 0-.707.293l-2 2c-.63.63-1.707.184-1.707-.707zM9 8a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2zm0 4a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>

                        <span>{post.comments}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: post.isLiked ? accentColor : lightTextColor,
                          cursor: "pointer",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => handleLike(post.id)}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 256 256"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: "0.25rem" }}
                        >
                          <path
                            fill="currentColor"
                            d="M240 102c0 70-103.79 126.66-108.21 129a8 8 0 0 1-7.58 0C119.79 228.66 16 172 16 102a62.07 62.07 0 0 1 62-62c20.65 0 38.73 8.88 50 23.89C139.27 48.88 157.35 40 178 40a62.07 62.07 0 0 1 62 62"
                          ></path>
                        </svg>
                        <span>{post.likes}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: lightTextColor,
                          cursor: "pointer",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => handleShare(post.id)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 512 512"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: "0.25rem" }}
                        >
                          <path
                            fill="currentColor"
                            d="M378 324a69.78 69.78 0 0 0-48.83 19.91L202 272.41a69.7 69.7 0 0 0 0-32.82l127.13-71.5A69.76 69.76 0 1 0 308.87 129l-130.13 73.2a70 70 0 1 0 0 107.56L308.87 383A70 70 0 1 0 378 324"
                          ></path>
                        </svg>
                        <span>{post.shares}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: lightTextColor,
                          cursor: "pointer",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => navigate(`/perfil/${post.userId}`)}
                      >
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: "0.25rem" }}
                        >
                          <path
                            fill="currentColor"
                            d="M8 8a3 3 0 1 0 0-6a3 3 0 0 0 0 6m4.735 6c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139z"
                          ></path>
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Barra lateral derecha - versión flotante */}
        {!isMobile && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: showRightSidebar ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              width: "350px",
              height: "100vh",
              borderLeft: `1px solid ${borderColor}`,
              backgroundColor: cardColor,
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              position: "fixed",
              right: 0,
              top: 0,
              zIndex: 30,
              overflowY: "auto",
              //Scroll
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
            {/* Buscador */}
            <div
              style={{
                padding: "1rem",
                borderRadius: "1rem",
                marginBottom: "1rem",
                backgroundColor: backgroundColor,
              }}
            >
              <div
                style={{
                  position: "relative",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar en Sportter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.5rem",
                    borderRadius: "50px",
                    border: `1px solid ${borderColor}`,
                    backgroundColor: cardColor,
                    color: textColor,
                    outline: "none",
                    fontSize: "0.9rem",
                  }}
                />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: lightTextColor,
                  }}
                >
                  <path
                    d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <motion.button
                whileHover={{ color: accentColor }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserSearchModal(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontWeight: "bold",
                  color: lightTextColor,
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  fontSize: "0.9rem",
                  textAlign: "left",
                  padding: "0.25rem 0.5rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1.3em"
                  height="1.3em"
                  style={{
                    marginRight: "0.9rem",
                    marginLeft: "0.15rem",
                    marginBottom: "0.1rem",
                  }}
                >
                  <path
                    fill="currentColor"
                    d="M11.91 14h7.843a2.25 2.25 0 0 1 2.25 2.25v.905A3.75 3.75 0 0 1 20.696 20C19.13 21.345 16.89 22.002 14 22.002h-.179a1.75 1.75 0 0 0-.221-1.897l-.111-.121l-2.23-2.224a5.48 5.48 0 0 0 .65-3.76M6.5 10.5a4.5 4.5 0 0 1 3.46 7.377l2.823 2.814a.75.75 0 0 1-.975 1.134l-.085-.072l-2.903-2.896A4.5 4.5 0 1 1 6.5 10.5m0 1.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6M14 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10"
                  ></path>
                </svg>
                Buscar usuarios
              </motion.button>

              {/* Modal para buscar usuarios */}
              {showUserSearchModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(5px)",
                    zIndex: 100,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      backgroundColor: cardColor,
                      borderRadius: "16px",
                      padding: "1.5rem",
                      width: "90%",
                      maxWidth: "500px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>Buscar usuarios</h3>
                      <button
                        onClick={() => {
                          setShowUserSearchModal(false);
                          setShareSearchQuery("");
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: textColor,
                          cursor: "pointer",
                          fontSize: "1.5rem",
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <div
                        style={{
                          position: "relative",
                          marginBottom: "1rem",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Buscar usuarios..."
                          value={shareSearchQuery}
                          onChange={(e) => setShareSearchQuery(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem 0.75rem 2.5rem",
                            borderRadius: "50px",
                            border: `1px solid ${borderColor}`,
                            backgroundColor: backgroundColor,
                            color: textColor,
                            outline: "none",
                            fontSize: "0.9rem",
                          }}
                        />
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: lightTextColor,
                          }}
                        >
                          <path
                            d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>

                      <div
                        style={{
                          maxHeight: "300px",
                          overflowY: "auto",
                          border: `1px solid ${borderColor}`,
                          borderRadius: "8px",
                          padding: "0.5rem",
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
                        {users.filter(
                          (user) =>
                            user.nombreUsuario
                              ?.toLowerCase()
                              .includes(shareSearchQuery.toLowerCase()) ||
                            user.correoElectronico
                              ?.toLowerCase()
                              .includes(shareSearchQuery.toLowerCase())
                        ).length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "1rem",
                              color: lightTextColor,
                            }}
                          >
                            No se encontraron usuarios con ese nombre
                          </div>
                        ) : (
                          users
                            .filter(
                              (user) =>
                                user.nombreUsuario
                                  ?.toLowerCase()
                                  .includes(shareSearchQuery.toLowerCase()) ||
                                user.correoElectronico
                                  ?.toLowerCase()
                                  .includes(shareSearchQuery.toLowerCase())
                            )
                            .map((user) => (
                              <div
                                key={user.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0.5rem",
                                  borderRadius: "4px",
                                  backgroundColor: selectedUsers.some(
                                    (u) => u.id === user.id
                                  )
                                    ? "rgba(255, 112, 67, 0.2)"
                                    : "transparent",
                                  marginBottom: "0.5rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  navigate(`/perfil/${user.id}`, {
                                    state: { user: userData },
                                  });
                                  setShowUserSearchModal(false);
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      background: primaryColor,
                                      marginRight: "0.5rem",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                    }}
                                  >
                                    {user.nombreUsuario
                                      ?.charAt(0)
                                      .toUpperCase() || "U"}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: "bold" }}>
                                      {user.nombreUsuario || "Usuario"}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "0.8rem",
                                        color: lightTextColor,
                                      }}
                                    >
                                      {user.correoElectronico}
                                    </div>
                                  </div>
                                </div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 12 12"
                                  width="1em"
                                  height="1em"
                                >
                                  <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M4.15 9.85a.5.5 0 0 1 0-.707l3.15-3.15l-3.15-3.15a.5.5 0 0 1 .707-.707l3.5 3.5a.5.5 0 0 1 0 .707l-3.5 3.5a.5.5 0 0 1-.707 0z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "1rem",
                borderRadius: "1rem",
                marginBottom: "1rem",
                backgroundColor: backgroundColor,
              }}
            >
              <h3
                style={{
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  color: textColor,
                }}
              >
                Tendencias para ti
              </h3>

              {Object.entries(trends).map(([sport, trend]) => (
                <div key={sport} style={{ marginBottom: "1rem" }}>
                  <div style={{ color: lightTextColor, fontSize: "0.8rem" }}>
                    {`Tendencia en ${
                      sport.charAt(0).toUpperCase() + sport.slice(1)
                    }`}
                  </div>
                  <div style={{ fontWeight: "bold", color: textColor }}>
                    {trend.tag}
                  </div>
                  <div style={{ color: lightTextColor, fontSize: "0.8rem" }}>
                    {trend.count} posts
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "auto",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  marginBottom: "0.5rem",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: lightTextColor,
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    marginRight: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                  onClick={() => navigate("/terminosDeServicio")}
                >
                  Términos de servicio
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: lightTextColor,
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    marginRight: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                  onClick={() => navigate("/politicaDePrivacidad")}
                >
                  Política de privacidad
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: lightTextColor,
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    marginRight: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                  onClick={() => navigate("/accesibilidad")}
                >
                  Accesibilidad
                </motion.button>
              </div>
              <div
                style={{
                  color: lightTextColor,
                  fontSize: "0.8rem",
                }}
              >
              <div style={{ justifyContent: "center", textAlign: "justify", fontSize: "0.72rem", marginLeft: "0.5rem" }}>
                <a href="https://github.com/DanielEstebanM/Sportter" style={{ textDecoration: "none", color: "inherit", borderRadius: "3px", fontWeight: "bold" }}>
                  Sportter
                </a>{" "}
                © 2025 by{" "}
                <a href="https://github.com/DanielEstebanM" style={{ textDecoration: "none", color: "inherit", borderRadius: "3px", fontWeight: "bold" }}>
                  Daniel Esteban, Geanina Foanta, Sara Chbali
                </a>{" "}
                is licensed under {" "}    
                <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" style={{ textDecoration: "none", color: "inherit", borderBottom: "1px solid", borderRadius: "3px"  }}>
                   Creative Commons Attribution-NonCommercial-NoDerivatives 
                   {"\n "} 4.0 International
                </a>{" "}
                <br/>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "1rem",
                    justifyContent: "space-between",
                  }}
                >
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/nc.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/nd.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                </div>
              </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Barra lateral derecha - versión móvil (flotante) */}
      {isMobile && showRightSidebar && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: showRightSidebar ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            width: "80%",
            height: "100vh",
            borderLeft: `1px solid ${borderColor}`,
            backgroundColor: cardColor,
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            right: 0,
            top: 0,
            zIndex: 40,
            overflowY: "auto",
            //Scroll
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
          {/* Botón para cerrar en móviles */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleRightSidebar}
            style={{
              alignSelf: "flex-end",
              background: "transparent",
              border: "none",
              color: textColor,
              cursor: "pointer",
              padding: "0.5rem",
              marginBottom: "1rem",
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
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
            </svg>
          </motion.button>

          {/* Buscador */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "1rem",
              marginBottom: "1rem",
              backgroundColor: backgroundColor,
            }}
          >
            <div
              style={{
                position: "relative",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="Buscar en Sportter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  borderRadius: "50px",
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardColor,
                  color: textColor,
                  outline: "none",
                  fontSize: "0.9rem",
                }}
              />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: lightTextColor,
                }}
              >
                <path
                  d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <motion.button
              whileHover={{ color: accentColor }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserSearchModal(true)}
              style={{
                background: "transparent",
                border: "none",
                fontWeight: "bold",
                color: lightTextColor,
                cursor: "pointer",
                marginTop: "0.5rem",
                fontSize: "0.9rem",
                textAlign: "left",
                padding: "0.25rem 0.5rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.3em"
                height="1.3em"
                style={{
                  marginRight: "0.9rem",
                  marginLeft: "0.15rem",
                  marginBottom: "0.1rem",
                }}
              >
                <path
                  fill="currentColor"
                  d="M11.91 14h7.843a2.25 2.25 0 0 1 2.25 2.25v.905A3.75 3.75 0 0 1 20.696 20C19.13 21.345 16.89 22.002 14 22.002h-.179a1.75 1.75 0 0 0-.221-1.897l-.111-.121l-2.23-2.224a5.48 5.48 0 0 0 .65-3.76M6.5 10.5a4.5 4.5 0 0 1 3.46 7.377l2.823 2.814a.75.75 0 0 1-.975 1.134l-.085-.072l-2.903-2.896A4.5 4.5 0 1 1 6.5 10.5m0 1.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6M14 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10"
                ></path>
              </svg>
              Buscar usuarios
            </motion.button>

            {/* Modal para buscar usuarios */}
            {showUserSearchModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(5px)",
                  zIndex: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    backgroundColor: cardColor,
                    borderRadius: "16px",
                    padding: "1.5rem",
                    width: "90%",
                    maxWidth: "500px",
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Buscar usuarios</h3>
                    <button
                      onClick={() => {
                        setShowUserSearchModal(false);
                        setShareSearchQuery("");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: textColor,
                        cursor: "pointer",
                        fontSize: "1.5rem",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        position: "relative",
                        marginBottom: "1rem",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={shareSearchQuery}
                        onChange={(e) => setShareSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem 0.75rem 2.5rem",
                          borderRadius: "50px",
                          border: `1px solid ${borderColor}`,
                          backgroundColor: backgroundColor,
                          color: textColor,
                          outline: "none",
                          fontSize: "0.9rem",
                        }}
                      />
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: lightTextColor,
                        }}
                      >
                        <path
                          d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    <div
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "8px",
                        padding: "0.5rem",
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
                      {users.filter(
                        (user) =>
                          user.nombreUsuario
                            ?.toLowerCase()
                            .includes(shareSearchQuery.toLowerCase()) ||
                          user.correoElectronico
                            ?.toLowerCase()
                            .includes(shareSearchQuery.toLowerCase())
                      ).length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "1rem",
                            color: lightTextColor,
                          }}
                        >
                          No se encontraron usuarios con ese nombre
                        </div>
                      ) : (
                        users
                          .filter(
                            (user) =>
                              user.nombreUsuario
                                ?.toLowerCase()
                                .includes(shareSearchQuery.toLowerCase()) ||
                              user.correoElectronico
                                ?.toLowerCase()
                                .includes(shareSearchQuery.toLowerCase())
                          )
                          .map((user) => (
                            <div
                              key={user.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                backgroundColor: selectedUsers.some(
                                  (u) => u.id === user.id
                                )
                                  ? "rgba(255, 112, 67, 0.2)"
                                  : "transparent",
                                marginBottom: "0.5rem",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                navigate(`/perfil/${user.id}`, {
                                  state: { user: userData },
                                });
                                setShowUserSearchModal(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: primaryColor,
                                    marginRight: "0.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                  }}
                                >
                                  {user.nombreUsuario
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </div>
                                <div>
                                  <div style={{ fontWeight: "bold" }}>
                                    {user.nombreUsuario || "Usuario"}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: lightTextColor,
                                    }}
                                  >
                                    {user.correoElectronico}
                                  </div>
                                </div>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 12 12"
                                width="1em"
                                height="1em"
                              >
                                <path
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  d="M4.15 9.85a.5.5 0 0 1 0-.707l3.15-3.15l-3.15-3.15a.5.5 0 0 1 .707-.707l3.5 3.5a.5.5 0 0 1 0 .707l-3.5 3.5a.5.5 0 0 1-.707 0z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "1rem",
              marginBottom: "1rem",
              backgroundColor: backgroundColor,
            }}
          >
            <h3
              style={{
                fontWeight: "bold",
                marginBottom: "1rem",
                color: textColor,
              }}
            >
              Tendencias para ti
            </h3>
            {Object.entries(trends).map(([sport, trend]) => (
              <div key={sport} style={{ marginBottom: "1rem" }}>
                <div style={{ color: lightTextColor, fontSize: "0.8rem" }}>
                  {`Tendencia en ${
                    sport.charAt(0).toUpperCase() + sport.slice(1)
                  }`}
                </div>
                <div style={{ fontWeight: "bold", color: textColor }}>
                  {trend.tag}
                </div>
                <div style={{ color: lightTextColor, fontSize: "0.8rem" }}>
                  {trend.count} posts
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "auto",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginBottom: "0.5rem",
              }}
            >
              <motion.button
              onClick={() => navigate("/terminosDeServicio")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: lightTextColor,
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                  marginRight: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                Términos de servicio
              </motion.button>
              <motion.button
              onClick={() => navigate("/politicaDePrivacidad")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: lightTextColor,
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                  marginRight: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                Política de privacidad
              </motion.button>
              <motion.button
              onClick={() => navigate("/accesibilidad")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: lightTextColor,
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                  marginRight: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                Accesibilidad
              </motion.button>
            </div>
            <div
              style={{
                color: lightTextColor,
                fontSize: "0.8rem",
              }}
            >
              <div style={{ justifyContent: "center", textAlign: "justify" }}>
                <a href="https://github.com/DanielEstebanM/Sportter" style={{ textDecoration: "none", color: "inherit", borderRadius: "3px", fontWeight: "bold" }}>
                  Sportter
                </a>{" "}
                © 2025 by{" "}
                <a href="https://github.com/DanielEstebanM" style={{ textDecoration: "none", color: "inherit", borderRadius: "3px", fontWeight: "bold" }}>
                  Daniel Esteban, Geanina Foanta, Sara Chbali
                </a>{" "}
                is licensed under
                <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" style={{ textDecoration: "none", color: "inherit", borderBottom: "1px solid", borderRadius: "3px"  }}>
                  {" "}
                  Creative Commons Attribution-NonCommercial-NoDerivatives 4.0
                  International
                </a>{" "}
                <br />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "1rem",
                    justifyContent: "space-between",
                  }}
                >
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/nc.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/nd.svg"
                    style={{ maxWidth: "1.4rem", maxHeight: "1.4rem" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
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
          }}
          onClick={() => setShowImageModal(false)}
          ref={(container) => {
            if (container && zoomLevel > 1) {
              // Calcular posición para mantener el punto de zoom visible
              const centerX = container.clientWidth / 2;
              const centerY = container.clientHeight / 2;
              const offsetX = zoomAnchor.x * zoomLevel - centerX;
              const offsetY = zoomAnchor.y * zoomLevel - centerY;

              container.scrollTo({
                left: offsetX,
                top: offsetY,
                behavior: "auto",
              });
            }
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
            }}
          >
            ×
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start", // Alinear arriba en lugar de centrar
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
                maxHeight: "none",
                objectFit: "contain",
                transform: `scale(${zoomLevel})`,
                transformOrigin: `${zoomAnchor.x}px ${zoomAnchor.y}px`, // Origen del zoom en el punto de clic
                transition: "transform 0.2s ease",
                cursor: "zoom-in",
              }}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                setZoomAnchor({ x, y });
                setZoomLevel((prev) => (prev === 1 ? 2 : 1));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallaPrincipal;
