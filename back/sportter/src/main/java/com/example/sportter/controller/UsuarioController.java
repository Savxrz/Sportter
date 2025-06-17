package com.example.sportter.controller;

import com.example.sportter.dto.CambioContrasenaRequest;
import com.example.sportter.dto.UsuarioDTO;
import com.example.sportter.model.Equipo;
import com.example.sportter.model.LoginRequest;
import com.example.sportter.model.Miembro;
import com.example.sportter.model.Usuario;
import com.example.sportter.repository.EquipoRepository;
import com.example.sportter.repository.MiembroRepository;
import com.example.sportter.repository.UsuarioRepository;
import com.example.sportter.service.EquipoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private EquipoRepository equipoRepository;

	@Autowired
	private MiembroRepository miembroRepository;

	@Autowired
	private EquipoService equipoService;

	private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
		Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoElectronico(loginRequest.getCorreoElectronico());

		if (usuarioOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrecta");
		}

		Usuario usuario = usuarioOpt.get();
		String contrasenaAlmacenada = usuario.getContrasena();
		String contrasenaIngresada = loginRequest.getContrasena();

		// Verificación híbrida
		boolean contrasenaValida = false;

		// 1. Primero intenta con BCrypt (para contraseñas nuevas)
		if (contrasenaAlmacenada.startsWith("$2a$")) {
			contrasenaValida = passwordEncoder.matches(contrasenaIngresada, contrasenaAlmacenada);
		}
		// 2. Si no es BCrypt, compara directamente (para contraseñas existentes)
		else {
			contrasenaValida = contrasenaIngresada.equals(contrasenaAlmacenada);

			// Opcional: Actualizar a BCrypt si la contraseña es correcta
			if (contrasenaValida) {
				usuario.setContrasena(passwordEncoder.encode(contrasenaIngresada));
				usuarioRepository.save(usuario);
			}
		}

		if (contrasenaValida) {

			if (usuario.getImagen_perfil() != null && !usuario.getImagen_perfil().startsWith("data:image")) {
				usuario.setImagen_perfil("data:image/jpeg;base64," + usuario.getImagen_perfil());
			}

			return ResponseEntity.ok(usuario);
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrecta");
		}
	}

	@PostMapping("/registro")
	public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {

		try {
			if (usuarioRepository.existsByCorreoElectronico(usuario.getCorreoElectronico())) {
				return ResponseEntity.badRequest()
						.body(Map.of("message", "Este correo electrónico ya está registrado", "status", "error"));
			}

			// Hashear la contraseña antes de guardar
			usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

			Usuario nuevoUsuario = usuarioRepository.save(usuario);
			return ResponseEntity.ok(nuevoUsuario);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al registrar usuario");
		}
	}

	// Verificar si el email existe para cambiar contraseña
	@PostMapping("/existe-email")
	public ResponseEntity<?> verificarEmail(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		boolean existe = usuarioRepository.existsByCorreoElectronico(email);

		if (existe) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "Este correo ya esta vinculado a una cuenta"));
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "Este correo no está vinculado a ninguna cuenta"));
		}
	}

	// Actualizar contraseña
	@PostMapping("/actualizar-contrasena")
	public ResponseEntity<?> actualizarContrasena(@RequestBody CambioContrasenaRequest request) {
		Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoElectronico(request.getEmail());

		if (usuarioOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
		}

		Usuario usuario = usuarioOpt.get();
		usuario.setContrasena(request.getNuevaContrasena()); // Asegúrate de hashear la contraseña aquí
		usuarioRepository.save(usuario);

		return ResponseEntity.ok().build();
	}

	@GetMapping("/buscar")
	public ResponseEntity<List<UsuarioDTO>> buscarUsuarios(@RequestParam String query) {
		List<Usuario> usuarios = usuarioRepository
				.findByNombreUsuarioContainingIgnoreCaseOrCorreoElectronicoContainingIgnoreCase(query, query);
		List<UsuarioDTO> usuariosDTO = usuarios.stream().map(this::convertirAUsuarioDTO).collect(Collectors.toList());
		return ResponseEntity.ok(usuariosDTO);
	}

	private UsuarioDTO convertirAUsuarioDTO(Usuario usuario) {
		UsuarioDTO dto = new UsuarioDTO();
		dto.setId(usuario.getId());
		dto.setNombre(usuario.getNombreUsuario());
		dto.setNombreUsuario(usuario.getNombreUsuario());
		dto.setEmail(usuario.getCorreoElectronico());
		dto.setAvatar(usuario.getUsuarioImagenPerfil());
		dto.setBio(usuario.getBio());
		return dto;
	}

	@GetMapping("/usuarios/{id}")
	public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
		try {
			Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);

			if (usuarioOpt.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Map.of("message", "Usuario no encontrado"));
			}

			Usuario usuario = usuarioOpt.get();
			// Ocultar contraseña por seguridad
			usuario.setContrasena(null);
			

			return ResponseEntity.ok(convertirAUsuarioDTO(usuario));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error al obtener usuario: " + e.getMessage());
		}
	}

	@GetMapping("/usuarios")
	public ResponseEntity<List<Usuario>> getAllUsuarios() {
		List<Usuario> usuarios = usuarioRepository.findAll();

		usuarios.forEach(u -> u.setContrasena(null));

		return ResponseEntity.ok(usuarios);
	}

	@DeleteMapping("/usuarios/{id}")
	@Transactional
	public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
	    try {
	        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
	        
	        if (usuarioOpt.isEmpty()) {
	            return ResponseEntity.notFound().build();
	        }

	        // 1. Eliminar al usuario de todos los equipos donde es miembro
	        miembroRepository.deleteByUsuarioId(id);
	        
	        // 2. Reasignar equipos donde era creador
	        List<Equipo> equiposComoCreador = equipoRepository.findByCreadorId(id);
	        for (Equipo equipo : equiposComoCreador) {
	            // Buscar otro miembro para asignar como admin
	            Optional<Miembro> nuevoAdminOpt = miembroRepository.findFirstByEquipoIdAndUsuarioIdNot(
	                equipo.getId(), id);
	            
	            if (nuevoAdminOpt.isPresent()) {
	                equipo.setCreador(nuevoAdminOpt.get().getUsuario());
	                equipoRepository.save(equipo);
	            } else {
	                // Si no hay otros miembros, eliminar el equipo
	                equipoService.eliminarEquipo(equipo.getId());
	            }
	        }

	        // 3. Finalmente eliminar el usuario
	        usuarioRepository.deleteById(id);
	        
	        return ResponseEntity.ok().build();
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Error al desactivar la cuenta: " + e.getMessage());
	    }
	}

	@PutMapping("/usuarios/{id}/perfil")
	public ResponseEntity<?> actualizarPerfil(
			@PathVariable Long id,
			@RequestBody Usuario usuarioActualizado) {

		Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);

		if (usuarioOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		Usuario usuario = usuarioOpt.get();

		// Actualizar solo los campos permitidos
		if (usuarioActualizado.getNombreUsuario() != null) {
			usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
		}

		if (usuarioActualizado.getBio() != null) {
			usuario.setBio(usuarioActualizado.getBio());
		}

		usuarioRepository.save(usuario);

		return ResponseEntity.ok(convertirAUsuarioDTO(usuario));
	}

	@PostMapping("/usuarios/{id}/imagen-perfil")
	public ResponseEntity<?> subirImagenPerfil(
			@PathVariable Long id,
			@RequestParam("image") MultipartFile file) {

		try {
			Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);

			if (usuarioOpt.isEmpty()) {
				return ResponseEntity.notFound().build();
			}

			Usuario usuario = usuarioOpt.get();

			// Obtener tipo de contenido (ej. image/jpeg)
			String contentType = file.getContentType();
			if (contentType == null || !contentType.startsWith("image/")) {
				return ResponseEntity.badRequest().body("Tipo de archivo no soportado");
			}

			// Convertir a Base64
			String imagenBase64 = Base64.getEncoder().encodeToString(file.getBytes());
			String tipoImagen = contentType.split("/")[1]; // "jpeg", "png", etc.

			String imagenConPrefijo = "data:image/" + tipoImagen + ";base64," + imagenBase64;

			// Guardar en el modelo
			usuario.setImagen_perfil(imagenConPrefijo);
			usuarioRepository.save(usuario);

			return ResponseEntity.ok(Map.of(
					"avatar", imagenConPrefijo,
					"message", "Imagen de perfil actualizada correctamente"));

		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error al procesar la imagen");
		}
	}

	@PostMapping("/verificar-email")
	public ResponseEntity<?> verificarEmailRegistro(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		boolean existe = usuarioRepository.existsByCorreoElectronico(email);

		if (existe) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(Map.of(
							"message", "Este correo ya está registrado",
							"status", "error"));
		} else {
			return ResponseEntity.ok(Map.of(
					"message", "Correo disponible",
					"status", "success"));
		}
	}
}
