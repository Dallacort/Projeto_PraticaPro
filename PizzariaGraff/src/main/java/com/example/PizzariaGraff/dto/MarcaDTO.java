package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Marca;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "DTO para transferência de dados de Marca")
public class MarcaDTO {

    @Schema(description = "ID da marca", example = "1")
    private Long id;

    @Schema(description = "Nome da marca", example = "Samsung", required = true)
    private String marca;

    @Schema(description = "Status ativo/inativo", example = "true")
    private Boolean ativo;

    @Schema(description = "Data de criação do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCriacao;

    @Schema(description = "Data de alteração do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAlteracao;

    // Constructors
    public MarcaDTO() {}

    public MarcaDTO(Marca marca) {
        this.id = marca.getId();
        this.marca = marca.getMarca();
        this.dataCriacao = marca.getDataCriacao();
        this.dataAlteracao = marca.getDataAlteracao();
        this.ativo = marca.getAtivo();
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

    // Método para converter DTO para Entity
    public Marca toEntity() {
        Marca marca = new Marca();
        marca.setId(this.id);
        marca.setMarca(this.marca);
        marca.setDataCriacao(this.dataCriacao);
        marca.setDataAlteracao(this.dataAlteracao);
        marca.setAtivo(this.ativo);
        return marca;
    }

    @Override
    public String toString() {
        return "MarcaDTO{" +
                "id=" + id +
                ", marca='" + marca + '\'' +
                ", ativo=" + ativo +
                ", dataCriacao=" + dataCriacao +
                ", dataAlteracao=" + dataAlteracao +
                '}';
    }
} 