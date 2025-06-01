package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.ProdutoFornecedor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProdutoFornecedorDTO {
    private Long id;
    private Long produtoId;
    private String produtoNome;
    private String produtoCodigo;
    private Long fornecedorId;
    private String fornecedorNome;
    private String codigoProd;
    private BigDecimal custo;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public ProdutoFornecedorDTO() {
    }
    
    public ProdutoFornecedorDTO(Long id, Long produtoId, String produtoNome, String produtoCodigo, 
                             Long fornecedorId, String fornecedorNome, String codigoProd, 
                             BigDecimal custo, Boolean ativo) {
        this.id = id;
        this.produtoId = produtoId;
        this.produtoNome = produtoNome;
        this.produtoCodigo = produtoCodigo;
        this.fornecedorId = fornecedorId;
        this.fornecedorNome = fornecedorNome;
        this.codigoProd = codigoProd;
        this.custo = custo;
        this.ativo = ativo;
    }
    
    // Método de conversão de Entity para DTO
    public static ProdutoFornecedorDTO fromEntity(ProdutoFornecedor produtoFornecedor) {
        if (produtoFornecedor == null) {
            return null;
        }
        
        ProdutoFornecedorDTO dto = new ProdutoFornecedorDTO();
        dto.setId(produtoFornecedor.getId());
        dto.setCodigoProd(produtoFornecedor.getCodigoProd());
        dto.setCusto(produtoFornecedor.getCusto());
        dto.setAtivo(produtoFornecedor.getAtivo());
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(produtoFornecedor.getDataCadastro() != null ? 
                            produtoFornecedor.getDataCadastro() : 
                            LocalDateTime.now());
        
        dto.setUltimaModificacao(produtoFornecedor.getUltimaModificacao() != null ? 
                                produtoFornecedor.getUltimaModificacao() : 
                                LocalDateTime.now());
        
        if (produtoFornecedor.getProduto() != null) {
            dto.setProdutoId(produtoFornecedor.getProduto().getId());
            dto.setProdutoNome(produtoFornecedor.getProduto().getProduto());
            dto.setProdutoCodigo(produtoFornecedor.getProduto().getCodigoBarras());
        }
        
        if (produtoFornecedor.getFornecedor() != null) {
            dto.setFornecedorId(produtoFornecedor.getFornecedor().getId());
            dto.setFornecedorNome(produtoFornecedor.getFornecedor().getFornecedor());
        }
        
        return dto;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }

    public String getProdutoNome() {
        return produtoNome;
    }

    public void setProdutoNome(String produtoNome) {
        this.produtoNome = produtoNome;
    }

    public String getProdutoCodigo() {
        return produtoCodigo;
    }

    public void setProdutoCodigo(String produtoCodigo) {
        this.produtoCodigo = produtoCodigo;
    }

    public Long getFornecedorId() {
        return fornecedorId;
    }

    public void setFornecedorId(Long fornecedorId) {
        this.fornecedorId = fornecedorId;
    }

    public String getFornecedorNome() {
        return fornecedorNome;
    }

    public void setFornecedorNome(String fornecedorNome) {
        this.fornecedorNome = fornecedorNome;
    }

    public String getCodigoProd() {
        return codigoProd;
    }

    public void setCodigoProd(String codigoProd) {
        this.codigoProd = codigoProd;
    }

    public BigDecimal getCusto() {
        return custo;
    }

    public void setCusto(BigDecimal custo) {
        this.custo = custo;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
    
    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public LocalDateTime getUltimaModificacao() {
        return ultimaModificacao;
    }

    public void setUltimaModificacao(LocalDateTime ultimaModificacao) {
        this.ultimaModificacao = ultimaModificacao;
    }
} 