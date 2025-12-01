import { formatFromBackend, formatToBackend, getCurrentDateString } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatFromBackend', () => {
    it('deve formatar data do backend corretamente', () => {
      const dateString = '2024-01-15';
      const result = formatFromBackend(dateString);
      expect(result).toBe('15/01/2024');
    });

    it('deve retornar "-" para string vazia', () => {
      const result = formatFromBackend('');
      expect(result).toBe('-');
    });

    it('deve retornar "-" para string undefined', () => {
      const result = formatFromBackend(undefined as any);
      expect(result).toBe('-');
    });
  });

  describe('formatToBackend', () => {
    it('deve converter data para formato do backend', () => {
      const dateString = '2024-01-15';
      const result = formatToBackend(dateString);
      expect(result).toBe('2024-01-15');
    });

    it('deve retornar string vazia para string vazia', () => {
      const result = formatToBackend('');
      expect(result).toBe('');
    });
  });

  describe('getCurrentDateString', () => {
    it('deve retornar data atual no formato correto', () => {
      const result = getCurrentDateString();
      // Verificar se está no formato YYYY-MM-DD
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});






