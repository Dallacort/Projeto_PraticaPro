package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Produto;
import com.example.PizzariaGraff.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {
    
    private final ProdutoRepository produtoRepository;
    
    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }
    
    public List<Produto> findAll() {
        return produtoRepository.findAll();
    }
    
    public List<Produto> findByAtivoTrue() {
        return produtoRepository.findByAtivoTrue();
    }
    
    public Produto findById(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com o ID: " + id));
    }
    
    public Produto findByCodigo(String codigo) {
        return produtoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com o código: " + codigo));
    }
    
    public Produto save(Produto produto) {
        return produtoRepository.save(produto);
    }
    
    public void deleteById(Long id) {
        produtoRepository.deleteById(id);
    }
    
    public List<Produto> findByDescricaoContainingIgnoreCase(String termo) {
        return produtoRepository.findByDescricaoContainingIgnoreCase(termo);
    }
} 