import api from './api';
import { ContaPagarAvulsa } from '../types';

// Lista todas as contas a pagar avulsas
export const getContasPagarAvulsa = async (): Promise<ContaPagarAvulsa[]> => {
  try {
    const response = await api.get('/contas-pagar-avulsa');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contas a pagar avulsas:', error);
    throw error;
  }
};

// Busca uma conta a pagar avulsa por ID
export const getContaPagarAvulsa = async (id: number): Promise<ContaPagarAvulsa> => {
  try {
    const response = await api.get(`/contas-pagar-avulsa/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar conta a pagar avulsa:`, error);
    throw error;
  }
};

// Busca contas avulsas por fornecedor
export const getContasPagarAvulsaPorFornecedor = async (fornecedorId: number): Promise<ContaPagarAvulsa[]> => {
  try {
    const response = await api.get(`/contas-pagar-avulsa/fornecedor/${fornecedorId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contas avulsas por fornecedor:`, error);
    throw error;
  }
};

// Busca contas avulsas por status
export const getContasPagarAvulsaPorStatus = async (status: string): Promise<ContaPagarAvulsa[]> => {
  try {
    const response = await api.get(`/contas-pagar-avulsa/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contas avulsas por status:`, error);
    throw error;
  }
};

// Busca contas avulsas vencidas
export const getContasPagarAvulsaVencidas = async (): Promise<ContaPagarAvulsa[]> => {
  try {
    const response = await api.get('/contas-pagar-avulsa/vencidas');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contas avulsas vencidas:', error);
    throw error;
  }
};

// Cria uma nova conta a pagar avulsa
export const createContaPagarAvulsa = async (conta: Partial<ContaPagarAvulsa>): Promise<ContaPagarAvulsa> => {
  try {
    const response = await api.post('/contas-pagar-avulsa', conta);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar conta a pagar avulsa:', error);
    throw error;
  }
};

// Registra pagamento de uma conta avulsa
export const pagarContaAvulsa = async (
  id: number,
  valorPago: number,
  dataPagamento: string | null,
  formaPagamentoId: number
): Promise<ContaPagarAvulsa> => {
  try {
    const response = await api.post(`/contas-pagar-avulsa/${id}/pagar`, {
      valorPago,
      dataPagamento: dataPagamento || null, // Se não fornecido, será null e o backend usará data atual
      formaPagamentoId
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    throw error;
  }
};

// Atualiza uma conta a pagar avulsa
export const updateContaPagarAvulsa = async (id: number, conta: Partial<ContaPagarAvulsa>): Promise<ContaPagarAvulsa> => {
  try {
    const response = await api.put(`/contas-pagar-avulsa/${id}`, conta);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar conta a pagar avulsa:`, error);
    throw error;
  }
};

// Cancela uma conta a pagar avulsa
export const cancelarContaPagarAvulsa = async (id: number): Promise<void> => {
  try {
    await api.delete(`/contas-pagar-avulsa/${id}/cancelar`);
  } catch (error) {
    console.error(`Erro ao cancelar conta a pagar avulsa:`, error);
    throw error;
  }
};

// Remove uma conta a pagar avulsa
export const deleteContaPagarAvulsa = async (id: number): Promise<void> => {
  try {
    await api.delete(`/contas-pagar-avulsa/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar conta a pagar avulsa:`, error);
    throw error;
  }
};

