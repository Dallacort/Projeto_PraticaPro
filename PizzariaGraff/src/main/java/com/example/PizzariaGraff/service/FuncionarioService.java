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
        System.out.println("=== SERVICE SAVE FUNCIONARIO ===");
        System.out.println("Dados recebidos no service:");
        System.out.println("ID: " + funcionario.getId());
        System.out.println("Funcionario: " + funcionario.getFuncionario());
        System.out.println("Email: " + funcionario.getEmail());
        System.out.println("CidadeId: " + funcionario.getCidadeId());
        System.out.println("NacionalidadeId: " + funcionario.getNacionalidadeId());
        System.out.println("FuncaoFuncionarioId: " + funcionario.getFuncaoFuncionarioId());
        System.out.println("Ativo: " + funcionario.getAtivo());
        
        // Validações básicas antes de salvar
        if (funcionario.getFuncionario() == null || funcionario.getFuncionario().trim().isEmpty()) {
            System.err.println("ERRO: Nome do funcionário é obrigatório");
            throw new RuntimeException("Nome do funcionário é obrigatório");
        }
        
        if (funcionario.getEmail() == null || funcionario.getEmail().trim().isEmpty()) {
            System.err.println("ERRO: Email do funcionário é obrigatório");
            throw new RuntimeException("Email do funcionário é obrigatório");
        }
        
        System.out.println("Validações OK, chamando repository...");
        Funcionario saved = funcionarioRepository.save(funcionario);
        
        System.out.println("=== DADOS SALVOS NO SERVICE ===");
        System.out.println("ID: " + saved.getId());
        System.out.println("Funcionario: " + saved.getFuncionario());
        System.out.println("Email: " + saved.getEmail());
        System.out.println("DataAlteracao: " + saved.getDataAlteracao());
        
        return saved;
    }
    
    public void deleteById(Long id) {
        funcionarioRepository.deleteById(id);
    }
} 