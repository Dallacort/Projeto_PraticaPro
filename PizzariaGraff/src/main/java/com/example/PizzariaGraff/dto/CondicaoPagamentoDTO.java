package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.CondicaoPagamento;
import com.example.PizzariaGraff.model.FormaPagamento;
import com.example.PizzariaGraff.model.ParcelaCondicaoPagamento;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CondicaoPagamentoDTO {
    private Long id;
    private String condicaoPagamento;
    private Integer numeroParcelas;
    private Integer parcelas;
    private Boolean ativo;
    private Integer diasPrimeiraParcela;
    private Integer diasEntreParcelas;
    private Double percentualJuros;
    private Double percentualMulta;
    private Double percentualDesconto;
    private List<ParcelaCondicaoPagamentoDTO> parcelasCondicaoPagamento = new ArrayList<>();
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;

    public CondicaoPagamentoDTO() {
    }

    public CondicaoPagamentoDTO(Long id, String condicaoPagamento, Boolean ativo) {
        this.id = id;
        this.condicaoPagamento = condicaoPagamento;
        this.ativo = ativo;
    }

    public CondicaoPagamentoDTO(CondicaoPagamento condicao) {
        this.id = condicao.getId();
        this.condicaoPagamento = condicao.getCondicaoPagamento();
        this.numeroParcelas = condicao.getNumeroParcelas();
        this.parcelas = condicao.getParcelas();
        this.ativo = condicao.getAtivo();
        this.diasPrimeiraParcela = condicao.getDiasPrimeiraParcela();
        this.diasEntreParcelas = condicao.getDiasEntreParcelas();
        this.percentualJuros = condicao.getPercentualJuros();
        this.percentualMulta = condicao.getPercentualMulta();
        this.percentualDesconto = condicao.getPercentualDesconto();
        
        this.dataCadastro = condicao.getDataCadastro();
        this.ultimaModificacao = condicao.getUltimaModificacao();
        
        if (condicao.getParcelasCondicaoPagamento() != null) {
            this.parcelasCondicaoPagamento = condicao.getParcelasCondicaoPagamento().stream()
                .map(ParcelaCondicaoPagamentoDTO::new)
                .collect(Collectors.toList());
        }
    }

    public static CondicaoPagamentoDTO fromEntity(CondicaoPagamento condicao) {
        if (condicao == null) {
            return null;
        }
        return new CondicaoPagamentoDTO(condicao);
    }

    public CondicaoPagamento toEntity() {
        CondicaoPagamento condicao = new CondicaoPagamento();
        condicao.setId(this.id);
        condicao.setCondicaoPagamento(this.condicaoPagamento);
        condicao.setNumeroParcelas(this.numeroParcelas != null ? this.numeroParcelas : 1);
        condicao.setParcelas(this.parcelas != null ? this.parcelas : 1);
        condicao.setDiasPrimeiraParcela(this.diasPrimeiraParcela != null ? this.diasPrimeiraParcela : 0);
        condicao.setDiasEntreParcelas(this.diasEntreParcelas != null ? this.diasEntreParcelas : 0);
        condicao.setPercentualJuros(this.percentualJuros != null ? this.percentualJuros : 0.0);
        condicao.setPercentualMulta(this.percentualMulta != null ? this.percentualMulta : 0.0);
        condicao.setPercentualDesconto(this.percentualDesconto != null ? this.percentualDesconto : 0.0);
        condicao.setAtivo(this.ativo != null ? this.ativo : true);
        return condicao;
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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
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

    public List<ParcelaCondicaoPagamentoDTO> getParcelasCondicaoPagamento() {
        return parcelasCondicaoPagamento;
    }

    public void setParcelasCondicaoPagamento(List<ParcelaCondicaoPagamentoDTO> parcelasCondicaoPagamento) {
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
} 