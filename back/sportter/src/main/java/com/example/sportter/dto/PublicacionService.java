package com.example.sportter.dto;

import com.example.sportter.model.Publicacion;
import com.example.sportter.repository.PublicacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicacionService {
    
    private final PublicacionRepository publicacionRepository;
    
    public PublicacionService(PublicacionRepository publicacionRepository) {
        this.publicacionRepository = publicacionRepository;
    }
    
    @Transactional
    public Publicacion incrementarCompartidos(Long publicacionId, Long cantidad) {
        // Versión optimista (mejor para concurrencia)
        Publicacion publicacion = publicacionRepository.findById(publicacionId)
            .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        
        publicacion.setCompartidos(
            (publicacion.getCompartidos() != null ? publicacion.getCompartidos() : 0) + cantidad
        );
        
        return publicacionRepository.save(publicacion);
        
        // Alternativa más eficiente para solo incrementar:
        // publicacionRepository.incrementarCompartidos(publicacionId, cantidad);
        // return publicacionRepository.findById(publicacionId).orElse(null);
    }
}