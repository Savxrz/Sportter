package com.example.sportter.controller;

import java.time.LocalDateTime;
import java.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.sportter.dto.PublicacionDTO;
import com.example.sportter.dto.PublicacionService;
import com.example.sportter.model.CategoriaDeporte;
import com.example.sportter.model.Publicacion;
import com.example.sportter.model.Usuario;
import com.example.sportter.repository.CategoriaDeporteRepository;
import com.example.sportter.repository.PublicacionRepository;
import com.example.sportter.repository.UsuarioRepository;

import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/publicaciones")
public class PublicacionController {

	@Autowired
	private PublicacionRepository publicacionRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private CategoriaDeporteRepository categoriaDeporteRepository;
	
	
	private final PublicacionService publicacionService;
	    
	
	public PublicacionController(PublicacionService publicacionService) {
		 this.publicacionService = publicacionService;
	 }

	@GetMapping
	public ResponseEntity<?> getAllPublications() {
		try {
			List<Publicacion> publicaciones = publicacionRepository.findAllWithUserAndCategory();

			// Log para depuración
			System.out.println("Número de publicaciones encontradas: " + publicaciones.size());
			publicaciones.forEach(p -> {
				System.out.println("Publicación ID: " + p.getId());
				System.out.println("Contenido: " + p.getContenido());
				System.out.println("Tiene imagen: " + (p.getImagen() != null));
				System.out.println("Longitud imagen para post " + p.getId() + ": " 
					    + (p.getImagen() != null ? p.getImagen().length() : "null"));
				if (p.getUsuario() != null) {
					System.out.println("Usuario: " + p.getUsuario().getNombreUsuario());
					System.out.println("Imagen perfil: " + (p.getUsuario().getImagen_perfil() != null ? "Existe imagen perfil" : "No existe imagen perfil"));
					System.out.println("Id usuario de la publicacion : " + p.getUsuarioId());
				} else {
					System.out.println("Usuario: NULL");
				}
			});

			// publicacionRepository.actualizarConteoDeComentarios();

			return ResponseEntity.ok(publicaciones);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error al obtener publicaciones: " + e.getMessage());
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> obtenerPublicacion(@PathVariable Long id) {
		try {
			// FORMA CORRECTA de usar orElseThrow
			Publicacion publicacion = publicacionRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Publicación no encontrada"));

			return ResponseEntity.ok(publicacion);

		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("Error al obtener publicación: " + e.getMessage());
		}
	}

	private PublicacionDTO convertirADTO(Publicacion publicacion) {
		PublicacionDTO dto = new PublicacionDTO(null, null, null, null, null);
		dto.setId(publicacion.getId());
		dto.setContenido(publicacion.getContenido());
		dto.setFechaHora(publicacion.getFechaHora());
		dto.setLikes(publicacion.getLikes());

		// Mapear usuario si existe
		if (publicacion.getUsuario() != null) {
			dto.setUsuarioId(publicacion.getUsuario().getId());
			dto.setUsuarioNombre(publicacion.getUsuario().getNombreUsuario());
			dto.setUsuarioCorreo(publicacion.getUsuario().getCorreoElectronico());
		}

		// Mapear categoría si existe
		if (publicacion.getCategoriaDeporte() != null) {
			dto.setCategoriaDeporte(publicacion.getCategoriaDeporte().getNombre());
		}

		return dto;
	}

	@GetMapping("/usuario/{userId}")
	public ResponseEntity<?> getPublicacionesPorUsuario(@PathVariable Long userId) {
		try {
			List<Publicacion> publicaciones = publicacionRepository.findByUsuarioId(userId);

			if (publicaciones.isEmpty()) {
				return ResponseEntity.ok(Collections.emptyList());
			}

			return ResponseEntity.ok(publicaciones);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error al obtener publicaciones del usuario: " + e.getMessage());
		}
	}

	@GetMapping("/publicaciones/usuario/{userId}")
	public ResponseEntity<List<Publicacion>> getPublicacionesUsuario(@PathVariable Long userId) {
	    List<Publicacion> publicaciones = publicacionRepository.findByUsuarioId(userId);
	    return ResponseEntity.ok(publicaciones);
	}
	
	@PostMapping("/{publicacionId}/like")
	public ResponseEntity<?> darLike(@PathVariable Long publicacionId, @RequestBody Map<String, String> request) {
		try {
			String userEmail = request.get("userEmail");
			Publicacion publicacion = publicacionRepository.findById(publicacionId)
					.orElseThrow(() -> new RuntimeException("Publicación no encontrada"));

			// Verificar si el usuario ya dio like
			boolean yaDioLike = publicacion.getUsuariosQueDieronLike().stream()
					.anyMatch(u -> u.getCorreoElectronico().equals(userEmail));

			if (!yaDioLike) {
				// Buscar al usuario por email
				Usuario usuario = usuarioRepository.findByCorreoElectronico(userEmail)
						.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

				publicacion.getUsuariosQueDieronLike().add(usuario);
				publicacion.setLikes(publicacion.getLikes() + 1);
				publicacionRepository.save(publicacion);
			}

			return ResponseEntity.ok(publicacion);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al dar like: " + e.getMessage());
		}
	}

	@PostMapping("/{publicacionId}/unlike")
	public ResponseEntity<?> quitarLike(@PathVariable Long publicacionId, @RequestBody Map<String, String> request) {
		try {
			String userEmail = request.get("userEmail");
			Publicacion publicacion = publicacionRepository.findById(publicacionId)
					.orElseThrow(() -> new RuntimeException("Publicación no encontrada"));

			// Buscar al usuario por email
			Usuario usuario = usuarioRepository.findByCorreoElectronico(userEmail)
					.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

			// Verificar si el usuario dio like
			if (publicacion.getUsuariosQueDieronLike().remove(usuario)) {
				publicacion.setLikes(publicacion.getLikes() - 1);
				publicacionRepository.save(publicacion);
			}

			return ResponseEntity.ok(publicacion);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error al quitar like: " + e.getMessage());
		}
	}

	@GetMapping("/{publicacionId}/check-like")
	public ResponseEntity<?> checkLikeStatus(@PathVariable Long publicacionId, @RequestParam String userEmail) {

		try {
			Publicacion publicacion = publicacionRepository.findById(publicacionId)
					.orElseThrow(() -> new RuntimeException("Publicación no encontrada"));

			boolean yaDioLike = publicacion.getUsuariosQueDieronLike().stream()
					.anyMatch(u -> u.getCorreoElectronico().equals(userEmail));

			return ResponseEntity.ok(yaDioLike);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error al verificar like: " + e.getMessage());
		}
	}
	
	@PostMapping(value = "/crearPubli", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Publicacion> crearPublicacion(
	    @RequestParam String contenido,
	    @RequestParam Long categoriaDeporteId,
	    @RequestParam Long usuarioId,
	    @RequestParam(required = false) MultipartFile imagen) {
	    
	    try {
	        Publicacion publicacion = new Publicacion();
	        publicacion.setContenido(contenido);
	        
	        // Configurar fecha actual
	        publicacion.setFechaHora(LocalDateTime.now());
	        
	        // Inicializar contadores
	        publicacion.setLikes(0L);
	        publicacion.setComentarios(0L);
	        publicacion.setCompartidos(0L);
	        
	        // Buscar y asignar usuario
	        Usuario usuario = usuarioRepository.findById(usuarioId)
	            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));
	        publicacion.setUsuario(usuario);
	        
	        // Buscar y asignar categoría usando tu repositorio
	        CategoriaDeporte categoria = categoriaDeporteRepository.findById(categoriaDeporteId)
	            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + categoriaDeporteId));
	        publicacion.setCategoriaDeporte(categoria);
	        
	        // Procesar imagen si existe
	        if (imagen != null && !imagen.isEmpty()) {
	            try {
	                // Validar tipo de imagen
	                String contentType = imagen.getContentType();
	                if (contentType == null || !contentType.startsWith("image/")) {
	                    return ResponseEntity.badRequest().body(null);
	                }
	                
	                // Convertir a Base64
	                String imagenBase64 = Base64.getEncoder().encodeToString(imagen.getBytes());
	                String tipoImagen = contentType.split("/")[1];
	                publicacion.setImagen("data:image/" + tipoImagen + ";base64," + imagenBase64);
	            } catch (Exception e) {
	                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(null);
	            }
	        }
	        
	        // Guardar y devolver la publicación
	        Publicacion nuevaPublicacion = publicacionRepository.save(publicacion);
	        return ResponseEntity.ok(nuevaPublicacion);
	        
	    } catch (RuntimeException e) {
	        return ResponseEntity.badRequest().body(null);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(null);
	    }
	}
	
	    
	    @PutMapping("/{id}/compartir")
	    public ResponseEntity<Publicacion> compartirPublicacion(
	            @PathVariable Long id,
	            @RequestParam(defaultValue = "1") Long cantidad) {
	        
	        try {
	            Publicacion publicacionActualizada = publicacionService.incrementarCompartidos(id, cantidad);
	            return ResponseEntity.ok(publicacionActualizada);
	        } catch (RuntimeException e) {
	            return ResponseEntity.notFound().build();
	        }
	    }
	    
	    // Endpoint alternativo con cuerpo JSON
	    @PutMapping("/{id}/compartidos")
	    public ResponseEntity<Publicacion> actualizarCompartidos(
	            @PathVariable Long id,
	            @RequestBody IncrementoRequest incremento) {
	        
	        try {
	            Publicacion publicacionActualizada = publicacionService.incrementarCompartidos(id, incremento.getCantidad());
	            return ResponseEntity.ok(publicacionActualizada);
	        } catch (RuntimeException e) {
	            return ResponseEntity.notFound().build();
	        }
	    }
	    
	    // Clase interna para el request body
	    static class IncrementoRequest {
	        private Long cantidad;
	        
	        // Getters y setters
	        public Long getCantidad() {
	            return cantidad;
	        }
	        
	        public void setCantidad(Long cantidad) {
	            this.cantidad = cantidad;
	        }
	    }

}