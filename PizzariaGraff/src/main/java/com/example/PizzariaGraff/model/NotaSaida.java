package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NotaSaida {
    private String numero;
    private String modelo;
    private String serie;
    private Long clienteId;
    private LocalDate dataEmissao;
    private LocalDate dataSaida;
    private String tipoFrete; // CIF, FOB, SEM
    private BigDecimal valorProdutos;
    private BigDecimal valorFrete;
    private BigDecimal valorSeguro;
    private BigDecimal outrasDespesas;
    private BigDecimal valorDesconto;
    private BigDecimal valorTotal;
    private Long condicaoPagamentoId;
    private Long transportadoraId;
    private String placaVeiculo;
    private String observacoes;
    private String situacao; // PENDENTE, CONFIRMADA, CANCELADA
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;
    
    // Relacionamentos
    private Cliente cliente;
    private CondicaoPagamento condicaoPagamento;
    private Transportadora transportadora;
    private List<ProdutoNotaSaida> produtos = new ArrayList<>();
    
    // Constructors
    public NotaSaida() {}
    
    public NotaSaida(String numero, String modelo, String serie, Long clienteId) {
        this.numero = numero;
        this.modelo = modelo;
        this.serie = serie;
        this.clienteId = clienteId;
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
    
    public Long getClienteId() {
        return clienteId;
    }
    
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
    
    public LocalDate getDataEmissao() {
        return dataEmissao;
    }
    
    public void setDataEmissao(LocalDate dataEmissao) {
        this.dataEmissao = dataEmissao;
    }
    
    public LocalDate getDataSaida() {
        return dataSaida;
    }
    
    public void setDataSaida(LocalDate dataSaida) {
        this.dataSaida = dataSaida;
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
    
    public Long getTransportadoraId() {
        return transportadoraId;
    }
    
    public void setTransportadoraId(Long transportadoraId) {
        this.transportadoraId = transportadoraId;
    }
    
    public String getPlacaVeiculo() {
        return placaVeiculo;
    }
    
    public void setPlacaVeiculo(String placaVeiculo) {
        this.placaVeiculo = placaVeiculo;
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
    
    public Cliente getCliente() {
        return cliente;
    }
    
    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
    
    public CondicaoPagamento getCondicaoPagamento() {
        return condicaoPagamento;
    }
    
    public void setCondicaoPagamento(CondicaoPagamento condicaoPagamento) {
        this.condicaoPagamento = condicaoPagamento;
    }
    
    public Transportadora getTransportadora() {
        return transportadora;
    }
    
    public void setTransportadora(Transportadora transportadora) {
        this.transportadora = transportadora;
    }
    
    public List<ProdutoNotaSaida> getProdutos() {
        return produtos;
    }
    
    public void setProdutos(List<ProdutoNotaSaida> produtos) {
        this.produtos = produtos;
    }
    
    public void addProduto(ProdutoNotaSaida produto) {
        this.produtos.add(produto);
    }
}








