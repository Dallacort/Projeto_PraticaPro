package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Transportadora;
import com.example.PizzariaGraff.repository.TransportadoraRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportadoraService {
    
    private final TransportadoraRepository transportadoraRepository;
    
    public TransportadoraService(TransportadoraRepository transportadoraRepository) {
        this.transportadoraRepository = transportadoraRepository;
    }
    
    public List<Transportadora> findAll() {
        return transportadoraRepository.findAll();
    }
    
    public List<Transportadora> findByAtivoTrue() {
        return transportadoraRepository.findByAtivoTrue();
    }
    
    public Transportadora findById(Long id) {
        return transportadoraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transportadora não encontrada com o ID: " + id));
    }
    
    public Transportadora findByCnpj(String cnpj) {
        String cnpjLimpo = cnpj != null ? cnpj.replaceAll("[^0-9]", "") : "";
        return transportadoraRepository.findByCnpj(cnpjLimpo)
                .orElseThrow(() -> new RuntimeException("Transportadora não encontrada com o CNPJ: " + cnpj));
    }
    
    public Transportadora save(Transportadora transportadora) {
        return transportadoraRepository.save(transportadora);
    }
    
    public void deleteById(Long id) {
        transportadoraRepository.deleteById(id);
    }
} 