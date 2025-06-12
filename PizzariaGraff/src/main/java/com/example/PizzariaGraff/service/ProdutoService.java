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
    
    public List<Produto> findByAtivoTrue() {
        return produtoRepository.findByAtivoTrue();
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
        System.out.println("=== DEBUG PRODUTO SAVE ===");
        System.out.println("Produto recebido: " + produto);
        System.out.println("ID: " + produto.getId());
        System.out.println("Nome: " + produto.getProduto());
        System.out.println("Código de barras: " + produto.getCodigoBarras());
        System.out.println("Referência: " + produto.getReferencia());
        System.out.println("Descrição: " + produto.getDescricao());
        System.out.println("Observações: " + produto.getObservacoes());
        System.out.println("Marca ID: " + produto.getMarcaId());
        System.out.println("Unidade Medida ID: " + produto.getUnidadeMedidaId());
        System.out.println("Ativo: " + produto.getAtivo());
        
        System.out.println("Salvando produto...");
        
        return produtoRepository.save(produto);
    }
    
    public void deleteById(Long id) {
        produtoRepository.deleteById(id);
    }
} 