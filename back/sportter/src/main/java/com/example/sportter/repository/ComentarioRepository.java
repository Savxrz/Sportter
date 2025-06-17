package com.example.sportter.repository;

import com.example.sportter.model.Comentario;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {    
    @Modifying
    @Query("UPDATE Comentario c SET c.likes = c.likes + 1 WHERE c.id = :id")
    @Transactional
    void incrementarLikes(@Param("id") Long comentarioId);
    
    @Modifying
    @Query("UPDATE Comentario c SET c.likes = c.likes - 1 WHERE c.id = :id AND c.likes > 0")
    @Transactional
    void decrementarLikes(@Param("id") Long comentarioId);
    
    @Query("SELECT c FROM Comentario c JOIN FETCH c.usuario WHERE c.publicacion.id = :publicacionId ORDER BY c.fechaHora DESC")
    List<Comentario> findByPublicacionIdOrderByFechaHoraDesc(@Param("publicacionId") Long publicacionId);
}