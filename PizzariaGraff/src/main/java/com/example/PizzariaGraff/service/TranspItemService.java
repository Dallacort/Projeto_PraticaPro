package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.TranspItem;
import com.example.PizzariaGraff.repository.TranspItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TranspItemService {
    
    private final TranspItemRepository transpItemRepository;
    
    public TranspItemService(TranspItemRepository transpItemRepository) {
        this.transpItemRepository = transpItemRepository;
    }
    
    public List<TranspItem> findAll() {
        return transpItemRepository.findAll();
    }
    
    public List<TranspItem> findByAtivoTrue() {
        return transpItemRepository.findByAtivoTrue();
    }
    
    public TranspItem findById(Long id) {
        return transpItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item de transportadora não encontrado com o ID: " + id));
    }
    
    public TranspItem findByCodigo(String codigo) {
        return transpItemRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Item de transportadora não encontrado com o código: " + codigo));
    }
    
    public List<TranspItem> findByTransportadoraId(Long transportadoraId) {
        return transpItemRepository.findByTransportadoraId(transportadoraId);
    }
    
    public List<TranspItem> findByDescricaoContainingIgnoreCase(String termo) {
        return transpItemRepository.findByDescricaoContainingIgnoreCase(termo);
    }
    
    public TranspItem save(TranspItem transpItem) {
        return transpItemRepository.save(transpItem);
    }
    
    public void deleteById(Long id) {
        transpItemRepository.deleteById(id);
    }
} 