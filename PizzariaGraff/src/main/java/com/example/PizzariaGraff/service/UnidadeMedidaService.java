package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.UnidadeMedida;
import com.example.PizzariaGraff.repository.UnidadeMedidaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnidadeMedidaService {

    private final UnidadeMedidaRepository unidadeMedidaRepository;

    public UnidadeMedidaService(UnidadeMedidaRepository unidadeMedidaRepository) {
        this.unidadeMedidaRepository = unidadeMedidaRepository;
    }

    public List<UnidadeMedida> findAll() {
        return unidadeMedidaRepository.findAll();
    }

    public List<UnidadeMedida> findByAtivoTrue() {
        return unidadeMedidaRepository.findByAtivoTrue();
    }

    public UnidadeMedida findById(Long id) {
        return unidadeMedidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidade de medida não encontrada com o ID: " + id));
    }

    public List<UnidadeMedida> findByUnidadeMedida(String unidadeMedida) {
        return unidadeMedidaRepository.findByUnidadeMedida(unidadeMedida);
    }

    public UnidadeMedida save(UnidadeMedida unidadeMedida) {
        // Validação básica
        if (unidadeMedida.getUnidadeMedida() == null || unidadeMedida.getUnidadeMedida().trim().isEmpty()) {
            throw new RuntimeException("O nome da unidade de medida é obrigatório");
        }
        
        return unidadeMedidaRepository.save(unidadeMedida);
    }

    public void deleteById(Long id) {
        unidadeMedidaRepository.deleteById(id);
    }
} 