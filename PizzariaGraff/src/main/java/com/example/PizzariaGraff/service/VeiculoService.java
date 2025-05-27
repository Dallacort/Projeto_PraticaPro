package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Veiculo;
import com.example.PizzariaGraff.repository.VeiculoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VeiculoService {
    
    private final VeiculoRepository veiculoRepository;
    
    public VeiculoService(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
    }
    
    public List<Veiculo> findAll() {
        return veiculoRepository.findAll();
    }
    
    public List<Veiculo> findByAtivoTrue() {
        return veiculoRepository.findByAtivoTrue();
    }
    
    public Veiculo findById(Long id) {
        return veiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado com o ID: " + id));
    }
    
    public Veiculo findByPlaca(String placa) {
        return veiculoRepository.findByPlaca(placa)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado com a placa: " + placa));
    }
    
    public List<Veiculo> findByTransportadoraId(Long transportadoraId) {
        return veiculoRepository.findByTransportadoraId(transportadoraId);
    }
    
    public Veiculo save(Veiculo veiculo) {
        return veiculoRepository.save(veiculo);
    }
    
    public void deleteById(Long id) {
        veiculoRepository.deleteById(id);
    }
} 