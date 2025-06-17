package com.example.sportter.repository;

import com.example.sportter.model.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {
    Optional<Conversacion> findByUsuario1IdAndUsuario2Id(Long usuario1Id, Long usuario2Id);
    List<Conversacion> findByUsuario1IdOrUsuario2IdOrderByFechaCreacionDesc(Long usuario1Id, Long usuario2Id);
}