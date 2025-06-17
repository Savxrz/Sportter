package com.example.sportter.dto;

import java.util.List;

public class EquipoDetallesDTO {
	
	private Long id;
    private String nombre;
    private String descripcion;
    private CategoriaDeporteDTO categoriaDeporte;
    private String imagenUrl;
    private UsuarioDTO creador;
    private List<MiembroDTO> miembros;
	
    public EquipoDetallesDTO(Long id, String nombre, String descripcion, CategoriaDeporteDTO categoriaDeporte,
			String imagenUrl, UsuarioDTO creador, List<MiembroDTO> miembros) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.descripcion = descripcion;
		this.categoriaDeporte = categoriaDeporte;
		this.imagenUrl = imagenUrl;
		this.creador = creador;
		this.miembros = miembros;
	}

	public EquipoDetallesDTO() {
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

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public CategoriaDeporteDTO getCategoriaDeporte() {
		return categoriaDeporte;
	}

	public void setCategoriaDeporte(CategoriaDeporteDTO categoriaDeporte) {
		this.categoriaDeporte = categoriaDeporte;
	}

	public String getImagenUrl() {
		return imagenUrl;
	}

	public void setImagenUrl(String imagenUrl) {
		this.imagenUrl = imagenUrl;
	}

	public UsuarioDTO getCreador() {
		return creador;
	}

	public void setCreador(UsuarioDTO creador) {
		this.creador = creador;
	}

	public List<MiembroDTO> getMiembros() {
		return miembros;
	}

	public void setMiembros(List<MiembroDTO> miembros) {
		this.miembros = miembros;
	}
    
}
