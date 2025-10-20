package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.ContaPagar;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para representar uma Conta a Pagar")
public class ContaPagarDTO {
    
    @Schema(description = "ID da conta", example = "1")
    private Long id;
    
    @Schema(description = "Número da nota", example = "123")
    private String notaNumero;
    
    @Schema(description = "Modelo da nota", example = "55")
    private String notaModelo;
    
    @Schema(description = "Série da nota", example = "1")
    private String notaSerie;
    
    @Schema(description = "ID do fornecedor", example = "1")
    private Long fornecedorId;
    
    @Schema(description = "Nome do fornecedor")
    private String fornecedorNome;
    
    @Schema(description = "Número da parcela", example = "1")
    private Integer numeroParcela;
    
    @Schema(description = "Total de parcelas", example = "3")
    private Integer totalParcelas;
    
    @Schema(description = "Valor original", example = "1000.00")
    private BigDecimal valorOriginal;
    
    @Schema(description = "Valor pago", example = "0.00")
    private BigDecimal valorPago;
    
    @Schema(description = "Valor desconto", example = "0.00")
    private BigDecimal valorDesconto;
    
    @Schema(description = "Valor juros", example = "0.00")
    private BigDecimal valorJuros;
    
    @Schema(description = "Valor multa", example = "0.00")
    private BigDecimal valorMulta;
    
    @Schema(description = "Valor total", example = "1000.00")
    private BigDecimal valorTotal;
    
    @Schema(description = "Data de emissão", example = "2025-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataEmissao;
    
    @Schema(description = "Data de vencimento", example = "2025-01-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataVencimento;
    
    @Schema(description = "Data de pagamento", example = "2025-01-30")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataPagamento;
    
    @Schema(description = "ID da forma de pagamento", example = "1")
    private Long formaPagamentoId;
    
    @Schema(description = "Nome da forma de pagamento")
    private String formaPagamentoNome;
    
    @Schema(description = "Situação", example = "PENDENTE")
    private String situacao;
    
    @Schema(description = "Observações")
    private String observacoes;
    
    @Schema(description = "Data de criação")
    private LocalDateTime dataCriacao;
    
    @Schema(description = "Data de alteração")
    private LocalDateTime dataAlteracao;
    
    // Constructors
    public ContaPagarDTO() {}
    
    public ContaPagarDTO(ContaPagar conta) {
        this.id = conta.getId();
        this.notaNumero = conta.getNotaNumero();
        this.notaModelo = conta.getNotaModelo();
        this.notaSerie = conta.getNotaSerie();
        this.fornecedorId = conta.getFornecedorId();
        this.numeroParcela = conta.getNumeroParcela();
        this.totalParcelas = conta.getTotalParcelas();
        this.valorOriginal = conta.getValorOriginal();
        this.valorPago = conta.getValorPago();
        this.valorDesconto = conta.getValorDesconto();
        this.valorJuros = conta.getValorJuros();
        this.valorMulta = conta.getValorMulta();
        this.valorTotal = conta.getValorTotal();
        this.dataEmissao = conta.getDataEmissao();
        this.dataVencimento = conta.getDataVencimento();
        this.dataPagamento = conta.getDataPagamento();
        this.formaPagamentoId = conta.getFormaPagamentoId();
        this.situacao = conta.getSituacao();
        this.observacoes = conta.getObservacoes();
        this.dataCriacao = conta.getDataCriacao();
        this.dataAlteracao = conta.getDataAlteracao();
        
        if (conta.getFornecedor() != null) {
            this.fornecedorNome = conta.getFornecedor().getFornecedor();
        }
        
        if (conta.getFormaPagamento() != null) {
            this.formaPagamentoNome = conta.getFormaPagamento().getNome();
        }
    }
    
    // Método para converter DTO para Entity
    public ContaPagar toEntity() {
        ContaPagar conta = new ContaPagar();
        conta.setId(this.id);
        conta.setNotaNumero(this.notaNumero);
        conta.setNotaModelo(this.notaModelo);
        conta.setNotaSerie(this.notaSerie);
        conta.setFornecedorId(this.fornecedorId);
        conta.setNumeroParcela(this.numeroParcela);
        conta.setTotalParcelas(this.totalParcelas);
        conta.setValorOriginal(this.valorOriginal);
        conta.setValorPago(this.valorPago != null ? this.valorPago : BigDecimal.ZERO);
        conta.setValorDesconto(this.valorDesconto != null ? this.valorDesconto : BigDecimal.ZERO);
        conta.setValorJuros(this.valorJuros != null ? this.valorJuros : BigDecimal.ZERO);
        conta.setValorMulta(this.valorMulta != null ? this.valorMulta : BigDecimal.ZERO);
        conta.setValorTotal(this.valorTotal);
        conta.setDataEmissao(this.dataEmissao);
        conta.setDataVencimento(this.dataVencimento);
        conta.setDataPagamento(this.dataPagamento);
        conta.setFormaPagamentoId(this.formaPagamentoId);
        conta.setSituacao(this.situacao != null ? this.situacao : "PENDENTE");
        conta.setObservacoes(this.observacoes);
        return conta;
    }
    
    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNotaNumero() { return notaNumero; }
    public void setNotaNumero(String notaNumero) { this.notaNumero = notaNumero; }
    
    public String getNotaModelo() { return notaModelo; }
    public void setNotaModelo(String notaModelo) { this.notaModelo = notaModelo; }
    
    public String getNotaSerie() { return notaSerie; }
    public void setNotaSerie(String notaSerie) { this.notaSerie = notaSerie; }
    
    public Long getFornecedorId() { return fornecedorId; }
    public void setFornecedorId(Long fornecedorId) { this.fornecedorId = fornecedorId; }
    
    public String getFornecedorNome() { return fornecedorNome; }
    public void setFornecedorNome(String fornecedorNome) { this.fornecedorNome = fornecedorNome; }
    
    public Integer getNumeroParcela() { return numeroParcela; }
    public void setNumeroParcela(Integer numeroParcela) { this.numeroParcela = numeroParcela; }
    
    public Integer getTotalParcelas() { return totalParcelas; }
    public void setTotalParcelas(Integer totalParcelas) { this.totalParcelas = totalParcelas; }
    
    public BigDecimal getValorOriginal() { return valorOriginal; }
    public void setValorOriginal(BigDecimal valorOriginal) { this.valorOriginal = valorOriginal; }
    
    public BigDecimal getValorPago() { return valorPago; }
    public void setValorPago(BigDecimal valorPago) { this.valorPago = valorPago; }
    
    public BigDecimal getValorDesconto() { return valorDesconto; }
    public void setValorDesconto(BigDecimal valorDesconto) { this.valorDesconto = valorDesconto; }
    
    public BigDecimal getValorJuros() { return valorJuros; }
    public void setValorJuros(BigDecimal valorJuros) { this.valorJuros = valorJuros; }
    
    public BigDecimal getValorMulta() { return valorMulta; }
    public void setValorMulta(BigDecimal valorMulta) { this.valorMulta = valorMulta; }
    
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    
    public LocalDate getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(LocalDate dataEmissao) { this.dataEmissao = dataEmissao; }
    
    public LocalDate getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(LocalDate dataVencimento) { this.dataVencimento = dataVencimento; }
    
    public LocalDate getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(LocalDate dataPagamento) { this.dataPagamento = dataPagamento; }
    
    public Long getFormaPagamentoId() { return formaPagamentoId; }
    public void setFormaPagamentoId(Long formaPagamentoId) { this.formaPagamentoId = formaPagamentoId; }
    
    public String getFormaPagamentoNome() { return formaPagamentoNome; }
    public void setFormaPagamentoNome(String formaPagamentoNome) { this.formaPagamentoNome = formaPagamentoNome; }
    
    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }
    
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    
    public LocalDateTime getDataAlteracao() { return dataAlteracao; }
    public void setDataAlteracao(LocalDateTime dataAlteracao) { this.dataAlteracao = dataAlteracao; }
}

