package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProdutoNotaSaida {
    private String notaNumero;
    private String notaModelo;
    private String notaSerie;
    private Long clienteId;
    private Long produtoId;
    private Integer sequencia;
    private BigDecimal quantidade;
    private BigDecimal valorUnitario;
    private BigDecimal valorDesconto;
    private BigDecimal percentualDesconto;
    private BigDecimal valorTotal;
    private BigDecimal rateioFrete;
    private BigDecimal rateioSeguro;
    private BigDecimal rateioOutras;
    private BigDecimal custoPrecoFinal;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;
    
    // Relacionamento
    private Produto produto;
    
    // Constructors
    public ProdutoNotaSaida() {
        this.sequencia = 1;
        this.valorDesconto = BigDecimal.ZERO;
        this.percentualDesconto = BigDecimal.ZERO;
        this.rateioFrete = BigDecimal.ZERO;
        this.rateioSeguro = BigDecimal.ZERO;
        this.rateioOutras = BigDecimal.ZERO;
    }
    
    // Getters e Setters
    public String getNotaNumero() {
        return notaNumero;
    }
    
    public void setNotaNumero(String notaNumero) {
        this.notaNumero = notaNumero;
    }
    
    public String getNotaModelo() {
        return notaModelo;
    }
    
    public void setNotaModelo(String notaModelo) {
        this.notaModelo = notaModelo;
    }
    
    public String getNotaSerie() {
        return notaSerie;
    }
    
    public void setNotaSerie(String notaSerie) {
        this.notaSerie = notaSerie;
    }
    
    public Long getClienteId() {
        return clienteId;
    }
    
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
    
    public Long getProdutoId() {
        return produtoId;
    }
    
    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }
    
    public Integer getSequencia() {
        return sequencia;
    }
    
    public void setSequencia(Integer sequencia) {
        this.sequencia = sequencia;
    }
    
    public BigDecimal getQuantidade() {
        return quantidade;
    }
    
    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }
    
    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }
    
    public void setValorUnitario(BigDecimal valorUnitario) {
        this.valorUnitario = valorUnitario;
    }
    
    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }
    
    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }
    
    public BigDecimal getPercentualDesconto() {
        return percentualDesconto;
    }
    
    public void setPercentualDesconto(BigDecimal percentualDesconto) {
        this.percentualDesconto = percentualDesconto;
    }
    
    public BigDecimal getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public BigDecimal getRateioFrete() {
        return rateioFrete;
    }
    
    public void setRateioFrete(BigDecimal rateioFrete) {
        this.rateioFrete = rateioFrete;
    }
    
    public BigDecimal getRateioSeguro() {
        return rateioSeguro;
    }
    
    public void setRateioSeguro(BigDecimal rateioSeguro) {
        this.rateioSeguro = rateioSeguro;
    }
    
    public BigDecimal getRateioOutras() {
        return rateioOutras;
    }
    
    public void setRateioOutras(BigDecimal rateioOutras) {
        this.rateioOutras = rateioOutras;
    }
    
    public BigDecimal getCustoPrecoFinal() {
        return custoPrecoFinal;
    }
    
    public void setCustoPrecoFinal(BigDecimal custoPrecoFinal) {
        this.custoPrecoFinal = custoPrecoFinal;
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
    
    public Produto getProduto() {
        return produto;
    }
    
    public void setProduto(Produto produto) {
        this.produto = produto;
    }
}

