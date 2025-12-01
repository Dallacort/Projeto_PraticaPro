package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContaPagarAvulsa {
    private Long id;
    
    // Dados da Nota (opcionais para nota avulsa)
    private String numeroNota;
    private String modelo;
    private String serie;
    
    // Fornecedor
    private Long fornecedorId;
    
    // Dados da Parcela
    private Integer numParcela;
    private BigDecimal valorParcela;
    
    // Datas
    private LocalDate dataEmissao;
    private LocalDate dataVencimento;
    private LocalDate dataPagamento;
    
    // Valores
    private BigDecimal valorPago;
    private BigDecimal juros;
    private BigDecimal multa;
    private BigDecimal desconto;
    
    // Status
    private String status; // PENDENTE, PAGA, VENCIDA, CANCELADA
    
    // Forma de Pagamento
    private Long formaPagamentoId;
    
    // Observações
    private String observacao;
    
    // Auditoria
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    
    // Relacionamentos
    private Fornecedor fornecedor;
    private FormaPagamento formaPagamento;
    
    // Constructors
    public ContaPagarAvulsa() {
        this.valorPago = BigDecimal.ZERO;
        this.juros = BigDecimal.ZERO;
        this.multa = BigDecimal.ZERO;
        this.desconto = BigDecimal.ZERO;
        this.status = "PENDENTE";
        this.numParcela = 1;
    }
    
    public ContaPagarAvulsa(String numeroNota, String modelo, String serie, Long fornecedorId,
                           Integer numParcela, BigDecimal valorParcela,
                           LocalDate dataEmissao, LocalDate dataVencimento) {
        this();
        this.numeroNota = numeroNota;
        this.modelo = modelo;
        this.serie = serie;
        this.fornecedorId = fornecedorId;
        this.numParcela = numParcela;
        this.valorParcela = valorParcela;
        this.dataEmissao = dataEmissao;
        this.dataVencimento = dataVencimento;
    }
    
    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNumeroNota() { return numeroNota; }
    public void setNumeroNota(String numeroNota) { this.numeroNota = numeroNota; }
    
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    
    public String getSerie() { return serie; }
    public void setSerie(String serie) { this.serie = serie; }
    
    public Long getFornecedorId() { return fornecedorId; }
    public void setFornecedorId(Long fornecedorId) { this.fornecedorId = fornecedorId; }
    
    public Integer getNumParcela() { return numParcela; }
    public void setNumParcela(Integer numParcela) { this.numParcela = numParcela; }
    
    public BigDecimal getValorParcela() { return valorParcela; }
    public void setValorParcela(BigDecimal valorParcela) { this.valorParcela = valorParcela; }
    
    public LocalDate getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(LocalDate dataEmissao) { this.dataEmissao = dataEmissao; }
    
    public LocalDate getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(LocalDate dataVencimento) { this.dataVencimento = dataVencimento; }
    
    public LocalDate getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(LocalDate dataPagamento) { this.dataPagamento = dataPagamento; }
    
    public BigDecimal getValorPago() { return valorPago; }
    public void setValorPago(BigDecimal valorPago) { this.valorPago = valorPago; }
    
    public BigDecimal getJuros() { return juros; }
    public void setJuros(BigDecimal juros) { this.juros = juros; }
    
    public BigDecimal getMulta() { return multa; }
    public void setMulta(BigDecimal multa) { this.multa = multa; }
    
    public BigDecimal getDesconto() { return desconto; }
    public void setDesconto(BigDecimal desconto) { this.desconto = desconto; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Long getFormaPagamentoId() { return formaPagamentoId; }
    public void setFormaPagamentoId(Long formaPagamentoId) { this.formaPagamentoId = formaPagamentoId; }
    
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    
    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
    
    public Fornecedor getFornecedor() { return fornecedor; }
    public void setFornecedor(Fornecedor fornecedor) { this.fornecedor = fornecedor; }
    
    public FormaPagamento getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(FormaPagamento formaPagamento) { this.formaPagamento = formaPagamento; }
    
    // Método para calcular valor total
    // Juros e multa só são somados se houver data de pagamento E se a data de pagamento for depois do vencimento
    public BigDecimal calcularValorTotal() {
        BigDecimal total = valorParcela;
        
        // Só somar juros e multa se o pagamento foi feito depois do vencimento
        if (dataPagamento != null && dataVencimento != null && dataPagamento.isAfter(dataVencimento)) {
            total = total.add(juros != null ? juros : BigDecimal.ZERO);
            total = total.add(multa != null ? multa : BigDecimal.ZERO);
        }
        
        total = total.subtract(desconto != null ? desconto : BigDecimal.ZERO);
        
        return total;
    }
}

