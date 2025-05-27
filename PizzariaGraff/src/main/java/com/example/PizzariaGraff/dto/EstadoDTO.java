package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.model.Pais;
import java.time.LocalDateTime;

public class EstadoDTO {
    private Long id;
    private String nome;
    private String uf;
    private String paisId;
    private String paisNome;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    private Boolean ativo;

    public EstadoDTO() {
    }

    public EstadoDTO(Long id, String nome, String uf, String paisId, String paisNome) {
        this.id = id;
        this.nome = nome;
        this.uf = uf;
        this.paisId = paisId;
        this.paisNome = paisNome;
    }

    public static EstadoDTO fromEntity(Estado estado) {
        String paisId = null;
        String paisNome = null;
        
        if (estado.getPais() != null) {
            paisId = estado.getPais().getId();
            paisNome = estado.getPais().getNome();
        }
        
        EstadoDTO dto = new EstadoDTO(
            estado.getId(),
            estado.getNome(),
            estado.getUf(),
            paisId,
            paisNome
        );
        
        dto.setDataCadastro(estado.getDataCadastro());
        dto.setUltimaModificacao(estado.getUltimaModificacao());
        dto.setAtivo(estado.getAtivo() != null ? estado.getAtivo() : true);
        
        return dto;
    }

    public Estado toEntity(Pais pais) {
        Estado estado = new Estado();
        estado.setId(this.id);
        estado.setNome(this.nome);
        estado.setUf(this.uf);
        estado.setPais(pais);
        estado.setDataCadastro(this.dataCadastro);
        estado.setUltimaModificacao(this.ultimaModificacao);
        estado.setAtivo(this.ativo != null ? this.ativo : true);
        return estado;
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

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getPaisId() {
        return paisId;
    }

    public void setPaisId(String paisId) {
        this.paisId = paisId;
    }

    public String getPaisNome() {
        return paisNome;
    }

    public void setPaisNome(String paisNome) {
        this.paisNome = paisNome;
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