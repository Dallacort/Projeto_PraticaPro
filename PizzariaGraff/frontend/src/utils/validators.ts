export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class Validators {
  /**
   * Valida CPF
   * @param cpf - CPF a ser validado (pode conter formatação)
   * @returns ValidationResult com resultado da validação
   */
  static validateCPF(cpf: string): ValidationResult {
    if (!cpf || !cpf.trim()) {
      return { isValid: false, error: 'CPF é obrigatório' };
    }

    const cleanCpf = cpf.replace(/[^\d]/g, '');
    
    if (cleanCpf.length !== 11) {
      return { isValid: false, error: 'CPF deve ter exatamente 11 dígitos' };
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    // Validar primeiro dígito
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCpf.charAt(9))) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    // Validar segundo dígito
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCpf.charAt(10))) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    return { isValid: true };
  }

  /**
   * Valida CNPJ
   * @param cnpj - CNPJ a ser validado (pode conter formatação)
   * @returns ValidationResult com resultado da validação
   */
  static validateCNPJ(cnpj: string): ValidationResult {
    if (!cnpj || !cnpj.trim()) {
      return { isValid: false, error: 'CNPJ é obrigatório' };
    }

    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cleanCnpj.length !== 14) {
      return { isValid: false, error: 'CNPJ deve ter exatamente 14 dígitos' };
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      return { isValid: false, error: 'CNPJ inválido' };
    }
    
    // Validar primeiro dígito
    let soma = 0;
    let peso = 2;
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cleanCnpj.charAt(i)) * peso;
      peso++;
      if (peso === 10) peso = 2;
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    if (digito1 !== parseInt(cleanCnpj.charAt(12))) {
      return { isValid: false, error: 'CNPJ inválido' };
    }
    
    // Validar segundo dígito
    soma = 0;
    peso = 2;
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cleanCnpj.charAt(i)) * peso;
      peso++;
      if (peso === 10) peso = 2;
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    if (digito2 !== parseInt(cleanCnpj.charAt(13))) {
      return { isValid: false, error: 'CNPJ inválido' };
    }
    
    return { isValid: true };
  }

  /**
   * Valida email
   * @param email - Email a ser validado
   * @returns ValidationResult com resultado da validação
   */
  static validateEmail(email: string): ValidationResult {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email é obrigatório' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email inválido' };
    }

    return { isValid: true };
  }

  /**
   * Valida se campo obrigatório está preenchido
   * @param value - Valor a ser validado
   * @param fieldName - Nome do campo para mensagem de erro
   * @returns ValidationResult com resultado da validação
   */
  static validateRequired(value: string | number | null | undefined, fieldName: string): ValidationResult {
    if (value === null || value === undefined || String(value).trim() === '') {
      return { isValid: false, error: `${fieldName} é obrigatório` };
    }
    return { isValid: true };
  }

  /**
   * Valida CPF ou CNPJ baseado no tipo de pessoa
   * @param cpfCnpj - CPF ou CNPJ a ser validado
   * @param tipo - 1 para Pessoa Física (CPF), 2 para Pessoa Jurídica (CNPJ)
   * @param isRequired - Se o campo é obrigatório
   * @returns ValidationResult com resultado da validação
   */
  static validateCpfCnpj(cpfCnpj: string, tipo: number, isRequired: boolean = true): ValidationResult {
    // Se não é obrigatório e está vazio, é válido
    if (!isRequired && (!cpfCnpj || !cpfCnpj.trim())) {
      return { isValid: true };
    }

    // Se é obrigatório e está vazio
    if (isRequired && (!cpfCnpj || !cpfCnpj.trim())) {
      const campo = tipo === 1 ? 'CPF' : 'CNPJ';
      return { isValid: false, error: `${campo} é obrigatório` };
    }

    // Validar baseado no tipo
    if (tipo === 1) {
      const result = this.validateCPF(cpfCnpj);
      // Se não é obrigatório, customizar a mensagem
      if (!result.isValid && !isRequired) {
        return { isValid: false, error: 'CPF inválido (campo opcional)' };
      }
      return result;
    } else if (tipo === 2) {
      const result = this.validateCNPJ(cpfCnpj);
      // Se não é obrigatório, customizar a mensagem
      if (!result.isValid && !isRequired) {
        return { isValid: false, error: 'CNPJ inválido (campo opcional)' };
      }
      return result;
    }

    return { isValid: false, error: 'Tipo de pessoa inválido' };
  }

  /**
   * Valida telefone brasileiro (formato básico)
   * @param telefone - Telefone a ser validado
   * @returns ValidationResult com resultado da validação
   */
  static validateTelefone(telefone: string): ValidationResult {
    if (!telefone || !telefone.trim()) {
      return { isValid: false, error: 'Telefone é obrigatório' };
    }

    const cleanTelefone = telefone.replace(/[^\d]/g, '');
    
    if (cleanTelefone.length < 4 || cleanTelefone.length > 15) {
      return { isValid: false, error: 'Telefone deve ter entre 4 e 15 dígitos' };
    }

    return { isValid: true };
  }

  /**
   * Valida CEP brasileiro
   * @param cep - CEP a ser validado
   * @returns ValidationResult com resultado da validação
   */
  static validateCEP(cep: string): ValidationResult {
    if (!cep || !cep.trim()) {
      return { isValid: false, error: 'CEP é obrigatório' };
    }

    const cleanCep = cep.replace(/[^\d]/g, '');
    
    if (cleanCep.length !== 8) {
      return { isValid: false, error: 'CEP deve ter 8 dígitos' };
    }

    return { isValid: true };
  }

  /**
   * Valida número positivo
   * @param value - Valor a ser validado
   * @param fieldName - Nome do campo para mensagem de erro
   * @returns ValidationResult com resultado da validação
   */
  static validatePositiveNumber(value: number | string, fieldName: string): ValidationResult {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue) || numValue < 0) {
      return { isValid: false, error: `${fieldName} deve ser um número positivo` };
    }

    return { isValid: true };
  }

  /**
   * Valida data (não pode ser futura para nascimento)
   * @param date - Data a ser validada
   * @param allowFuture - Se permite datas futuras
   * @returns ValidationResult com resultado da validação
   */
  static validateDate(date: string, allowFuture: boolean = true): ValidationResult {
    if (!date || !date.trim()) {
      return { isValid: false, error: 'Data é obrigatória' };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: 'Data inválida' };
    }

    if (!allowFuture && dateObj > new Date()) {
      return { isValid: false, error: 'Data não pode ser futura' };
    }

    return { isValid: true };
  }

  /**
   * Valida múltiplos campos e retorna array de erros
   * @param validations - Array de funções de validação
   * @returns Array de mensagens de erro (vazio se tudo válido)
   */
  static validateMultiple(validations: (() => ValidationResult)[]): string[] {
    const errors: string[] = [];
    
    validations.forEach(validation => {
      const result = validation();
      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
    });

    return errors;
  }
} 