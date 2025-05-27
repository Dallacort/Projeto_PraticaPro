package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;

public class ParcelaCondicaoPagamento {
    private Long id;
    private CondicaoPagamento condicaoPagamento;
    private Integer numero;
    private Integer dias;
    private Double percentual;
    private FormaPagamento formaPagamento;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public ParcelaCondicaoPagamento() {
    }
    
    public ParcelaCondicaoPagamento(Integer numero, Integer dias, Double percentual) {
        this.numero = numero;
        this.dias = dias;
        this.percentual = percentual;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CondicaoPagamento getCondicaoPagamento() {
        return condicaoPagamento;
    }
    
    public void setCondicaoPagamento(CondicaoPagamento condicaoPagamento) {
        this.condicaoPagamento = condicaoPagamento;
    }
    
    public Integer getNumero() {
        return numero;
    }
    
    public void setNumero(Integer numero) {
        this.numero = numero;
    }
    
    public Integer getDias() {
        return dias;
    }
    
    public void setDias(Integer dias) {
        this.dias = dias;
    }
    
    public Double getPercentual() {
        return percentual;
    }
    
    public void setPercentual(Double percentual) {
        this.percentual = percentual;
    }
    
    public FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }
    
    public void setFormaPagamento(FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
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
} 