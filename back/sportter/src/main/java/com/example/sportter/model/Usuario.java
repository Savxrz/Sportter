package com.example.sportter.model;

import java.util.ArrayList;
import java.util.List;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private List<Publicacion> publicaciones = new ArrayList<>();
    
    
    @JsonProperty("nombreUsuario")
    @Column(name = "nombre_usuario") // Cambiado de nombre.usuario a nombre_usuario
    private String nombreUsuario;

    @JsonProperty("correoElectronico")
    @Column(name = "correo_electronico", unique = true)
    private String correoElectronico;

    @JsonProperty("contrasena")
    @Column(name = "contrasena") // Añadida anotación @Column
    private String contrasena;
    
    @JsonProperty("bio")
    @Column(name = "bio", length = 500)
    private String bio;
    
    @Column(name = "imagen_perfil", columnDefinition = "LONGTEXT")
    private String imagen_perfil; 
    
    public Usuario() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Usuario(Long id, List<Publicacion> publicaciones, String nombreUsuario, String correoElectronico,
			String contrasena, String imagen_perfil) {
		super();
		this.id = id;
		this.publicaciones = publicaciones;
		this.nombreUsuario = nombreUsuario;
		this.correoElectronico = correoElectronico;
		this.contrasena = contrasena;
		this.imagen_perfil = imagen_perfil;
	}

	// Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }
    
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico= correoElectronico;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
   

	public List<Publicacion> getPublicaciones() {
		return publicaciones;
	}

	public void setPublicaciones(List<Publicacion> publicaciones) {
		this.publicaciones = publicaciones;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public String getImagen_perfil() {
		return imagen_perfil;
	}

	public void setImagen_perfil(String imagen_perfil) {
		this.imagen_perfil = imagen_perfil;
	}
	
	@JsonProperty("usuarioImagenPerfil")
	public String getUsuarioImagenPerfil() {
	    return this.imagen_perfil;
	}


}
