// Funciones para manejar el inicio de sesion de usuarios
import axios from "axios";
import SockJS from "sockjs-client";
import { Stomp, Client } from "@stomp/stompjs";

const BASE_URL = "http://localhost:8080";


export const loginUser = async (credentials) => {
  try {
    console.log("Enviando credenciales:", credentials);
    const response = await axios.post(
      `${BASE_URL}/api/login`,
      {
        correoElectronico: credentials.correoElectronico, // ← Cambiado a guión bajo
        contrasena: credentials.contrasena,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error completo:", error.response);
    throw error;
  }
};

// Función para manejar el registro de usuarios
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Error en el registro");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

//funcion para verificar si el correo ya existe
export const verificarEmail = async (email, paraRegistro) => {
  try {
    const response = await fetch(`${BASE_URL}/api/existe-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.status === 200) {
      return true;
    }

    // Si viene con contenido (por ejemplo, error 404 con mensaje)
    const data = await response.json();

    if (paraRegistro) {
      if (
        response.status === 404 &&
        data.message.includes("no está vinculado")
      ) {
        return false; // Email no existe (ok para registro)
      }
      if (response.ok || data.message.includes("ya esta vinculado")) {
        return true; // Email existe (error para registro)
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Este correo no está vinculado a ninguna cuenta"
      );
    }

    if (!paraRegistro) {
      throw new Error(
        error.message || "Error al verificar el correo electrónico"
      );
    }
    return true;
  } catch (error) {
    console.error("Error al verificar el email:", error);
    // Aseguramos que siempre devolvamos un mensaje de error legible
    throw new Error(
      error.message || "Error al verificar el correo electrónico"
    );
  }
};

// Actualizar contraseña
export const actualizarContrasena = async (email, nuevaContrasena) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/actualizar-contrasena`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          nuevaContrasena: nuevaContrasena,
        }),
      }
    );

    // Verificar si la respuesta tiene contenido
    const contentType = response.headers.get("content-type");
    let data = null;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
        "Error al actualizar la contraseña. Código: " + response.status
      );
    }

    return data || { success: true }; // Devuelve datos o objeto de éxito
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    throw new Error(
      error.message ||
      "No se pudo conectar con el servidor para actualizar la contraseña"
    );
  }
};

export const loadPosts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/publicaciones`);
    if (!response.data || !Array.isArray(response.data)) return [];

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userEmail = userData?.correoElectronico;

    const procesarImagen = (img) => {
      if (!img) return null;
      if (typeof img === 'string') {
        if (img.startsWith('http') || img.startsWith('data:image/')) return img;
        if (/^[A-Za-z0-9+/=]+$/.test(img)) {
          let tipo = 'jpeg';
          if (img.startsWith('iVBORw0KGgo')) tipo = 'png';
          return `data:image/${tipo};base64,${img}`;
        }
      }
      return null;
    };

    return await Promise.all(response.data.map(async (post) => {
      const usuario = post.usuario || {
        id: 0,
        nombreUsuario: "AnÃ³nimo",
        correoElectronico: "anonimo@example.com",
        imagen_perfil: null
      };

      // Procesar imagen de perfil
      const imagenPerfil = usuario.imagen_perfil
        ? procesarImagen(usuario.imagen_perfil)
        : null;

      // Verificar like
      let isLiked = false;
      if (userEmail) {
        try {
          const likeResponse = await axios.get(
            `${BASE_URL}/api/publicaciones/${post.id}/check-like`,
            { params: { userEmail } }
          );
          isLiked = likeResponse.data;
        } catch (error) {
          console.error("Error verificando like:", error);
        }
      }

      // Procesar fecha
      const postDate = post.fechaHora ? new Date(post.fechaHora) : new Date();

      return {
        id: post.id,
        userId: usuario.id,
        user: usuario.correoElectronico,
        name: usuario.nombreUsuario,
        content: post.contenido || "",
        time: postDate,
        comments: post.comentarios || 0,
        likes: post.likes || 0,
        shares: post.compartidos || 0,
        sport: post.categoriaDeporte?.nombre || "General",
        isLiked,
        imagen: procesarImagen(post.imagen),
        usuario: { imagenPerfil }
      };
    }));

  } catch (error) {
    console.error("Error loading posts:", error);
    return [];
  }
};

export const darLike = async (postId, userEmail) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/publicaciones/${postId}/like`,
      { userEmail },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al dar like:", error);
    throw error;
  }
};

export const quitarLike = async (postId, userEmail) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/publicaciones/${postId}/unlike`,
      { userEmail },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al quitar like:", error);
    throw error;
  }
};

export const checkLikeStatus = async (postId, userEmail) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/publicaciones/${postId}/check-like`,
      { params: { userEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error verificando like:", error);
    return false;
  }
};

export const crearPublicacion = async (publicacionData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/publicaciones/crearPubli`, // Cambiado el endpoint
      publicacionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al crear publicación:", error);
    throw error;
  }
};


// Funciones para manejar comentarios
export const getComentarios = async (publicacionId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/comentarios/publicaciones/${publicacionId}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }
    console.log("Respuesta de la API:", response.data);

    return response.data.map((comment) => processComment(comment));
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    throw error;
  }
};

export const processComment = (comment) => {
  const usuario = {
    id: comment.usuarioId || 0,
    nombreUsuario: comment.usuarioNombre || "Anónimo",
    correoElectronico: comment.usuarioCorreo || "anonimo@example.com",
    imagenPerfil: comment.usuarioImagenPerfil, 
  };

  // Manejo de fecha igual que en las publicaciones
  let commentDate;
  if (comment.fechaHora) {
    if (typeof comment.fechaHora === "number") {
      commentDate = new Date(comment.fechaHora * 1000);
    } else if (typeof comment.fechaHora === "string") {
      commentDate = new Date(comment.fechaHora);
    } else if (comment.fechaHora instanceof Date) {
      commentDate = comment.fechaHora;
    }
  }

  if (!commentDate || isNaN(commentDate.getTime())) {
    commentDate = new Date();
  }

  return {
    id: comment.id,
    userId: usuario.id,
    user: usuario.correoElectronico,
    name: usuario.nombreUsuario,
    content: comment.contenido,
    imagen: usuario.imagenPerfil,
    time: commentDate,
    likes: comment.likes || 0,
    isLiked: comment.isLiked || false,
  };
};

export const crearComentario = async (comentarioData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${BASE_URL}/api/comentarios`,
      comentarioData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Mapea la respuesta al formato esperado
    return {
      id: response.data.id,
      contenido: response.data.contenido,
      usuario: {
        id: response.data.usuarioId,
        nombre: response.data.usuarioNombre,
        nombreUsuario: response.data.usuarioNombre,
        correoElectronico: response.data.usuarioCorreo,
      },
      fechaHora: response.data.fechaHora,
      likes: 0,
      isLiked: false,
    };
  } catch (error) {
    console.error("Error al crear comentario:", error);
    throw error;
  }
};
export const getPublicacion = async (postId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/publicaciones/${postId}`
    );

    if (!response.data) {
      throw new Error("Publicación no encontrada");
    }

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userEmail = userData?.correoElectronico;

    const post = response.data;
    const usuario = post.usuario || {
      id: 0,
      nombreUsuario: "Anónimo",
      correoElectronico: "anonimo@example.com",
    };

    const categoria = post.categoriaDeporte || { nombre: "General" };

    let isLiked = false;
    if (userEmail) {
      try {
        const likeResponse = await axios.get(
          `${BASE_URL}/api/publicaciones/${post.id}/check-like`,
          { params: { userEmail } }
        );
        isLiked = likeResponse.data;
      } catch (error) {
        console.error("Error verificando like:", error);
      }
    }

    console.log("Respuesta de la API publi:", response.data);

    // Manejo consistente de la fecha (igual que en loadPosts)
    let postDate;
    if (post.fechaHora) {
      if (typeof post.fechaHora === "number") {
        postDate = new Date(post.fechaHora * 1000);
      } else if (typeof post.fechaHora === "string") {
        postDate = new Date(post.fechaHora);
      } else if (post.fechaHora instanceof Date) {
        postDate = post.fechaHora;
      }
    }

    if (!postDate || isNaN(postDate.getTime())) {
      console.warn(`Fecha inválida para post ${post.id}, usando fecha actual`);
      postDate = new Date();
    }


    return {
      id: post.id,
      userId: usuario.id,
      user: usuario.correoElectronico || "anonimo@example.com",
      name: usuario.nombreUsuario || "Anónimo",
      content: post.contenido || "",
      time: postDate,
      imagen: usuario.imagen_perfil,
      imagenPost: post.imagen, 
      comments: post.comentarios || 0,
      likes: post.likes || 0,
      shares: post.compartidos || 0,
      sport: categoria.nombre || "General",
      isLiked: isLiked,
    };
  } catch (error) {
    console.error("Error loading single post:", error);
    throw error; // Propaga el error para manejarlo en el componente
  }
};

// Función para actualizar la cantidad de compartidos de una publicación
export const actualizarCompartidos = async (postId, cantidad) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/publicaciones/${postId}/compartidos`,
      { cantidad },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar compartidos:', error);
    throw error;
  }
};

// Funciones para manejar likes en comentarios
// NO SE ESTA USANDO, NO FUNCIONA, SE PUEDE MODIFICAR PARA QUE FUNCIONE
export const darLikeComent = async (comentarioId, userEmail) => {
  const response = await axios.post(
    `${BASE_URL}/comentarios/${comentarioId}/like`,
    { userEmail }
  );
  return response.data;
};

export const quitarLikeComent = async (comentarioId, userEmail) => {
  const response = await axios.post(
    `${BASE_URL}/api/comentarios/${comentarioId}/unlike`,
    { userEmail }
  );
  return response.data;
};

export const checkLikeStatusComent = async (comentarioId, userEmail) => {
  const response = await axios.get(
    `${BASE_URL}/api/comentarios/${comentarioId}/check-like`,
    { params: { userEmail } }
  );
  return response.data;
};



//Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/usuarios`);
    console.log("Usuarios recibidos:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};


/**
 * Obtiene los datos de un usuario por su ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/usuarios/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener datos del usuario"
    );
  }
};

export const getUserPosts = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/publicaciones/usuario/${userId}`
    );
    const posts = response.data;

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userEmail = userData?.correoElectronico;

    // Procesar cada publicación
    return await Promise.all(posts.map(async (post) => {
      let isLiked = false;
      if (userEmail) {
        try {
          const likeResponse = await axios.get(
            `${BASE_URL}/api/publicaciones/${post.id}/check-like`,
            { params: { userEmail } }
          );
          isLiked = likeResponse.data;
        } catch (error) {
          console.error("Error verificando like:", error);
        }
      }

      return {
        id: post.id,
        contenido: post.contenido,
        fechaHora: new Date(post.fechaHora),
        likes: post.likes || 0,
        imagen_perfil: post.imagen_perfil,
        comentarios: post.comentarios || 0,
        compartidos: post.compartidos || 0,
        categoriaDeporteId: post.categoriaDeporte?.nombre?.toLowerCase() || "general",
        name: post.usuario?.nombreUsuario || "Anónimo",
        userUsername: post.usuario?.correoElectronico || "anonimo@example.com",
        isLiked: isLiked
      };
    }));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
};

// Obtener todas las publicaciones (para feed)
export const getAllPosts = async () => {
  try {
    const response = await fetch("/api/posts");
    const data = await response.json();
    return data.posts.map((post) => ({
      id: post.id,
      contenido: post.content,
      fechaHora: post.created_at,
      likes: post.likes_count,
      comments: post.comments_count,
      shares: post.shares_count,
      isLiked: post.is_liked,
      categoriaDeporteId: post.sport_category || "General",
      name: post.author_name,
      userUsername: post.author_username,
      authorImage: post.author_image,
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};


export const getUserTeams = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/equipos/usuario/${userId}`
    );
    return response.data.map(team => ({
      id: team.id,
      nombre: team.nombre,
      descripcion: team.descripcion,
      deporte: team.deporte,
      imagen: team.imagenUrl || "https://i.imgur.com/vVkxceM.png",
      cantidadMiembros: team.cantidadMiembros
    }));
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return [];
  }
};

export const getAllTeams = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/equipos/comunidad/${userId}`
    );
    return response.data.map(team => ({
      id: team.id,
      nombre: team.nombre,
      descripcion: team.descripcion,
      deporte: team.deporte,
      imagen: team.imagenUrl || "https://i.imgur.com/vVkxceM.png",
      cantidadMiembros: team.cantidadMiembros
    }));
  } catch (error) {
    console.error("Error fetching all teams:", error);
    return [];
  }
};

export const createTeam = async (teamData, creadorId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/equipos?creadorId=${creadorId}`,
      teamData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

// Añadir miembro
export const addTeamMember = async (teamId, userId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/equipos/${teamId}/miembros?usuarioId=${userId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding team member:", error);
    throw error;
  }
};

// Obtener información detallada de un equipo
export const getTeamDetails = async (teamId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/equipos/${teamId}`);
    return {
      ...response.data,
      sport: response.data.categoriaDeporte.nombre.toLowerCase(),
      categoriaDeporte: response.data.categoriaDeporte // Incluye toda la info de la categoría
    };
  } catch (error) {
    console.error("Error fetching team details:", error);
    throw error;
  }
};

// Actualizar equipo
export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/equipos/${teamId}`,
      teamData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating team:", error.response?.data || error.message);
    throw error;
  }
};

// Eliminar equipo
export const deleteTeam = async (teamId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/equipos/${teamId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};

export const getTeamMembers = async (teamId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/equipos/${teamId}/miembros`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
};

export const getSportsCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/equipos/categorias`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sports categories:", error);
    return [];
  }
};

// Expulsar miembro
export const removeTeamMember = async (teamId, userId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/equipos/${teamId}/miembros/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing team member:", error);
    throw error;
  }
};

export const assignNewAdmin = async (teamId, newAdminId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/equipos/${teamId}/admin?nuevoAdminId=${newAdminId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning new admin:", error);
    throw error;
  }
};

/**
 * Actualiza los datos del perfil de un usuario
 * @param {number} userId - ID del usuario
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const updateProfile = async (userId, profileData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/usuarios/${userId}/perfil`,
      profileData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw new Error(
      error.response?.data?.message || "Error al actualizar el perfil"
    );
  }
};

/**
 * Sube una imagen de perfil
 * @param {number} userId - ID del usuario
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const uploadProfileImage = async (userId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axios.post(
      `${BASE_URL}/api/usuarios/${userId}/imagen-perfil`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al subir imagen de perfil:", error);
    throw new Error(
      error.response?.data?.message || "Error al subir la imagen"
    );
  }
};

//-------------------------------------------------------------------------------------\\
// MENSAJERIA
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mensajeService = {
  // Mensajes
  enviarMensaje: (mensaje) => axios.post(`${BASE_URL}/api/mensajes`, mensaje),
  obtenerMensajesConversacion: (conversacionId) =>
    axios.get(`${BASE_URL}/api/mensajes/conversacion/${conversacionId}`),
  obtenerConversacionesUsuario: (usuarioId) =>
    axios.get(`${BASE_URL}/api/mensajes/usuario/${usuarioId}`),
  marcarMensajesLeidos: (conversacionId, usuarioId) =>
    axios.put(
      `${BASE_URL}/api/mensajes/marcar-leidos/${conversacionId}/${usuarioId}`
    ),

  // Conversaciones
  crearConversacion: (usuario1Id, usuario2Id) =>
    axios.post(
      `${BASE_URL}/api/conversaciones?usuario1Id=${usuario1Id}&usuario2Id=${usuario2Id}`
    ),
  obtenerConversacionesUsuario: (usuarioId) =>
    axios.get(`${BASE_URL}/api/conversaciones/usuario/${usuarioId}`),
  obtenerUsuario: (userId) => axios.get(`${BASE_URL}/api/usuarios/${userId}`),
  obtenerUsuariosPorIds: (userIds) =>
    axios.get(`${BASE_URL}/api/usuarios/buscar-por-ids`, {
      params: { ids: userIds.join(",") },
    }),

  // Usuarios
  buscarUsuarios: (query) => axios.get(`${BASE_URL}/api/buscar?query=${query}`),
};

export const setupWebSocket = (conversacionId, onMessageReceived, onError) => {
  const socket = new SockJS(`${BASE_URL}/ws`);

  const stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => console.log("STOMP:", str),
    onConnect: () => {
      console.log("✅ WebSocket conectado correctamente");

      stompClient.subscribe(
        `/topic/conversation.${conversacionId}`,
        (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log(
              `📩 [${conversacionId}] Mensaje recibido:`,
              parsedMessage
            );
            onMessageReceived(parsedMessage);
          } catch (error) {
            console.error(`❌ Error procesando mensaje:`, error);
          }
        }
      );
    },
    onStompError: (frame) => {
      console.error("❌ STOMP Error:", frame.headers.message || frame.body);
      if (onError) onError(frame);
    },
    onWebSocketClose: () => {
      console.warn("⚠️ WebSocket cerrado");
    },
  });

  stompClient.activate();
  return stompClient;
};

export const sendMessageWebSocket = (
  stompClient,
  conversacionId,
  mensajeDTO
) => {
  if (stompClient && stompClient.active) {
    stompClient.publish({
      destination: `/app/chat/${conversacionId}`,
      body: JSON.stringify(mensajeDTO),
    });
    console.log("✉️ Mensaje enviado:", mensajeDTO);
  } else {
    console.error("⚠️ No se pudo enviar - WebSocket no activo");
  }
};

export const setupWebSocketMultiple = (
  conversationIds,
  onMessageReceived,
  onError
) => {
  const socket = new SockJS(`${BASE_URL}/ws`);

  const stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => console.log("STOMP:", str),
    onConnect: () => {
      console.log("✅ WebSocket conectado correctamente");

      // 🟢 SUSCRIPCIÓN CORRECTA (ajustada a tu backend)
      conversationIds.forEach((id) => {
        stompClient.subscribe(`/topic/conversation.${id}`, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log(`📩 [${id}] Mensaje recibido:`, parsedMessage);
            onMessageReceived(parsedMessage);
          } catch (error) {
            console.error(`❌ Error procesando mensaje:`, error);
          }
        });
      });
    },
    onStompError: (frame) => {
      console.error("❌ STOMP Error:", frame.headers.message || frame.body);
      if (onError) onError(frame);
    },
    onWebSocketClose: () => {
      console.warn("⚠️ WebSocket cerrado");
    },
  });

  stompClient.activate();
  return stompClient;
};

export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/eventos`, eventData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const getEventos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/eventos`);
    if (!response.ok) throw new Error("Error al obtener eventos");
    return await response.json();
  } catch (error) {
    console.error("Error fetching eventos:", error);
    throw error;
  }
};

export const getEventosPorUsuario = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/eventos/usuarios/${userId}`);
    if (!response.ok) throw new Error("Error al obtener eventos del usuario");
    return await response.json();
  } catch (error) {
    console.error("Error fetching eventos del usuario:", error);
    throw error;
  }
};
