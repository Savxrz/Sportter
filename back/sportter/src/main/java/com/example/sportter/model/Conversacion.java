package com.example.sportter.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversacion")
public class Conversacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Para MySQL autoincremental
    private Long id;
    
    @Column(name = "usuario1_id", nullable = false)
    private Long usuario1Id;
    
    @Column(name = "usuario2_id", nullable = false)
    private Long usuario2Id;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUsuario1Id() { return usuario1Id; }
    public void setUsuario1Id(Long usuario1Id) { this.usuario1Id = usuario1Id; }
    public Long getUsuario2Id() { return usuario2Id; }
    public void setUsuario2Id(Long usuario2Id) { this.usuario2Id = usuario2Id; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}