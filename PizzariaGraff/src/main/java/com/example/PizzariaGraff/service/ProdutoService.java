package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Produto;
import com.example.PizzariaGraff.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {
    
    private final ProdutoRepository produtoRepository;
    
    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }
    
    public List<Produto> findAll() {
        return produtoRepository.findAll();
    }
    
    public Produto findById(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com o ID: " + id));
    }
    
    public List<Produto> findByProduto(String produto) {
        return produtoRepository.findByProduto(produto);
    }
    
    public Optional<Produto> findByCodigoBarras(String codigoBarras) {
        return produtoRepository.findByCodigoBarras(codigoBarras);
    }
    
    public Optional<Produto> findByReferencia(String referencia) {
        return produtoRepository.findByReferencia(referencia);
    }
    
    public Produto save(Produto produto) {
        // Validação básica
        if (produto.getProduto() == null || produto.getProduto().trim().isEmpty()) {
            throw new RuntimeException("O nome do produto é obrigatório");
        }
        
        if (produto.getCodigoBarras() == null || produto.getCodigoBarras().trim().isEmpty()) {
            throw new RuntimeException("O código de barras é obrigatório");
        }
        
        if (produto.getReferencia() == null || produto.getReferencia().trim().isEmpty()) {
            throw new RuntimeException("A referência é obrigatória");
        }
        
        if (produto.getDescricao() == null || produto.getDescricao().trim().isEmpty()) {
            throw new RuntimeException("A descrição é obrigatória");
        }
        
        if (produto.getObservacoes() == null || produto.getObservacoes().trim().isEmpty()) {
            throw new RuntimeException("As observações são obrigatórias");
        }
        
        if (produto.getMarcaId() == null) {
            throw new RuntimeException("A marca é obrigatória");
        }
        
        if (produto.getUnidadeMedidaId() == null) {
            throw new RuntimeException("A unidade de medida é obrigatória");
        }
        
        if (produto.getSituacao() == null) {
            throw new RuntimeException("A situação é obrigatória");
        }
        
        return produtoRepository.save(produto);
    }
    
    public void deleteById(Long id) {
        produtoRepository.deleteById(id);
    }
} 