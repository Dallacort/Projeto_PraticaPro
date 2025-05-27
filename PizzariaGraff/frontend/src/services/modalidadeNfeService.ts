import api from './api';
import { ModalidadeNfe } from '../types';

// Exportar funções individuais para compatibilidade com código existente
export const getModalidadesNfe = async (): Promise<ModalidadeNfe[]> => {
  return ModalidadeNfeService.list();
};

export const getModalidadeNfe = async (id: number): Promise<ModalidadeNfe | null> => {
  return ModalidadeNfeService.getById(id);
};

export const createModalidadeNfe = async (data: Omit<ModalidadeNfe, 'id'>): Promise<ModalidadeNfe> => {
  return ModalidadeNfeService.create(data);
};

export const updateModalidadeNfe = async (id: number, data: Omit<ModalidadeNfe, 'id'>): Promise<ModalidadeNfe> => {
  return ModalidadeNfeService.update(id, data);
};

export const deleteModalidadeNfe = async (id: number): Promise<void> => {
  return ModalidadeNfeService.delete(id);
};

// Mock para compatibilidade
export const mockModalidadesNfe: ModalidadeNfe[] = [
  { id: 1, descricao: 'Venda' },
  { id: 2, descricao: 'Devolução' },
  { id: 3, descricao: 'Transferência' }
];

const ModalidadeNfeService = {
  async list(): Promise<ModalidadeNfe[]> {
    try {
      const response = await api.get('/modalidades-nfe');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar modalidades de NFe:', error);
      throw error;
    }
  },

  async listAtivos(): Promise<ModalidadeNfe[]> {
    try {
      const response = await api.get('/modalidades-nfe/ativos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar modalidades de NFe ativas:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<ModalidadeNfe | null> {
    try {
      const response = await api.get(`/modalidades-nfe/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar modalidade de NFe com ID ${id}:`, error);
      throw error;
    }
  },

  async create(data: Omit<ModalidadeNfe, 'id'>): Promise<ModalidadeNfe> {
    try {
      const response = await api.post('/modalidades-nfe', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar modalidade de NFe:', error);
      throw error;
    }
  },

  async update(id: number, data: Omit<ModalidadeNfe, 'id'>): Promise<ModalidadeNfe> {
    try {
      const response = await api.put(`/modalidades-nfe/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar modalidade de NFe com ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/modalidades-nfe/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir modalidade de NFe com ID ${id}:`, error);
      throw error;
    }
  }
};

export default ModalidadeNfeService; 