package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ModalidadeNfe;
import com.example.PizzariaGraff.repository.ModalidadeNfeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModalidadeNfeService {
    
    private final ModalidadeNfeRepository modalidadeNfeRepository;
    
    public ModalidadeNfeService(ModalidadeNfeRepository modalidadeNfeRepository) {
        this.modalidadeNfeRepository = modalidadeNfeRepository;
    }
    
    public List<ModalidadeNfe> findAll() {
        return modalidadeNfeRepository.findAll();
    }
    
    public List<ModalidadeNfe> findByAtivoTrue() {
        return modalidadeNfeRepository.findByAtivoTrue();
    }
    
    public ModalidadeNfe findById(Long id) {
        return modalidadeNfeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modalidade de NF-e não encontrada com o ID: " + id));
    }
    
    public ModalidadeNfe findByCodigo(String codigo) {
        return modalidadeNfeRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Modalidade de NF-e não encontrada com o código: " + codigo));
    }
    
    public List<ModalidadeNfe> findByDescricaoContainingIgnoreCase(String termo) {
        return modalidadeNfeRepository.findByDescricaoContainingIgnoreCase(termo);
    }
    
    public ModalidadeNfe save(ModalidadeNfe modalidade) {
        return modalidadeNfeRepository.save(modalidade);
    }
    
    public void deleteById(Long id) {
        modalidadeNfeRepository.deleteById(id);
    }
} 