package com.example.sportter.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.*;

@Entity
@Table(name = "comentario")
public class Comentario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(nullable = false)
    private LocalDateTime fechaHora;
    
    @JsonBackReference
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioId", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicacionId", nullable = false)
    private Publicacion publicacion;
    
    @Column(name = "likes", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Long likes = 0L;
    
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "comentario_likes",
        joinColumns = @JoinColumn(name = "comentario_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private Set<Usuario> usuariosQueDieronLike = new HashSet<>();


    @PrePersist
    protected void onCreate() {
        fechaHora = LocalDateTime.now();
    }

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

	public Publicacion getPublicacion() {
		return publicacion;
	}

	public void setPublicacion(Publicacion publicacion) {
		this.publicacion = publicacion;
	}
	
	public Long getLikes() {
	    return likes;
	}

	public void setLikes(Long likes) {
	    this.likes = likes;
	}


	public Set<Usuario> getUsuariosQueDieronLike() {
	    return usuariosQueDieronLike;
	}

	public void setUsuariosQueDieronLike(Set<Usuario> usuariosQueDieronLike) {
	    this.usuariosQueDieronLike = usuariosQueDieronLike;
	}
    
	public void addUsuarioLike(Usuario usuario) {
        this.usuariosQueDieronLike.add(usuario);
        this.likes = (long) this.usuariosQueDieronLike.size();
    }

    public void removeUsuarioLike(Usuario usuario) {
        this.usuariosQueDieronLike.remove(usuario);
        this.likes = (long) this.usuariosQueDieronLike.size();
    }

    public boolean containsUsuarioLike(Usuario usuario) {
        return this.usuariosQueDieronLike.contains(usuario);
    }
}