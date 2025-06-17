package com.example.sportter.dto;

import java.time.LocalDateTime;

public class MensajeDTO {
    private Long id;
    private String contenido;
    private LocalDateTime fechaHora;
    private boolean leido;
    private Long remitenteId;
    private String remitenteNombre;
    private String remitenteImagenPerfil;
    private Long destinatarioId;
    private String destinatarioNombre;
    private String conversacionId;
    private String metadata;


    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public boolean isLeido() { return leido; }
    public void setLeido(boolean leido) { this.leido = leido; }
    public Long getRemitenteId() { return remitenteId; }
    public void setRemitenteId(Long remitenteId) { this.remitenteId = remitenteId; }
    public String getRemitenteNombre() { return remitenteNombre; }
    public void setRemitenteNombre(String remitenteNombre) { this.remitenteNombre = remitenteNombre; }
    public String getRemitenteImagenPerfil() { return remitenteImagenPerfil; }
    public void setRemitenteImagenPerfil(String remitenteImagenPerfil) {
        this.remitenteImagenPerfil = remitenteImagenPerfil;
    }
    public Long getDestinatarioId() { return destinatarioId; }
    public void setDestinatarioId(Long destinatarioId) { this.destinatarioId = destinatarioId; }
    public String getDestinatarioNombre() { return destinatarioNombre; }
    public void setDestinatarioNombre(String destinatarioNombre) { this.destinatarioNombre = destinatarioNombre; }
    public String getConversacionId() { return conversacionId; }
    public void setConversacionId(String long1) { this.conversacionId = long1; }
	public String getMetadata() {
		return metadata;
	}
	public void setMetadata(String metadata) {
		this.metadata = metadata;
	}
}