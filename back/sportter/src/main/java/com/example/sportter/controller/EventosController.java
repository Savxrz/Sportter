package com.example.sportter.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.sportter.dto.EquipoDTO;
import com.example.sportter.dto.EventoDTO;
import com.example.sportter.model.Equipo;
import com.example.sportter.model.Evento;
import com.example.sportter.model.Miembro;
import com.example.sportter.repository.EventoRepository;
import com.example.sportter.repository.MiembroRepository;

@CrossOrigin(origins = "https://sportter.vercel.app", allowCredentials = "true")
@RestController
@RequestMapping("api/eventos")
public class EventosController {

	@Autowired
	private EventoRepository eventoRepository;

	@Autowired
	private MiembroRepository miembrosRepository;

	// Obtener todos los eventos
	@GetMapping
	public ResponseEntity<List<EventoDTO>> getAllEventos() {
		List<Evento> eventos = eventoRepository.findAll();
		List<EventoDTO> dtos = eventos.stream().map(this::convertToDTO).collect(Collectors.toList());
		return ResponseEntity.ok(dtos);
	}

	// Obtener eventos de los equipos del usuario
	@GetMapping("/usuarios/{userId}")
	public ResponseEntity<List<EventoDTO>> getEventosPorUsuario(@PathVariable Long userId) {
		// 1. Obtener los equipos del usuario
		List<Miembro> miembros = miembrosRepository.findByUsuarioId(userId);
		List<Long> equipoIds = miembros.stream().map(m -> m.getEquipo().getId()).collect(Collectors.toList());

		// 2. Obtener eventos donde el equipo local o visitante está en la lista
		List<Evento> eventos = eventoRepository.findByEquipoLocalIdInOrEquipoVisitanteIdIn(equipoIds, equipoIds);

		// 3. Marcar si el usuario es miembro de alguno de los equipos
		List<EventoDTO> dtos = eventos.stream().map(evento -> {
			EventoDTO dto = convertToDTO(evento);
			dto.setEsMiembro(true); // Porque solo llegamos aquí si es miembro
			return dto;
		}).collect(Collectors.toList());

		return ResponseEntity.ok(dtos);
	}

	private EventoDTO convertToDTO(Evento evento) {
		EventoDTO dto = new EventoDTO();
		dto.setId(evento.getId());
		dto.setNombre(evento.getNombre());
		dto.setFecha(evento.getFecha());
		dto.setUbicacion(evento.getUbicacion());

		if (evento.getEquipoLocal() != null) {
			dto.setEquipoLocal(convertEquipoToDTO(evento.getEquipoLocal()));
		}

		if (evento.getEquipoVisitante() != null) {
			dto.setEquipoVisitante(convertEquipoToDTO(evento.getEquipoVisitante()));
		}

		dto.setDeporte(evento.getDeporte());
		return dto;
	}

	private EquipoDTO convertEquipoToDTO(Equipo equipo) {
		EquipoDTO dto = new EquipoDTO();
		dto.setId(equipo.getId());
		dto.setNombre(equipo.getNombre());
		dto.setImagenUrl(equipo.getImagenUrl());
		return dto;
	}
	
	@PostMapping
	public ResponseEntity<EventoDTO> crearEvento(@RequestBody Evento evento) {

		if (evento.getEquipoLocal() == null || evento.getEquipoLocal().getId() == null) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El equipo local es requerido");
	    }
	    if (evento.getEquipoVisitante() == null || evento.getEquipoVisitante().getId() == null) {
	        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El equipo visitante es requerido");
	    }

	    Evento nuevoEvento = eventoRepository.save(evento);

	    return ResponseEntity.ok(convertToDTO(nuevoEvento));
	}
}
