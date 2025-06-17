package com.example.sportter.repository;

import com.example.sportter.dto.EquipoConMiembrosDTO;
import com.example.sportter.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {
 
 @Query("SELECT new com.example.sportter.dto.EquipoConMiembrosDTO(" +
        "e.id, e.nombre, e.descripcion, e.categoriaDeporte.nombre, " +
        "e.imagenUrl, COUNT(m)) " +
        "FROM Equipo e LEFT JOIN e.miembros m " +
        "WHERE e IN (SELECT m2.equipo FROM Miembro m2 WHERE m2.usuario.id = :userId) " +
        "GROUP BY e.id, e.nombre, e.descripcion, e.categoriaDeporte.nombre, e.imagenUrl")
 List<EquipoConMiembrosDTO> findEquiposConMiembrosByUsuario(@Param("userId") Long userId);

 @Query("SELECT new com.example.sportter.dto.EquipoConMiembrosDTO(" +
        "e.id, e.nombre, e.descripcion, e.categoriaDeporte.nombre, " +
        "e.imagenUrl, COUNT(m)) " +
        "FROM Equipo e LEFT JOIN e.miembros m " +
        "WHERE e NOT IN (SELECT m2.equipo FROM Miembro m2 WHERE m2.usuario.id = :userId) " +
        "GROUP BY e.id, e.nombre, e.descripcion, e.categoriaDeporte.nombre, e.imagenUrl")
 List<EquipoConMiembrosDTO> findEquiposComunidadConMiembros(@Param("userId") Long userId);
 
 List<Equipo> findByCreadorId(Long creadorId);
}