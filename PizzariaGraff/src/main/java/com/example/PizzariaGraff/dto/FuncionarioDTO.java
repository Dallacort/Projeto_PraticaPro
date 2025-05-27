package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Funcionario;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FuncionarioDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String rg;
    private LocalDate dataNascimento;
    private String telefone;
    private String email;
    private String endereco;
    private String numero;
    private String complemento;
    private String bairro;
    private String cep;
    private Long cidadeId;
    private String cidadeNome;
    private String cargo;
    private LocalDate dataAdmissao;
    private LocalDate dataDemissao;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;

    public FuncionarioDTO() {
    }

    public FuncionarioDTO(Long id, String nome, String cpf, String rg, LocalDate dataNascimento, 
                         String telefone, String email, String endereco, String numero, 
                         String complemento, String bairro, String cep, Long cidadeId, 
                         String cidadeNome, String cargo, LocalDate dataAdmissao, 
                         LocalDate dataDemissao, Boolean ativo, LocalDateTime dataCadastro,
                         LocalDateTime ultimaModificacao) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.rg = rg;
        this.dataNascimento = dataNascimento;
        this.telefone = telefone;
        this.email = email;
        this.endereco = endereco;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cep = cep;
        this.cidadeId = cidadeId;
        this.cidadeNome = cidadeNome;
        this.cargo = cargo;
        this.dataAdmissao = dataAdmissao;
        this.dataDemissao = dataDemissao;
        this.ativo = ativo;
        this.dataCadastro = dataCadastro;
        this.ultimaModificacao = ultimaModificacao;
    }

    public static FuncionarioDTO fromEntity(Funcionario funcionario) {
        FuncionarioDTO dto = new FuncionarioDTO(
            funcionario.getId(),
            funcionario.getNome(),
            funcionario.getCpf(),
            funcionario.getRg(),
            funcionario.getDataNascimento(),
            funcionario.getTelefone(),
            funcionario.getEmail(),
            funcionario.getEndereco(),
            funcionario.getNumero(),
            funcionario.getComplemento(),
            funcionario.getBairro(),
            funcionario.getCep(),
            funcionario.getCidade() != null ? funcionario.getCidade().getId() : null,
            funcionario.getCidade() != null ? funcionario.getCidade().getNome() : null,
            funcionario.getCargo(),
            funcionario.getDataAdmissao(),
            funcionario.getDataDemissao(),
            funcionario.getAtivo(),
            null,
            null
        );
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(funcionario.getDataCadastro() != null ? 
                           funcionario.getDataCadastro() : 
                           LocalDateTime.now());
        
        dto.setUltimaModificacao(funcionario.getUltimaModificacao() != null ? 
                                funcionario.getUltimaModificacao() : 
                                LocalDateTime.now());
        
        return dto;
    }

    public Funcionario toEntity() {
        Funcionario funcionario = new Funcionario();
        funcionario.setId(this.id);
        funcionario.setNome(this.nome);
        funcionario.setCpf(this.cpf);
        funcionario.setRg(this.rg);
        funcionario.setDataNascimento(this.dataNascimento);
        funcionario.setTelefone(this.telefone);
        funcionario.setEmail(this.email);
        funcionario.setEndereco(this.endereco);
        funcionario.setNumero(this.numero);
        funcionario.setComplemento(this.complemento);
        funcionario.setBairro(this.bairro);
        funcionario.setCep(this.cep);
        funcionario.setCargo(this.cargo);
        funcionario.setDataAdmissao(this.dataAdmissao);
        funcionario.setDataDemissao(this.dataDemissao);
        funcionario.setAtivo(this.ativo);
        funcionario.setDataCadastro(this.dataCadastro);
        funcionario.setUltimaModificacao(this.ultimaModificacao);
        return funcionario;
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

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(LocalDate dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public LocalDate getDataDemissao() {
        return dataDemissao;
    }

    public void setDataDemissao(LocalDate dataDemissao) {
        this.dataDemissao = dataDemissao;
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