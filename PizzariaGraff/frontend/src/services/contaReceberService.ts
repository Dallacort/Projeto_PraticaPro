import api from './api';
import { ContaReceber } from '../types';

// Lista todas as contas a receber
export const getContasReceber = async (): Promise<ContaReceber[]> => {
  try {
    const response = await api.get('/contas-receber');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    throw error;
  }
};

// Busca uma conta a receber por ID
export const getContaReceber = async (id: number): Promise<ContaReceber> => {
  try {
    const response = await api.get(`/contas-receber/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar conta a receber:`, error);
    throw error;
  }
};

// Busca contas por cliente
export const getContasReceberPorCliente = async (clienteId: number): Promise<ContaReceber[]> => {
  try {
    const response = await api.get(`/contas-receber/cliente/${clienteId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contas por cliente:`, error);
    throw error;
  }
};

// Busca contas por situação
export const getContasReceberPorSituacao = async (situacao: string): Promise<ContaReceber[]> => {
  try {
    const response = await api.get(`/contas-receber/situacao/${situacao}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contas por situação:`, error);
    throw error;
  }
};

// Busca contas vencidas
export const getContasReceberVencidas = async (): Promise<ContaReceber[]> => {
  try {
    const response = await api.get('/contas-receber/vencidas');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contas vencidas:', error);
    throw error;
  }
};

// Registra recebimento de uma conta
export const receberConta = async (
  id: number,
  valorRecebido: number,
  dataRecebimento: string,
  formaPagamentoId: number
): Promise<ContaReceber> => {
  try {
    const response = await api.post(`/contas-receber/${id}/receber`, {
      valorRecebido,
      dataRecebimento,
      formaPagamentoId
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar recebimento:', error);
    throw error;
  }
};

// Atualiza uma conta a receber
export const updateContaReceber = async (id: number, conta: Partial<ContaReceber>): Promise<ContaReceber> => {
  try {
    const response = await api.put(`/contas-receber/${id}`, conta);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar conta a receber:`, error);
    throw error;
  }
};

// Cancela uma conta a receber
export const cancelarContaReceber = async (id: number): Promise<void> => {
  try {
    await api.delete(`/contas-receber/${id}/cancelar`);
  } catch (error) {
    console.error(`Erro ao cancelar conta a receber:`, error);
    throw error;
  }
};

// Remove uma conta a receber
export const deleteContaReceber = async (id: number): Promise<void> => {
  try {
    await api.delete(`/contas-receber/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar conta a receber:`, error);
    throw error;
  }
};

