package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.MovimentacaoNfe;
import com.example.PizzariaGraff.repository.MovimentacaoNfeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovimentacaoNfeService {
    
    private final MovimentacaoNfeRepository movimentacaoNfeRepository;
    
    public MovimentacaoNfeService(MovimentacaoNfeRepository movimentacaoNfeRepository) {
        this.movimentacaoNfeRepository = movimentacaoNfeRepository;
    }
    
    public List<MovimentacaoNfe> findAll() {
        return movimentacaoNfeRepository.findAll();
    }
    
    public MovimentacaoNfe findById(Long id) {
        return movimentacaoNfeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimentação de NF-e não encontrada com o ID: " + id));
    }
    
    public List<MovimentacaoNfe> findByNfeId(Long nfeId) {
        return movimentacaoNfeRepository.findByNfeId(nfeId);
    }
    
    public MovimentacaoNfe save(MovimentacaoNfe movimentacao) {
        return movimentacaoNfeRepository.save(movimentacao);
    }
    
    public void deleteById(Long id) {
        movimentacaoNfeRepository.deleteById(id);
    }
} 