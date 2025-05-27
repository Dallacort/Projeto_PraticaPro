package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Nfe {
    private Long id;
    private String numero;
    private String serie;
    private String chaveAcesso;
    private Cliente cliente;
    private LocalDate dataEmissao;
    private BigDecimal valorTotal;
    private FormaPagamento formaPagamento;
    private CondicaoPagamento condicaoPagamento;
    private Transportadora transportadora;
    private Veiculo veiculo;
    private ModalidadeNfe modalidade;
    private Boolean cancelada = false;
    private StatusNfe status;
    private List<ItemNfe> itens;
    private List<MovimentacaoNfe> movimentacoes;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }
    
    public String getSerie() {
        return serie;
    }
    
    public void setSerie(String serie) {
        this.serie = serie;
    }

    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public LocalDate getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDate dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }
    
    public void setFormaPagamento(FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
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
    
    public Veiculo getVeiculo() {
        return veiculo;
    }
    
    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }
    
    public ModalidadeNfe getModalidade() {
        return modalidade;
    }
    
    public void setModalidade(ModalidadeNfe modalidade) {
        this.modalidade = modalidade;
    }
    
    public Boolean getCancelada() {
        return cancelada;
    }
    
    public void setCancelada(Boolean cancelada) {
        this.cancelada = cancelada;
    }

    public StatusNfe getStatus() {
        return status;
    }

    public void setStatus(StatusNfe status) {
        this.status = status;
    }
    
    public List<ItemNfe> getItens() {
        return itens;
    }
    
    public void setItens(List<ItemNfe> itens) {
        this.itens = itens;
    }
    
    public List<MovimentacaoNfe> getMovimentacoes() {
        return movimentacoes;
    }
    
    public void setMovimentacoes(List<MovimentacaoNfe> movimentacoes) {
        this.movimentacoes = movimentacoes;
    }
    
    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public LocalDateTime getUltimaModificacao() {
        return ultimaModificacao;
    }

    public void setUltimaModificacao(LocalDateTime ultimaModificacao) {
        this.ultimaModificacao = ultimaModificacao;
    }
    
    // Métodos de compatibilidade para código antigo que ainda use getData/setData
    @Deprecated
    public LocalDate getData() {
        return dataEmissao;
    }
    
    @Deprecated
    public void setData(LocalDate data) {
        this.dataEmissao = data;
    }
} 