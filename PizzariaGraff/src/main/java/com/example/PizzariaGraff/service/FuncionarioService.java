package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Funcionario;
import com.example.PizzariaGraff.repository.FuncionarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuncionarioService {
    
    private final FuncionarioRepository funcionarioRepository;
    
    public FuncionarioService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }
    
    public List<Funcionario> findAll() {
        return funcionarioRepository.findAll();
    }
    
    public Funcionario findById(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
    }
    
    public List<Funcionario> findByFuncionario(String funcionario) {
        return funcionarioRepository.findByFuncionario(funcionario);
    }
    
    public List<Funcionario> findByCpfCpnj(String cpfCpnj) {
        return funcionarioRepository.findByCpfCpnj(cpfCpnj);
    }
    
    public Funcionario findByEmail(String email) {
        return funcionarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o email: " + email));
    }
    
    public List<Funcionario> findByFuncaoFuncionarioId(Long funcaoId) {
        return funcionarioRepository.findByFuncaoFuncionarioId(funcaoId);
    }
    
    public Funcionario save(Funcionario funcionario) {
        // Validações obrigatórias
        validarCamposObrigatorios(funcionario);
        
        // Validação e verificação de duplicatas de CPF/CNPJ
        if (funcionario.getCpfCpnj() != null && !funcionario.getCpfCpnj().trim().isEmpty()) {
            validarCpfCnpj(funcionario.getCpfCpnj(), funcionario.getTipo());
            verificarCpfCnpjDuplicado(funcionario.getCpfCpnj(), funcionario.getId());
        }
        
        // Verificar email duplicado
        verificarEmailDuplicado(funcionario.getEmail(), funcionario.getId());
        
        return funcionarioRepository.save(funcionario);
    }
    
    private void validarCamposObrigatorios(Funcionario funcionario) {
        if (funcionario.getFuncionario() == null || funcionario.getFuncionario().trim().isEmpty()) {
            throw new RuntimeException("O nome do funcionário é obrigatório");
        }
        
        if (funcionario.getEmail() == null || funcionario.getEmail().trim().isEmpty()) {
            throw new RuntimeException("O email é obrigatório");
        }
        
        if (funcionario.getTelefone() == null || funcionario.getTelefone().trim().isEmpty()) {
            throw new RuntimeException("O telefone é obrigatório");
        }
        
        if (funcionario.getEndereco() == null || funcionario.getEndereco().trim().isEmpty()) {
            throw new RuntimeException("O endereço é obrigatório");
        }
        
        if (funcionario.getNumero() == null || funcionario.getNumero().trim().isEmpty()) {
            throw new RuntimeException("O número do endereço é obrigatório");
        }
        
        if (funcionario.getBairro() == null || funcionario.getBairro().trim().isEmpty()) {
            throw new RuntimeException("O bairro é obrigatório");
        }
        
        if (funcionario.getCep() == null || funcionario.getCep().trim().isEmpty()) {
            throw new RuntimeException("O CEP é obrigatório");
        }
        
        if (funcionario.getSexo() == null) {
            throw new RuntimeException("O sexo é obrigatório");
        }
        
        if (funcionario.getEstadoCivil() == null) {
            throw new RuntimeException("O estado civil é obrigatório");
        }
        
        if (funcionario.getSalario() == null) {
            throw new RuntimeException("O salário é obrigatório");
        }
        
        if (funcionario.getDataNascimento() == null) {
            throw new RuntimeException("A data de nascimento é obrigatória");
        }
        
        if (funcionario.getDataAdmissao() == null) {
            throw new RuntimeException("A data de admissão é obrigatória");
        }
        
        if (funcionario.getCidadeId() == null) {
            throw new RuntimeException("A cidade é obrigatória");
        }
        
        if (funcionario.getFuncaoFuncionarioId() == null) {
            throw new RuntimeException("A função é obrigatória");
        }
        
        if (funcionario.getNacionalidadeId() == null) {
            throw new RuntimeException("A nacionalidade é obrigatória");
        }
        
        if (funcionario.getTipo() == null) {
            throw new RuntimeException("O tipo (Pessoa Física/Jurídica) é obrigatório");
        }
        
        if (funcionario.getObservacao() == null || funcionario.getObservacao().trim().isEmpty()) {
            throw new RuntimeException("A observação é obrigatória");
        }
        
        // CPF/CNPJ é obrigatório apenas para brasileiros (nacionalidadeId = 1)
        if (funcionario.getNacionalidadeId() != null && funcionario.getNacionalidadeId() == 1) {
            if (funcionario.getCpfCpnj() == null || funcionario.getCpfCpnj().trim().isEmpty()) {
                String documento = funcionario.getTipo() == 1 ? "CPF" : "CNPJ";
                throw new RuntimeException("O " + documento + " é obrigatório para funcionários brasileiros");
            }
        }
        
        // Campos opcionais: apelido, complemento, cnh, dataValidadeCnh, dataDemissao
        // Não precisam de validação de obrigatoriedade
    }
    
    private void validarCpfCnpj(String cpfCnpj, Integer tipo) {
        if (cpfCnpj == null || cpfCnpj.trim().isEmpty()) {
            return; // Já validado na função anterior se obrigatório
        }
        
        String documento = cpfCnpj.replaceAll("[^0-9]", "");
        
        if (tipo == 1) { // Pessoa Física - CPF
            if (documento.length() != 11) {
                throw new RuntimeException("CPF deve conter exatamente 11 dígitos");
            }
            if (!validarCPF(documento)) {
                throw new RuntimeException("CPF inválido");
            }
        } else if (tipo == 2) { // Pessoa Jurídica - CNPJ
            if (documento.length() != 14) {
                throw new RuntimeException("CNPJ deve conter exatamente 14 dígitos");
            }
            if (!validarCNPJ(documento)) {
                throw new RuntimeException("CNPJ inválido");
            }
        }
    }
    
    private void verificarCpfCnpjDuplicado(String cpfCnpj, Long funcionarioId) {
        if (cpfCnpj == null || cpfCnpj.trim().isEmpty()) {
            return;
        }
        
        List<Funcionario> funcionariosExistentes = funcionarioRepository.findByCpfCpnj(cpfCnpj);
        
        for (Funcionario existente : funcionariosExistentes) {
            // Se é um funcionário diferente (não é uma atualização do mesmo)
            if (funcionarioId == null || !existente.getId().equals(funcionarioId)) {
                String documento = existente.getTipo() == 1 ? "CPF" : "CNPJ";
                throw new RuntimeException("Já existe um funcionário cadastrado com este " + documento);
            }
        }
    }
    
    private void verificarEmailDuplicado(String email, Long funcionarioId) {
        if (email == null || email.trim().isEmpty()) {
            return;
        }
        
        try {
            Funcionario funcionarioExistente = funcionarioRepository.findByEmail(email).orElse(null);
            
            if (funcionarioExistente != null) {
                // Se é um funcionário diferente (não é uma atualização do mesmo)
                if (funcionarioId == null || !funcionarioExistente.getId().equals(funcionarioId)) {
                    throw new RuntimeException("Já existe um funcionário cadastrado com este email");
                }
            }
        } catch (RuntimeException e) {
            // Se não encontrou, está OK
            if (!e.getMessage().contains("não encontrado")) {
                throw e;
            }
        }
    }
    
    private boolean validarCPF(String cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("[^0-9]", "");
        
        // Verifica se tem 11 dígitos
        if (cpf.length() != 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) return false;
        
        // Calcula o primeiro dígito verificador
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) primeiroDigito = 0;
        
        // Calcula o segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) segundoDigito = 0;
        
        // Verifica se os dígitos calculados conferem com os informados
        return Character.getNumericValue(cpf.charAt(9)) == primeiroDigito &&
               Character.getNumericValue(cpf.charAt(10)) == segundoDigito;
    }
    
    private boolean validarCNPJ(String cnpj) {
        // Remove caracteres não numéricos
        cnpj = cnpj.replaceAll("[^0-9]", "");
        
        // Verifica se tem 14 dígitos
        if (cnpj.length() != 14) return false;
        
        // Verifica se todos os dígitos são iguais
        if (cnpj.matches("(\\d)\\1{13}")) return false;
        
        // Calcula o primeiro dígito verificador
        int[] peso1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * peso1[i];
        }
        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) primeiroDigito = 0;
        
        // Calcula o segundo dígito verificador
        int[] peso2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * peso2[i];
        }
        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) segundoDigito = 0;
        
        // Verifica se os dígitos calculados conferem com os informados
        return Character.getNumericValue(cnpj.charAt(12)) == primeiroDigito &&
               Character.getNumericValue(cnpj.charAt(13)) == segundoDigito;
    }
    
    public void deleteById(Long id) {
        funcionarioRepository.deleteById(id);
    }
} 