package com.example.sportter.service;

import com.example.sportter.dto.CategoriaDeporteDTO;
import com.example.sportter.dto.CrearEquipoDTO;
import com.example.sportter.dto.EquipoConMiembrosDTO;
import com.example.sportter.dto.EquipoDTO;
import com.example.sportter.dto.EquipoDetallesDTO;
import com.example.sportter.dto.MiembroDTO;
import com.example.sportter.dto.UsuarioDTO;
import com.example.sportter.model.CategoriaDeporte;
import com.example.sportter.model.Equipo;
import com.example.sportter.model.Miembro;
import com.example.sportter.model.Usuario;
import com.example.sportter.repository.CategoriaDeporteRepository;
import com.example.sportter.repository.EquipoRepository;
import com.example.sportter.repository.EventoRepository;
import com.example.sportter.repository.MiembroRepository;
import com.example.sportter.repository.UsuarioRepository;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EquipoService {

	@Autowired
	private EquipoRepository equipoRepository;

	@Autowired
	private MiembroRepository miembroRepository;

	@Autowired
	private CategoriaDeporteRepository categoriaDeporteRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private EventoRepository eventoRepository;

	@Transactional(readOnly = true)
	public List<EquipoConMiembrosDTO> getEquiposConMiembrosParaUsuario(Long userId) {
		return equipoRepository.findEquiposConMiembrosByUsuario(userId);
	}

	@Transactional(readOnly = true)
	public List<EquipoConMiembrosDTO> getEquiposComunidadConMiembros(Long userId) {
		return equipoRepository.findEquiposComunidadConMiembros(userId);
	}

	@Transactional
	public Equipo crearEquipo(CrearEquipoDTO equipoDTO, Long creadorId) {
		// Obtener la categoría de deporte
		CategoriaDeporte categoriaDeporte = categoriaDeporteRepository.findById(equipoDTO.getCategoriaDeporteId())
				.orElseThrow(() -> new RuntimeException("Categoría de deporte no encontrada"));

		// Crear el equipo
		Equipo equipo = new Equipo();
		equipo.setNombre(equipoDTO.getNombre());
		equipo.setDescripcion(equipoDTO.getDescripcion());
		equipo.setCategoriaDeporte(categoriaDeporte);
		equipo.setImagenUrl(equipoDTO.getImagenUrl());

		// Asignar creador
		Usuario creador = new Usuario();
		creador.setId(creadorId);
		equipo.setCreador(creador);

		// Guardar el equipo
		Equipo equipoGuardado = equipoRepository.save(equipo);

		// Añadir al creador como miembro
		añadirMiembro(equipoGuardado.getId(), creadorId);

		return equipoGuardado;
	}

	@Transactional(readOnly = true)
	public List<UsuarioDTO> getMiembrosEquipo(Long equipoId) {
		Equipo equipo = equipoRepository.findById(equipoId)
				.orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

		return equipo.getMiembros().stream().map(Miembro::getUsuario).map(this::convertirAUsuarioDTO)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<CategoriaDeporte> getTodasCategorias() {
		return categoriaDeporteRepository.findAll();
	}

	@Transactional
	public void añadirMiembro(Long equipoId, Long usuarioId) {
		// Verificar si el equipo existe
		Equipo equipo = equipoRepository.findById(equipoId)
				.orElseThrow(() -> new RuntimeException("Equipo no encontrado con ID: " + equipoId));

		// Verificar si el usuario existe
		Usuario usuario = usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

		// Verificar si ya es miembro
		if (miembroRepository.existsByEquipoIdAndUsuarioId(equipoId, usuarioId)) {
			throw new RuntimeException("El usuario ya es miembro de este equipo");
		}

		// Crear y guardar la relación
		Miembro miembro = new Miembro();
		miembro.setEquipo(equipo);
		miembro.setUsuario(usuario);

		miembroRepository.save(miembro);
	}

	@Transactional
	public void eliminarMiembro(Long equipoId, Long usuarioId) {
	    Equipo equipo = equipoRepository.findById(equipoId)
	            .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
	    
	    // Verificar que el usuario a eliminar no sea el creador/admin
	    if (equipo.getCreador().getId().equals(usuarioId)) {
	        throw new RuntimeException("No se puede eliminar al administrador del equipo");
	    }
	    
	    miembroRepository.deleteByEquipoIdAndUsuarioId(equipoId, usuarioId);
	}

	@Transactional(readOnly = true)
	public EquipoDetallesDTO getDetallesEquipo(Long id) {
		Equipo equipo = equipoRepository.findById(id).orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

		Hibernate.initialize(equipo.getMiembros());
		Hibernate.initialize(equipo.getCreador());

		List<MiembroDTO> miembrosDTO = equipo.getMiembros().stream().map(m -> new MiembroDTO(m.getId(),
				convertirAUsuarioDTO(m.getUsuario()), m.getUsuario().getId().equals(equipo.getCreador().getId())))
				.collect(Collectors.toList());

		return new EquipoDetallesDTO(equipo.getId(), equipo.getNombre(), equipo.getDescripcion(),
				new CategoriaDeporteDTO(equipo.getCategoriaDeporte().getId(), equipo.getCategoriaDeporte().getNombre()),
				equipo.getImagenUrl(), convertirAUsuarioDTO(equipo.getCreador()), miembrosDTO);
	}

	@Transactional
	public Equipo actualizarEquipo(Long id, CrearEquipoDTO equipoDTO) {
	    if (equipoDTO.getNombre() == null || equipoDTO.getNombre().trim().isEmpty()) {
	        throw new RuntimeException("El nombre del equipo es requerido");
	    }
	    
	    if (equipoDTO.getCategoriaDeporteId() == null) {
	        throw new RuntimeException("La categoría de deporte es requerida");
	    }

	    Equipo equipo = equipoRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

	    CategoriaDeporte categoria = categoriaDeporteRepository.findById(equipoDTO.getCategoriaDeporteId())
	            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

	    equipo.setNombre(equipoDTO.getNombre());
	    equipo.setDescripcion(equipoDTO.getDescripcion());
	    equipo.setCategoriaDeporte(categoria);
	    equipo.setImagenUrl(equipoDTO.getImagenUrl());

	    return equipoRepository.save(equipo);
	}

	@Transactional
	public void eliminarTodosMiembros(Long equipoId) {
	    miembroRepository.deleteByEquipoId(equipoId);
	}

	@Transactional
	public void eliminarEquipo(Long id) {
	    // Eliminar todos los eventos asociados
	    eventoRepository.deleteByEquipoId(id);
	    // Eliminar todos los miembros
	    miembroRepository.deleteByEquipoId(id);
	    // Eliminar el equipo
	    equipoRepository.deleteById(id);
	}

	private UsuarioDTO convertirAUsuarioDTO(Usuario usuario) {
		UsuarioDTO dto = new UsuarioDTO();
		dto.setId(usuario.getId());
		dto.setNombre(usuario.getNombreUsuario());
		dto.setNombreUsuario(usuario.getNombreUsuario());
		dto.setEmail(usuario.getCorreoElectronico());
		dto.setAvatar(usuario.getImagen_perfil());
		return dto;
	}

	@Transactional
	public void asignarNuevoAdmin(Long equipoId, Long nuevoAdminId) {
		Equipo equipo = equipoRepository.findById(equipoId)
				.orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

		Usuario nuevoAdmin = usuarioRepository.findById(nuevoAdminId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		// Verificar que el nuevo admin es miembro del equipo
		if (!miembroRepository.existsByEquipoIdAndUsuarioId(equipoId, nuevoAdminId)) {
			throw new RuntimeException("El usuario no es miembro del equipo");
		}

		equipo.setCreador(nuevoAdmin);
		equipoRepository.save(equipo);
	}

	public List<EquipoDTO> findAll() {
        List<Equipo> equipos = equipoRepository.findAll();
        return equipos.stream()
                     .map(this::convertirAEquipoDTO)
                     .collect(Collectors.toList());
    }

    private EquipoDTO convertirAEquipoDTO(Equipo equipo) {
        EquipoDTO equipoDTO = new EquipoDTO();
        equipoDTO.setId(equipo.getId());
        equipoDTO.setNombre(equipo.getNombre());
        equipoDTO.setDescripcion(equipo.getDescripcion());
        equipoDTO.setImagenUrl(equipo.getImagenUrl());
        equipoDTO.setCat(equipo.getCategoriaDeporte());
        return equipoDTO;
    }

}