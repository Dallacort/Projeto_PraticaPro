package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;

public class FornecedorEmail {
    private Long id;
    private Long fornecedorId;
    private String email;
    private String tipo; // COMERCIAL, FINANCEIRO, COMPRAS, VENDAS, SUPORTE
    private Boolean principal;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;

    // Constructors
    public FornecedorEmail() {}

    public FornecedorEmail(Long fornecedorId, String email, String tipo, Boolean principal) {
        this.fornecedorId = fornecedorId;
        this.email = email;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
        return "FornecedorEmail{" +
                "id=" + id +
                ", fornecedorId=" + fornecedorId +
                ", email='" + email + '\'' +
                ", tipo='" + tipo + '\'' +
                ", principal=" + principal +
                ", ativo=" + ativo +
                '}';
    }
} 