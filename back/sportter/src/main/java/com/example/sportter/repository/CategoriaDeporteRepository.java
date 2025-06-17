package com.example.sportter.repository;

import com.example.sportter.model.CategoriaDeporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaDeporteRepository extends JpaRepository<CategoriaDeporte, Long> {
    Optional<CategoriaDeporte> findByNombre(String nombre);
    boolean existsByNombre(String nombre);
}