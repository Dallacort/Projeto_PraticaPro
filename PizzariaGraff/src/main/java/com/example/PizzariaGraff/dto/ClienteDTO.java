package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.model.Cidade;
import java.time.LocalDateTime;

public class ClienteDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
    private String numero;
    private String complemento;
    private String bairro;
    private String cep;
    private Long cidadeId;
    private String cidadeNome;
    private Long estadoId;
    private String estadoNome;
    private String estadoUf;
    private String paisId;
    private String paisNome;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    public ClienteDTO() {
    }
    
    public ClienteDTO(Long id, String nome, String cpf, String cnpj, String email, 
                     String telefone, String endereco, String numero, String complemento,
                     String bairro, String cep, Long cidadeId, String cidadeNome, Boolean ativo,
                     LocalDateTime dataCadastro, LocalDateTime ultimaModificacao) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.cnpj = cnpj;
        this.email = email;
        this.telefone = telefone;
        this.endereco = endereco;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cep = cep;
        this.cidadeId = cidadeId;
        this.cidadeNome = cidadeNome;
        this.ativo = ativo;
        this.dataCadastro = dataCadastro;
        this.ultimaModificacao = ultimaModificacao;
    }
    
    public ClienteDTO(Cliente cliente) {
        this.id = cliente.getId();
        this.nome = cliente.getNome();
        this.cpf = cliente.getCpf();
        this.cnpj = cliente.getCnpj();
        this.email = cliente.getEmail();
        this.telefone = cliente.getTelefone();
        this.endereco = cliente.getEndereco();
        this.numero = cliente.getNumero();
        this.complemento = cliente.getComplemento();
        this.bairro = cliente.getBairro();
        this.cep = cliente.getCep();
        this.ativo = cliente.getAtivo();
        this.dataCadastro = cliente.getDataCadastro();
        this.ultimaModificacao = cliente.getUltimaModificacao();
        
        if (cliente.getCidade() != null) {
            this.cidadeId = cliente.getCidade().getId();
            this.cidadeNome = cliente.getCidade().getNome();
            
            if (cliente.getCidade().getEstado() != null) {
                this.estadoId = cliente.getCidade().getEstado().getId();
                this.estadoNome = cliente.getCidade().getEstado().getNome();
                this.estadoUf = cliente.getCidade().getEstado().getUf();
                
                if (cliente.getCidade().getEstado().getPais() != null) {
                    this.paisId = cliente.getCidade().getEstado().getPais().getId();
                    this.paisNome = cliente.getCidade().getEstado().getPais().getNome();
                }
            }
        }
    }
    
    public static ClienteDTO fromEntity(Cliente cliente) {
        if (cliente == null) {
            return null;
        }
        return new ClienteDTO(cliente);
    }
    
    public Cliente toEntity(Cidade cidade) {
        Cliente cliente = new Cliente();
        cliente.setId(this.id);
        cliente.setNome(this.nome);
        cliente.setCpf(this.cpf);
        cliente.setCnpj(this.cnpj);
        cliente.setEmail(this.email);
        cliente.setTelefone(this.telefone);
        cliente.setEndereco(this.endereco);
        cliente.setNumero(this.numero);
        cliente.setComplemento(this.complemento);
        cliente.setBairro(this.bairro);
        cliente.setCep(this.cep);
        cliente.setCidade(cidade);
        cliente.setAtivo(this.ativo != null ? this.ativo : true);
        return cliente;
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

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
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

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
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
} 