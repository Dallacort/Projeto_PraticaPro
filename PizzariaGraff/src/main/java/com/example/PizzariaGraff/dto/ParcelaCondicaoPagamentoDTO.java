package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.FormaPagamento;
import com.example.PizzariaGraff.model.ParcelaCondicaoPagamento;

import java.time.LocalDateTime;

public class ParcelaCondicaoPagamentoDTO {
    private Long id;
    private Long condicaoPagamentoId;
    private Integer numero;
    private Integer dias;
    private Double percentual;
    private Long formaPagamentoId;
    private String formaPagamentoNome;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;

    public ParcelaCondicaoPagamentoDTO() {
    }

    public ParcelaCondicaoPagamentoDTO(Long id, Integer numero, Integer dias, Double percentual) {
        this.id = id;
        this.numero = numero;
        this.dias = dias;
        this.percentual = percentual;
    }

    public ParcelaCondicaoPagamentoDTO(ParcelaCondicaoPagamento parcela) {
        this.id = parcela.getId();
        
        if (parcela.getCondicaoPagamento() != null) {
            this.condicaoPagamentoId = parcela.getCondicaoPagamento().getId();
        }
        
        this.numero = parcela.getNumero();
        this.dias = parcela.getDias();
        this.percentual = parcela.getPercentual();
        
        if (parcela.getFormaPagamento() != null) {
            this.formaPagamentoId = parcela.getFormaPagamento().getId();
            this.formaPagamentoNome = parcela.getFormaPagamento().getNome();
        }
        
        this.dataCadastro = parcela.getDataCadastro();
        this.ultimaModificacao = parcela.getUltimaModificacao();
    }

    public static ParcelaCondicaoPagamentoDTO fromEntity(ParcelaCondicaoPagamento parcela) {
        if (parcela == null) {
            return null;
        }
        return new ParcelaCondicaoPagamentoDTO(parcela);
    }

    public ParcelaCondicaoPagamento toEntity() {
        ParcelaCondicaoPagamento parcela = new ParcelaCondicaoPagamento();
        parcela.setId(this.id);
        parcela.setNumero(this.numero);
        parcela.setDias(this.dias);
        parcela.setPercentual(this.percentual);
        
        if (this.formaPagamentoId != null) {
            FormaPagamento formaPagamento = new FormaPagamento();
            formaPagamento.setId(this.formaPagamentoId);
            if (this.formaPagamentoNome != null) {
                formaPagamento.setNome(this.formaPagamentoNome);
            }
            parcela.setFormaPagamento(formaPagamento);
        }
        
        return parcela;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCondicaoPagamentoId() {
        return condicaoPagamentoId;
    }

    public void setCondicaoPagamentoId(Long condicaoPagamentoId) {
        this.condicaoPagamentoId = condicaoPagamentoId;
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

    public Long getFormaPagamentoId() {
        return formaPagamentoId;
    }

    public void setFormaPagamentoId(Long formaPagamentoId) {
        this.formaPagamentoId = formaPagamentoId;
    }

    public String getFormaPagamentoNome() {
        return formaPagamentoNome;
    }

    public void setFormaPagamentoNome(String formaPagamentoNome) {
        this.formaPagamentoNome = formaPagamentoNome;
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