package com.example.sportter.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ComentarioResponseDto {
	 private Long id;
	    private String contenido;
	    private LocalDateTime fechaHora;
	    private Long publicacionId;
	    private Long usuarioId;
	    private String usuarioNombre;
	    private String usuarioCorreo;
	    private String usuarioImagenPerfil;
	    private Long likes;
	    
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
		public String getUsuarioNombre() {
			return usuarioNombre;
		}
		public void setUsuarioNombre(String usuarioNombre) {
			this.usuarioNombre = usuarioNombre;
		}
		public String getUsuarioCorreo() {
			return usuarioCorreo;
		}
		public void setUsuarioCorreo(String usuarioCorreo) {
			this.usuarioCorreo = usuarioCorreo;
		}
		public String getUsuarioImagenPerfil() {
	        return usuarioImagenPerfil;
	    }
	    
	    public void setUsuarioImagenPerfil(String usuarioImagenPerfil) {
	        this.usuarioImagenPerfil = usuarioImagenPerfil;
	    }
		public Long getLikes() {
			return likes;
		}
		public void setLikes(Long likes) {
			this.likes = likes;
		}
    
}