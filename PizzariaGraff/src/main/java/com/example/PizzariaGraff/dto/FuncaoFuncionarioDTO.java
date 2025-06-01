package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.FuncaoFuncionario;

import java.time.LocalDateTime;

public class FuncaoFuncionarioDTO {
    private Long id;
    private String descricao;
    private Double salarioBase;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    public FuncaoFuncionarioDTO() {
    }
    
    public FuncaoFuncionarioDTO(FuncaoFuncionario funcao) {
        this.id = funcao.getId();
        this.descricao = funcao.getDescricao();
        this.salarioBase = funcao.getSalarioBase();
        this.ativo = funcao.getAtivo();
        this.dataCadastro = funcao.getDataCadastro();
        this.ultimaModificacao = funcao.getUltimaModificacao();
    }
    
    public static FuncaoFuncionarioDTO fromEntity(FuncaoFuncionario funcao) {
        if (funcao == null) {
            return null;
        }
        return new FuncaoFuncionarioDTO(funcao);
    }
    
    public FuncaoFuncionario toEntity() {
        FuncaoFuncionario funcao = new FuncaoFuncionario();
        funcao.setId(this.id);
        funcao.setDescricao(this.descricao);
        funcao.setSalarioBase(this.salarioBase);
        funcao.setAtivo(this.ativo != null ? this.ativo : true);
        return funcao;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getSalarioBase() {
        return salarioBase;
    }

    public void setSalarioBase(Double salarioBase) {
        this.salarioBase = salarioBase;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
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