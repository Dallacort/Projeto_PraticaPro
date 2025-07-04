package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Produto {
    private Long id;
    private String produto;              // varchar(255)
    private Long unidadeMedidaId;        // bigint(20) - FK para UnidadeMedida
    private String codigoBarras;         // varchar(255) NOT NULL
    private String referencia;           // varchar(10) NOT NULL
    private Long marcaId;                // bigint(20) - FK para Marca
    private Long categoriaId;            // bigint(20) - FK para Categoria
    private Integer quantidadeMinima;    // int(11)
    private BigDecimal valorCompra;      // decimal(10,2)
    private BigDecimal valorVenda;       // decimal(10,2)
    private Integer quantidade;          // int(11)
    private BigDecimal percentualLucro;  // decimal(10,2)
    private String descricao;            // varchar(255) NOT NULL
    private String observacoes;          // varchar(255) NOT NULL
    private LocalDateTime dataCriacao;   // timestamp NOT NULL
    private LocalDateTime dataAlteracao; // timestamp NOT NULL
    
    // Campo ativo para controle de status
    private Boolean ativo;
    
    // Relacionamentos
    private UnidadeMedida unidadeMedida;
    private Marca marca;
    private Categoria categoria;
    
    // Nomes dos relacionamentos para DTO
    private String marcaNome;
    private String unidadeMedidaNome;
    private String categoriaNome;

    // Constructors
    public Produto() {}

    public Produto(String produto, String codigoBarras, String referencia, String descricao, String observacoes) {
        this.produto = produto;
        this.codigoBarras = codigoBarras;
        this.referencia = referencia;
        this.descricao = descricao;
        this.observacoes = observacoes;
        this.ativo = true;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProduto() {
        return produto;
    }

    public void setProduto(String produto) {
        this.produto = produto;
    }

    public Long getUnidadeMedidaId() {
        return unidadeMedidaId;
    }

    public void setUnidadeMedidaId(Long unidadeMedidaId) {
        this.unidadeMedidaId = unidadeMedidaId;
    }

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public Long getMarcaId() {
        return marcaId;
    }

    public void setMarcaId(Long marcaId) {
        this.marcaId = marcaId;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public Integer getQuantidadeMinima() {
        return quantidadeMinima;
    }

    public void setQuantidadeMinima(Integer quantidadeMinima) {
        this.quantidadeMinima = quantidadeMinima;
    }

    public BigDecimal getValorCompra() {
        return valorCompra;
    }

    public void setValorCompra(BigDecimal valorCompra) {
        this.valorCompra = valorCompra;
    }

    public BigDecimal getValorVenda() {
        return valorVenda;
    }

    public void setValorVenda(BigDecimal valorVenda) {
        this.valorVenda = valorVenda;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getPercentualLucro() {
        return percentualLucro;
    }

    public void setPercentualLucro(BigDecimal percentualLucro) {
        this.percentualLucro = percentualLucro;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAlteracao() {
        return dataAlteracao;
    }

    public void setDataAlteracao(LocalDateTime dataAlteracao) {
        this.dataAlteracao = dataAlteracao;
    }

    public Boolean getAtivo() {
        return ativo != null ? ativo : true;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public UnidadeMedida getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(UnidadeMedida unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

    public Marca getMarca() {
        return marca;
    }

    public void setMarca(Marca marca) {
        this.marca = marca;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getMarcaNome() {
        return marcaNome;
    }

    public void setMarcaNome(String marcaNome) {
        this.marcaNome = marcaNome;
    }

    public String getUnidadeMedidaNome() {
        return unidadeMedidaNome;
    }

    public void setUnidadeMedidaNome(String unidadeMedidaNome) {
        this.unidadeMedidaNome = unidadeMedidaNome;
    }

    public String getCategoriaNome() {
        return categoriaNome;
    }

    public void setCategoriaNome(String categoriaNome) {
        this.categoriaNome = categoriaNome;
    }

    @Override
    public String toString() {
        return "Produto{" +
                "id=" + id +
                ", produto='" + produto + '\'' +
                ", codigoBarras='" + codigoBarras + '\'' +
                ", referencia='" + referencia + '\'' +
                ", valorCompra=" + valorCompra +
                ", valorVenda=" + valorVenda +
                ", quantidade=" + quantidade +
                ", ativo=" + ativo +
                '}';
    }
} 