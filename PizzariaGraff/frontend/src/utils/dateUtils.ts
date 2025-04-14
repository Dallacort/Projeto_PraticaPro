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
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Erro ao formatar data para o backend:', error);
    return '';
  }
}; 