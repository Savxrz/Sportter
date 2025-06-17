package com.example.sportter.dto;

import java.time.LocalDateTime;

public class PublicacionDTO {
	private Long id;
	private String contenido;
	private LocalDateTime fechaHora;
	private String nombreUsuario;
	private String categoriaDeporte;
	private Long likes;
	private int comentarios;
	private Long compartidos;

	// Constructor, Getters y Setters
	public PublicacionDTO(Long id, String contenido, String nombreUsuario, LocalDateTime fechaHora, String categoriaDeporte) {
		this.id = id;
		this.contenido = contenido;
		this.fechaHora = fechaHora;
		this.nombreUsuario = nombreUsuario;
		this.categoriaDeporte = categoriaDeporte;
	}

	
	// Getters y Setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getContenido() {
		return contenido;
	}

	public void setContenido(String contenido) {
		this.contenido = contenido;
	}

	public LocalDateTime getFechaHora() {
		return fechaHora;
	}

	public void setFechaHora(LocalDateTime fechaHora) {
		this.fechaHora = fechaHora;
	}

	public String getNombreUsuario() {
		return nombreUsuario;
	}

	public void setNombreUsuario(String nombreUsuario) {
		this.nombreUsuario = nombreUsuario;
	}

	public String getCategoriaDeporte() {
		return categoriaDeporte;
	}

	public void setCategoriaDeporte(String categoriaDeporte) {
		this.categoriaDeporte = categoriaDeporte;
	}


	public Long getLikes() {
		return likes;
	}

	public void setLikes(Long long1) {
		this.likes = long1;
	}

	public int getComentarios() {
		return comentarios;
	}

	public void setComentarios(int comentarios) {
		this.comentarios = comentarios;
	}

	public Long getCompartidos() {
		return compartidos;
	}

	public void setCompartidos(Long long1) {
		this.compartidos = long1;
	}

	public void setUsuarioId(Long id2) {
		// TODO Auto-generated method stub
		
	}

	public void setUsuarioNombre(String nombreUsuario2) {
		// TODO Auto-generated method stub
		
	}

	public void setUsuarioCorreo(String correoElectronico) {
		// TODO Auto-generated method stub
		
	}

}