import api from './api';
import { ContaPagar } from '../types';

// Lista todas as contas a pagar
export const getContasPagar = async (): Promise<ContaPagar[]> => {
  try {
    const response = await api.get('/contas-pagar');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    throw error;
  }
};

// Busca uma conta a pagar por ID
export const getContaPagar = async (id: number): Promise<ContaPagar> => {
  try {
    const response = await api.get(`/contas-pagar/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar conta a pagar:`, error);
    throw error;
  }
};

// Busca contas por fornecedor
export const getContasPagarPorFornecedor = async (fornecedorId: number): Promise<ContaPagar[]> => {
  try {
    const response = await api.get(`/contas-pagar/fornecedor/${fornecedorId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contas por fornecedor:`, error);
    throw error;
  }
};

// Busca contas por situação
export const getContasPagarPorSituacao = async (situacao: string): Promise<ContaPagar[]> => {
  try {
    const response = await api.get(`/contas-pagar/situacao/${situacao}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contas por situação:`, error);
    throw error;
  }
};

// Busca contas vencidas
export const getContasPagarVencidas = async (): Promise<ContaPagar[]> => {
  try {
    const response = await api.get('/contas-pagar/vencidas');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contas vencidas:', error);
    throw error;
  }
};

// Registra pagamento de uma conta
export const pagarConta = async (
  id: number,
  valorPago: number,
  dataPagamento: string,
  formaPagamentoId?: number | undefined
): Promise<ContaPagar> => {
  try {
    const response = await api.post(`/contas-pagar/${id}/pagar`, {
      valorPago,
      dataPagamento,
      formaPagamentoId: formaPagamentoId || null
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    throw error;
  }
};

// Atualiza uma conta a pagar
export const updateContaPagar = async (id: number, conta: Partial<ContaPagar>): Promise<ContaPagar> => {
  try {
    const response = await api.put(`/contas-pagar/${id}`, conta);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar conta a pagar:`, error);
    throw error;
  }
};

// Cancela uma conta a pagar
export const cancelarContaPagar = async (id: number): Promise<void> => {
  try {
    await api.delete(`/contas-pagar/${id}/cancelar`);
  } catch (error) {
    console.error(`Erro ao cancelar conta a pagar:`, error);
    throw error;
  }
};

// Remove uma conta a pagar
export const deleteContaPagar = async (id: number): Promise<void> => {
  try {
    await api.delete(`/contas-pagar/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar conta a pagar:`, error);
    throw error;
  }
};

