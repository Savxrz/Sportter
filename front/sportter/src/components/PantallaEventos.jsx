import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { getEventos, getEventosPorUsuario } from "../services/api";

function PantallaEventos() {
    const [activeTab, setActiveTab] = useState("paraTi");
    const [showLeftSidebar, setShowLeftSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState({ paraTi: [], comunidad: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const userData =
        location.state?.user || JSON.parse(localStorage.getItem("userData"));
    const userEmail = userData?.correoElectronico;
    const userName = userData?.nombreUsuario;
    const currentUserId = userData?.id;

    // Colores con tema anaranjado-rojizo (igual que PantallaInicio)
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

        return icons[sport] || icons["general"];
    };

    const handleOpenMap = (location) => {
        const encodedLocation = encodeURIComponent(location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
    };

    // Datos de ejemplo para eventos
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);

                // Obtener eventos para "Para ti" (eventos de los equipos del usuario)
                const eventosParaTi = await getEventosPorUsuario(currentUserId);

                // Obtener eventos para "Comunidad" (todos los eventos)
                const eventosComunidad = await getEventos();

                // Transformar los datos al formato que espera tu componente
                const transformEvent = (evento) => ({
                    id: evento.id,
                    localTeam: evento.equipoLocal?.nombre || "Equipo Local",
                    visitorTeam: evento.equipoVisitante?.nombre || "Equipo Visitante",
                    sport: evento.deporte || "fútbol",
                    localImage: evento.equipoLocal?.imagenUrl || "https://i.imgur.com/bUwYQP3.png",
                    visitorImage: evento.equipoVisitante?.imagenUrl || "https://i.imgur.com/bUwYQP3.png",
                    date: evento.fecha,
                    location: evento.ubicacion,
                    isMember: evento.esMiembro,
                });

                setEvents({
                    paraTi: eventosParaTi.map(transformEvent),
                    comunidad: eventosComunidad.map(transformEvent),
                });
            } catch (error) {
                console.error("Error al cargar eventos:", error);
                // Puedes mantener algunos datos de ejemplo como respaldo
                setEvents({
                    paraTi: [],
                    comunidad: [],
                });
            } finally {
                setLoading(false);
            }
        };

        if (currentUserId) {
            fetchEvents();
        }
    }, [currentUserId, activeTab]);

    // Formatear fecha para mostrarla
    const formatDate = (dateString) => {
        const options = {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    };

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

    const handleLogout = () => {
        // 1. Limpiar datos de autenticación
        localStorage.removeItem("userData");

        // 2. Redirigir al login (con replace para evitar volver atrás)
        navigate("/", { replace: true });
    };

    const noEventsStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 200px)",
        color: lightTextColor,
        textAlign: "center",
        padding: "2rem",
    };

    const filteredEvents = searchQuery
        ? events[activeTab].filter(
            (event) =>
                event.localTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.visitorTeam.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [...events[activeTab]].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
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
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
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
                            color:
                                activeTab === ("inicio" || "equipos" || "mensajes" || "perfil")
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
                            isMobile && setShowLeftSidebar(false);
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
                                    fill={activeTab === "eventos" ? textColor : accentColor}
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
                        Eventos
                    </h1>

                    {/* Barra de búsqueda */}
                    <div style={{ position: "relative", marginTop: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Buscar eventos..."
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

                {/* Lista de eventos */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "1.5rem",
                        padding: "1.5rem",
                        overflowY: "auto",
                        maxHeight: "calc(100vh - 200px)",
                        alignContent: "flex-start",
                        /* Estilos personalizados para el scroll */
                        scrollbarWidth: "thin",
                        scrollbarColor: `${lightTextColor} ${backgroundColor}`,
                        "&::-webkit-scrollbar": {
                            width: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: backgroundColor,
                            borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: primaryColor,
                            borderRadius: "10px",
                            border: `2px solid ${backgroundColor}`,
                        },
                    }}
                >
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => (
                            <motion.div
                                key={event.id}
                                whileHover={{
                                    y: -5,
                                    boxShadow: `0 10px 25px rgba(255, 69, 0, 0.3)`,
                                    borderColor: primaryColor,
                                }}
                                style={{
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    border: `2px solid ${borderColor}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    cursor: "pointer",
                                    position: "relative",
                                    transition: "all 0.1s ease",
                                    height: "280px",
                                    minWidth: "320px",
                                    background:
                                        "linear-gradient(135deg, rgba(30,30,30,0.9), rgba(18,18,18,1))",
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
                                onClick={() => setSelectedEvent(event)}
                            >
                                {/* Overlay oscuro */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: "rgba(0,0,0,0.6)",
                                        zIndex: 1,
                                    }}
                                ></div>

                                {/* Contenido del evento - Parte superior (equipos) */}
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        padding: "1rem",
                                        zIndex: 3,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                            height: "100%",
                                        }}
                                    >
                                        {/* Equipo local */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flex: 1,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "80px",
                                                    height: "80px",
                                                    borderRadius: "50%",
                                                    overflow: "hidden",
                                                    border: `3px solid ${primaryColor}`,
                                                    boxShadow: `0 0 15px rgba(255, 69, 0, 0.3)`,
                                                    position: "relative",
                                                    backgroundColor: "rgb(48, 48, 48)"
                                                }}
                                            >
                                                <img
                                                    src={event.localImage}
                                                    alt={event.localTeam}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: "1rem",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                    color: textColor,
                                                    fontSize: "1.1rem",
                                                }}
                                            >
                                                {event.localTeam}
                                            </div>
                                        </div>

                                        {/* VS */}
                                        <div
                                            style={{
                                                fontSize: "1.8rem",
                                                fontWeight: "bold",
                                                color: primaryColor,
                                                padding: "0 1rem",
                                                textShadow: `0 0 10px rgba(255, 69, 0, 0.5)`,
                                                margin: "0 0.5rem",
                                            }}
                                        >
                                            VS
                                        </div>

                                        {/* Equipo visitante */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flex: 1,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "80px",
                                                    height: "80px",
                                                    borderRadius: "50%",
                                                    overflow: "hidden",
                                                    border: `3px solid ${primaryColor}`,
                                                    boxShadow: `0 0 15px rgba(255, 69, 0, 0.3)`,
                                                    position: "relative",
                                                    backgroundColor: "rgb(48, 48, 48)"
                                                }}
                                            >
                                                <img
                                                    src={event.visitorImage}
                                                    alt={event.visitorTeam}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: "1rem",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                    color: textColor,
                                                    fontSize: "1.1rem",
                                                }}
                                            >
                                                {event.visitorTeam}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Icono del deporte */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "15px",
                                            right: "15px",
                                            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                                            color: "white",
                                            padding: "0.5rem",
                                            borderRadius: "50%",
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: `0 2px 10px rgba(255, 69, 0, 0.5)`,
                                            zIndex: 3,
                                        }}
                                    >
                                        <SportIcon
                                            sport={event.sport}
                                            style={{
                                                width: "25px",
                                                height: "25px",
                                                color: "white",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Pie de tarjeta con información */}
                                <div
                                    style={{
                                        padding: "1rem",
                                        background: "rgba(30,30,30,0.9)",
                                        borderTop: `1px solid ${borderColor}`,
                                        position: "relative",
                                        zIndex: 3,
                                        minHeight: "100px", // Altura fija para la parte inferior
                                    }}
                                >
                                    {/* Indicador de miembro */}
                                    {event.isMember && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "-12px",
                                                left: "15px",
                                                background: primaryColor,
                                                color: "white",
                                                padding: "3px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.7rem",
                                                fontWeight: "bold",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{ marginRight: "5px" }}
                                            >
                                                <path
                                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                                    fill="white"
                                                />
                                            </svg>
                                            Mi equipo
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginTop: event.isMember ? "0.5rem" : "0",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                color: lightTextColor,
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 46 46"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{ marginRight: "5px" }}
                                            >
                                                <g fill="none" stroke="#a0a0a0" strokeWidth="4">
                                                    <circle cx="24" cy="8" r="4" fill=""></circle>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M7 18H19V34"
                                                    ></path>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M41 18H29V44"
                                                    ></path>
                                                </g>
                                            </svg>
                                            {event.sport.charAt(0).toUpperCase() +
                                                event.sport.slice(1)}
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
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{ marginRight: "5px" }}
                                            >
                                                <path
                                                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                                                    fill={lightTextColor}
                                                />
                                            </svg>
                                            {new Date(event.date).toLocaleTimeString("es-ES", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "0.5rem",
                                            color: textColor,
                                            fontWeight: "500",
                                            fontSize: "0.95rem",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ marginRight: "5px" }}
                                        >
                                            <path
                                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                                fill={primaryColor}
                                            />
                                        </svg>
                                        {event.location}
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
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="5em"
                                height="5em"
                                style={{ marginBottom: "1rem" }}
                            >
                                <path
                                    fill="currentColor"
                                    d="M17 2c-.55 0-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V3c0-.55-.45-1-1-1m2 18H5V10h14zm-8-7c0-.55.45-1 1-1s1 .45 1 1s-.45 1-1 1s-1-.45-1-1m-4 0c0-.55.45-1 1-1s1 .45 1 1s-.45 1-1 1s-1-.45-1-1m8 0c0-.55.45-1 1-1s1 .45 1 1s-.45 1-1 1s-1-.45-1-1m-4 4c0-.55.45-1 1-1s1 .45 1 1s-.45 1-1 1s-1-.45-1-1m-4 0c0-.55.45-1 1-1s1 .45 1 1s-.45 1-1 1s-1-.45-1-1m8 0c0-.55.45-1 1-1s1 .45 1 1s-.45 1-1 1s-1-.45-1-1"
                                ></path>
                            </svg>
                            <h3 style={{ color: textColor, marginBottom: "0.5rem" }}>
                                No hay eventos disponibles
                            </h3>
                            <p>
                                {activeTab === "paraTi"
                                    ? "No tienes eventos programados con tus equipos"
                                    : "No hay eventos públicos disponibles en este momento"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para ver detalles del evento */}
            {selectedEvent && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        backdropFilter: "blur(8px)",
                        zIndex: 100,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1rem",
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25 }}
                        style={{
                            backgroundColor: cardColor,
                            borderRadius: "20px",
                            padding: "0",
                            width: "100%",
                            maxWidth: "600px",
                            border: `2px solid ${borderColor}`,
                            maxHeight: "90vh",
                            overflow: "auto",
                            boxShadow: `0 15px 30px rgba(0,0,0,0.5)`,
                            position: "relative",
                        }}
                    >
                        {/* Banda decorativa superior */}
                        <div
                            style={{
                                height: "10px",
                                width: "100%",
                                background: primaryColor,
                                position: "absolute",
                                top: 0,
                                left: 0,
                            }}
                        ></div>

                        {/* Encabezado del modal - MODIFICADO */}
                        <div
                            style={{
                                padding: "1.5rem 1.5rem 0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    color: textColor,
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    flex: 1,
                                }}
                            >
                                Detalles
                            </h3>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                }}
                            >
                                {/* Badge de deporte */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        background: primaryColor,
                                        borderRadius: "20px",
                                        padding: "0.5rem 1rem",
                                        color: "white",
                                        fontWeight: "bold",
                                    }}
                                >
                                    <SportIcon
                                        sport={selectedEvent.sport}
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            marginRight: "0.5rem",
                                        }}
                                    />
                                    {selectedEvent.sport.charAt(0).toUpperCase() +
                                        selectedEvent.sport.slice(1)}
                                </div>

                                {/* Botón de cerrar */}
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    style={{
                                        background: "rgba(0,0,0,0.7)",
                                        border: "none",
                                        color: "white",
                                        cursor: "pointer",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                        transition: "all 0.3s ease",
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
                                            fill="white"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contenido principal - IMÁGENES EN LÍNEA */}
                        <div
                            style={{
                                padding: "1.5rem",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            {/* Equipos - SIEMPRE EN LA MISMA LÍNEA */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    margin: "1.5rem 0",
                                    gap: "1rem",
                                    flexWrap: "nowrap", // Evita que se rompa la línea
                                    overflow: "hidden", // Para contener el contenido
                                }}
                            >
                                {/* Equipo local */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        flex: "1 1 auto",
                                        minWidth: "80px", // Mínimo para que no colapse
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            maxWidth: "120px",
                                            aspectRatio: "1/1",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            border: `4px solid ${primaryColor}`,
                                            boxShadow: `0 0 20px rgba(255, 69, 0, 0.4)`,
                                            position: "relative",
                                            marginBottom: "1rem",
                                            backgroundColor: "rgb(48, 48, 48)",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        <img
                                            src={selectedEvent.localImage}
                                            alt={selectedEvent.localTeam}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                    <h4
                                        style={{
                                            margin: "0.5rem 0 0",
                                            color: textColor,
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {selectedEvent.localTeam}
                                    </h4>
                                </div>

                                {/* VS */}
                                <div
                                    style={{
                                        fontSize: "2rem",
                                        fontWeight: "bold",
                                        color: primaryColor,
                                        padding: "0 0.5rem",
                                        textShadow: `0 0 15px rgba(255, 69, 0, 0.6)`,
                                        flexShrink: 0,
                                        alignSelf: "center",
                                        margin: "0 0.5rem",
                                    }}
                                >
                                    VS
                                </div>

                                {/* Equipo visitante */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        flex: "1 1 auto",
                                        minWidth: "80px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            maxWidth: "120px",
                                            aspectRatio: "1/1",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            border: `4px solid ${accentColor}`,
                                            boxShadow: `0 0 20px rgba(255, 112, 67, 0.4)`,
                                            position: "relative",
                                            marginBottom: "1rem",
                                            transition: "all 0.3s ease",
                                            backgroundColor: "rgb(48, 48, 48)"
                                        }}
                                    >
                                        <img
                                            src={selectedEvent.visitorImage}
                                            alt={selectedEvent.visitorTeam}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                    <h4
                                        style={{
                                            margin: "0.5rem 0 0",
                                            color: textColor,
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {selectedEvent.visitorTeam}
                                    </h4>
                                </div>
                            </div>

                            {/* Información detallada */}
                            <div
                                style={{
                                    width: "100%",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "12px",
                                    padding: "1.5rem",
                                    marginTop: "0.5rem",
                                }}
                            >
                                {/* Fila de fecha y hora */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        paddingBottom: "1rem",
                                        borderBottom: `1px solid ${borderColor}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "12px",
                                            background: "rgba(255, 69, 0, 0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: "1rem",
                                            flexShrink: 0,
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
                                                d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V17H12V13Z"
                                                fill={primaryColor}
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                color: lightTextColor,
                                                fontSize: "0.9rem",
                                                marginBottom: "0.2rem",
                                            }}
                                        >
                                            Fecha y Hora
                                        </div>
                                        <div
                                            style={{
                                                color: textColor,
                                                fontSize: "1.1rem",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {formatDate(selectedEvent.date)}
                                        </div>
                                    </div>
                                </div>

                                {/* Fila de ubicación */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "1rem",
                                        paddingBottom: "1rem",
                                        borderBottom: `1px solid ${borderColor}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "12px",
                                            background: "rgba(255, 69, 0, 0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: "1rem",
                                            flexShrink: 0,
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
                                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                                fill={primaryColor}
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                color: lightTextColor,
                                                fontSize: "0.9rem",
                                                marginBottom: "0.2rem",
                                            }}
                                        >
                                            Ubicación
                                        </div>
                                        <div
                                            style={{
                                                color: textColor,
                                                fontSize: "1.1rem",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {selectedEvent.location}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                background: "transparent",
                                                border: `1px solid ${primaryColor}`,
                                                color: primaryColor,
                                                borderRadius: "20px",
                                                padding: "0.25rem 1rem",
                                                marginTop: "0.5rem",
                                                fontSize: "0.8rem",
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => handleOpenMap(selectedEvent.location)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="1.2em"
                                                height="1.2em"
                                                style={{ marginRight: "0.3rem" }}
                                            >
                                                <path
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 15a6 6 0 1 0 0-12a6 6 0 0 0 0 12m0 0v6M9.5 9A2.5 2.5 0 0 1 12 6.5"
                                                ></path>
                                            </svg>
                                            Ver en mapa
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Estado del evento (si es tu equipo) */}
                                {selectedEvent.isMember && (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "rgba(255, 69, 0, 0.1)",
                                            borderRadius: "8px",
                                            padding: "0.75rem",
                                            marginTop: "-0.5rem",
                                        }}
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ marginRight: "0.5rem" }}
                                        >
                                            <path
                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                                fill={primaryColor}
                                            />
                                        </svg>
                                        <span style={{ color: primaryColor, fontWeight: "500" }}>
                                            Eres miembro de uno de estos equipos
                                        </span>
                                    </div>
                                )}
                            </div>
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

export default PantallaEventos;