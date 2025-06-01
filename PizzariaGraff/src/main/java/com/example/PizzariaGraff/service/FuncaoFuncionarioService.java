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
        // Validações básicas antes de salvar
        if (funcao.getDescricao() == null || funcao.getDescricao().trim().isEmpty()) {
            throw new RuntimeException("Descrição da função é obrigatória");
        }
        
        return funcaoFuncionarioRepository.save(funcao);
    }
    
    public void deleteById(Long id) {
        funcaoFuncionarioRepository.deleteById(id);
    }
} 