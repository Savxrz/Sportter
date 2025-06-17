package com.example.sportter.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.sportter.model.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    @Query("SELECT e FROM Evento e WHERE e.equipoLocal.id IN :equipoIds OR e.equipoVisitante.id IN :equipoIds")
    List<Evento> findByEquipoLocalIdInOrEquipoVisitanteIdIn(
        @Param("equipoIds") List<Long> equipoIdsLocal,
        @Param("equipoIds") List<Long> equipoIdsVisitante);
    
    @Modifying
    @Query("DELETE FROM Evento e WHERE e.equipoLocal.id = :equipoId OR e.equipoVisitante.id = :equipoId")
    void deleteByEquipoId(@Param("equipoId") Long equipoId);
}