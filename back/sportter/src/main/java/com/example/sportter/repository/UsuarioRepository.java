package com.example.sportter.repository;

import com.example.sportter.model.Publicacion;
import com.example.sportter.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreoElectronicoAndContrasena(String correoElectronico, String contrasena);
    boolean existsByCorreoElectronico(String correoElectronico);
    Optional<Usuario> findByCorreoElectronico(String correoElectronico);
	Usuario findById(Usuario usuario);
	List<Usuario> findByNombreUsuarioContainingIgnoreCaseOrCorreoElectronicoContainingIgnoreCase(
			String query1, String query2);
}