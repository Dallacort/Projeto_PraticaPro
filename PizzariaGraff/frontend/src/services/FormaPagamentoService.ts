import { FormaPagamento } from '../types';
import api from './api';

export interface FormaPagamentoInput {
  nome: string;
  descricao: string;
  ativo: boolean;
}

// Função para converter string para Date se necessário
const convertToDate = (value: Date | string | undefined): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return new Date(value);
};

const FormaPagamentoService = {
  async list(): Promise<FormaPagamento[]> {
    try {
      const response = await api.get('/formas-pagamento');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      throw error;
    }
  },

  async listAtivos(): Promise<FormaPagamento[]> {
    try {
      const response = await api.get('/formas-pagamento/ativos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento ativas:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<FormaPagamento> {
    try {
      const response = await api.get(`/formas-pagamento/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar forma de pagamento:', error);
      throw error;
    }
  },

  async create(formaPagamento: FormaPagamentoInput): Promise<FormaPagamento> {
    try {
      const dataToSend = {
        nome: formaPagamento.nome,
        descricao: formaPagamento.descricao,
        ativo: formaPagamento.ativo
      };
      
      console.log('Dados enviados para criação:', dataToSend);
      const response = await api.post('/formas-pagamento', dataToSend);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar forma de pagamento:', error);
      throw error;
    }
  },

  async update(id: number, formaPagamento: FormaPagamentoInput): Promise<FormaPagamento> {
    try {
      const dataToSend = {
        nome: formaPagamento.nome,
        descricao: formaPagamento.descricao,
        ativo: formaPagamento.ativo
      };
      
      console.log('Dados enviados para atualização:', dataToSend);
      const response = await api.put(`/formas-pagamento/${id}`, dataToSend);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar forma de pagamento:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/formas-pagamento/${id}`);
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error);
      throw error;
    }
  }
};

export default FormaPagamentoService;