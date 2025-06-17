package com.example.sportter.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "categoriaDeporte")
public class CategoriaDeporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;

    @OneToMany(mappedBy = "categoriaDeporte", cascade = CascadeType.ALL)
    private List<Publicacion> publicaciones;

    
    public CategoriaDeporte() {
    }

    public CategoriaDeporte(String nombre) {
        this.nombre = nombre;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Publicacion> getPublicaciones() {
        return publicaciones;
    }

    public void setPublicaciones(List<Publicacion> publicaciones) {
        this.publicaciones = publicaciones;
    }
}