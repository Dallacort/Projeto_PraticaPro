package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;

public class TransportadoraTelefone {
    private Long id;
    private Long transportadoraId;
    private String telefone;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;

    // Constructors
    public TransportadoraTelefone() {}

    public TransportadoraTelefone(Long transportadoraId, String telefone) {
        this.transportadoraId = transportadoraId;
        this.telefone = telefone;
        this.ativo = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTransportadoraId() {
        return transportadoraId;
    }

    public void setTransportadoraId(Long transportadoraId) {
        this.transportadoraId = transportadoraId;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
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
        return "TransportadoraTelefone{" +
                "id=" + id +
                ", transportadoraId=" + transportadoraId +
                ", telefone='" + telefone + '\'' +
                ", ativo=" + ativo +
                '}';
    }
} 