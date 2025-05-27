package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.repository.CidadeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CidadeService {
    
    private final CidadeRepository cidadeRepository;
    
    public CidadeService(CidadeRepository cidadeRepository) {
        this.cidadeRepository = cidadeRepository;
    }
    
    public List<Cidade> findAll() {
        return cidadeRepository.findAll();
    }
    
    public Cidade findById(Long id) {
        return cidadeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cidade não encontrada com o ID: " + id));
    }
    
    public List<Cidade> findByEstadoId(Long estadoId) {
        return cidadeRepository.findByEstadoId(estadoId);
    }
    
    public Cidade save(Cidade cidade) {
        return cidadeRepository.save(cidade);
    }
    
    public void deleteById(Long id) {
        cidadeRepository.deleteById(id);
    }
} 