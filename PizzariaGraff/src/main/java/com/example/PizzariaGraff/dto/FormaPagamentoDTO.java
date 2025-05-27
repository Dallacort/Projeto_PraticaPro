package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.FormaPagamento;
import java.time.LocalDateTime;

public class FormaPagamentoDTO {
    private Long id;
    private String nome;
    private String descricao;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    public FormaPagamentoDTO() {
    }

    public FormaPagamentoDTO(Long id, String nome, String descricao, Boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.ativo = ativo;
    }

    public FormaPagamentoDTO(FormaPagamento forma) {
        this.id = forma.getId();
        this.nome = forma.getNome();
        this.descricao = forma.getDescricao();
        this.ativo = forma.getAtivo();
        this.dataCadastro = forma.getDataCadastro();
        this.ultimaModificacao = forma.getUltimaModificacao();
    }
    
    public static FormaPagamentoDTO fromEntity(FormaPagamento forma) {
        if (forma == null) {
            return null;
        }
        return new FormaPagamentoDTO(forma);
    }
    
    public FormaPagamento toEntity() {
        FormaPagamento forma = new FormaPagamento();
        forma.setId(this.id);
        forma.setNome(this.nome);
        forma.setDescricao(this.descricao);
        forma.setAtivo(this.ativo);
        forma.setDataCadastro(this.dataCadastro);
        forma.setUltimaModificacao(this.ultimaModificacao);
        return forma;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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
    
    @Override
    public String toString() {
        return "FormaPagamentoDTO{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", descricao='" + descricao + '\'' +
                ", ativo=" + ativo +
                ", dataCadastro=" + dataCadastro +
                ", ultimaModificacao=" + ultimaModificacao +
                '}';
    }
} 