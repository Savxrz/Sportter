// EquipoConMiembrosDTO.java
package com.example.sportter.dto;

public class EquipoConMiembrosDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private String deporte; // Nombre de la categoría
    private String imagenUrl;
    private Long cantidadMiembros;

    // Constructor
    public EquipoConMiembrosDTO(Long id, String nombre, String descripcion, 
                              String deporte, String imagenUrl, Long cantidadMiembros) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.deporte = deporte;
        this.imagenUrl = imagenUrl;
        this.cantidadMiembros = cantidadMiembros;
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

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public String getDeporte() {
		return deporte;
	}

	public void setDeporte(String deporte) {
		this.deporte = deporte;
	}

	public String getImagenUrl() {
		return imagenUrl;
	}

	public void setImagenUrl(String imagenUrl) {
		this.imagenUrl = imagenUrl;
	}

	public Long getCantidadMiembros() {
		return cantidadMiembros;
	}

	public void setCantidadMiembros(Long cantidadMiembros) {
		this.cantidadMiembros = cantidadMiembros;
	}
    
    
    
}