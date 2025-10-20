package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContaReceber {
    private Long id;
    
    // Relacionamento com Nota de Saída
    private String notaNumero;
    private String notaModelo;
    private String notaSerie;
    private Long clienteId;
    
    // Dados da Parcela
    private Integer numeroParcela;
    private Integer totalParcelas;
    
    // Valores
    private BigDecimal valorOriginal;
    private BigDecimal valorRecebido;
    private BigDecimal valorDesconto;
    private BigDecimal valorJuros;
    private BigDecimal valorMulta;
    private BigDecimal valorTotal;
    
    // Datas
    private LocalDate dataEmissao;
    private LocalDate dataVencimento;
    private LocalDate dataRecebimento;
    
    // Forma de Pagamento
    private Long formaPagamentoId;
    
    // Status
    private String situacao; // PENDENTE, RECEBIDA, VENCIDA, CANCELADA, PARCIALMENTE_RECEBIDA
    
    // Observações
    private String observacoes;
    
    // Auditoria
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;
    
    // Relacionamentos
    private Cliente cliente;
    private FormaPagamento formaPagamento;
    
    // Constructors
    public ContaReceber() {
        this.valorRecebido = BigDecimal.ZERO;
        this.valorDesconto = BigDecimal.ZERO;
        this.valorJuros = BigDecimal.ZERO;
        this.valorMulta = BigDecimal.ZERO;
        this.situacao = "PENDENTE";
    }
    
    public ContaReceber(String notaNumero, String notaModelo, String notaSerie, Long clienteId,
                        Integer numeroParcela, Integer totalParcelas, BigDecimal valorOriginal,
                        LocalDate dataEmissao, LocalDate dataVencimento) {
        this();
        this.notaNumero = notaNumero;
        this.notaModelo = notaModelo;
        this.notaSerie = notaSerie;
        this.clienteId = clienteId;
        this.numeroParcela = numeroParcela;
        this.totalParcelas = totalParcelas;
        this.valorOriginal = valorOriginal;
        this.valorTotal = valorOriginal;
        this.dataEmissao = dataEmissao;
        this.dataVencimento = dataVencimento;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public Integer getNumeroParcela() {
        return numeroParcela;
    }
    
    public void setNumeroParcela(Integer numeroParcela) {
        this.numeroParcela = numeroParcela;
    }
    
    public Integer getTotalParcelas() {
        return totalParcelas;
    }
    
    public void setTotalParcelas(Integer totalParcelas) {
        this.totalParcelas = totalParcelas;
    }
    
    public BigDecimal getValorOriginal() {
        return valorOriginal;
    }
    
    public void setValorOriginal(BigDecimal valorOriginal) {
        this.valorOriginal = valorOriginal;
    }
    
    public BigDecimal getValorRecebido() {
        return valorRecebido;
    }
    
    public void setValorRecebido(BigDecimal valorRecebido) {
        this.valorRecebido = valorRecebido;
    }
    
    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }
    
    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }
    
    public BigDecimal getValorJuros() {
        return valorJuros;
    }
    
    public void setValorJuros(BigDecimal valorJuros) {
        this.valorJuros = valorJuros;
    }
    
    public BigDecimal getValorMulta() {
        return valorMulta;
    }
    
    public void setValorMulta(BigDecimal valorMulta) {
        this.valorMulta = valorMulta;
    }
    
    public BigDecimal getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public LocalDate getDataEmissao() {
        return dataEmissao;
    }
    
    public void setDataEmissao(LocalDate dataEmissao) {
        this.dataEmissao = dataEmissao;
    }
    
    public LocalDate getDataVencimento() {
        return dataVencimento;
    }
    
    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }
    
    public LocalDate getDataRecebimento() {
        return dataRecebimento;
    }
    
    public void setDataRecebimento(LocalDate dataRecebimento) {
        this.dataRecebimento = dataRecebimento;
    }
    
    public Long getFormaPagamentoId() {
        return formaPagamentoId;
    }
    
    public void setFormaPagamentoId(Long formaPagamentoId) {
        this.formaPagamentoId = formaPagamentoId;
    }
    
    public String getSituacao() {
        return situacao;
    }
    
    public void setSituacao(String situacao) {
        this.situacao = situacao;
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
    
    public Cliente getCliente() {
        return cliente;
    }
    
    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
    
    public FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }
    
    public void setFormaPagamento(FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}

