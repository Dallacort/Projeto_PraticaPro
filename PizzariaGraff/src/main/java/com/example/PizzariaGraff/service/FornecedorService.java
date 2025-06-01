package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.repository.FornecedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    public List<Fornecedor> findAll() {
        return fornecedorRepository.findAll();
    }
    
    public Fornecedor findById(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com o ID: " + id));
    }
    
    public List<Fornecedor> findByFornecedor(String nome) {
        return fornecedorRepository.findByFornecedor(nome);
    }
    
    public Fornecedor save(Fornecedor fornecedor) {
        // Normalização de dados
        if (fornecedor.getCpfCnpj() != null) {
            String cpfCnpjLimpo = fornecedor.getCpfCnpj().replaceAll("[^0-9]", "");
            fornecedor.setCpfCnpj(cpfCnpjLimpo);
        }
        
        if (fornecedor.getEmail() != null) {
            String emailNormalizado = fornecedor.getEmail().trim().toLowerCase();
            fornecedor.setEmail(emailNormalizado);
        }
        
        // Validação básica
        if (fornecedor.getFornecedor() == null || fornecedor.getFornecedor().trim().isEmpty()) {
            throw new RuntimeException("O nome do fornecedor é obrigatório");
        }
        
        if (fornecedor.getCpfCnpj() == null || fornecedor.getCpfCnpj().trim().isEmpty()) {
            throw new RuntimeException("O CPF/CNPJ é obrigatório");
        }
        
        return fornecedorRepository.save(fornecedor);
    }
    
    public void deleteById(Long id) {
        fornecedorRepository.deleteById(id);
    }
} 