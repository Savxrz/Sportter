package com.example.sportter.dto;

import com.example.sportter.model.Usuario;
import java.time.LocalDateTime;

public class ConversacionDTO {
    private String id; // ID de la conversación (de la tabla conversacion)
    private Usuario participante1;
    private Usuario participante2;
    private LocalDateTime fechaCreacion;
    private String ultimoMensaje;
    private LocalDateTime fechaUltimoMensaje;
    private long mensajesNoLeidos;

    // Constructor completo
    public ConversacionDTO(String id, Usuario participante1, Usuario participante2, 
                         LocalDateTime fechaCreacion, String ultimoMensaje,
                         LocalDateTime fechaUltimoMensaje, long mensajesNoLeidos) {
        this.id = id;
        this.participante1 = participante1;
        this.participante2 = participante2;
        this.fechaCreacion = fechaCreacion;
        this.ultimoMensaje = ultimoMensaje;
        this.fechaUltimoMensaje = fechaUltimoMensaje;
        this.mensajesNoLeidos = mensajesNoLeidos;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Usuario getParticipante1() { return participante1; }
    public void setParticipante1(Usuario participante1) { this.participante1 = participante1; }
    public Usuario getParticipante2() { return participante2; }
    public void setParticipante2(Usuario participante2) { this.participante2 = participante2; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public String getUltimoMensaje() { return ultimoMensaje; }
    public void setUltimoMensaje(String ultimoMensaje) { this.ultimoMensaje = ultimoMensaje; }
    public LocalDateTime getFechaUltimoMensaje() { return fechaUltimoMensaje; }
    public void setFechaUltimoMensaje(LocalDateTime fechaUltimoMensaje) { this.fechaUltimoMensaje = fechaUltimoMensaje; }
    public long getMensajesNoLeidos() { return mensajesNoLeidos; }
    public void setMensajesNoLeidos(long mensajesNoLeidos) { this.mensajesNoLeidos = mensajesNoLeidos; }
}
