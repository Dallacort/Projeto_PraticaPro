package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Funcionario;
import com.example.PizzariaGraff.repository.FuncionarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuncionarioService {
    
    private final FuncionarioRepository funcionarioRepository;
    
    public FuncionarioService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }
    
    public List<Funcionario> findAll() {
        return funcionarioRepository.findAll();
    }
    
    public Funcionario findById(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
    }
    
    public List<Funcionario> findByFuncionario(String funcionario) {
        return funcionarioRepository.findByFuncionario(funcionario);
    }
    
    public List<Funcionario> findByCpfCpnj(String cpfCpnj) {
        return funcionarioRepository.findByCpfCpnj(cpfCpnj);
    }
    
    public Funcionario findByEmail(String email) {
        return funcionarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o email: " + email));
    }
    
    public List<Funcionario> findByFuncaoFuncionarioId(Long funcaoId) {
        return funcionarioRepository.findByFuncaoFuncionarioId(funcaoId);
    }
    
    public Funcionario save(Funcionario funcionario) {
        // Validações básicas antes de salvar
        if (funcionario.getFuncionario() == null || funcionario.getFuncionario().trim().isEmpty()) {
            throw new RuntimeException("Nome do funcionário é obrigatório");
        }
        
        if (funcionario.getEmail() == null || funcionario.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email do funcionário é obrigatório");
        }
        
        return funcionarioRepository.save(funcionario);
    }
    
    public void deleteById(Long id) {
        funcionarioRepository.deleteById(id);
    }
} 