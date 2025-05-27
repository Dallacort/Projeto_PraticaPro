package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ProdutoFornecedor;
import com.example.PizzariaGraff.repository.ProdutoFornecedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoFornecedorService {
    
    private final ProdutoFornecedorRepository produtoFornecedorRepository;
    
    public ProdutoFornecedorService(ProdutoFornecedorRepository produtoFornecedorRepository) {
        this.produtoFornecedorRepository = produtoFornecedorRepository;
    }
    
    public List<ProdutoFornecedor> findAll() {
        return produtoFornecedorRepository.findAll();
    }
    
    public List<ProdutoFornecedor> findByAtivoTrue() {
        return produtoFornecedorRepository.findByAtivoTrue();
    }
    
    public ProdutoFornecedor findById(Long id) {
        return produtoFornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto do fornecedor não encontrado com o ID: " + id));
    }
    
    public List<ProdutoFornecedor> findByProdutoId(Long produtoId) {
        return produtoFornecedorRepository.findByProdutoId(produtoId);
    }
    
    public List<ProdutoFornecedor> findByFornecedorId(Long fornecedorId) {
        return produtoFornecedorRepository.findByFornecedorId(fornecedorId);
    }
    
    public ProdutoFornecedor save(ProdutoFornecedor produtoFornecedor) {
        return produtoFornecedorRepository.save(produtoFornecedor);
    }
    
    public void deleteById(Long id) {
        produtoFornecedorRepository.deleteById(id);
    }
} 