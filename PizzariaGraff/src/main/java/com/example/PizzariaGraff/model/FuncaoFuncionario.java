package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public class FuncaoFuncionario {
    private Long id;
    private String funcaoFuncionario;    // Nome da função (campo principal)
    private Boolean requerCNH;           // Se requer CNH
    private BigDecimal cargaHoraria;     // Carga horária
    private String descricao;            // Descrição da função
    private String observacao;           // Observações
    private LocalDateTime dataCriacao;   // Data de criação
    private LocalDateTime dataAlteracao; // Data de alteração
    
    // Campos legados (manter compatibilidade)
    private Double salarioBase;
    private Boolean ativo = true;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;

    // Construtores
    public FuncaoFuncionario() {}

    public FuncaoFuncionario(String funcaoFuncionario) {
        this.funcaoFuncionario = funcaoFuncionario;
        this.ativo = true;
        this.requerCNH = false;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFuncaoFuncionario() {
        return funcaoFuncionario;
    }

    public void setFuncaoFuncionario(String funcaoFuncionario) {
        this.funcaoFuncionario = funcaoFuncionario;
    }

    public Boolean getRequerCNH() {
        return requerCNH;
    }

    public void setRequerCNH(Boolean requerCNH) {
        this.requerCNH = requerCNH;
    }

    public BigDecimal getCargaHoraria() {
        return cargaHoraria;
    }

    public void setCargaHoraria(BigDecimal cargaHoraria) {
        this.cargaHoraria = cargaHoraria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
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

    // Campos legados (manter compatibilidade)
    public Double getSalarioBase() {
        return salarioBase;
    }

    public void setSalarioBase(Double salarioBase) {
        this.salarioBase = salarioBase;
    }

    public Boolean getAtivo() {
        return ativo != null ? ativo : true;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro != null ? dataCadastro : dataCriacao;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public LocalDateTime getUltimaModificacao() {
        return ultimaModificacao != null ? ultimaModificacao : dataAlteracao;
    }

    public void setUltimaModificacao(LocalDateTime ultimaModificacao) {
        this.ultimaModificacao = ultimaModificacao;
    }

    @Override
    public String toString() {
        return "FuncaoFuncionario{" +
                "id=" + id +
                ", funcaoFuncionario='" + funcaoFuncionario + '\'' +
                ", requerCNH=" + requerCNH +
                ", cargaHoraria=" + cargaHoraria +
                ", descricao='" + descricao + '\'' +
                ", observacao='" + observacao + '\'' +
                ", ativo=" + ativo +
                ", dataCriacao=" + dataCriacao +
                ", dataAlteracao=" + dataAlteracao +
                '}';
    }
} 