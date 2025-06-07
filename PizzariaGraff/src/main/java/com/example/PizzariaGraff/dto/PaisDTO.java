package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Pais;
import java.time.LocalDateTime;

public class PaisDTO {
    private Long id;
    private String nome;
    private String codigo;
    private String sigla;
    private String nacionalidade;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    private Boolean ativo;

    public PaisDTO() {
    }

    public PaisDTO(Long id, String nome, String codigo, String sigla, String nacionalidade) {
        this.id = id;
        this.nome = nome;
        this.codigo = codigo;
        this.sigla = sigla;
        this.nacionalidade = nacionalidade;
    }

    public static PaisDTO fromEntity(Pais pais) {
        PaisDTO dto = new PaisDTO(
            pais.getId(),
            pais.getNome(),
            pais.getCodigo(),
            pais.getSigla(),
            pais.getNacionalidade()
        );
        dto.setDataCadastro(pais.getDataCadastro());
        dto.setUltimaModificacao(pais.getUltimaModificacao());
        dto.setAtivo(pais.getAtivo() != null ? pais.getAtivo() : true);
        return dto;
    }

    public Pais toEntity() {
        Pais pais = new Pais();
        pais.setId(this.id);
        pais.setNome(this.nome);
        pais.setCodigo(this.codigo);
        pais.setSigla(this.sigla);
        pais.setNacionalidade(this.nacionalidade);
        pais.setDataCadastro(this.dataCadastro);
        pais.setUltimaModificacao(this.ultimaModificacao);
        pais.setAtivo(this.ativo != null ? this.ativo : true);
        return pais;
    }

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

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getSigla() {
        return sigla;
    }

    public void setSigla(String sigla) {
        this.sigla = sigla;
    }

    public String getNacionalidade() {
        return nacionalidade;
    }

    public void setNacionalidade(String nacionalidade) {
        this.nacionalidade = nacionalidade;
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
    
    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
} 