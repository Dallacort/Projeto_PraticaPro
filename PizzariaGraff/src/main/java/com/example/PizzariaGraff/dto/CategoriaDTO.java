package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Categoria;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "DTO para transferência de dados de Categoria")
public class CategoriaDTO {

    @Schema(description = "ID da categoria", example = "1")
    private Long id;

    @Schema(description = "Nome da categoria", example = "Bebidas", required = true)
    private String categoria;

    @Schema(description = "Status ativo/inativo", example = "true")
    private Boolean ativo;

    @Schema(description = "Data de criação do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCriacao;

    @Schema(description = "Data de alteração do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAlteracao;

    // Constructors
    public CategoriaDTO() {}

    public CategoriaDTO(Categoria categoria) {
        this.id = categoria.getId();
        this.categoria = categoria.getCategoria();
        this.dataCriacao = categoria.getDataCriacao();
        this.dataAlteracao = categoria.getDataAlteracao();
        this.ativo = categoria.getAtivo();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
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
    public Categoria toEntity() {
        Categoria categoria = new Categoria();
        categoria.setId(this.id);
        categoria.setCategoria(this.categoria);
        categoria.setDataCriacao(this.dataCriacao);
        categoria.setDataAlteracao(this.dataAlteracao);
        categoria.setAtivo(this.ativo);
        return categoria;
    }

    @Override
    public String toString() {
        return "CategoriaDTO{" +
                "id=" + id +
                ", categoria='" + categoria + '\'' +
                ", ativo=" + ativo +
                ", dataCriacao=" + dataCriacao +
                ", dataAlteracao=" + dataAlteracao +
                '}';
    }
} 