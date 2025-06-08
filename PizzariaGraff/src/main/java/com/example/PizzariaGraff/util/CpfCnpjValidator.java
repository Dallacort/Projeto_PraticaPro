package com.example.PizzariaGraff.util;

public class CpfCnpjValidator {

    /**
     * Valida CPF (11 dígitos)
     * @param cpf String contendo o CPF
     * @return true se válido, false se inválido
     */
    public static boolean isValidCPF(String cpf) {
        if (cpf == null) return false;
        
        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("[^\\d]", "");
        
        // Verifica se tem 11 dígitos
        if (cpf.length() != 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) return false;
        
        try {
            // Validação do primeiro dígito verificador
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
            }
            int resto = 11 - (soma % 11);
            int digito1 = (resto == 10 || resto == 11) ? 0 : resto;
            
            if (digito1 != Character.getNumericValue(cpf.charAt(9))) {
                return false;
            }
            
            // Validação do segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
            }
            resto = 11 - (soma % 11);
            int digito2 = (resto == 10 || resto == 11) ? 0 : resto;
            
            return digito2 == Character.getNumericValue(cpf.charAt(10));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Valida CNPJ (14 dígitos)
     * @param cnpj String contendo o CNPJ
     * @return true se válido, false se inválido
     */
    public static boolean isValidCNPJ(String cnpj) {
        if (cnpj == null) return false;
        
        // Remove caracteres não numéricos
        cnpj = cnpj.replaceAll("[^\\d]", "");
        
        // Verifica se tem 14 dígitos
        if (cnpj.length() != 14) return false;
        
        // Verifica se todos os dígitos são iguais
        if (cnpj.matches("(\\d)\\1{13}")) return false;
        
        try {
            // Validação do primeiro dígito verificador
            int soma = 0;
            int peso = 2;
            for (int i = 11; i >= 0; i--) {
                soma += Character.getNumericValue(cnpj.charAt(i)) * peso;
                peso++;
                if (peso == 10) peso = 2;
            }
            int resto = soma % 11;
            int digito1 = (resto < 2) ? 0 : 11 - resto;
            
            if (digito1 != Character.getNumericValue(cnpj.charAt(12))) {
                return false;
            }
            
            // Validação do segundo dígito verificador
            soma = 0;
            peso = 2;
            for (int i = 12; i >= 0; i--) {
                soma += Character.getNumericValue(cnpj.charAt(i)) * peso;
                peso++;
                if (peso == 10) peso = 2;
            }
            resto = soma % 11;
            int digito2 = (resto < 2) ? 0 : 11 - resto;
            
            return digito2 == Character.getNumericValue(cnpj.charAt(13));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Valida CPF ou CNPJ baseado no comprimento
     * @param documento String contendo CPF ou CNPJ
     * @return true se válido, false se inválido
     */
    public static boolean isValidCpfOrCnpj(String documento) {
        if (documento == null) return false;
        
        String limpo = documento.replaceAll("[^\\d]", "");
        
        if (limpo.length() == 11) {
            return isValidCPF(documento);
        } else if (limpo.length() == 14) {
            return isValidCNPJ(documento);
        }
        
        return false;
    }

    /**
     * Determina o tipo do documento (CPF ou CNPJ)
     * @param documento String contendo o documento
     * @return "CPF", "CNPJ" ou "INVÁLIDO"
     */
    public static String getDocumentType(String documento) {
        if (documento == null) return "INVÁLIDO";
        
        String limpo = documento.replaceAll("[^\\d]", "");
        
        if (limpo.length() == 11) {
            return isValidCPF(documento) ? "CPF" : "INVÁLIDO";
        } else if (limpo.length() == 14) {
            return isValidCNPJ(documento) ? "CNPJ" : "INVÁLIDO";
        }
        
        return "INVÁLIDO";
    }
} 