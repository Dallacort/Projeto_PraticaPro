package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.ContaReceber;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para representar uma Conta a Receber")
public class ContaReceberDTO {
    
    @Schema(description = "ID da conta", example = "1")
    private Long id;
    
    @Schema(description = "Número da nota", example = "123")
    private String notaNumero;
    
    @Schema(description = "Modelo da nota", example = "55")
    private String notaModelo;
    
    @Schema(description = "Série da nota", example = "1")
    private String notaSerie;
    
    @Schema(description = "ID do cliente", example = "1")
    private Long clienteId;
    
    @Schema(description = "Nome do cliente")
    private String clienteNome;
    
    @Schema(description = "Número da parcela", example = "1")
    private Integer numeroParcela;
    
    @Schema(description = "Total de parcelas", example = "3")
    private Integer totalParcelas;
    
    @Schema(description = "Valor original", example = "1000.00")
    private BigDecimal valorOriginal;
    
    @Schema(description = "Valor recebido", example = "0.00")
    private BigDecimal valorRecebido;
    
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
    
    @Schema(description = "Data de recebimento", example = "2025-01-30")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataRecebimento;
    
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
    public ContaReceberDTO() {}
    
    public ContaReceberDTO(ContaReceber conta) {
        this.id = conta.getId();
        this.notaNumero = conta.getNotaNumero();
        this.notaModelo = conta.getNotaModelo();
        this.notaSerie = conta.getNotaSerie();
        this.clienteId = conta.getClienteId();
        this.numeroParcela = conta.getNumeroParcela();
        this.totalParcelas = conta.getTotalParcelas();
        this.valorOriginal = conta.getValorOriginal();
        this.valorRecebido = conta.getValorRecebido();
        this.valorDesconto = conta.getValorDesconto();
        this.valorJuros = conta.getValorJuros();
        this.valorMulta = conta.getValorMulta();
        this.valorTotal = conta.getValorTotal();
        this.dataEmissao = conta.getDataEmissao();
        this.dataVencimento = conta.getDataVencimento();
        this.dataRecebimento = conta.getDataRecebimento();
        this.formaPagamentoId = conta.getFormaPagamentoId();
        this.situacao = conta.getSituacao();
        this.observacoes = conta.getObservacoes();
        this.dataCriacao = conta.getDataCriacao();
        this.dataAlteracao = conta.getDataAlteracao();
        
        if (conta.getCliente() != null) {
            this.clienteNome = conta.getCliente().getCliente();
        }
        
        if (conta.getFormaPagamento() != null) {
            this.formaPagamentoNome = conta.getFormaPagamento().getNome();
        }
    }
    
    // Método para converter DTO para Entity
    public ContaReceber toEntity() {
        ContaReceber conta = new ContaReceber();
        conta.setId(this.id);
        conta.setNotaNumero(this.notaNumero);
        conta.setNotaModelo(this.notaModelo);
        conta.setNotaSerie(this.notaSerie);
        conta.setClienteId(this.clienteId);
        conta.setNumeroParcela(this.numeroParcela);
        conta.setTotalParcelas(this.totalParcelas);
        conta.setValorOriginal(this.valorOriginal);
        conta.setValorRecebido(this.valorRecebido != null ? this.valorRecebido : BigDecimal.ZERO);
        conta.setValorDesconto(this.valorDesconto != null ? this.valorDesconto : BigDecimal.ZERO);
        conta.setValorJuros(this.valorJuros != null ? this.valorJuros : BigDecimal.ZERO);
        conta.setValorMulta(this.valorMulta != null ? this.valorMulta : BigDecimal.ZERO);
        conta.setValorTotal(this.valorTotal);
        conta.setDataEmissao(this.dataEmissao);
        conta.setDataVencimento(this.dataVencimento);
        conta.setDataRecebimento(this.dataRecebimento);
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
    
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    
    public String getClienteNome() { return clienteNome; }
    public void setClienteNome(String clienteNome) { this.clienteNome = clienteNome; }
    
    public Integer getNumeroParcela() { return numeroParcela; }
    public void setNumeroParcela(Integer numeroParcela) { this.numeroParcela = numeroParcela; }
    
    public Integer getTotalParcelas() { return totalParcelas; }
    public void setTotalParcelas(Integer totalParcelas) { this.totalParcelas = totalParcelas; }
    
    public BigDecimal getValorOriginal() { return valorOriginal; }
    public void setValorOriginal(BigDecimal valorOriginal) { this.valorOriginal = valorOriginal; }
    
    public BigDecimal getValorRecebido() { return valorRecebido; }
    public void setValorRecebido(BigDecimal valorRecebido) { this.valorRecebido = valorRecebido; }
    
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
    
    public LocalDate getDataRecebimento() { return dataRecebimento; }
    public void setDataRecebimento(LocalDate dataRecebimento) { this.dataRecebimento = dataRecebimento; }
    
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

