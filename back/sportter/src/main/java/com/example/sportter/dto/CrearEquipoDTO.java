package com.example.sportter.dto;

public class CrearEquipoDTO {
    private String nombre;
    private String descripcion;
    private Long categoriaDeporteId;
    private String imagenUrl;

    // Getters y Setters
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getCategoriaDeporteId() {
        return categoriaDeporteId;
    }

    public void setCategoriaDeporteId(Long categoriaDeporteId) {
        this.categoriaDeporteId = categoriaDeporteId;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
}