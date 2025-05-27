package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CondicaoPagamento {
    private Long id;
    private String condicaoPagamento;
    private Integer numeroParcelas = 1;
    private Integer parcelas = 1;
    private Integer diasPrimeiraParcela = 0;
    private Integer diasEntreParcelas = 0;
    private Double percentualJuros = 0.0;
    private Double percentualMulta = 0.0;
    private Double percentualDesconto = 0.0;
    private Boolean ativo = true;
    private List<ParcelaCondicaoPagamento> parcelasCondicaoPagamento = new ArrayList<>();
    private List<Nfe> notas;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Método auxiliar para adicionar parcela
    public void addParcela(ParcelaCondicaoPagamento parcela) {
        parcelasCondicaoPagamento.add(parcela);
        parcela.setCondicaoPagamento(this);
    }
    
    // Método auxiliar para remover parcela
    public void removeParcela(ParcelaCondicaoPagamento parcela) {
        parcelasCondicaoPagamento.remove(parcela);
        parcela.setCondicaoPagamento(null);
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCondicaoPagamento() {
        return condicaoPagamento;
    }
    
    public void setCondicaoPagamento(String condicaoPagamento) {
        this.condicaoPagamento = condicaoPagamento;
    }
    
    public Integer getNumeroParcelas() {
        return numeroParcelas;
    }
    
    public void setNumeroParcelas(Integer numeroParcelas) {
        this.numeroParcelas = numeroParcelas;
    }
    
    public Integer getParcelas() {
        return parcelas;
    }
    
    public void setParcelas(Integer parcelas) {
        this.parcelas = parcelas;
    }
    
    public Integer getDiasPrimeiraParcela() {
        return diasPrimeiraParcela;
    }
    
    public void setDiasPrimeiraParcela(Integer diasPrimeiraParcela) {
        this.diasPrimeiraParcela = diasPrimeiraParcela;
    }
    
    public Integer getDiasEntreParcelas() {
        return diasEntreParcelas;
    }
    
    public void setDiasEntreParcelas(Integer diasEntreParcelas) {
        this.diasEntreParcelas = diasEntreParcelas;
    }
    
    public Double getPercentualJuros() {
        return percentualJuros;
    }
    
    public void setPercentualJuros(Double percentualJuros) {
        this.percentualJuros = percentualJuros;
    }
    
    public Double getPercentualMulta() {
        return percentualMulta;
    }
    
    public void setPercentualMulta(Double percentualMulta) {
        this.percentualMulta = percentualMulta;
    }
    
    public Double getPercentualDesconto() {
        return percentualDesconto;
    }
    
    public void setPercentualDesconto(Double percentualDesconto) {
        this.percentualDesconto = percentualDesconto;
    }
    
    public Boolean getAtivo() {
        return ativo;
    }
    
    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
    
    public List<ParcelaCondicaoPagamento> getParcelasCondicaoPagamento() {
        return parcelasCondicaoPagamento;
    }
    
    public void setParcelasCondicaoPagamento(List<ParcelaCondicaoPagamento> parcelasCondicaoPagamento) {
        this.parcelasCondicaoPagamento = parcelasCondicaoPagamento;
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
    
    public List<Nfe> getNotas() {
        return notas;
    }
    
    public void setNotas(List<Nfe> notas) {
        this.notas = notas;
    }
} 