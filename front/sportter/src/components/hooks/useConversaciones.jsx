import { useState, useEffect } from 'react';
import { mensajeService } from '../../services/api';

export const useConversaciones = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await mensajeService.obtenerConversacionesUsuario(userId);
      const conversaciones = response.data;

      const conversacionesConInfo = await Promise.all(
        conversaciones.map(async (conv) => {
          const otroUsuarioId = conv.usuario1Id === userId ? conv.usuario2Id : conv.usuario1Id;
          try {
            const usuarioRes = await mensajeService.obtenerUsuario(otroUsuarioId);
            return {
              ...conv,
              user: usuarioRes.data.nombreUsuario || `Usuario ${otroUsuarioId}`,
              username: usuarioRes.data.email || `user${otroUsuarioId}`,
              avatar: usuarioRes.avatar,
              destinatarioId: otroUsuarioId
            };
          } catch (error) {
            console.error(`Error al cargar usuario ${otroUsuarioId}:`, error);
            return {
              ...conv,
              user: `Usuario ${otroUsuarioId}`,
              username: `user${otroUsuarioId}`,
              avatar: `avatar ${otroUsuarioId}`,
              destinatarioId: otroUsuarioId
            };
          }
        })
      );

      setConversations(conversacionesConInfo);
    } catch (err) {
      console.error("Error al cargar conversaciones:", err);
      setError(err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  return { 
    conversations, 
    loadingConversations: loading,
    error,
    refetch: fetchConversations
  };
};