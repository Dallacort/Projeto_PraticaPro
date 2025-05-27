package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.model.Cidade;
import java.time.LocalDateTime;

public class FornecedorDTO {
    private Long id;
    private String razaoSocial;
    private String nomeFantasia;
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
    
    public FornecedorDTO() {
    }
    
    public FornecedorDTO(Long id, String razaoSocial, String nomeFantasia, String cnpj, String email, 
                         String telefone, String endereco, String numero, String complemento,
                         String bairro, String cep, Long cidadeId, String cidadeNome, 
                         Long estadoId, String estadoNome, String estadoUf,
                         String paisId, String paisNome, Boolean ativo,
                         LocalDateTime dataCadastro, LocalDateTime ultimaModificacao) {
        this.id = id;
        this.razaoSocial = razaoSocial;
        this.nomeFantasia = nomeFantasia;
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
        this.estadoId = estadoId;
        this.estadoNome = estadoNome;
        this.estadoUf = estadoUf;
        this.paisId = paisId;
        this.paisNome = paisNome;
        this.ativo = ativo;
        this.dataCadastro = dataCadastro;
        this.ultimaModificacao = ultimaModificacao;
    }
    
    public static FornecedorDTO fromEntity(Fornecedor fornecedor) {
        if (fornecedor == null) {
            return null;
        }
        
        FornecedorDTO dto = new FornecedorDTO();
        dto.setId(fornecedor.getId());
        dto.setRazaoSocial(fornecedor.getRazaoSocial());
        dto.setNomeFantasia(fornecedor.getNomeFantasia());
        dto.setCnpj(fornecedor.getCnpj());
        dto.setEmail(fornecedor.getEmail());
        dto.setTelefone(fornecedor.getTelefone());
        dto.setEndereco(fornecedor.getEndereco());
        dto.setNumero(fornecedor.getNumero());
        dto.setComplemento(fornecedor.getComplemento());
        dto.setBairro(fornecedor.getBairro());
        dto.setCep(fornecedor.getCep());
        dto.setAtivo(fornecedor.getAtivo());
        dto.setDataCadastro(fornecedor.getDataCadastro());
        dto.setUltimaModificacao(fornecedor.getUltimaModificacao());
        
        if (fornecedor.getCidade() != null) {
            dto.setCidadeId(fornecedor.getCidade().getId());
            dto.setCidadeNome(fornecedor.getCidade().getNome());
            
            if (fornecedor.getCidade().getEstado() != null) {
                dto.setEstadoId(fornecedor.getCidade().getEstado().getId());
                dto.setEstadoNome(fornecedor.getCidade().getEstado().getNome());
                dto.setEstadoUf(fornecedor.getCidade().getEstado().getUf());
                
                if (fornecedor.getCidade().getEstado().getPais() != null) {
                    dto.setPaisId(fornecedor.getCidade().getEstado().getPais().getId());
                    dto.setPaisNome(fornecedor.getCidade().getEstado().getPais().getNome());
                }
            }
        }
        
        return dto;
    }
    
    public Fornecedor toEntity(Cidade cidade) {
        System.out.println("Convertendo DTO para entidade de Fornecedor");
        System.out.println("Valores recebidos no DTO:");
        System.out.println("- ID: " + this.id);
        System.out.println("- Razão Social: " + this.razaoSocial);
        System.out.println("- Nome Fantasia: " + this.nomeFantasia);
        System.out.println("- CNPJ: " + this.cnpj);
        System.out.println("- Email: " + this.email);
        System.out.println("- Telefone: " + this.telefone);
        System.out.println("- Endereço: " + this.endereco);
        System.out.println("- cidadeId: " + this.cidadeId);
        System.out.println("- Cidade recebida como parâmetro: " + (cidade != null ? "ID=" + cidade.getId() + ", Nome=" + cidade.getNome() : "null"));

        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setId(this.id);
        fornecedor.setRazaoSocial(this.razaoSocial);
        fornecedor.setNomeFantasia(this.nomeFantasia);
        fornecedor.setCnpj(this.cnpj);
        fornecedor.setEmail(this.email);
        fornecedor.setTelefone(this.telefone);
        fornecedor.setEndereco(this.endereco);
        fornecedor.setNumero(this.numero);
        fornecedor.setComplemento(this.complemento);
        fornecedor.setBairro(this.bairro);
        fornecedor.setCep(this.cep);
        fornecedor.setCidade(cidade);
        fornecedor.setAtivo(this.ativo != null ? this.ativo : true);
        fornecedor.setDataCadastro(this.dataCadastro);
        fornecedor.setUltimaModificacao(this.ultimaModificacao);
        
        System.out.println("Entidade Fornecedor criada com sucesso");
        System.out.println("- ID: " + fornecedor.getId());
        System.out.println("- Razão Social: " + fornecedor.getRazaoSocial());
        System.out.println("- Nome Fantasia: " + fornecedor.getNomeFantasia());
        System.out.println("- CNPJ: " + fornecedor.getCnpj());
        System.out.println("- Cidade: " + (fornecedor.getCidade() != null ? "ID=" + fornecedor.getCidade().getId() : "null"));
        
        return fornecedor;
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