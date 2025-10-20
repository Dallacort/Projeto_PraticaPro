package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.NotaSaida;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Schema(description = "DTO para representar uma Nota de Saída")
public class NotaSaidaDTO {
    
    @Schema(description = "Número da nota fiscal", example = "22232", required = true)
    private String numero;
    
    @Schema(description = "Modelo da nota fiscal", example = "55")
    private String modelo;
    
    @Schema(description = "Série da nota fiscal", example = "1")
    private String serie;
    
    @Schema(description = "ID do cliente", example = "1", required = true)
    private Long clienteId;
    
    @Schema(description = "Nome do cliente")
    private String clienteNome;
    
    @Schema(description = "Data de emissão da nota", example = "2025-09-28", required = true)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataEmissao;
    
    @Schema(description = "Data de saída da nota", example = "2025-09-28")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataSaida;
    
    @Schema(description = "Tipo de frete (CIF, FOB, SEM)", example = "CIF", required = true)
    private String tipoFrete;
    
    @Schema(description = "Valor total dos produtos", example = "1650.00", required = true)
    private BigDecimal valorProdutos;
    
    @Schema(description = "Valor do frete", example = "0")
    private BigDecimal valorFrete;
    
    @Schema(description = "Valor do seguro", example = "100")
    private BigDecimal valorSeguro;
    
    @Schema(description = "Outras despesas", example = "0")
    private BigDecimal outrasDespesas;
    
    @Schema(description = "Valor do desconto", example = "0")
    private BigDecimal valorDesconto;
    
    @Schema(description = "Valor total da nota", example = "1660.00", required = true)
    private BigDecimal valorTotal;
    
    @Schema(description = "ID da condição de pagamento", example = "1")
    private Long condicaoPagamentoId;
    
    @Schema(description = "Nome da condição de pagamento")
    private String condicaoPagamentoNome;
    
    @Schema(description = "ID da transportadora", example = "1")
    private Long transportadoraId;
    
    @Schema(description = "Nome da transportadora")
    private String transportadoraNome;
    
    @Schema(description = "Placa do veículo")
    private String placaVeiculo;
    
    @Schema(description = "Observações sobre a nota")
    private String observacoes;
    
    @Schema(description = "Situação da nota (PENDENTE, CONFIRMADA, CANCELADA)", example = "PENDENTE")
    private String situacao;
    
    @Schema(description = "Data de criação do registro")
    private LocalDateTime dataCriacao;
    
    @Schema(description = "Data da última alteração")
    private LocalDateTime dataAlteracao;
    
    @Schema(description = "Lista de produtos da nota", required = true)
    private List<ProdutoNotaSaidaDTO> produtos = new ArrayList<>();
    
    // Constructors
    public NotaSaidaDTO() {}
    
    public NotaSaidaDTO(NotaSaida nota) {
        this.numero = nota.getNumero();
        this.modelo = nota.getModelo();
        this.serie = nota.getSerie();
        this.clienteId = nota.getClienteId();
        this.dataEmissao = nota.getDataEmissao();
        this.dataSaida = nota.getDataSaida();
        this.tipoFrete = nota.getTipoFrete();
        this.valorProdutos = nota.getValorProdutos();
        this.valorFrete = nota.getValorFrete();
        this.valorSeguro = nota.getValorSeguro();
        this.outrasDespesas = nota.getOutrasDespesas();
        this.valorDesconto = nota.getValorDesconto();
        this.valorTotal = nota.getValorTotal();
        this.condicaoPagamentoId = nota.getCondicaoPagamentoId();
        this.transportadoraId = nota.getTransportadoraId();
        this.placaVeiculo = nota.getPlacaVeiculo();
        this.observacoes = nota.getObservacoes();
        this.situacao = nota.getSituacao();
        this.dataCriacao = nota.getDataCriacao();
        this.dataAlteracao = nota.getDataAlteracao();
        
        // Relacionamentos
        if (nota.getCliente() != null) {
            this.clienteNome = nota.getCliente().getCliente();
        }
        
        if (nota.getCondicaoPagamento() != null) {
            this.condicaoPagamentoNome = nota.getCondicaoPagamento().getCondicaoPagamento();
        }
        
        if (nota.getTransportadora() != null) {
            this.transportadoraNome = nota.getTransportadora().getTransportadora();
        }
        
        if (nota.getProdutos() != null) {
            this.produtos = nota.getProdutos().stream()
                    .map(ProdutoNotaSaidaDTO::new)
                    .collect(Collectors.toList());
        }
    }
    
    // Método para converter DTO para Entity
    public NotaSaida toEntity() {
        NotaSaida nota = new NotaSaida();
        nota.setNumero(this.numero);
        nota.setModelo(this.modelo != null ? this.modelo : "55");
        nota.setSerie(this.serie != null ? this.serie : "1");
        nota.setClienteId(this.clienteId);
        nota.setDataEmissao(this.dataEmissao);
        nota.setDataSaida(this.dataSaida);
        nota.setTipoFrete(this.tipoFrete != null ? this.tipoFrete : "CIF");
        nota.setValorProdutos(this.valorProdutos != null ? this.valorProdutos : BigDecimal.ZERO);
        nota.setValorFrete(this.valorFrete != null ? this.valorFrete : BigDecimal.ZERO);
        nota.setValorSeguro(this.valorSeguro != null ? this.valorSeguro : BigDecimal.ZERO);
        nota.setOutrasDespesas(this.outrasDespesas != null ? this.outrasDespesas : BigDecimal.ZERO);
        nota.setValorDesconto(this.valorDesconto != null ? this.valorDesconto : BigDecimal.ZERO);
        nota.setValorTotal(this.valorTotal != null ? this.valorTotal : BigDecimal.ZERO);
        nota.setCondicaoPagamentoId(this.condicaoPagamentoId);
        nota.setTransportadoraId(this.transportadoraId);
        nota.setPlacaVeiculo(this.placaVeiculo);
        nota.setObservacoes(this.observacoes);
        nota.setSituacao(this.situacao != null ? this.situacao : "PENDENTE");
        
        if (this.produtos != null) {
            List<com.example.PizzariaGraff.model.ProdutoNotaSaida> produtosEntity = this.produtos.stream()
                    .map(ProdutoNotaSaidaDTO::toEntity)
                    .collect(Collectors.toList());
            nota.setProdutos(produtosEntity);
        }
        
        return nota;
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
    
    public String getClienteNome() {
        return clienteNome;
    }
    
    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
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
    
    public String getCondicaoPagamentoNome() {
        return condicaoPagamentoNome;
    }
    
    public void setCondicaoPagamentoNome(String condicaoPagamentoNome) {
        this.condicaoPagamentoNome = condicaoPagamentoNome;
    }
    
    public Long getTransportadoraId() {
        return transportadoraId;
    }
    
    public void setTransportadoraId(Long transportadoraId) {
        this.transportadoraId = transportadoraId;
    }
    
    public String getTransportadoraNome() {
        return transportadoraNome;
    }
    
    public void setTransportadoraNome(String transportadoraNome) {
        this.transportadoraNome = transportadoraNome;
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
    
    public List<ProdutoNotaSaidaDTO> getProdutos() {
        return produtos;
    }
    
    public void setProdutos(List<ProdutoNotaSaidaDTO> produtos) {
        this.produtos = produtos;
    }
}

