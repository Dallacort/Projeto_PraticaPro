package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Pais;
import com.example.PizzariaGraff.repository.PaisRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaisService {
    
    private final PaisRepository paisRepository;
    
    public PaisService(PaisRepository paisRepository) {
        this.paisRepository = paisRepository;
    }
    
    public List<Pais> findAll() {
        try {
            return paisRepository.findAll();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar todos os países: " + e.getMessage(), e);
        }
    }
    
    public Pais findById(String id) {
        try {
            return paisRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("País não encontrado com o ID: " + id));
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar país por ID: " + e.getMessage(), e);
        }
    }
    
    public Pais save(Pais pais) {
        try {
            return paisRepository.save(pais);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao salvar país: " + e.getMessage(), e);
        }
    }
    
    public void deleteById(String id) {
        try {
            paisRepository.deleteById(id);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao deletar país: " + e.getMessage(), e);
        }
    }
} 