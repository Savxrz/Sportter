package com.example.sportter.repository;

import com.example.sportter.model.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByConversacionIdOrderByFechaHoraAsc(String conversacionId);
    List<Mensaje> findByRemitenteIdOrDestinatarioIdOrderByFechaHoraDesc(Long remitenteId, Long destinatarioId);
    List<Mensaje> findByConversacionIdAndLeidoFalseAndDestinatarioId(String conversacionId, Long destinatarioId);
}