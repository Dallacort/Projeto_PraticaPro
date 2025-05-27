package com.example.PizzariaGraff.model;

import java.time.LocalDateTime;
import java.util.List;

public class ModalidadeNfe {
    private Long id;
    private String codigo;
    private String descricao;
    private Boolean ativo = true;
    private List<Nfe> notas;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
    
    public List<Nfe> getNotas() {
        return notas;
    }
    
    public void setNotas(List<Nfe> notas) {
        this.notas = notas;
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