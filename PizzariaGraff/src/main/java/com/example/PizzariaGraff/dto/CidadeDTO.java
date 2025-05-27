package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Estado;

import java.time.LocalDateTime;

public class CidadeDTO {
    private Long id;
    private String nome;
    private Long estadoId;
    private String estadoNome;
    private String estadoUf;
    private String paisId;
    private String paisNome;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    private Boolean ativo;

    public CidadeDTO() {
    }

    public CidadeDTO(Long id, String nome, Long estadoId, String estadoNome, String estadoUf, String paisId, String paisNome, LocalDateTime dataCadastro, LocalDateTime ultimaModificacao, Boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.estadoId = estadoId;
        this.estadoNome = estadoNome;
        this.estadoUf = estadoUf;
        this.paisId = paisId;
        this.paisNome = paisNome;
        this.dataCadastro = dataCadastro;
        this.ultimaModificacao = ultimaModificacao;
        this.ativo = ativo;
    }

    public static CidadeDTO fromEntity(Cidade cidade) {
        // Garantir que os campos do estado sejam preenchidos mesmo se o estado for nulo
        Long estadoId = null;
        String estadoNome = null;
        String estadoUf = null;
        String paisId = null;
        String paisNome = null;
        
        if (cidade.getEstado() != null) {
            estadoId = cidade.getEstado().getId();
            estadoNome = cidade.getEstado().getNome();
            estadoUf = cidade.getEstado().getUf();
            
            if (cidade.getEstado().getPais() != null) {
                paisId = cidade.getEstado().getPais().getId();
                paisNome = cidade.getEstado().getPais().getNome();
            }
        }
        
        return new CidadeDTO(
            cidade.getId(),
            cidade.getNome(),
            estadoId,
            estadoNome,
            estadoUf,
            paisId,
            paisNome,
            cidade.getDataCadastro(),
            cidade.getUltimaModificacao(),
            cidade.getAtivo() != null ? cidade.getAtivo() : true
        );
    }

    public Cidade toEntity(Estado estado) {
        Cidade cidade = new Cidade();
        cidade.setId(this.id);
        cidade.setNome(this.nome);
        cidade.setEstado(estado);
        cidade.setDataCadastro(this.dataCadastro);
        cidade.setUltimaModificacao(this.ultimaModificacao);
        cidade.setAtivo(this.ativo != null ? this.ativo : true);
        return cidade;
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

    public Long getEstadoId() {
        return estadoId;
    }

    public void setEstadoId(Long estadoId) {
        this.estadoId = estadoId;
    }

    public String getEstadoNome() {
        return estadoNome;
    }

    public void setEstadoNome(String estadoNome) {
        this.estadoNome = estadoNome;
    }

    public String getEstadoUf() {
        return estadoUf;
    }

    public void setEstadoUf(String estadoUf) {
        this.estadoUf = estadoUf;
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