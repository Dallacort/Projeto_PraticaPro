package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.ContaPagarAvulsa;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para representar uma Conta a Pagar Avulsa")
public class ContaPagarAvulsaDTO {
    
    @Schema(description = "ID da conta", example = "1")
    private Long id;
    
    @Schema(description = "Número da nota", example = "123")
    private String numeroNota;
    
    @Schema(description = "Modelo da nota", example = "55")
    private String modelo;
    
    @Schema(description = "Série da nota", example = "1")
    private String serie;
    
    @Schema(description = "ID do fornecedor", example = "1")
    private Long fornecedorId;
    
    @Schema(description = "Nome do fornecedor")
    private String fornecedorNome;
    
    @Schema(description = "Número da parcela", example = "1")
    private Integer numParcela;
    
    @Schema(description = "Valor da parcela", example = "1000.00")
    private BigDecimal valorParcela;
    
    @Schema(description = "Data de emissão", example = "2025-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataEmissao;
    
    @Schema(description = "Data de vencimento", example = "2025-01-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataVencimento;
    
    @Schema(description = "Data de pagamento", example = "2025-01-30")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataPagamento;
    
    @Schema(description = "Valor pago", example = "0.00")
    private BigDecimal valorPago;
    
    @Schema(description = "Juros", example = "0.00")
    private BigDecimal juros;
    
    @Schema(description = "Multa", example = "0.00")
    private BigDecimal multa;
    
    @Schema(description = "Desconto", example = "0.00")
    private BigDecimal desconto;
    
    @Schema(description = "Status", example = "PENDENTE")
    private String status;
    
    @Schema(description = "ID da forma de pagamento", example = "1")
    private Long formaPagamentoId;
    
    @Schema(description = "Nome da forma de pagamento")
    private String formaPagamentoNome;
    
    @Schema(description = "Observação")
    private String observacao;
    
    @Schema(description = "Data de criação")
    private LocalDateTime dataCriacao;
    
    @Schema(description = "Data de atualização")
    private LocalDateTime dataAtualizacao;
    
    // Constructors
    public ContaPagarAvulsaDTO() {}
    
    public ContaPagarAvulsaDTO(ContaPagarAvulsa conta) {
        this.id = conta.getId();
        this.numeroNota = conta.getNumeroNota();
        this.modelo = conta.getModelo();
        this.serie = conta.getSerie();
        this.fornecedorId = conta.getFornecedorId();
        this.numParcela = conta.getNumParcela();
        this.valorParcela = conta.getValorParcela();
        this.dataEmissao = conta.getDataEmissao();
        this.dataVencimento = conta.getDataVencimento();
        this.dataPagamento = conta.getDataPagamento();
        this.valorPago = conta.getValorPago();
        this.juros = conta.getJuros();
        this.multa = conta.getMulta();
        this.desconto = conta.getDesconto();
        this.status = conta.getStatus();
        this.formaPagamentoId = conta.getFormaPagamentoId();
        this.observacao = conta.getObservacao();
        this.dataCriacao = conta.getDataCriacao();
        this.dataAtualizacao = conta.getDataAtualizacao();
        
        if (conta.getFornecedor() != null) {
            this.fornecedorNome = conta.getFornecedor().getFornecedor();
        }
        
        if (conta.getFormaPagamento() != null) {
            this.formaPagamentoNome = conta.getFormaPagamento().getNome();
        }
    }
    
    // Método para converter DTO para Entity
    public ContaPagarAvulsa toEntity() {
        ContaPagarAvulsa conta = new ContaPagarAvulsa();
        conta.setId(this.id);
        conta.setNumeroNota(this.numeroNota);
        conta.setModelo(this.modelo);
        conta.setSerie(this.serie);
        conta.setFornecedorId(this.fornecedorId);
        conta.setNumParcela(this.numParcela);
        conta.setValorParcela(this.valorParcela);
        conta.setDataEmissao(this.dataEmissao);
        conta.setDataVencimento(this.dataVencimento);
        conta.setDataPagamento(this.dataPagamento);
        conta.setValorPago(this.valorPago != null ? this.valorPago : BigDecimal.ZERO);
        conta.setJuros(this.juros != null ? this.juros : BigDecimal.ZERO);
        conta.setMulta(this.multa != null ? this.multa : BigDecimal.ZERO);
        conta.setDesconto(this.desconto != null ? this.desconto : BigDecimal.ZERO);
        conta.setStatus(this.status != null ? this.status : "PENDENTE");
        conta.setFormaPagamentoId(this.formaPagamentoId);
        conta.setObservacao(this.observacao);
        return conta;
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
    
    public String getFornecedorNome() { return fornecedorNome; }
    public void setFornecedorNome(String fornecedorNome) { this.fornecedorNome = fornecedorNome; }
    
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
    
    public String getFormaPagamentoNome() { return formaPagamentoNome; }
    public void setFormaPagamentoNome(String formaPagamentoNome) { this.formaPagamentoNome = formaPagamentoNome; }
    
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    
    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}

