/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data vinda do backend para exibição no frontend
 * @param dateString Data em formato ISO ou string
 * @returns Data formatada para exibição
 */
export const formatFromBackend = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    // Corrigir problema de timezone - tratar como data local
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Converte uma data do frontend para o formato esperado pelo backend
 * @param dateString Data no formato do frontend
 * @returns Data formatada para o backend (ISO)
 */
export const formatToBackend = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Garantir que a data seja tratada como local
    const date = new Date(dateString + 'T00:00:00');
    return date.toISOString().split('T')[0]; // Retornar apenas a parte da data
  } catch (error) {
    console.error('Erro ao formatar data para o backend:', error);
    return '';
  }
};

/**
 * Obtém a data atual no formato YYYY-MM-DD para inputs de data
 * @returns Data atual no formato correto
 */
export const getCurrentDateString = (): string => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}; 