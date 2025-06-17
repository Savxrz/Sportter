package com.example.sportter.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "publicacion")
public class Publicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contenido", nullable = false)
    private String contenido;

    @Column(name = "fechahora", nullable = false) // Nombre exacto como en BD
    private LocalDateTime fechaHora;

//    @JsonIgnoreProperties({"publicaciones"}) // Evita recursión infinita
//    @ManyToOne(fetch = FetchType.EAGER) // Cambiar a EAGER loading
//    @JoinColumn(name = "usuarioId", referencedColumnName = "id")
//    private static Usuario usuario;
    
    @JsonIgnoreProperties({"publicaciones"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuarioId", nullable = false) // Nombre exacto como en BD
    private Usuario usuario; // Cambiado de static y renombrado

    @JsonIgnoreProperties({"publicaciones"}) // Evita recursión infinita
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoriaDeporteId", referencedColumnName = "id")
    private CategoriaDeporte categoriaDeporte;
    
    
    @Column(name = "likes")
    private Long likes;
    
    @ManyToMany
    @JoinTable(
        name = "publicacion_likes",
        joinColumns = @JoinColumn(name = "publicacion_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    
    
    private Set<Usuario> usuariosQueDieronLike = new HashSet<>();
    
    @Column(name = "comentarios")
    private Long comentarios = (long) 0;
    
    @Column(name = "compartidos")
    private Long compartidos;
    
    @Column(name = "imagen", columnDefinition = "LONGTEXT")
    private String imagen;
    

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

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public CategoriaDeporte getCategoriaDeporte() {
		return categoriaDeporte;
	}

	public void setCategoriaDeporte(CategoriaDeporte categoriaDeporte) {
		this.categoriaDeporte = categoriaDeporte;
	}

	public Long getCompartidos() {
		return compartidos;
	}

	public void setCompartidos(Long compartidos) {
		this.compartidos = compartidos;
	}

	public Long getComentarios() {
		return comentarios;
	}

	public void setComentarios(Long comentarios) {
		this.comentarios = comentarios;
	}

	public Long getLikes() {
		return likes;
	}

	public void setLikes(Long likes) {
		this.likes = likes;
	}

	public String getImagen() {
		return imagen;
	}

	public void setImagen(String imagen) {
		this.imagen = imagen;
	}
	
	public Set<Usuario> getUsuariosQueDieronLike() {
	    return usuariosQueDieronLike;
	}

	public void setUsuariosQueDieronLike(Set<Usuario> usuariosQueDieronLike) {
	    this.usuariosQueDieronLike = usuariosQueDieronLike;
	}
	
	@JsonProperty("usuarioId")
	public Long getUsuarioId() {
	    return this.usuario != null ? this.usuario.getId() : null;
	}
}