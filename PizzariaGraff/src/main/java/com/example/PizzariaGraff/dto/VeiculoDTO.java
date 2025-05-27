package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Veiculo;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VeiculoDTO {
    private Long id;
    private String placa;
    private String modelo;
    private String marca;
    private Integer ano;
    private BigDecimal capacidade;
    private Long transportadoraId;
    private String transportadoraNome;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public VeiculoDTO() {
    }
    
    public VeiculoDTO(Long id, String placa, String modelo, String marca, Integer ano, 
                      BigDecimal capacidade, Long transportadoraId, String transportadoraNome, Boolean ativo) {
        this.id = id;
        this.placa = placa;
        this.modelo = modelo;
        this.marca = marca;
        this.ano = ano;
        this.capacidade = capacidade;
        this.transportadoraId = transportadoraId;
        this.transportadoraNome = transportadoraNome;
        this.ativo = ativo;
    }
    
    // Método de conversão de Entity para DTO
    public static VeiculoDTO fromEntity(Veiculo veiculo) {
        VeiculoDTO dto = new VeiculoDTO();
        dto.setId(veiculo.getId());
        dto.setPlaca(veiculo.getPlaca());
        dto.setModelo(veiculo.getModelo());
        dto.setMarca(veiculo.getMarca());
        dto.setAno(veiculo.getAno());
        dto.setCapacidade(veiculo.getCapacidade());
        dto.setAtivo(veiculo.getAtivo());
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(veiculo.getDataCadastro() != null ? 
                            veiculo.getDataCadastro() : 
                            LocalDateTime.now());
        
        dto.setUltimaModificacao(veiculo.getUltimaModificacao() != null ? 
                                veiculo.getUltimaModificacao() : 
                                LocalDateTime.now());
        
        if (veiculo.getTransportadora() != null) {
            dto.setTransportadoraId(veiculo.getTransportadora().getId());
            dto.setTransportadoraNome(veiculo.getTransportadora().getRazaoSocial());
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

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public BigDecimal getCapacidade() {
        return capacidade;
    }

    public void setCapacidade(BigDecimal capacidade) {
        this.capacidade = capacidade;
    }

    public Long getTransportadoraId() {
        return transportadoraId;
    }

    public void setTransportadoraId(Long transportadoraId) {
        this.transportadoraId = transportadoraId;
    }

    public String getTransportadoraNome() {
        return transportadoraNome;
    }

    public void setTransportadoraNome(String transportadoraNome) {
        this.transportadoraNome = transportadoraNome;
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