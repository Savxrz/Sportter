package com.example.sportter.controller;

import com.example.sportter.dto.CrearEquipoDTO;
import com.example.sportter.dto.EquipoConMiembrosDTO;
import com.example.sportter.dto.EquipoDTO;
import com.example.sportter.dto.EquipoDetallesDTO;
import com.example.sportter.dto.UsuarioDTO;
import com.example.sportter.model.CategoriaDeporte;
import com.example.sportter.model.Equipo;
import com.example.sportter.repository.EquipoRepository;
import com.example.sportter.service.EquipoService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;


@CrossOrigin(origins = "https://sportter.vercel.app", allowCredentials = "true")
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

	@Autowired
	private EquipoService equipoService;

	@GetMapping("/usuario/{userId}")
	public ResponseEntity<List<EquipoConMiembrosDTO>> getEquiposConMiembrosParaUsuario(@PathVariable Long userId) {
		List<EquipoConMiembrosDTO> equipos = equipoService.getEquiposConMiembrosParaUsuario(userId);
		return ResponseEntity.ok(equipos);
	}

	@GetMapping("/comunidad/{userId}")
	public ResponseEntity<List<EquipoConMiembrosDTO>> getEquiposComunidadConMiembros(@PathVariable Long userId) {
		List<EquipoConMiembrosDTO> equipos = equipoService.getEquiposComunidadConMiembros(userId);
		return ResponseEntity.ok(equipos);
	}
	
	@GetMapping("/getAll")
	public ResponseEntity<?> getAllEquipos() {
        try {
            List<EquipoDTO> equipos = equipoService.findAll();
            
            if (equipos.isEmpty()) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "No hay equipos registrados",
                    "data", Collections.emptyList()
                ));
            }

            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "data", equipos
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error al obtener los equipos: " + e.getMessage()
            ));
        }
    }

	@PostMapping
	public ResponseEntity<?> crearEquipo(@RequestBody @Valid CrearEquipoDTO equipoDTO, @RequestParam Long creadorId) {
		try {
			Equipo nuevoEquipo = equipoService.crearEquipo(equipoDTO, creadorId);
			return ResponseEntity.ok(nuevoEquipo);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/{id}/miembros")
	@Transactional(readOnly = true)
	public ResponseEntity<List<UsuarioDTO>> getMiembrosEquipo(@PathVariable Long id) {
		List<UsuarioDTO> miembros = equipoService.getMiembrosEquipo(id);
		return ResponseEntity.ok(miembros);
	}

	@GetMapping("/categorias")
	public ResponseEntity<List<CategoriaDeporte>> getCategoriasDeporte() {
		List<CategoriaDeporte> categorias = equipoService.getTodasCategorias();
		return ResponseEntity.ok(categorias);
	}

	@PostMapping("/{equipoId}/miembros")
	public ResponseEntity<?> añadirMiembro(@PathVariable Long equipoId, @RequestParam Long usuarioId) {
		try {
			equipoService.añadirMiembro(equipoId, usuarioId);
			return ResponseEntity.ok().body(Map.of("success", true, "message", "Miembro añadido correctamente"));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
		}
	}

	@DeleteMapping("/{equipoId}/miembros/{usuarioId}")
	public ResponseEntity<?> eliminarMiembro(@PathVariable Long equipoId, @PathVariable Long usuarioId) {
	    try {
	        equipoService.eliminarMiembro(equipoId, usuarioId);
	        return ResponseEntity.ok().body(Map.of("success", true, "message", "Miembro eliminado correctamente"));
	    } catch (RuntimeException e) {
	        return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
	    }
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarEquipo(@PathVariable Long id) {
	    equipoService.eliminarEquipo(id);
	    return ResponseEntity.ok().build();
	}

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	public ResponseEntity<EquipoDetallesDTO> getDetallesEquipo(@PathVariable Long id) {
		EquipoDetallesDTO equipo = equipoService.getDetallesEquipo(id);
		return ResponseEntity.ok(equipo);
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> actualizarEquipo(@PathVariable Long id, @RequestBody @Valid CrearEquipoDTO equipoDTO) {
	    try {
	        Equipo equipoActualizado = equipoService.actualizarEquipo(id, equipoDTO);
	        return ResponseEntity.ok(equipoActualizado);
	    } catch (RuntimeException e) {
	        return ResponseEntity.badRequest().body(Map.of(
	            "success", false,
	            "message", e.getMessage(),
	            "error", "Verifica los datos enviados"
	        ));
	    }
	}

	// Asignar admin si este se va
	@PutMapping("/{equipoId}/admin")
	public ResponseEntity<?> asignarNuevoAdmin(@PathVariable Long equipoId, @RequestParam Long nuevoAdminId) {
		try {
			equipoService.asignarNuevoAdmin(equipoId, nuevoAdminId);
			return ResponseEntity.ok().build();
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

}