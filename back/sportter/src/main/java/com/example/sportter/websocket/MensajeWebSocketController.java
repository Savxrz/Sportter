package com.example.sportter.websocket;

import com.example.sportter.dto.MensajeDTO;
import com.example.sportter.model.Mensaje;
import com.example.sportter.repository.MensajeRepository;
import com.example.sportter.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class MensajeWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @MessageMapping("/chat/{conversacionId}")
    public void enviarMensaje(
        @DestinationVariable String conversacionId,
        MensajeDTO mensajeDTO
    ) {
        System.out.println("🔥 [WebSocket] Mensaje recibido para conversación: " + conversacionId);
        
        // 1. Validación mejorada
        if (mensajeDTO.getRemitenteId() == null || mensajeDTO.getDestinatarioId() == null 
            || mensajeDTO.getContenido() == null) {
            System.err.println("❌ Datos del mensaje incompletos");
            return;
        }

        // 2. Guardar mensaje
        Mensaje mensaje = new Mensaje();
        mensaje.setContenido(mensajeDTO.getContenido());
        mensaje.setConversacionId(conversacionId);
        mensaje.setFechaHora(LocalDateTime.now());
        mensaje.setLeido(false);
        mensaje.setRemitente(usuarioRepository.findById(mensajeDTO.getRemitenteId())
            .orElseThrow(() -> new RuntimeException("Remitente no encontrado")));
        mensaje.setDestinatario(usuarioRepository.findById(mensajeDTO.getDestinatarioId())
            .orElseThrow(() -> new RuntimeException("Destinatario no encontrado")));
        
        mensajeRepository.save(mensaje);

        // 3. Enviar a TODOS los suscriptores del topic
        String destino = "/topic/conversation." + conversacionId; // <-- Usa siempre 'conversation' (sin 'n')
        System.out.println("📤 Enviando a: " + destino + " - Mensaje: " + mensajeDTO);
        messagingTemplate.convertAndSend(destino, mensajeDTO);
    }
}
