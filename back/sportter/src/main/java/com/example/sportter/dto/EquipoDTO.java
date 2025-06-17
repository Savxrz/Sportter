package com.example.sportter.dto;

import com.example.sportter.model.CategoriaDeporte;

public class EquipoDTO {
	
	private Long id;
    private String nombre;
    private String imagenUrl;
    private String descripcion;
    private CategoriaDeporte cat;
    
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
	public String getImagenUrl() {
		return imagenUrl;
	}
	public void setImagenUrl(String imagenUrl) {
		this.imagenUrl = imagenUrl;
	}
	public String getDescripcion() {
		return descripcion;
	}
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}
	public CategoriaDeporte getCat() {
		return cat;
	}
	public void setCat(CategoriaDeporte cat) {
		this.cat = cat;
	}

}
