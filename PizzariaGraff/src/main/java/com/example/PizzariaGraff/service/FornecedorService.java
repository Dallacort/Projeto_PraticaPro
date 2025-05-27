package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.repository.CidadeRepository;
import com.example.PizzariaGraff.repository.FornecedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;
    private final CidadeRepository cidadeRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository, CidadeRepository cidadeRepository) {
        this.fornecedorRepository = fornecedorRepository;
        this.cidadeRepository = cidadeRepository;
    }

    public List<Fornecedor> findAll() {
        return fornecedorRepository.findAll();
    }
    
    public List<Fornecedor> findByAtivoTrue() {
        return fornecedorRepository.findByAtivoTrue();
    }
    
    public Fornecedor findById(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com o ID: " + id));
    }
    
    public Fornecedor findByCnpj(String cnpj) {
        String cnpjLimpo = cnpj != null ? cnpj.replaceAll("[^0-9]", "") : "";
        return fornecedorRepository.findByCnpj(cnpjLimpo)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com o CNPJ: " + cnpj));
    }
    
    public List<Fornecedor> findByNomeContainingIgnoreCase(String nome) {
        return fornecedorRepository.findByNomeContainingIgnoreCase(nome);
    }
    
    public Fornecedor save(Fornecedor fornecedor) {
        // Normalização de dados
        if (fornecedor.getCnpj() != null) {
            String cnpjLimpo = fornecedor.getCnpj().replaceAll("[^0-9]", "");
            fornecedor.setCnpj(cnpjLimpo);
        }
        
        if (fornecedor.getEmail() != null) {
            String emailNormalizado = fornecedor.getEmail().trim().toLowerCase();
            fornecedor.setEmail(emailNormalizado);
        }
        
        // Validação básica
        if (fornecedor.getRazaoSocial() == null || fornecedor.getRazaoSocial().trim().isEmpty()) {
            throw new RuntimeException("A razão social é obrigatória");
        }
        
        if (fornecedor.getCnpj() == null || fornecedor.getCnpj().trim().isEmpty()) {
            throw new RuntimeException("O CNPJ é obrigatório");
        }
        
        return fornecedorRepository.save(fornecedor);
    }
    
    public void deleteById(Long id) {
        fornecedorRepository.deleteById(id);
    }
} 