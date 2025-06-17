package com.example.sportter.repository;

import com.example.sportter.model.Publicacion;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {

	@EntityGraph(type = EntityGraph.EntityGraphType.FETCH, attributePaths = { "usuario", "categoriaDeporte" })
	@Query("SELECT DISTINCT p FROM Publicacion p LEFT JOIN FETCH p.usuario LEFT JOIN FETCH p.categoriaDeporte ORDER BY p.fechaHora DESC")
	List<Publicacion> findAllWithUserAndCategory();

	@Query("SELECT p FROM Publicacion p LEFT JOIN FETCH p.usuario LEFT JOIN FETCH p.categoriaDeporte WHERE p.id = :id")
	Optional<Publicacion> findByIdWithRelations(@Param("id") Long id);

	@Modifying
	@Query(value = "UPDATE publicacion p SET comentarios = (SELECT COUNT(*) FROM comentario c WHERE c.publicacionId = p.id)", nativeQuery = true)
	void actualizarConteoDeComentarios();

	@Modifying
	@Query("UPDATE Publicacion p SET p.comentarios = p.comentarios + 1 WHERE p.id = :id")
	@Transactional
	void incrementarComentarios(@Param("id") Long publicacionId);

	@EntityGraph(type = EntityGraph.EntityGraphType.FETCH, attributePaths = { "usuario", "categoriaDeporte" })
	@Query("SELECT p FROM Publicacion p WHERE p.usuario.id = :userId ORDER BY p.fechaHora DESC")
	List<Publicacion> findByUsuarioId(@Param("userId") Long userId);
	
	@Modifying
    @Transactional
    @Query("UPDATE Publicacion p SET p.compartidos = COALESCE(p.compartidos, 0) + :incremento WHERE p.id = :id")
    void incrementarCompartidos(Long id, Long incremento);
    
    // Método alternativo para obtener y actualizar
    default Publicacion incrementarCompartidosYRetornar(Long id, Long incremento) {
        incrementarCompartidos(id, incremento);
        return findById(id).orElse(null);
    }
}