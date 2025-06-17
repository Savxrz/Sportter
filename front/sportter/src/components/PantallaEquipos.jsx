import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  getUserTeams,
  getAllTeams,
  createTeam,
  getUsers,
  addTeamMember,
} from "../services/api";

function PantallaEquipos() {
  const [activeTab, setActiveTab] = useState("paraTi");
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para Crear equipo
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamSport, setTeamSport] = useState("fútbol");
  const [teamImage, setTeamImage] = useState(null);
  const [teamImagePreview, setTeamImagePreview] = useState("");
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showSportsMenu, setShowSportsMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Datos de ejemplo para equipos
  const [teams, setTeams] = useState({
    paraTi: [],
    comunidad: [],
  });

  const navigate = useNavigate();
  const userData =
    location.state?.user || JSON.parse(localStorage.getItem("userData"));
  const userEmail = userData?.correoElectronico;
  const userName = userData?.nombreUsuario;
  const currentUserId = userData?.id;

  const primaryColor = "#FF4500";
  const accentColor = "#FF7043";
  const backgroundColor = "#121212";
  const cardColor = "#1e1e1e";
  const textColor = "#e1e1e1";
  const lightTextColor = "#a0a0a0";
  const borderColor = "#2d2d2d";

  // Componente para los iconos de deporte (igual que en PantallaPrincipal)
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
    };

    return icons[sport] || icons["fútbol"];
  };

  // Crear Equipos
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTeamImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = (user) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const handleCreateTeam = async () => {
    if (teamName.trim() && teamDescription.trim()) {
      try {
        // Map sport names to category IDs (usando la estructura de tu api.js)
        const sportToCategoryId = {
          fútbol: 1,
          baloncesto: 2,
          volleyball: 3,
          tenis: 4,
          ciclismo: 5,
        };

        const newTeam = {
          nombre: teamName,
          categoriaDeporteId: sportToCategoryId[teamSport],
          descripcion: teamDescription,
          imagenUrl: teamImagePreview || "https://i.imgur.com/vVkxceM.png",
        };

        console.log("Creando equipo con datos:", newTeam);
        const createdTeam = await createTeam(newTeam, currentUserId);
        console.log("Equipo creado:", createdTeam);

        // Añadir miembros seleccionados al equipo usando la función de api.js
        const memberAdditionResults = await Promise.allSettled(
          selectedMembers.map((member) =>
            addTeamMember(createdTeam.id, member.id)
          )
        );

        // Verificar resultados
        const failedAdditions = memberAdditionResults
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason);

        if (failedAdditions.length > 0) {
          console.warn(
            "Algunos miembros no se pudieron añadir:",
            failedAdditions
          );
          alert(
            `Equipo creado, pero algunos miembros no se pudieron añadir. Ver consola para detalles.`
          );
        } else {
          alert("Equipo creado exitosamente con todos los miembros!");
        }

        // Actualizar listas de equipos usando las funciones de api.js
        const [updatedUserTeams, updatedAllTeams] = await Promise.all([
          getUserTeams(currentUserId),
          getAllTeams(currentUserId),
        ]);

        setTeams({
          paraTi: updatedUserTeams,
          comunidad: updatedAllTeams,
        });

        // Reset form
        setTeamName("");
        setTeamDescription("");
        setTeamSport("fútbol");
        setTeamImage(null);
        setTeamImagePreview("");
        setSelectedMembers([]);
        setShowCreateTeamModal(false);
      } catch (error) {
        console.error("Error creating team:", error);
        let errorMessage = "Error al crear el equipo";

        if (error.response) {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            error.response.data ||
            errorMessage;
        } else if (error.request) {
          errorMessage = "No se recibió respuesta del servidor";
        } else {
          errorMessage = error.message || errorMessage;
        }

        alert(errorMessage);
      }
    } else {
      alert("Por favor completa todos los campos requeridos");
    }
  };

  const handleCancel = () => {
    // Reiniciar todos los campos
    setTeamName("");
    setTeamDescription("");
    setTeamSport("fútbol");
    setTeamImage(null);
    setTeamImagePreview("");
    setSelectedMembers([]);
    setSearchMemberQuery("");
    setShowCreateTeamModal(false);
  };

  const handleRemoveImage = () => {
    setTeamImage(null);
    setTeamImagePreview("");
  };

  useEffect(() => {
    // Detectar si es móvil o tablet
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowLeftSidebar(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cargar equipos
    const loadTeams = async () => {
      try {
        console.log("Cargando equipos para usuario:", currentUserId);
        const userTeams = await getUserTeams(currentUserId);
        const communityTeams = await getAllTeams(currentUserId);

        console.log("Equipos del usuario:", userTeams);
        console.log("Equipos de la comunidad:", communityTeams);

        setTeams({
          paraTi: userTeams,
          comunidad: communityTeams,
        });
      } catch (error) {
        console.error("Error loading teams:", error);
      }
    };

    if (currentUserId) {
      loadTeams();
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [currentUserId]);

  // Reemplazar el useEffect que carga los usuarios con este:
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const fetchedUsers = await getUsers();

        // Filtrar para excluir al usuario actual
        const filteredUsers = fetchedUsers.filter(
          (user) => user.id !== currentUserId
        );

        // Ordenar usuarios alfabéticamente por nombreUsuario
        const sortedUsers = filteredUsers.sort((a, b) => {
          const nameA = a.nombreUsuario?.toUpperCase() || "";
          const nameB = b.nombreUsuario?.toUpperCase() || "";
          return nameA.localeCompare(nameB);
        });

        console.log("Usuarios ordenados (excluyendo al actual):", sortedUsers);
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  const handleLogout = () => {
    // 1. Limpiar datos de autenticación
    localStorage.removeItem("userData");

    // 2. Redirigir al login (con replace para evitar volver atrás)
    navigate("/", { replace: true });
  };

  const filteredTeams = searchQuery
    ? (teams[activeTab] || []).filter((team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : teams[activeTab] || [];

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
      {/* Barra lateral izquierda (igual que en PantallaPrincipal) */}
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
                rotate: activeTab === "inicio" ? 10 : 0, // Mismo efecto de inclinación de 10 grados
                scale: activeTab === "inicio" ? 1.1 : 1, // Mismo escalado del 10%
              }}
              transition={{ type: "spring", stiffness: 500 }} // Misma animación spring
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
              color:
                activeTab === ("inicio" || "eventos" || "mensajes" || "perfil")
                  ? textColor
                  : accentColor,
              backgroundColor: "rgba(255, 112, 67, 0.1)",
              borderRadius: "8px",
              border: "none",
              fontSize: "1.2rem",
              textAlign: "left",
              padding: "0.5rem",
            }}
            onClick={() => {
              setActiveTab("paraTi");
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
            <motion.div style={{ marginBottom: "0.20rem" }}>
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
              borderRadius: "8px",
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
                rotate: activeTab === "mensajes" ? 10 : 0, // Mismo efecto de inclinación de 10 grados
                scale: activeTab === "mensajes" ? 1.1 : 1, // Mismo escalado del 10%
              }}
              transition={{ type: "spring", stiffness: 500 }} // Misma animación spring
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
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            padding: "1rem",
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: cardColor,
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              margin: "0.5rem 0",
              color: primaryColor,
              textAlign: isMobile ? "center" : "left",
            }}
          >
            Equipos
          </h1>

          {/* Barra de búsqueda */}
          <div style={{ position: "relative", marginTop: "1rem" }}>
            <input
              type="text"
              placeholder="Buscar equipos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>

        {/* Pestañas Para ti / Comunidad */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: cardColor,
            position: "sticky",
            top: "80px",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setActiveTab("paraTi")}
            style={{
              flex: 1,
              padding: "1rem",
              border: "none",
              backgroundColor:
                activeTab === "paraTi" ? backgroundColor : "transparent",
              color: activeTab === "paraTi" ? primaryColor : textColor,
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              borderBottom:
                activeTab === "paraTi" ? `2px solid ${primaryColor}` : "none",
            }}
          >
            Para ti
          </button>
          <button
            onClick={() => setActiveTab("comunidad")}
            style={{
              flex: 1,
              padding: "1rem",
              border: "none",
              backgroundColor:
                activeTab === "comunidad" ? backgroundColor : "transparent",
              color: activeTab === "comunidad" ? primaryColor : textColor,
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              borderBottom:
                activeTab === "comunidad"
                  ? `2px solid ${primaryColor}`
                  : "none",
            }}
          >
            Comunidad
          </button>
        </div>

        {/* Lista de equipos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
            padding: "1rem",
            overflowY: "auto",
            maxHeight: "calc(100vh - 200px)",
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
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                whileHover={{
                  y: -5,
                  boxShadow: `0 5px 15px rgba(255, 69, 0, 0.35)`,
                }}
                style={{
                  backgroundColor: cardColor,
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: `1px solid ${borderColor}`,
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                }}
                onClick={() => navigate(`/equipo/${team.id}`)}
              >
                {/* Imagen del equipo con badge de deporte */}
                <div
                  style={{
                    height: "140px",
                    backgroundColor: "rgba(0, 0, 0, 0.28)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={team.imagen || "https://i.imgur.com/vVkxceM.png"} // Imagen por defecto
                    alt={team.nombre}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* Badge del deporte */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "50px",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <SportIcon
                      sport={team.deporte.toLowerCase()}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span>{team.deporte}</span>
                  </div>
                </div>

                {/* Información del equipo */}
                <div
                  style={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: textColor,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {team.nombre}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: lightTextColor,
                      fontSize: "0.85rem",
                      marginTop: "0.3rem",
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
                    {team.cantidadMiembros}{" "}
                    {team.cantidadMiembros === 1 ? "miembro" : "miembros"}
                  </div>
                </div>
              </motion.div>
            ))

          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              color: lightTextColor,
              textAlign: "center",
              padding: "2rem",
              gridColumn: "1 / -1",
            }}>
              <svg
                width="75"
                height="75"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "5px", marginBottom: "10px" }}
              >
                <path
                  fill="currentColor"
                  d="M5.5 3.5a2.5 2.5 0 1 1 5 0a2.5 2.5 0 0 1-5 0m1 3.5A1.5 1.5 0 0 0 5 8.5V11a3 3 0 1 0 6 0V8.5A1.5 1.5 0 0 0 9.5 7zm-2.444.97A2.5 2.5 0 0 0 4 8.5V11a4 4 0 0 0 1.213 2.87l-.1.028a3 3 0 0 1-3.673-2.121l-.389-1.45A1.5 1.5 0 0 1 2.112 8.49zm6.73 5.9A4 4 0 0 0 12 11V8.5q-.001-.274-.056-.53l1.943.52a1.5 1.5 0 0 1 1.061 1.838l-.388 1.449a3 3 0 0 1-3.773 2.093M1 5a2 2 0 1 1 4 0a2 2 0 0 1-4 0m10 0a2 2 0 1 1 4 0a2 2 0 0 1-4 0"
                ></path>
              </svg>
              <h3 style={{ color: textColor, marginBottom: "0.5rem" }}>
                No hay equipos disponibles
              </h3>
              <p>
                {activeTab === "paraTi"
                  ? "No eres miembro de ningún equipo"
                  : "Crea un nuevo equipo o únete a uno existente"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para crear equipo */}
      {!showCreateTeamModal && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateTeamModal(true)}
          style={{
            position: "fixed",
            right: "20px",
            bottom: "20px",
            zIndex: 50,
            width: "60px",
            height: "60px",
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
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white" />
          </svg>
        </motion.button>
      )}

      {/* Modal para crear equipo */}
      {showCreateTeamModal && (
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
              overflowY: "auto",

              // Estilos personalizados para el scroll del popup
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ margin: 0, color: textColor }}>
                Crear nuevo equipo
              </h3>
              <button
                onClick={() => handleCancel()}
                style={{
                  background: "transparent",
                  border: "none",
                  color: textColor,
                  cursor: "pointer",
                  fontSize: "1.75rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6m0 12L6 6"
                  ></path>
                </svg>
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: textColor,
                }}
              >
                Nombre del equipo
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                maxLength={50}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  outline: "none",
                }}
                placeholder="Nombre del equipo"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: textColor,
                }}
              >
                Descripción
              </label>
              <textarea
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                rows="3"
                maxLength={500}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  outline: "none",
                  resize: "vertical",
                  minHeight: "100px",
                  maxHeight: "250px",

                  // Estilos personalizados para el scroll del textarea
                  scrollbarWidth: "thin",
                  scrollbarColor: `${lightTextColor} ${backgroundColor}`,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: backgroundColor,
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: lightTextColor,
                    borderRadius: "10px",
                    border: `2px solid ${backgroundColor}`,
                  },
                }}
                placeholder="Descripción del equipo"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: textColor,
                }}
              >
                Deporte
              </label>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowSportsMenu(!showSportsMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    backgroundColor: backgroundColor,
                    color: textColor,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <SportIcon
                      sport={teamSport}
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "0.5rem",
                      }}
                    />
                    {teamSport.charAt(0).toUpperCase() + teamSport.slice(1)}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 10L12 15L17 10H7Z" fill={textColor} />
                  </svg>
                </button>

                {showSportsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: cardColor,
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                      zIndex: 10,
                      marginTop: "0.25rem",
                      overflow: "hidden",
                    }}
                  >
                    {[
                      "fútbol",
                      "baloncesto",
                      "volleyball",
                      "tenis",
                      "ciclismo",
                    ].map((sport) => (
                      <button
                        key={sport}
                        onClick={() => {
                          setTeamSport(sport);
                          setShowSportsMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          textAlign: "left",
                          backgroundColor: "transparent",
                          border: "none",
                          color: textColor,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          ":hover": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                        }}
                      >
                        <SportIcon
                          sport={sport}
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "0.5rem",
                          }}
                        />
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: textColor,
                }}
              >
                Imagen del equipo
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  position: "relative",
                }}
              >
                <label
                  style={{
                    padding: "0.6rem",
                    borderRadius: "8px",
                    backgroundColor: teamImagePreview
                      ? "rgba(255, 112, 67, 0.5)"
                      : primaryColor,
                    color: "white",
                    cursor: teamImagePreview ? "default" : "pointer",
                    textAlign: "center",
                    flexShrink: 0,
                    opacity: teamImagePreview ? 0.7 : 1,
                  }}
                >
                  Seleccionar imagen
                  {!teamImagePreview && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  )}
                </label>
                {teamImagePreview && (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={teamImagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        border: "none",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: textColor,
                }}
              >
                Añadir miembros
              </label>
              <div
                style={{
                  position: "relative",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
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

              {searchMemberQuery && (
                <div
                  style={{
                    backgroundColor: backgroundColor,
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    maxHeight: "200px",
                    overflowY: "auto",
                    marginBottom: "1rem",
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
                  {users
                    .filter(
                      (user) =>
                        user.nombreUsuario
                          ?.toLowerCase()
                          .includes(searchMemberQuery.toLowerCase()) ||
                        user.correoElectronico
                          ?.toLowerCase()
                          .includes(searchMemberQuery.toLowerCase())
                    )
                    .filter(
                      (user) => !selectedMembers.some((m) => m.id === user.id)
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem",
                          cursor: "pointer",
                          ":hover": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                        }}
                        onClick={() => handleAddMember(user)}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                            {user.nombreUsuario?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div
                              style={{ fontWeight: "bold", color: textColor }}
                            >
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMember(user);
                          }}
                          style={{
                            background: primaryColor,
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.25rem 0.5rem",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          Añadir
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <div
                style={{
                  backgroundColor: backgroundColor,
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  padding: "0.75rem",
                  minHeight: "100px",
                  maxHeight: "200px",
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
                <h4 style={{ margin: "0 0 0.5rem 0", color: textColor }}>
                  Miembros seleccionados
                </h4>
                {selectedMembers.length === 0 ? (
                  <p style={{ color: lightTextColor, margin: 0 }}>
                    No hay miembros seleccionados
                  </p>
                ) : (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "rgba(255, 112, 67, 0.2)",
                          borderRadius: "50px",
                          padding: "0.25rem 0.5rem 0.25rem 0.25rem",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: primaryColor,
                            marginRight: "0.25rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {member.nombreUsuario?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span style={{ color: textColor, fontSize: "0.8rem" }}>
                          {member.nombreUsuario || "Usuario"}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: textColor,
                            cursor: "pointer",
                            marginLeft: "0.25rem",
                            fontSize: "0.8rem",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1rem",
                gap: "0.5rem",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowCreateTeamModal(false);
                  handleCancel();
                }}
                style={{
                  background: "transparent",
                  color: textColor,
                  borderRadius: "30px",
                  border: `1px solid ${borderColor}`,
                  padding: "8px 24px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleCreateTeam();
                }}
                disabled={!teamName.trim() || !teamDescription.trim()}
                style={{
                  background:
                    teamName.trim() && teamDescription.trim()
                      ? primaryColor
                      : "rgba(255, 69, 0, 0.5)",
                  color: "white",
                  borderRadius: "30px",
                  border: "none",
                  padding: "8px 24px",
                  cursor:
                    teamName.trim() && teamDescription.trim()
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Crear equipo
              </motion.button>
            </div>
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

export default PantallaEquipos;
