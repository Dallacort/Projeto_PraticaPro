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
        System.out.println("Situação: " + produto.getSituacao());
        
        // Validações temporariamente desabilitadas para debug
        /*
        // Validação básica
        if (produto.getProduto() == null || produto.getProduto().trim().isEmpty()) {
            System.out.println("ERRO: Nome do produto é obrigatório");
            throw new RuntimeException("O nome do produto é obrigatório");
        }
        
        if (produto.getCodigoBarras() == null || produto.getCodigoBarras().trim().isEmpty()) {
            System.out.println("ERRO: Código de barras é obrigatório");
            throw new RuntimeException("O código de barras é obrigatório");
        }
        
        if (produto.getReferencia() == null || produto.getReferencia().trim().isEmpty()) {
            System.out.println("ERRO: Referência é obrigatória");
            throw new RuntimeException("A referência é obrigatória");
        }
        
        if (produto.getDescricao() == null || produto.getDescricao().trim().isEmpty()) {
            System.out.println("ERRO: Descrição é obrigatória");
            throw new RuntimeException("A descrição é obrigatória");
        }
        
        if (produto.getObservacoes() == null || produto.getObservacoes().trim().isEmpty()) {
            System.out.println("ERRO: Observações são obrigatórias");
            throw new RuntimeException("As observações são obrigatórias");
        }
        
        if (produto.getMarcaId() == null) {
            System.out.println("ERRO: Marca é obrigatória");
            throw new RuntimeException("A marca é obrigatória");
        }
        
        if (produto.getUnidadeMedidaId() == null) {
            System.out.println("ERRO: Unidade de medida é obrigatória");
            throw new RuntimeException("A unidade de medida é obrigatória");
        }
        
        if (produto.getSituacao() == null) {
            System.out.println("ERRO: Situação é obrigatória");
            throw new RuntimeException("A situação é obrigatória");
        }
        */
        
        System.out.println("Validações desabilitadas, salvando produto...");
        
        return produtoRepository.save(produto);
    }
    
    public void deleteById(Long id) {
        produtoRepository.deleteById(id);
    }
} 