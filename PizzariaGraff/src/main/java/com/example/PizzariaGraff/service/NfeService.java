package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Nfe;
import com.example.PizzariaGraff.repository.NfeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NfeService {
    
    private final NfeRepository nfeRepository;
    
    public NfeService(NfeRepository nfeRepository) {
        this.nfeRepository = nfeRepository;
    }
    
    public List<Nfe> findAll() {
        return nfeRepository.findAll();
    }
    
    public Nfe findById(Long id) {
        return nfeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada com o ID: " + id));
    }
    
    public Nfe findByChaveAcesso(String chaveAcesso) {
        return nfeRepository.findByChaveAcesso(chaveAcesso)
                .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada com a chave de acesso: " + chaveAcesso));
    }
    
    public List<Nfe> findByClienteId(Long clienteId) {
        return nfeRepository.findByClienteId(clienteId);
    }
    
    public Nfe save(Nfe nfe) {
        return nfeRepository.save(nfe);
    }
    
    public void deleteById(Long id) {
        nfeRepository.deleteById(id);
    }
} 