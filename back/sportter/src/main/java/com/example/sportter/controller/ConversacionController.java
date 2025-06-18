package com.example.sportter.controller;

import com.example.sportter.model.Conversacion;
import com.example.sportter.repository.ConversacionRepository;
import com.example.sportter.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "https://sportter.vercel.app", allowCredentials = "true")
@RestController
@RequestMapping("/api/conversaciones")
public class ConversacionController {

    @Autowired
    private ConversacionRepository conversacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<Conversacion> crearConversacion(@RequestParam Long usuario1Id, @RequestParam Long usuario2Id) {
    	
        // Verificar si ya existe una conversación entre estos usuarios
        Conversacion existente = conversacionRepository.findByUsuario1IdAndUsuario2Id(usuario1Id, usuario2Id).orElse(null);
        if (existente != null) {
            return ResponseEntity.ok(existente);
        }

        existente = conversacionRepository.findByUsuario1IdAndUsuario2Id(usuario2Id, usuario1Id).orElse(null);
        if (existente != null) {
            return ResponseEntity.ok(existente);
        }

        // Crear nueva conversación
        Conversacion nuevaConversacion = new Conversacion();
        nuevaConversacion.setUsuario1Id(usuario1Id);
        nuevaConversacion.setUsuario2Id(usuario2Id);
        nuevaConversacion.setFechaCreacion(LocalDateTime.now());

        Conversacion guardada = conversacionRepository.save(nuevaConversacion);
        return ResponseEntity.ok(guardada);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Conversacion>> obtenerConversacionesUsuario(@PathVariable Long usuarioId) {
        List<Conversacion> conversaciones = conversacionRepository.findByUsuario1IdOrUsuario2IdOrderByFechaCreacionDesc(usuarioId, usuarioId);
        return ResponseEntity.ok(conversaciones);
    }
   
}