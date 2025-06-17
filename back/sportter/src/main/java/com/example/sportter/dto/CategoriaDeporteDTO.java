package com.example.sportter.dto;

public class CategoriaDeporteDTO {
	
	private Long id;
    private String nombre;
	
    public CategoriaDeporteDTO(Long id, String nombre) {
		super();
		this.id = id;
		this.nombre = nombre;
	}

	public CategoriaDeporteDTO() {
		super();
		// TODO Auto-generated constructor stub
	}

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
    
}
