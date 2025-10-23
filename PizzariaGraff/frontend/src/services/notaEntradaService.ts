import api from './api';
import { NotaEntrada } from '../types';
import { formatNotaDates } from '../utils/dateFormatter';

// Lista todas as notas de entrada
export const getNotasEntrada = async (): Promise<NotaEntrada[]> => {
  try {
    const response = await api.get('/notas-entrada');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar notas de entrada:', error);
    throw error;
  }
};

// Busca uma nota de entrada pela chave composta
export const getNotaEntrada = async (
  numero: string,
  modelo: string,
  serie: string,
  fornecedorId: number
): Promise<NotaEntrada> => {
  try {
    const response = await api.get(`/notas-entrada/${numero}/${modelo}/${serie}/${fornecedorId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar nota de entrada:`, error);
    throw error;
  }
};

// Busca notas por fornecedor
export const getNotasEntradaPorFornecedor = async (fornecedorId: number): Promise<NotaEntrada[]> => {
  try {
    const response = await api.get(`/notas-entrada/fornecedor/${fornecedorId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar notas por fornecedor:`, error);
    throw error;
  }
};

// Busca notas por situação
export const getNotasEntradaPorSituacao = async (situacao: string): Promise<NotaEntrada[]> => {
  try {
    const response = await api.get(`/notas-entrada/situacao/${situacao}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar notas por situação:`, error);
    throw error;
  }
};

// Cria uma nova nota de entrada
export const createNotaEntrada = async (nota: Partial<NotaEntrada>): Promise<NotaEntrada> => {
  try {
    const response = await api.post('/notas-entrada', nota);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar nota de entrada:', error);
    throw error;
  }
};

// Atualiza uma nota de entrada existente
export const updateNotaEntrada = async (
  numero: string,
  modelo: string,
  serie: string,
  fornecedorId: number,
  nota: Partial<NotaEntrada>
): Promise<NotaEntrada> => {
  try {
    const response = await api.put(`/notas-entrada/${numero}/${modelo}/${serie}/${fornecedorId}`, nota);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar nota de entrada:`, error);
    throw error;
  }
};

// Remove uma nota de entrada
export const deleteNotaEntrada = async (
  numero: string,
  modelo: string,
  serie: string,
  fornecedorId: number
): Promise<void> => {
  try {
    await api.delete(`/notas-entrada/${numero}/${modelo}/${serie}/${fornecedorId}`);
  } catch (error) {
    console.error(`Erro ao deletar nota de entrada:`, error);
    throw error;
  }
};

// Cancela uma nota de entrada e todas as suas parcelas
export const cancelarNotaEntrada = async (
  numero: string,
  modelo: string,
  serie: string,
  fornecedorId: number
): Promise<void> => {
  try {
    await api.put(`/notas-entrada/${numero}/${modelo}/${serie}/${fornecedorId}/cancelar`);
  } catch (error) {
    console.error(`Erro ao cancelar nota de entrada:`, error);
    throw error;
  }
};

