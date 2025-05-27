package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Produto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProdutoDTO {
    private Long id;
    private String codigo;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    public ProdutoDTO() {
    }
    
    public ProdutoDTO(Long id, String codigo, String nome, String descricao, BigDecimal preco, Boolean ativo) {
        this.id = id;
        this.codigo = codigo;
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.ativo = ativo;
    }
    
    public static ProdutoDTO fromEntity(Produto produto) {
        if (produto == null) {
            return null;
        }
        
        ProdutoDTO dto = new ProdutoDTO();
        dto.setId(produto.getId());
        dto.setCodigo(produto.getCodigo());
        dto.setNome(produto.getNome());
        dto.setDescricao(produto.getDescricao());
        dto.setPreco(produto.getPreco());
        dto.setAtivo(produto.getAtivo());
        dto.setDataCadastro(produto.getDataCadastro());
        dto.setUltimaModificacao(produto.getUltimaModificacao());
        return dto;
    }
    
    public Produto toEntity() {
        Produto produto = new Produto();
        produto.setId(this.id);
        produto.setCodigo(this.codigo);
        produto.setNome(this.nome);
        produto.setDescricao(this.descricao);
        produto.setPreco(this.preco);
        produto.setAtivo(this.ativo);
        produto.setDataCadastro(this.dataCadastro);
        produto.setUltimaModificacao(this.ultimaModificacao);
        return produto;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
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