package com.example.sportter.dto;

import lombok.Data;

@Data
public class ComentarioDto {
    private String contenido;
    private Long publicacionId;
    private Long usuarioId;
	public String getContenido() {
		return contenido;
	}
	public void setContenido(String contenido) {
		this.contenido = contenido;
	}
	public Long getPublicacionId() {
		return publicacionId;
	}
	public void setPublicacionId(Long publicacionId) {
		this.publicacionId = publicacionId;
	}
	public Long getUsuarioId() {
		return usuarioId;
	}
	public void setUsuarioId(Long usuarioId) {
		this.usuarioId = usuarioId;
	}
    
    
    
}
