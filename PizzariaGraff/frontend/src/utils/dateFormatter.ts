// Utilitário para formatação de datas para o backend

/**
 * Formata uma data para o formato esperado pelo backend (YYYY-MM-DD)
 * @param date - Data a ser formatada (string, Date ou null/undefined)
 * @returns String no formato YYYY-MM-DD ou data atual se inválida
 */
export const formatDateForBackend = (date: any): string => {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }

  if (typeof date === 'string') {
    // Se já está no formato YYYY-MM-DD, retorna
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // Se tem T (ISO), remove a parte da hora
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    
    // Se tem espaço (formato brasileiro ou LocalDateTime), converte
    if (date.includes(' ')) {
      try {
        // Tenta converter diretamente
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      } catch {
        // Se falhar, tenta formatar manualmente
        try {
          // Formato: "2025-10-19 20:43:28" -> "2025-10-19"
          const datePart = date.split(' ')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
          }
        } catch {
          // Fallback
        }
      }
    }
    
    // Tenta converter diretamente
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    } catch {
      // Fallback
    }
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // Fallback para data atual
  return new Date().toISOString().split('T')[0];
};

/**
 * Formata todas as datas de uma nota para o backend
 * @param nota - Objeto da nota com possíveis campos de data
 * @returns Objeto com todas as datas formatadas
 */
export const formatNotaDates = (nota: any): any => {
  if (!nota) return nota;

  const formatted = { ...nota };

  // Campos de data comuns em notas
  const dateFields = [
    'dataEmissao',
    'dataChegada', 
    'dataSaida',
    'dataVencimento',
    'dataPagamento',
    'dataRecebimento',
    'createdAt',
    'updatedAt'
  ];

  // Formatar cada campo de data
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDateForBackend(formatted[field]);
    }
  });

  // Formatar datas em arrays (ex: produtos com datas)
  if (formatted.produtos && Array.isArray(formatted.produtos)) {
    formatted.produtos = formatted.produtos.map((produto: any) => {
      const produtoFormatted = { ...produto };
      dateFields.forEach(field => {
        if (produtoFormatted[field]) {
          produtoFormatted[field] = formatDateForBackend(produtoFormatted[field]);
        }
      });
      return produtoFormatted;
    });
  }

  // Formatar datas em arrays de parcelas
  if (formatted.parcelas && Array.isArray(formatted.parcelas)) {
    formatted.parcelas = formatted.parcelas.map((parcela: any) => {
      const parcelaFormatted = { ...parcela };
      dateFields.forEach(field => {
        if (parcelaFormatted[field]) {
          parcelaFormatted[field] = formatDateForBackend(parcelaFormatted[field]);
        }
      });
      return parcelaFormatted;
    });
  }

  // Formatação recursiva para objetos aninhados
  const formatNestedDates = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => formatNestedDates(item));
    }
    
    const formatted = { ...obj };
    
    // Verifica se o valor parece ser uma data (contém números e hífens/espaços)
    Object.keys(formatted).forEach(key => {
      const value = formatted[key];
      if (typeof value === 'string' && (
        value.includes('-') || 
        value.includes(' ') || 
        value.includes('T') ||
        /^\d{4}-\d{2}-\d{2}/.test(value) ||
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value)
      )) {
        formatted[key] = formatDateForBackend(value);
      } else if (typeof value === 'object' && value !== null) {
        formatted[key] = formatNestedDates(value);
      }
    });
    
    return formatted;
  };

  return formatNestedDates(formatted);
};
