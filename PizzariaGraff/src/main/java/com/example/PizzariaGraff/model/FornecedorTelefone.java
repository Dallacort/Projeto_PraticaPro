package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;

public class FornecedorTelefone {
    private Long id;
    private Long fornecedorId;
    private String telefone;
    private String tipo; // COMERCIAL, RESIDENCIAL, CELULAR, FAX, WHATSAPP
    private Boolean principal;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;

    // Constructors
    public FornecedorTelefone() {}

    public FornecedorTelefone(Long fornecedorId, String telefone, String tipo, Boolean principal) {
        this.fornecedorId = fornecedorId;
        this.telefone = telefone;
        this.tipo = tipo;
        this.principal = principal;
        this.ativo = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFornecedorId() {
        return fornecedorId;
    }

    public void setFornecedorId(Long fornecedorId) {
        this.fornecedorId = fornecedorId;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Boolean getPrincipal() {
        return principal;
    }

    public void setPrincipal(Boolean principal) {
        this.principal = principal;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
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

    @Override
    public String toString() {
        return "FornecedorTelefone{" +
                "id=" + id +
                ", fornecedorId=" + fornecedorId +
                ", telefone='" + telefone + '\'' +
                ", tipo='" + tipo + '\'' +
                ", principal=" + principal +
                ", ativo=" + ativo +
                '}';
    }
} 