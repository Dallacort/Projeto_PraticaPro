package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Transportadora;
import java.time.LocalDateTime;

public class TransportadoraDTO {
    private Long id;
    private String razaoSocial;
    private String nomeFantasia;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
    private Long cidadeId;
    private String cidadeNome;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public TransportadoraDTO() {
    }
    
    public TransportadoraDTO(Long id, String razaoSocial, String nomeFantasia, String cnpj, String email, 
                            String telefone, String endereco, Long cidadeId, String cidadeNome, Boolean ativo) {
        this.id = id;
        this.razaoSocial = razaoSocial;
        this.nomeFantasia = nomeFantasia;
        this.cnpj = cnpj;
        this.email = email;
        this.telefone = telefone;
        this.endereco = endereco;
        this.cidadeId = cidadeId;
        this.cidadeNome = cidadeNome;
        this.ativo = ativo;
    }
    
    // Método de conversão de Entity para DTO
    public static TransportadoraDTO fromEntity(Transportadora transportadora) {
        TransportadoraDTO dto = new TransportadoraDTO();
        dto.setId(transportadora.getId());
        dto.setRazaoSocial(transportadora.getRazaoSocial());
        dto.setNomeFantasia(transportadora.getNomeFantasia());
        dto.setCnpj(transportadora.getCnpj());
        dto.setEmail(transportadora.getEmail());
        dto.setTelefone(transportadora.getTelefone());
        dto.setEndereco(transportadora.getEndereco());
        dto.setAtivo(transportadora.getAtivo());
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(transportadora.getDataCadastro() != null ? 
                           transportadora.getDataCadastro() : 
                           LocalDateTime.now());
        
        dto.setUltimaModificacao(transportadora.getUltimaModificacao() != null ? 
                                transportadora.getUltimaModificacao() : 
                                LocalDateTime.now());
        
        if (transportadora.getCidade() != null) {
            dto.setCidadeId(transportadora.getCidade().getId());
            dto.setCidadeNome(transportadora.getCidade().getNome());
        }
        
        return dto;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public Long getCidadeId() {
        return cidadeId;
    }

    public void setCidadeId(Long cidadeId) {
        this.cidadeId = cidadeId;
    }

    public String getCidadeNome() {
        return cidadeNome;
    }

    public void setCidadeNome(String cidadeNome) {
        this.cidadeNome = cidadeNome;
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