package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;

public class Marca {
    private Long id;
    private String marca;               // varchar(60) NOT NULL
    private LocalDateTime dataCriacao;  // timestamp NOT NULL
    private LocalDateTime dataAlteracao; // timestamp NOT NULL

    // Campo ativo para controle de status
    private Boolean ativo;

    // Constructors
    public Marca() {}

    public Marca(String marca) {
        this.marca = marca;
        this.ativo = true;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
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

    public Boolean getAtivo() {
        return ativo != null ? ativo : true;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    @Override
    public String toString() {
        return "Marca{" +
                "id=" + id +
                ", marca='" + marca + '\'' +
                ", ativo=" + ativo +
                ", dataCriacao=" + dataCriacao +
                ", dataAlteracao=" + dataAlteracao +
                '}';
    }
} 