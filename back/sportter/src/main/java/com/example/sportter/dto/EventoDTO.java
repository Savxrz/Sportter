package com.example.sportter.dto;

import java.time.LocalDateTime;

public class EventoDTO {

	
	private Long id;
    private String nombre;
    private LocalDateTime fecha;
    private String ubicacion;
    private EquipoDTO equipoLocal;
    private EquipoDTO equipoVisitante;
    private String deporte;
    private boolean esMiembro;
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
	public LocalDateTime getFecha() {
		return fecha;
	}
	public void setFecha(LocalDateTime fecha) {
		this.fecha = fecha;
	}
	public String getUbicacion() {
		return ubicacion;
	}
	public void setUbicacion(String ubicacion) {
		this.ubicacion = ubicacion;
	}
	public EquipoDTO getEquipoLocal() {
		return equipoLocal;
	}
	public void setEquipoLocal(EquipoDTO equipoLocal) {
		this.equipoLocal = equipoLocal;
	}
	public EquipoDTO getEquipoVisitante() {
		return equipoVisitante;
	}
	public void setEquipoVisitante(EquipoDTO equipoVisitante) {
		this.equipoVisitante = equipoVisitante;
	}
	public String getDeporte() {
		return deporte;
	}
	public void setDeporte(String deporte) {
		this.deporte = deporte;
	}
	public boolean isEsMiembro() {
		return esMiembro;
	}
	public void setEsMiembro(boolean esMiembro) {
		this.esMiembro = esMiembro;
	}
    
    
    
}
