import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import styled from "styled-components";
import axios from "axios";
import {
  getUsers,
  getUserById,
  getUserPosts,
  getUserTeams,
  updateProfile,
  uploadProfileImage,
  darLike,
  quitarLike,
} from "../services/api";

function PantallaPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedContent, setSelectedContent] = useState("publicaciones");
  const [editMode, setEditMode] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showAccountSubmenu, setShowAccountSubmenu] = useState(false);
  const [bio, setBio] = useState("");
  const [tempBio, setTempBio] = useState(bio);
  const [name, setName] = useState("");
  const [tempName, setTempName] = useState(name);
  const [profileImage, setProfileImage] = useState();
  const [teams, setTeams] = useState([]);
  const [profilePosts, setProfilePosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [profileExists, setProfileExists] = useState(true);
  const [users, setUsers] = useState([]);
  const [userProfile, setUserProfile] = useState({
    nombre_usuario: "",
    email: "",
    bio: "",
    imagen: "",
    equipos: [],
  });
  const [currentSharedPost, setCurrentSharedPost] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const currentUserId = userData?.id;
  const userEmail = userData?.correoElectronico;
  const userName = userData?.nombreUsuario || userData?.nombre_usuario;
  const imageProfile = userData?.avatar || "https://i.imgur.com/bUwYQP3.png";

  // Colores con tema anaranjado-rojizo
  const primaryColor = "#FF4500";
  const accentColor = "#FF7043";
  const backgroundColor = "#121212";
  const cardColor = "#1e1e1e";
  const textColor = "#e1e1e1";
  const lightTextColor = "#a0a0a0";
  const borderColor = "#2d2d2d";

  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const handleConfirmedAction = async () => {
    if (confirmationAction === "edit") {
      try {
        if (isCurrentUser) {
          const updateData = {
            nombreUsuario: tempName,
            bio: tempBio,
          };

          const updatedProfile = await updateProfile(currentUserId, updateData);

          setName(updatedProfile.nombreUsuario || tempName);
          setBio(updatedProfile.bio || tempBio);
          setEditMode(false);
          setHasChanges(false);

          setUserProfile((prev) => ({
            ...prev,
            nombre_usuario: updatedProfile.nombreUsuario || tempName,
            bio: updatedProfile.bio || tempBio,
          }));

          const updatedUserData = {
            ...userData,
            nombreUsuario: updatedProfile.nombreUsuario || tempName,
            bio: updatedProfile.bio || tempBio,
          };
          localStorage.setItem("userData", JSON.stringify(updatedUserData));

          alert("Perfil actualizado correctamente");
        }
      } catch (error) {
        console.error("Error al guardar perfil:", error);
        alert(
          "Error al guardar los cambios: " +
            (error.message || "Inténtalo de nuevo más tarde")
        );
      }
    } else if (confirmationAction === "delete") {
      try {
        const response = await axios.delete(
          `http://localhost:8080/api/usuarios/${currentUserId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          // Limpiar datos de usuario y redirigir
          localStorage.removeItem("userData");
          navigate("/", { replace: true });
          alert("Tu cuenta ha sido eliminada correctamente");
        }
      } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        alert(
          "Error al eliminar la cuenta: " +
            (error.response?.data?.message || "Inténtalo de nuevo más tarde")
        );
      }
    } else if (confirmationAction === "changePassword") {
      // Cerrar sesión y redirigir a inicio con estado para mostrar recuperación de contraseña
      localStorage.removeItem("userData");
      navigate("/", {
        state: {
          showPasswordReset: true,
          email: userEmail,
          fromProfile: true,
        },
        replace: true,
      });
    }
    setShowConfirmationModal(false);
  };

  useEffect(() => {
    if (id && currentUserId) {
      setIsCurrentUser(id === currentUserId.toString());
    }
  }, [id, currentUserId]);

  // Obtener datos del perfil al cargar el componente o cambiar el ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserById(id);
        console.log("Datos recibidos de la API:", data);

        const equipos = await getUserTeams(id);

        if (!data || data.error) {
          setProfileExists(false);
          return;
        }

        const defaultImage = "https://i.imgur.com/bUwYQP3.png";
        const userAvatar = data.avatar
          ? data.avatar.startsWith("data:image")
            ? data.avatar
            : `data:image/jpeg;base64,${data.avatar}`
          : defaultImage;

        setProfileExists(true);
        setUserProfile({
          nombre_usuario: data.nombreUsuario || data.nombre || "",
          email: data.email || data.correoElectronico || "",
          bio: data.bio || "Este usuario no tiene biografía.",
          imagen: userAvatar,
          equipos: equipos,
        });

        setName(data.nombreUsuario || data.nombre || "");
        setBio(data.bio || "");
        setTempName(data.nombreUsuario || data.nombre || "");
        setTempBio(data.bio || "");
        setProfileImage(userAvatar);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setProfileExists(false);
      }
    };
    fetchData();
  }, [id]);

  // Obtener publicaciones del usuario
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const posts = await getUserPosts(id);
        // Asegurar que cada post tenga los campos necesarios
        const processedPosts = posts.map((post) => ({
          ...post,
          isLiked: post.isLiked || false,
          likes: post.likes || 0,
          comentarios: post.comentarios || 0,
          compartidos: post.compartidos || 0,
        }));
        setProfilePosts(processedPosts);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        const sortedUsers = fetchedUsers.sort((a, b) => {
          const nameA = a.nombreUsuario?.toUpperCase() || "";
          const nameB = b.nombreUsuario?.toUpperCase() || "";
          return nameA.localeCompare(nameB);
        });
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Detectar si es móvil o tablet
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowLeftSidebar(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLike = async (postId) => {
    try {
      const post = profilePosts.find((post) => post.id === postId);

      if (post.isLiked) {
        // Quitar like
        await quitarLike(postId, userEmail);
        setProfilePosts(
          profilePosts.map((post) => {
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
        setProfilePosts(
          profilePosts.map((post) => {
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

  const handleShare = (postId) => {
    setCurrentSharedPost(profilePosts.find((post) => post.id === postId));
    setShowShareModal(true);
    setSelectedUsers([]);
  };

  const handleSendShare = () => {
    if (selectedUsers.length === 0 || !currentSharedPost) return;

    console.log(
      `Compartiendo publicación ${currentSharedPost.id} con usuarios:`,
      selectedUsers
    );

    // Actualizar el contador de shares
    setProfilePosts(
      profilePosts.map((post) => {
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
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Reemplaza tus handlers actuales con estos:
  const handleNameChange = (e) => {
    setTempName(e.target.value);
    setHasChanges(e.target.value !== name || tempBio !== bio);
  };

  const handleBioChange = (e) => {
    setTempBio(e.target.value);
    setHasChanges(e.target.value !== bio || tempName !== name);
  };

  const handleCancelEdit = () => {
    setTempBio(bio);
    setTempName(name);
    setEditMode(false);
    setHasChanges(false);
  };

  const handleSaveBio = async () => {
    if (!hasChanges) return;

    try {
      if (isCurrentUser) {
        const updateData = {
          nombreUsuario: tempName,
          bio: tempBio,
        };

        const updatedProfile = await updateProfile(currentUserId, updateData);

        setName(updatedProfile.nombreUsuario || tempName);
        setBio(updatedProfile.bio || tempBio);
        setEditMode(false);
        setHasChanges(false);

        setUserProfile((prev) => ({
          ...prev,
          nombre_usuario: updatedProfile.nombreUsuario || tempName,
          bio: updatedProfile.bio || tempBio,
        }));

        const updatedUserData = {
          ...userData,
          nombreUsuario: updatedProfile.nombreUsuario || tempName,
          bio: updatedProfile.bio || tempBio,
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        alert("Perfil actualizado correctamente");
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      alert(
        "Error al guardar los cambios: " +
          (error.message || "Inténtalo de nuevo más tarde")
      );
    }
  };

  const handleSaveClick = () => {
    if (hasChanges) {
      setConfirmationAction("edit");
      setConfirmationMessage(
        "¿Estás seguro que deseas guardar los cambios en tu perfil?"
      );
      setShowConfirmationModal(true);
    }
  };

  const handleLogout = () => {
    // 1. Limpiar datos de autenticación
    localStorage.removeItem("userData");

    // 2. Redirigir al login (con replace para evitar volver atrás)
    navigate("/", { replace: true });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && isCurrentUser) {
      try {
        const response = await uploadProfileImage(currentUserId, file);
        setProfileImage(response.avatar);

        // Actualizar imagen en localStorage si es el usuario actual
        const updatedUserData = {
          ...userData,
          avatar: response.avatar,
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      } catch (error) {
        console.error("Error al subir imagen:", error);
      }
    }
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

  // Componente para los iconos de deporte
  const SportIcon = ({ sport, ...props }) => {
    const icons = {
      fútbol: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 3.3l1.35-.95a8 8 0 0 1 4.38 3.34l-.39 1.34l-1.35.46L13 6.7zm-3.35-.95L11 5.3v1.4L7.01 9.49l-1.35-.46l-.39-1.34a8.1 8.1 0 0 1 4.38-3.34M7.08 17.11l-1.14.1A7.94 7.94 0 0 1 4 12c0-.12.01-.23.02-.35l1-.73l1.38.48l1.46 4.34zm7.42 2.48c-.79.26-1.63.41-2.5.41s-1.71-.15-2.5-.41l-.69-1.49l.64-1.1h5.11l.64 1.11zM14.27 15H9.73l-1.35-4.02L12 8.44l3.63 2.54zm3.79 2.21l-1.14-.1l-.79-1.37l1.46-4.34l1.39-.47l1 .73c.01.11.02.22.02.34c0 1.99-.73 3.81-1.94 5.21"
          />
        </svg>
      ),
      baloncesto: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2M5.23 7.75C6.1 8.62 6.7 9.74 6.91 11H4.07a8.1 8.1 0 0 1 1.16-3.25M4.07 13h2.84a5.97 5.97 0 0 1-1.68 3.25A8.1 8.1 0 0 1 4.07 13M11 19.93c-1.73-.22-3.29-1-4.49-2.14A7.95 7.95 0 0 0 8.93 13H11zM11 11H8.93A8 8 0 0 0 6.5 6.2A8.04 8.04 0 0 1 11 4.07zm8.93 0h-2.84c.21-1.26.81-2.38 1.68-3.25c.6.97 1.01 2.07 1.16 3.25M13 4.07c1.73.22 3.29.99 4.5 2.13a8 8 0 0 0-2.43 4.8H13zm0 15.86V13h2.07a8 8 0 0 0 2.42 4.79A8 8 0 0 1 13 19.93m5.77-3.68A6 6 0 0 1 17.09 13h2.84a8.1 8.1 0 0 1-1.16 3.25"
          />
        </svg>
      ),
      volleyball: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 2.07c3.07.38 5.57 2.52 6.54 5.36L13 5.65zM8 5.08c1.18-.69 3.33-1.06 3-1.02v7.35l-3 1.73zM4.63 15.1c-.4-.96-.63-2-.63-3.1c0-2.02.76-3.86 2-5.27v7.58zm1.01 1.73L12 13.15l3 1.73l-6.98 4.03a7.8 7.8 0 0 1-2.38-2.08M12 20c-.54 0-1.07-.06-1.58-.16l6.58-3.8l1.36.78C16.9 18.75 14.6 20 12 20m1-8.58V7.96l7 4.05c0 1.1-.23 2.14-.63 3.09z"
          />
        </svg>
      ),
      tenis: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2M5.61 16.78C4.6 15.45 4 13.8 4 12s.6-3.45 1.61-4.78a5.975 5.975 0 0 1 0 9.56M12 20c-1.89 0-3.63-.66-5-1.76c1.83-1.47 3-3.71 3-6.24S8.83 7.23 7 5.76C8.37 4.66 10.11 4 12 4s3.63.66 5 1.76c-1.83 1.47-3 3.71-3 6.24s1.17 4.77 3 6.24A7.96 7.96 0 0 1 12 20m6.39-3.22a5.975 5.975 0 0 1 0-9.56C19.4 8.55 20 10.2 20 12s-.6 3.45-1.61 4.78"
          />
        </svg>
      ),
      ciclismo: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
          <path
            fill="currentColor"
            d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2M5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5m0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5m5.8-10l2.4-2.4l.8.8c1.06 1.06 2.38 1.78 3.96 2.02c.6.09 1.14-.39 1.14-1c0-.49-.37-.91-.85-.99c-1.11-.18-2.02-.71-2.75-1.43l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4c0 .6.2 1.1.6 1.4L11 14v4c0 .55.45 1 1 1s1-.45 1-1v-4.4c0-.52-.2-1.01-.55-1.38zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5m0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5"
          />
        </svg>
      ),
      general: (
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
    };

    return icons[sport] || icons["general"];
  };

  // Estilos para el scroll personalizado
  const CustomScroll = styled.div`
    overflow-y: auto;
    max-height: calc(100vh - 400px);
    scrollbar-width: thin;
    scrollbar-color: ${lightTextColor} ${cardColor};

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: ${cardColor};
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${lightTextColor};
      border-radius: 10px;
      border: 2px solid ${cardColor};
    }
  `;

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
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        >
          <img
            src="https://i.imgur.com/bUwYQP3.png"
            alt="Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
              backgroundColor: "transparent",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
            }}
            onClick={() => {
              setActiveTab("inicio");
              isMobile && setShowLeftSidebar(false);

              // Efecto de transición idéntico al de PantallaPrincipal
              document.body.style.overflow = "hidden"; // Bloquea el scroll durante la transición
              setTimeout(() => {
                navigate("/principal", {
                  state: { user: userData },
                  replace: false,
                });
                document.body.style.overflow = ""; // Restaura el scroll
              }, 300);
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: activeTab === "inicio" ? 10 : 0,
                scale: activeTab === "inicio" ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{ marginBottom: "0.10rem" }}
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
            </motion.div>
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

              // Efecto de transición idéntico al de PantallaPrincipal
              document.body.style.overflow = "hidden"; // Bloquea el scroll durante la transición
              setTimeout(() => {
                navigate("/eventos", {
                  state: { user: userData },
                  replace: false,
                });
                document.body.style.overflow = ""; // Restaura el scroll
              }, 300);
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
              backgroundColor: "rgba(255, 112, 67, 0.1)",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
              borderRadius: "8px",
            }}
            onClick={() => {
              setTimeout(() => {
                navigate(`/perfil/${currentUserId}`, {
                  state: { user: userEmail },
                  replace: false,
                });
                document.body.style.overflow = ""; // Restaura el scroll
              }, 300);
            }}
          >
            <motion.div style={{ marginBottom: "0.20rem" }}>
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
              {userName?.charAt(0).toUpperCase() + userName?.slice(1)}
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
              style={{ backgroundColor: "rgba(204, 112, 0, 0.27)" }}
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
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Encabezado del perfil */}
        <div
          style={{
            position: "relative",
            backgroundColor: cardColor,
            borderBottom: `1px solid ${borderColor}`,
            flexShrink: 0,
          }}
        >
          {/* Portada */}
          <div
            style={{
              height: "150px",
              backgroundColor: primaryColor,
              opacity: 0.7,
            }}
          ></div>

          {/* Foto de perfil */}
          <div
            style={{
              position: "absolute",
              top: "100px",
              left: "20px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: `4px solid ${cardColor}`,
              backgroundColor: backgroundColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {editMode ? (
              <label
                htmlFor="profile-image-upload"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={userProfile.imagen}
                  alt="Perfil"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "https://i.imgur.com/bUwYQP3.png";
                  }}
                />
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <img
                src={userProfile.imagen}
                alt="Perfil"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.src = "https://i.imgur.com/bUwYQP3.png";
                }}
              />
            )}
          </div>
          {/* Menú de configuración */}
          <div style={{ position: "relative" }}>
            {isCurrentUser && (
              <motion.button
                whileHover={{ backgroundColor: `${borderColor}` }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  backgroundColor: backgroundColor,
                  color: textColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: "10px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  zIndex: 10,
                }}
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              >
                <svg
                  style={{ marginRight: "8px", paddingTop: "2px" }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 26 26"
                  width="1.4em"
                  height="1.4em"
                >
                  <g fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M13.765 2.152C13.398 2 12.932 2 12 2s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083c-.092.223-.129.484-.143.863a1.62 1.62 0 0 1-.79 1.353a1.62 1.62 0 0 1-1.567.008c-.336-.178-.579-.276-.82-.308a2 2 0 0 0-1.478.396C4.04 5.79 3.806 6.193 3.34 7s-.7 1.21-.751 1.605a2 2 0 0 0 .396 1.479c.148.192.355.353.676.555c.473.297.777.803.777 1.361s-.304 1.064-.777 1.36c-.321.203-.529.364-.676.556a2 2 0 0 0-.396 1.479c.052.394.285.798.75 1.605c.467.807.7 1.21 1.015 1.453a2 2 0 0 0 1.479.396c.24-.032.483-.13.819-.308a1.62 1.62 0 0 1 1.567.008c.483.28.77.795.79 1.353c.014.38.05.64.143.863a2 2 0 0 0 1.083 1.083C10.602 22 11.068 22 12 22s1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083c.092-.223.129-.483.143-.863c.02-.558.307-1.074.79-1.353a1.62 1.62 0 0 1 1.567-.008c.336.178.579.276.819.308a2 2 0 0 0 1.479-.396c.315-.242.548-.646 1.014-1.453s.7-1.21.751-1.605a2 2 0 0 0-.396-1.479c-.148-.192-.355-.353-.676-.555A1.62 1.62 0 0 1 19.562 12c0-.558.304-1.064.777-1.36c.321-.203.529-.364.676-.556a2 2 0 0 0 .396-1.479c-.052-.394-.285-.798-.75-1.605c-.467-.807-.7-1.21-1.015-1.453a2 2 0 0 0-1.479-.396c-.24.032-.483.13-.82.308a1.62 1.62 0 0 1-1.566-.008a1.62 1.62 0 0 1-.79-1.353c-.014-.38-.05-.64-.143-.863a2 2 0 0 0-1.083-1.083Z"></path>
                  </g>
                </svg>
                Ajustes
              </motion.button>
            )}

            <div style={{ position: "relative" }}>
              {/* Menú desplegable de configuración */}
              {showSettingsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: "absolute",
                    top: "70px",
                    right: "20px",
                    backgroundColor: cardColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    width: "250px",
                    zIndex: 20,
                    overflow: "hidden",
                  }}
                  onMouseLeave={() => {
                    setShowSettingsMenu(false);
                    setShowAccountSubmenu(false);
                  }}
                >
                  {/* Opción Editar Perfil */}
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      backgroundColor: "transparent",
                      border: "none",
                      color: textColor,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                    onClick={() => {
                      setEditMode(true);
                      setShowSettingsMenu(false);
                    }}
                  >
                    <svg
                      style={{ marginRight: "12px" }}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1.3em"
                      height="1.3em"
                    >
                      <path
                        fill="currentColor"
                        d="M15.748 2.947a2 2 0 0 1 2.828 0l2.475 2.475a2 2 0 0 1 0 2.829L9.158 20.144l-6.38 1.076l1.077-6.38zm-.229 3.057l2.475 2.475l1.643-1.643l-2.475-2.474zm1.06 3.89l-2.474-2.475l-8.384 8.384l-.503 2.977l2.977-.502z"
                      ></path>
                    </svg>
                    Editar perfil
                  </motion.button>

                  {/* Menú desplegable de Configuración de cuenta */}
                  <div style={{ position: "relative" }}>
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        backgroundColor: showAccountSubmenu
                          ? "rgba(255,255,255,0.05)"
                          : "transparent",
                        border: "none",
                        color: textColor,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                      onClick={() => setShowAccountSubmenu(!showAccountSubmenu)}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <svg
                          style={{ marginRight: "12px" }}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="1.3em"
                          height="1.3em"
                        >
                          <g
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.1"
                          >
                            <path d="m15.5 7.5l2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4m2-2l-9.6 9.6"></path>
                            <circle cx="7.5" cy="15.5" r="5.5"></circle>
                          </g>
                        </svg>
                        Configuración de cuenta
                      </div>
                      <svg
                        style={{ paddingBottom: "4px" }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        width="1.3em"
                        height="1.3em"
                      >
                        <path
                          fill="currentColor"
                          d="m8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71"
                        ></path>
                      </svg>
                    </motion.button>

                    {showAccountSubmenu && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          backgroundColor: "rgba(30, 30, 30, 0.9)",
                          overflow: "hidden",
                        }}
                      >
                        <motion.button
                          whileHover={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderTop: `2px solid ${cardColor}`,
                          }}
                          style={{
                            width: "100%",
                            padding: "12px 16px 12px 40px",
                            textAlign: "left",
                            backgroundColor: "transparent",
                            border: "none",
                            color: textColor,
                            cursor: "pointer",
                            borderBottom: `1px solid ${borderColor}`,
                            borderTop: `2px solid transparent`,
                          }}
                          onClick={() => {
                            setConfirmationAction("changePassword");
                            setConfirmationMessage(
                              "Para cambiar tu contraseña, necesitaremos cerrar tu sesión y redirigirte a la página de recuperación. ¿Deseas continuar?"
                            );
                            setShowConfirmationModal(true);
                            setShowSettingsMenu(false);
                          }}
                        >
                          <svg
                            style={{
                              marginRight: "12px",
                              paddingBottom: "3px",
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 23 23"
                            width="1.55em"
                            height="1.55em"
                          >
                            <g fill="none">
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="1.8"
                                d="M12 4h-2C6.229 4 4.343 4 3.172 5.172S2 8.229 2 12s0 5.657 1.172 6.828S6.229 20 10 20h2m3-16c3.114.01 4.765.108 5.828 1.172C22 6.343 22 8.229 22 12s0 5.657-1.172 6.828C19.765 19.892 18.114 19.99 15 20"
                              ></path>
                              <path
                                fill="currentColor"
                                d="M9 12a1 1 0 1 1-2 0a1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0"
                              ></path>
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="1.5"
                                d="M15 2v20"
                              ></path>
                            </g>
                          </svg>
                          Cambiar contraseña
                        </motion.button>
                        <motion.button
                          whileHover={{
                            backgroundColor: "rgba(255, 0, 0, 0.10)",
                          }}
                          style={{
                            width: "100%",
                            padding: "12px 16px 12px 40px",
                            textAlign: "left",
                            backgroundColor: "transparent",
                            border: "none",
                            borderBottom: `1px solid ${borderColor}`,
                            color: "#FF5252",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setConfirmationAction("delete");
                            setConfirmationMessage(
                              "¿Estás seguro que deseas desactivar tu cuenta? Esta acción no se puede deshacer."
                            );
                            setShowConfirmationModal(true);
                          }}
                        >
                          <svg
                            style={{
                              marginLeft: "2px",
                              marginRight: "11px",
                              paddingBottom: "3px",
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 26 26"
                            width="1.5em"
                            height="1.5em"
                          >
                            <path
                              fill="currentColor"
                              d="M10.875 0a1 1 0 0 0-.594.281L5.562 5H3c-.551 0-1 .449-1 1v2c0 .551.449 1 1 1h.25l2.281 13.719v.062c.163.788.469 1.541 1.032 2.157A3.26 3.26 0 0 0 8.938 26h8.124a3.26 3.26 0 0 0 2.375-1.031c.571-.615.883-1.405 1.032-2.219v-.031L22.78 9H23c.551 0 1-.449 1-1V6c0-.551-.449-1-1-1h-1.563l-2.812-3.5a.81.81 0 0 0-.719-.313a.8.8 0 0 0-.343.125L14.688 3.25L11.717.281A1 1 0 0 0 10.876 0zM11 2.438L13.563 5H8.436L11 2.437zm6.844.656L19.375 5h-2.938l-.593-.594zM5.25 9h.688l1.187 1.188l-1.438 1.406zm2.094 0h.937l-.469.469zm2.312 0h1.688l.906.906l-2 2l-1.75-1.75zm3.125 0h.344l-.156.188L12.78 9zm1.781 0h1.688l1.156 1.156l-1.75 1.75l-2-2.031zm3.063 0h.938l-.47.469L17.626 9zm2.344 0h.812l-.437 2.688l-1.532-1.532zm-7.032 1.594l2.032 2l-2.031 2l-2-2l2-2zm-5.124.281l1.718 1.719l-2 2l-1.625-1.625l-.031-.156zm10.28 0l2 2l-1.718 1.75l-2-2.031l1.719-1.719zm-7.843 2.438l2 2l-2 2l-2-2zm5.406 0l2.031 2l-2 2l-2.03-2zm4.188 1.25l-.219 1.312l-.563-.563l.782-.75zm-13.657.093l.657.656l-.469.47zM7.532 16l2 2l-2 2.031l-.562-.562l-.407-2.5zm5.407 0l2.03 2.031l-2 2L10.939 18zm5.437 0l1.063 1.063l-.407 2.28l-.656.657l-2-2zm-8.125 2.719l2 2l-2 2.031l-2-2zm5.406 0l2 2l-2 2l-2-2zm-8.094 2.718l2 2L9 24h-.063c-.391 0-.621-.13-.874-.406a2.65 2.65 0 0 1-.594-1.188v-.031l-.125-.75l.218-.188zm5.407 0l2 2l-.563.563H11.5l-.563-.563l2.032-2zm5.406 0l.281.282l-.125.656c-.002.01.002.02 0 .031c-.095.49-.316.922-.562 1.188c-.252.27-.509.406-.907.406h-.125l-.562-.563z"
                            ></path>
                          </svg>
                          Desactivar cuenta
                        </motion.button>
                      </motion.div>
                    )}
                  </div>

                  {/* Opción Cerrar sesión */}
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      backgroundColor: "transparent",
                      border: "none",
                      color: textColor,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={handleLogout}
                  >
                    <svg
                      style={{ marginRight: "8px" }}
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
                    Cerrar sesión
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Información del perfil */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: `${lightTextColor} ${cardColor}`,
            "&::-webkit-scrollbar": {
              width: "8px",
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
          <div
            style={{
              padding: "1rem",
              paddingTop: "60px",
              paddingLeft: "25px",
              backgroundColor: cardColor,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            {editMode ? (
              <div>
                <input
                  type="text"
                  value={tempName}
                  onChange={handleNameChange}
                  style={{
                    width: "100%",
                    backgroundColor: backgroundColor,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    marginTop: "1rem",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                />
                <textarea
                  value={tempBio}
                  onChange={handleBioChange}
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    backgroundColor: backgroundColor,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "right",
                  }}
                >
                  <motion.button
                    whileHover={
                      hasChanges ? { backgroundColor: primaryColor } : {}
                    }
                    whileTap={hasChanges ? { scale: 0.95 } : {}}
                    style={{
                      backgroundColor: hasChanges
                        ? primaryColor
                        : "rgba(255, 69, 0, 0.3)",
                      color: "white",
                      border: `1px solid ${
                        hasChanges ? primaryColor : "rgba(255, 69, 0, 0.3)"
                      }`,
                      borderRadius: "10px",
                      padding: "8px 16px",
                      cursor: hasChanges ? "pointer" : "not-allowed",
                      transition: "all 0.2s ease-in-out",
                      opacity: hasChanges ? 1 : 0.7,
                    }}
                    onClick={hasChanges ? handleSaveClick : undefined}
                    disabled={!hasChanges}
                  >
                    Guardar
                  </motion.button>
                  <motion.button
                    whileHover={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: "transparent",
                      color: textColor,
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      borderRadius: "10px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "0.25rem",
                    color: textColor,
                  }}
                >
                  {userProfile.nombre_usuario}
                </h1>
                <div
                  style={{
                    color: lightTextColor,
                    marginBottom: "1rem",
                  }}
                >
                  {userProfile.email}
                </div>
                <div
                  style={{
                    textAlign: "justify",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "1rem",
                      color: textColor,
                    }}
                  >
                    {userProfile.bio}
                  </p>
                </div>
              </>
            )}
          </div>
          {/* Pestañas de contenido */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: cardColor,
            }}
          >
            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              style={{
                flex: 1,
                padding: "1rem",
                border: "none",
                backgroundColor:
                  selectedContent === "publicaciones"
                    ? "rgba(255, 69, 0, 0.1)"
                    : "transparent",
                color:
                  selectedContent === "publicaciones" ? accentColor : textColor,
                fontWeight: "bold",
                cursor: "pointer",
                borderBottom:
                  selectedContent === "publicaciones"
                    ? `2px solid ${accentColor}`
                    : "none",
              }}
              onClick={() => setSelectedContent("publicaciones")}
            >
              Publicaciones
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ backgroundColor: "rgba(255,255,white,0.1)" }}
              style={{
                flex: 1,
                padding: "1rem",
                border: "none",
                backgroundColor:
                  selectedContent === "equipos"
                    ? "rgba(255, 69, 0, 0.1)"
                    : "transparent",
                color: selectedContent === "equipos" ? accentColor : textColor,
                fontWeight: "bold",
                cursor: "pointer",
                borderBottom:
                  selectedContent === "equipos"
                    ? `2px solid ${accentColor}`
                    : "none",
              }}
              onClick={() => setSelectedContent("equipos")}
            >
              Equipos
            </motion.button>
          </div>

          {/* Contenido según pestaña seleccionada */}
          <CustomScroll>
            {selectedContent === "publicaciones" && (
              <div>
                {loadingPosts ? (
                  <div style={{ padding: "2rem", textAlign: "center" }}>
                    Cargando publicaciones...
                  </div>
                ) : profilePosts.length > 0 ? (
                  profilePosts.map((post) => (
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
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(`/publicaciones/${post.id}`, {
                          state: { user: userData },
                        })
                      }
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: !userProfile?.imagen
                            ? primaryColor
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "0.5rem",
                        }}
                      >
                        {userProfile.imagen ? (
                          <img
                            src={userProfile.imagen}
                            style={{
                              borderRadius: "50%",
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ color: "white", fontWeight: "bold" }}>
                            {userProfile.nombre_usuario?.charAt(0).toUpperCase() ||
                              "U"}
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
                                {post.userUsername}
                              </span>
                            </>
                          )}
                          <span style={{ color: lightTextColor }}>
                            · {formatRelativeTime(post.fechaHora)}
                          </span>
                          {post.categoriaDeporteId !== "General" && (
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
                                sport={post.categoriaDeporteId}
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  marginRight: "0.25rem",
                                  color: "white",
                                }}
                              />
                              {post.categoriaDeporteId}
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
                          {post.contenido}
                        </p>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navegar a la publicación específica
                              navigate(`/publicaciones/${post.id}`, {
                                state: { user: userData },
                              });
                            }}
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
                            <span>{post.comentarios || 0}</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: post.isLiked
                                ? accentColor
                                : lightTextColor,
                              cursor: "pointer",
                              padding: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id);
                            }}
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
                            <span>{post.likes || 0}</span>
                          </motion.button>
                        </div>
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
                    <div style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                      No hay publicaciones aún
                    </div>
                    <div>
                      {isCurrentUser
                        ? "Cuando publiques algo, aparecerá aquí"
                        : ""}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedContent === "equipos" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                  padding: "1rem",
                }}
              >
                {userProfile.equipos.map((equipo) => (
                  <motion.div
                    key={equipo.id}
                    whileHover={{
                      y: -5,
                      boxShadow: `0 5px 15px rgba(255, 69, 0, 0.2)`,
                    }}
                    style={{
                      backgroundColor: cardColor,
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: `1px solid ${borderColor}`,
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/equipo/${equipo.id}`)}
                  >
                    {/* Imagen del equipo */}
                    <div
                      style={{
                        height: "150px",
                        backgroundColor: "rgba(150, 133, 127, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={equipo.imagen || "https://i.imgur.com/vVkxceM.png"}
                        alt={equipo.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Información del equipo */}
                    <div style={{ padding: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <h3
                          style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            color: textColor,
                          }}
                        >
                          {equipo.nombre}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <SportIcon
                            sport={equipo.deporte.toLowerCase()}
                            style={{
                              width: "20px",
                              height: "20px",
                              marginRight: "0.5rem",
                              color: accentColor,
                            }}
                          />
                          <span
                            style={{
                              color: lightTextColor,
                              fontSize: "0.9rem",
                            }}
                          >
                            {equipo.deporte}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: lightTextColor,
                          fontSize: "0.9rem",
                        }}
                      >
                        <svg
                          style={{ marginRight: "0.5rem" }}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="1.2em"
                          height="1.2em"
                        >
                          <path
                            fill="currentColor"
                            d="M3.5 7a5 5 0 1 1 10 0a5 5 0 0 1-10 0M5 14a5 5 0 0 0-5 5v2h17v-2a5 5 0 0 0-5-5zm19 7h-5v-2c0-1.959-.804-3.73-2.1-5H19a5 5 0 0 1 5 5zm-8.5-9a5 5 0 0 1-1.786-.329A6.97 6.97 0 0 0 15.5 7a6.97 6.97 0 0 0-1.787-4.671A5 5 0 1 1 15.5 12"
                          ></path>
                        </svg>
                        {equipo.cantidadMiembros}{" "}
                        {equipo.cantidadMiembros === 1 ? "miembro" : "miembros"}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {userProfile.equipos.length === 0 && (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: lightTextColor,
                    }}
                  >
                    {isCurrentUser
                      ? "No perteneces a ningún equipo todavía"
                      : "El usuario no pertenece a ningún equipo"}
                  </div>
                )}
              </div>
            )}
          </CustomScroll>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmationModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(5px)",
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
              backgroundColor: cardColor,
              borderRadius: "16px",
              padding: "1.5rem",
              width: "90%",
              maxWidth: "500px",
              border: `1px solid ${borderColor}`,
            }}
          >
            <h3 style={{ marginTop: 0, color: textColor }}>Confirmar acción</h3>
            <p style={{ color: lightTextColor, marginBottom: "2rem" }}>
              {confirmationMessage}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <motion.button
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: "transparent",
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancelar
              </motion.button>

              <motion.button
                whileHover={{
                  backgroundColor:
                    confirmationAction === "delete"
                      ? "rgba(255, 0, 0, 0.4)"
                      : "rgba(255, 112, 67, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor:
                    confirmationAction === "delete" ? "rgb(255, 0, 0)" : "red",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
                onClick={handleConfirmedAction}
              >
                {confirmationAction === "delete"
                  ? "Desactivar cuenta"
                  : "Confirmar"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {showShareModal && (
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
            {/* Contenido del modal de compartir */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ margin: 0 }}>Compartir publicación</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
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

            {users.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  color: lightTextColor,
                }}
              >
                Cargando usuarios...
              </div>
            ) : (
              <>
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
                      No se encontraron usuarios
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
                          onClick={() => toggleUserSelection(user)}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
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
                              {user.nombreUsuario?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: "bold" }}>
                                {user.nombreUsuario}
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
                          {selectedUsers.some((u) => u.id === user.id) && (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                                fill={accentColor}
                              />
                            </svg>
                          )}
                        </div>
                      ))
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingTop: "1rem",
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendShare}
                    style={{
                      background:
                        selectedUsers.length > 0
                          ? primaryColor
                          : "rgba(255, 69, 0, 0.5)",
                      color: "white",
                      borderRadius: "30px",
                      border: "none",
                      padding: "8px 24px",
                      cursor:
                        selectedUsers.length > 0 ? "pointer" : "not-allowed",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                    disabled={selectedUsers.length === 0}
                  >
                    Enviar ({selectedUsers.length})
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {!profileExists && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: backgroundColor,
            zIndex: 1000,
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <motion.div
            animate={{
              boxShadow: hover
                ? "0 0px 30px #FF4500"
                : "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: "500px",
              padding: "2rem",
              borderRadius: "12px",
              border: `2px solid ${primaryColor}`,
            }}
          >
            <h2
              style={{
                color: textColor,
                marginBottom: "1rem",
                fontSize: "1.5rem",
              }}
            >
              Esta cuenta no existe.
            </h2>
            <p
              style={{
                color: lightTextColor,
                marginBottom: "2rem",
                fontSize: "1rem",
              }}
            >
              Intenta hacer otra búsqueda.
            </p>
            <motion.button
              whileHover={{ backgroundColor: backgroundColor }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHover(true)}
              onHoverEnd={() => setHover(false)}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: primaryColor,
                color: "white",
                border: "2px solid #FF4500",
                padding: "0.5rem 1.25rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={() => navigate("/principal")}
            >
              Volver al inicio
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Botón para mostrar barra izquierda en móviles */}
      {isMobile && !showLeftSidebar && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLeftSidebar(true)}
          style={{
            position: "fixed",
            left: "20px",
            top: "20px",
            zIndex: 50,
            width: "50px",
            height: "50px",
            border: "none",
            borderRadius: "50%",
            background: "transparent",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
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
    </div>
  );
}

export default PantallaPerfil;
