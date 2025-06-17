package com.example.sportter.controller;

import com.example.sportter.dto.MensajeDTO;

import com.example.sportter.model.Mensaje;
import com.example.sportter.model.Usuario;
import com.example.sportter.repository.MensajeRepository;
import com.example.sportter.repository.ConversacionRepository;
import com.example.sportter.repository.UsuarioRepository;
import com.example.sportter.websocket.MensajeWebSocketController;

import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    @Autowired
    private MensajeRepository mensajeRepository;
    

    @Autowired
    private ConversacionRepository conversacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    private final SimpMessagingTemplate messagingTemplate;
    
    

    public MensajeController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
	@PostMapping
    public ResponseEntity<?> enviarMensaje(@RequestBody MensajeDTO mensajeDTO) {
        // Validaciones explícitas
    	if (mensajeDTO.getDestinatarioId() == null) {
            return ResponseEntity.badRequest().body(
                "Destinatario no especificado. Datos recibidos: " + mensajeDTO.toString()
            );
        }
        try {
        	
            Usuario remitente = usuarioRepository.findById(mensajeDTO.getRemitenteId())
                .orElseThrow(() -> new IllegalArgumentException("Remitente no encontrado con ID: " + mensajeDTO.getRemitenteId()));
            
            Usuario destinatario = usuarioRepository.findById(mensajeDTO.getDestinatarioId())
                .orElseThrow(() -> new IllegalArgumentException("Destinatario no encontrado con ID: " + mensajeDTO.getDestinatarioId()));

            Mensaje mensaje = new Mensaje();
            mensaje.setContenido(mensajeDTO.getContenido());
            mensaje.setFechaHora(LocalDateTime.now());
            mensaje.setMetadata(mensajeDTO.getMetadata());
            mensaje.setLeido(false);
            mensaje.setRemitente(remitente);
            mensaje.setDestinatario(destinatario);
            mensaje.setConversacionId(mensajeDTO.getConversacionId());
            
            Mensaje mensajeGuardado = mensajeRepository.save(mensaje);
            
           
            return ResponseEntity.ok(convertirAMensajeDTO(mensajeGuardado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
	
	@Autowired
	private ConfigurableApplicationContext context;

	@GetMapping("/ws-controller-check")
	public ResponseEntity<String> checkWebSocketController() {
	    boolean exists = context.getBeansOfType(MensajeWebSocketController.class).size() > 0;
	    return ResponseEntity.ok("¿MensajeWebSocketController registrado?: " + exists);
	}
	
	

    @GetMapping("/conversacion/{conversacionId}")
    public ResponseEntity<List<MensajeDTO>> obtenerMensajesPorConversacion(@PathVariable String conversacionId) {
        List<Mensaje> mensajes = mensajeRepository.findByConversacionIdOrderByFechaHoraAsc(conversacionId);
        List<MensajeDTO> mensajesDTO = mensajes.stream()
            .map(this::convertirAMensajeDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(mensajesDTO);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<MensajeDTO>> obtenerConversacionesUsuario(@PathVariable Long usuarioId) {
        List<Mensaje> mensajes = mensajeRepository.findByRemitenteIdOrDestinatarioIdOrderByFechaHoraDesc(usuarioId, usuarioId);
        List<MensajeDTO> mensajesDTO = mensajes.stream()
            .map(this::convertirAMensajeDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(mensajesDTO);
    }

    @PutMapping("/marcar-leidos/{conversacionId}/{usuarioId}")
    public ResponseEntity<Void> marcarMensajesComoLeidos(@PathVariable String conversacionId, @PathVariable Long usuarioId) {
        List<Mensaje> mensajesNoLeidos = mensajeRepository.findByConversacionIdAndLeidoFalseAndDestinatarioId(conversacionId, usuarioId);
        mensajesNoLeidos.forEach(mensaje -> {
            mensaje.setLeido(true);
            mensajeRepository.save(mensaje);
        });
        return ResponseEntity.ok().build();
    }

    private MensajeDTO convertirAMensajeDTO(Mensaje mensaje) {
        MensajeDTO dto = new MensajeDTO();
        dto.setId(mensaje.getId());
        dto.setContenido(mensaje.getContenido());
        dto.setFechaHora(mensaje.getFechaHora());
        dto.setLeido(mensaje.isLeido());
        dto.setRemitenteId(mensaje.getRemitente().getId());
        dto.setRemitenteNombre(mensaje.getRemitente().getNombreUsuario());
        dto.setMetadata(mensaje.getMetadata()); // ✔️ Asignación directa

        
        Usuario usuario = mensaje.getRemitente();
        String imagenPerfil = usuario.getImagen_perfil();
        //System.out.println(imagenPerfil);
        if (imagenPerfil != null && !imagenPerfil.startsWith("data:image")) {
            if (imagenPerfil.matches("^[A-Za-z0-9+/=]+$")) {
                imagenPerfil = "data:image/jpeg;base64," + imagenPerfil;
                //System.out.println(imagenPerfil);
           }
        }
             
      
        dto.setRemitenteImagenPerfil(imagenPerfil);
        dto.setDestinatarioId(mensaje.getDestinatario().getId());
        dto.setDestinatarioNombre(mensaje.getDestinatario().getNombreUsuario());
        
        dto.setConversacionId(mensaje.getConversacionId());
        return dto;
    }
}