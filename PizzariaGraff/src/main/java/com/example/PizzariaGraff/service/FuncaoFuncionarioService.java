package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.FuncaoFuncionario;
import com.example.PizzariaGraff.repository.FuncaoFuncionarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuncaoFuncionarioService {
    
    private final FuncaoFuncionarioRepository funcaoFuncionarioRepository;
    
    public FuncaoFuncionarioService(FuncaoFuncionarioRepository funcaoFuncionarioRepository) {
        this.funcaoFuncionarioRepository = funcaoFuncionarioRepository;
    }
    
    public List<FuncaoFuncionario> findAll() {
        return funcaoFuncionarioRepository.findAll();
    }
    
    public List<FuncaoFuncionario> findAllAtivos() {
        return funcaoFuncionarioRepository.findByAtivo(true);
    }
    
    public FuncaoFuncionario findById(Long id) {
        return funcaoFuncionarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Função de funcionário não encontrada com o ID: " + id));
    }
    
    public FuncaoFuncionario save(FuncaoFuncionario funcao) {
        try {
            // Validações obrigatórias: apenas função e carga horária
            if (funcao.getFuncaoFuncionario() == null || funcao.getFuncaoFuncionario().trim().isEmpty()) {
                throw new RuntimeException("Nome da função é obrigatório");
            }
            
            if (funcao.getCargaHoraria() == null) {
                throw new RuntimeException("Carga horária é obrigatória");
            }
            
            // Validações de formato
            if (funcao.getCargaHoraria().doubleValue() < 0) {
                throw new RuntimeException("Carga horária deve ser um valor positivo");
            }
            
            if (funcao.getCargaHoraria().doubleValue() > 80) {
                throw new RuntimeException("Carga horária não pode exceder 80 horas por semana");
            }
            
            return funcaoFuncionarioRepository.save(funcao);
            
        } catch (Exception e) {
            System.err.println("Erro ao salvar função: " + e.getMessage());
            throw e;
        }
    }
    
    public void deleteById(Long id) {
        funcaoFuncionarioRepository.deleteById(id);
    }
} 