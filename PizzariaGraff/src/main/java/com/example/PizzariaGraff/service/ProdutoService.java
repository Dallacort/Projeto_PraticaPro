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
        // Validações obrigatórias
        validarCamposObrigatorios(produto);
        
        // Verificar duplicatas de código de barras e referência se preenchidos
        if (produto.getCodigoBarras() != null && !produto.getCodigoBarras().trim().isEmpty()) {
            verificarCodigoBarrasDuplicado(produto.getCodigoBarras(), produto.getId());
        }
        
        if (produto.getReferencia() != null && !produto.getReferencia().trim().isEmpty()) {
            verificarReferenciaDuplicada(produto.getReferencia(), produto.getId());
        }
        
        return produtoRepository.save(produto);
    }
    
    private void validarCamposObrigatorios(Produto produto) {
        if (produto.getProduto() == null || produto.getProduto().trim().isEmpty()) {
            throw new RuntimeException("O nome do produto é obrigatório");
        }
        
        if (produto.getMarcaId() == null) {
            throw new RuntimeException("A marca é obrigatória");
        }
        
        if (produto.getUnidadeMedidaId() == null) {
            throw new RuntimeException("A unidade de medida é obrigatória");
        }
        
        if (produto.getCategoriaId() == null) {
            throw new RuntimeException("A categoria é obrigatória");
        }
        
        if (produto.getValorCompra() == null || produto.getValorCompra().doubleValue() <= 0) {
            throw new RuntimeException("O valor de compra deve ser maior que zero");
        }
        
        if (produto.getValorVenda() == null || produto.getValorVenda().doubleValue() <= 0) {
            throw new RuntimeException("O valor de venda deve ser maior que zero");
        }
        
        if (produto.getPercentualLucro() == null || produto.getPercentualLucro().doubleValue() < 0) {
            throw new RuntimeException("O percentual de lucro não pode ser negativo");
        }
        
        if (produto.getQuantidade() == null || produto.getQuantidade() < 0) {
            throw new RuntimeException("A quantidade não pode ser negativa");
        }
        
        if (produto.getQuantidadeMinima() == null || produto.getQuantidadeMinima() < 0) {
            throw new RuntimeException("A quantidade mínima não pode ser negativa");
        }
        
        // Campos opcionais: codigoBarras, referencia, descricao, observacoes
        // Não precisam de validação de obrigatoriedade
    }
    
    private void verificarCodigoBarrasDuplicado(String codigoBarras, Long produtoId) {
        if (codigoBarras == null || codigoBarras.trim().isEmpty()) {
            return;
        }
        
        Optional<Produto> produtoExistente = produtoRepository.findByCodigoBarras(codigoBarras);
        
        if (produtoExistente.isPresent()) {
            // Se é um produto diferente (não é uma atualização do mesmo)
            if (produtoId == null || !produtoExistente.get().getId().equals(produtoId)) {
                throw new RuntimeException("Já existe um produto cadastrado com este código de barras");
            }
        }
    }
    
    private void verificarReferenciaDuplicada(String referencia, Long produtoId) {
        if (referencia == null || referencia.trim().isEmpty()) {
            return;
        }
        
        Optional<Produto> produtoExistente = produtoRepository.findByReferencia(referencia);
        
        if (produtoExistente.isPresent()) {
            // Se é um produto diferente (não é uma atualização do mesmo)
            if (produtoId == null || !produtoExistente.get().getId().equals(produtoId)) {
                throw new RuntimeException("Já existe um produto cadastrado com esta referência");
            }
        }
    }
    
    public void deleteById(Long id) {
        produtoRepository.deleteById(id);
    }
} 