package com.example.sportter.dto;

public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String nombreUsuario;
    private String email;
    private String imagen_perfil;
    private String bio;

 
	// Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAvatar() { return imagen_perfil; }
    public void setAvatar(String imagen_perfil) { this.imagen_perfil = imagen_perfil; }
	public String getBio() {
		return bio;
	}
	public void setBio(String bio) {
		this.bio = bio;
	}
    
}