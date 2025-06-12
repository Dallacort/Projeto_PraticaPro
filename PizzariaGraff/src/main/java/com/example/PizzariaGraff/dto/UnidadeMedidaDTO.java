package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.UnidadeMedida;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "DTO para transferência de dados de Unidade de Medida")
public class UnidadeMedidaDTO {

    @Schema(description = "ID da unidade de medida", example = "1")
    private Long id;

    @Schema(description = "Nome da unidade de medida", example = "Quilograma", required = true)
    private String unidadeMedida;

    @Schema(description = "Status ativo/inativo", example = "true")
    private Boolean ativo;

    @Schema(description = "Data de criação do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCriacao;

    @Schema(description = "Data de alteração do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAlteracao;

    // Constructors
    public UnidadeMedidaDTO() {}

    public UnidadeMedidaDTO(UnidadeMedida unidadeMedida) {
        this.id = unidadeMedida.getId();
        this.unidadeMedida = unidadeMedida.getUnidadeMedida();
        this.dataCriacao = unidadeMedida.getDataCriacao();
        this.dataAlteracao = unidadeMedida.getDataAlteracao();
        this.ativo = unidadeMedida.getAtivo();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
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
    public UnidadeMedida toEntity() {
        UnidadeMedida unidadeMedida = new UnidadeMedida();
        unidadeMedida.setId(this.id);
        unidadeMedida.setUnidadeMedida(this.unidadeMedida);
        unidadeMedida.setDataCriacao(this.dataCriacao);
        unidadeMedida.setDataAlteracao(this.dataAlteracao);
        unidadeMedida.setAtivo(this.ativo);
        return unidadeMedida;
    }

    @Override
    public String toString() {
        return "UnidadeMedidaDTO{" +
                "id=" + id +
                ", unidadeMedida='" + unidadeMedida + '\'' +
                ", ativo=" + ativo +
                ", dataCriacao=" + dataCriacao +
                ", dataAlteracao=" + dataAlteracao +
                '}';
    }
} 