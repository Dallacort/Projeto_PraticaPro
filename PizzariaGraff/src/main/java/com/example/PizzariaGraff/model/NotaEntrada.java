package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NotaEntrada {
    private String numero;
    private String modelo;
    private String serie;
    private Long fornecedorId;
    private LocalDate dataEmissao;
    private LocalDate dataChegada;
    private String tipoFrete; // CIF, FOB, SEM
    private BigDecimal valorProdutos;
    private BigDecimal valorFrete;
    private BigDecimal valorSeguro;
    private BigDecimal outrasDespesas;
    private BigDecimal valorDesconto;
    private BigDecimal valorTotal;
    private Long condicaoPagamentoId;
    private String observacoes;
    private String situacao; // PENDENTE, CONFIRMADA, CANCELADA
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;
    
    // Relacionamentos
    private Fornecedor fornecedor;
    private CondicaoPagamento condicaoPagamento;
    private List<ProdutoNota> produtos = new ArrayList<>();
    
    // Constructors
    public NotaEntrada() {}
    
    public NotaEntrada(String numero, String modelo, String serie, Long fornecedorId) {
        this.numero = numero;
        this.modelo = modelo;
        this.serie = serie;
        this.fornecedorId = fornecedorId;
        this.situacao = "PENDENTE";
        this.tipoFrete = "CIF";
        this.valorProdutos = BigDecimal.ZERO;
        this.valorFrete = BigDecimal.ZERO;
        this.valorSeguro = BigDecimal.ZERO;
        this.outrasDespesas = BigDecimal.ZERO;
        this.valorDesconto = BigDecimal.ZERO;
        this.valorTotal = BigDecimal.ZERO;
    }
    
    // Getters e Setters
    public String getNumero() {
        return numero;
    }
    
    public void setNumero(String numero) {
        this.numero = numero;
    }
    
    public String getModelo() {
        return modelo;
    }
    
    public void setModelo(String modelo) {
        this.modelo = modelo;
    }
    
    public String getSerie() {
        return serie;
    }
    
    public void setSerie(String serie) {
        this.serie = serie;
    }
    
    public Long getFornecedorId() {
        return fornecedorId;
    }
    
    public void setFornecedorId(Long fornecedorId) {
        this.fornecedorId = fornecedorId;
    }
    
    public LocalDate getDataEmissao() {
        return dataEmissao;
    }
    
    public void setDataEmissao(LocalDate dataEmissao) {
        this.dataEmissao = dataEmissao;
    }
    
    public LocalDate getDataChegada() {
        return dataChegada;
    }
    
    public void setDataChegada(LocalDate dataChegada) {
        this.dataChegada = dataChegada;
    }
    
    public String getTipoFrete() {
        return tipoFrete;
    }
    
    public void setTipoFrete(String tipoFrete) {
        this.tipoFrete = tipoFrete;
    }
    
    public BigDecimal getValorProdutos() {
        return valorProdutos;
    }
    
    public void setValorProdutos(BigDecimal valorProdutos) {
        this.valorProdutos = valorProdutos;
    }
    
    public BigDecimal getValorFrete() {
        return valorFrete;
    }
    
    public void setValorFrete(BigDecimal valorFrete) {
        this.valorFrete = valorFrete;
    }
    
    public BigDecimal getValorSeguro() {
        return valorSeguro;
    }
    
    public void setValorSeguro(BigDecimal valorSeguro) {
        this.valorSeguro = valorSeguro;
    }
    
    public BigDecimal getOutrasDespesas() {
        return outrasDespesas;
    }
    
    public void setOutrasDespesas(BigDecimal outrasDespesas) {
        this.outrasDespesas = outrasDespesas;
    }
    
    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }
    
    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }
    
    public BigDecimal getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public Long getCondicaoPagamentoId() {
        return condicaoPagamentoId;
    }
    
    public void setCondicaoPagamentoId(Long condicaoPagamentoId) {
        this.condicaoPagamentoId = condicaoPagamentoId;
    }
    
    public String getObservacoes() {
        return observacoes;
    }
    
    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
    
    public String getSituacao() {
        return situacao;
    }
    
    public void setSituacao(String situacao) {
        this.situacao = situacao;
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
    
    public Fornecedor getFornecedor() {
        return fornecedor;
    }
    
    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }
    
    public CondicaoPagamento getCondicaoPagamento() {
        return condicaoPagamento;
    }
    
    public void setCondicaoPagamento(CondicaoPagamento condicaoPagamento) {
        this.condicaoPagamento = condicaoPagamento;
    }
    
    public List<ProdutoNota> getProdutos() {
        return produtos;
    }
    
    public void setProdutos(List<ProdutoNota> produtos) {
        this.produtos = produtos;
    }
    
    public void addProduto(ProdutoNota produto) {
        this.produtos.add(produto);
    }
}

