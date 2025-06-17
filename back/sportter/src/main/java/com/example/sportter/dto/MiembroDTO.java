package com.example.sportter.dto;

public class MiembroDTO {
	
	private Long id;
    private UsuarioDTO usuario;
    private boolean isAdmin;
	
    public MiembroDTO(Long id, UsuarioDTO usuario, boolean isAdmin) {
		super();
		this.id = id;
		this.usuario = usuario;
		this.isAdmin = isAdmin;
	}

	public MiembroDTO() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public UsuarioDTO getUsuario() {
		return usuario;
	}

	public void setUsuario(UsuarioDTO usuario) {
		this.usuario = usuario;
	}

	public boolean isAdmin() {
		return isAdmin;
	}

	public void setAdmin(boolean isAdmin) {
		this.isAdmin = isAdmin;
	}
    
}
