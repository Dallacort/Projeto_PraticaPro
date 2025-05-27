import api from './api';
import { StatusNfe } from '../types';

const StatusNfeService = {
  async list(): Promise<StatusNfe[]> {
    try {
      const response = await api.get('/status-nfe');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar status de NFe:', error);
      throw error;
    }
  },

  async listAtivos(): Promise<StatusNfe[]> {
    try {
      const response = await api.get('/status-nfe/ativos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar status de NFe ativos:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<StatusNfe | null> {
    try {
      const response = await api.get(`/status-nfe/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar status de NFe com ID ${id}:`, error);
      throw error;
    }
  },

  async create(data: Omit<StatusNfe, 'id'>): Promise<StatusNfe> {
    try {
      const response = await api.post('/status-nfe', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar status de NFe:', error);
      throw error;
    }
  },

  async update(id: number, data: Omit<StatusNfe, 'id'>): Promise<StatusNfe> {
    try {
      const response = await api.put(`/status-nfe/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status de NFe com ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/status-nfe/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir status de NFe com ID ${id}:`, error);
      throw error;
    }
  }
};

export default StatusNfeService; 