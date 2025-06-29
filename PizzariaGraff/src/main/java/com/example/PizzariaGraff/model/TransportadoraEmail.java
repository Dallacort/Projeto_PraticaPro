package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;

public class TransportadoraEmail {
    private Long id;
    private Long transportadoraId;
    private String email;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;

    // Constructors
    public TransportadoraEmail() {}

    public TransportadoraEmail(Long transportadoraId, String email) {
        this.transportadoraId = transportadoraId;
        this.email = email;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
        return "TransportadoraEmail{" +
                "id=" + id +
                ", transportadoraId=" + transportadoraId +
                ", email='" + email + '\'' +
                ", ativo=" + ativo +
                '}';
    }
} 