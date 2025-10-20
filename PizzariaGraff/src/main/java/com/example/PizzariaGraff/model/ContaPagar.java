package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContaPagar {
    private Long id;
    
    // Relacionamento com Nota de Entrada
    private String notaNumero;
    private String notaModelo;
    private String notaSerie;
    private Long fornecedorId;
    
    // Dados da Parcela
    private Integer numeroParcela;
    private Integer totalParcelas;
    
    // Valores
    private BigDecimal valorOriginal;
    private BigDecimal valorPago;
    private BigDecimal valorDesconto;
    private BigDecimal valorJuros;
    private BigDecimal valorMulta;
    private BigDecimal valorTotal;
    
    // Datas
    private LocalDate dataEmissao;
    private LocalDate dataVencimento;
    private LocalDate dataPagamento;
    
    // Forma de Pagamento
    private Long formaPagamentoId;
    
    // Status
    private String situacao; // PENDENTE, PAGA, VENCIDA, CANCELADA, PARCIALMENTE_PAGA
    
    // Observações
    private String observacoes;
    
    // Auditoria
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;
    
    // Relacionamentos
    private Fornecedor fornecedor;
    private FormaPagamento formaPagamento;
    
    // Constructors
    public ContaPagar() {
        this.valorPago = BigDecimal.ZERO;
        this.valorDesconto = BigDecimal.ZERO;
        this.valorJuros = BigDecimal.ZERO;
        this.valorMulta = BigDecimal.ZERO;
        this.situacao = "PENDENTE";
    }
    
    public ContaPagar(String notaNumero, String notaModelo, String notaSerie, Long fornecedorId,
                      Integer numeroParcela, Integer totalParcelas, BigDecimal valorOriginal,
                      LocalDate dataEmissao, LocalDate dataVencimento) {
        this();
        this.notaNumero = notaNumero;
        this.notaModelo = notaModelo;
        this.notaSerie = notaSerie;
        this.fornecedorId = fornecedorId;
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
    
    public Long getFornecedorId() {
        return fornecedorId;
    }
    
    public void setFornecedorId(Long fornecedorId) {
        this.fornecedorId = fornecedorId;
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
    
    public BigDecimal getValorPago() {
        return valorPago;
    }
    
    public void setValorPago(BigDecimal valorPago) {
        this.valorPago = valorPago;
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
    
    public LocalDate getDataPagamento() {
        return dataPagamento;
    }
    
    public void setDataPagamento(LocalDate dataPagamento) {
        this.dataPagamento = dataPagamento;
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
    
    public Fornecedor getFornecedor() {
        return fornecedor;
    }
    
    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }
    
    public FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }
    
    public void setFormaPagamento(FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}

