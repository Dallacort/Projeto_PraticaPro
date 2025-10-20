import api from './api';
import { NotaSaida } from '../types';

// Lista todas as notas de saída
export const getNotasSaida = async (): Promise<NotaSaida[]> => {
  try {
    const response = await api.get('/notas-saida');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar notas de saída:', error);
    throw error;
  }
};

// Busca uma nota de saída pela chave composta
export const getNotaSaida = async (
  numero: string,
  modelo: string,
  serie: string,
  clienteId: number
): Promise<NotaSaida> => {
  try {
    const response = await api.get(`/notas-saida/${numero}/${modelo}/${serie}/${clienteId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar nota de saída:`, error);
    throw error;
  }
};

// Busca notas por cliente
export const getNotasSaidaPorCliente = async (clienteId: number): Promise<NotaSaida[]> => {
  try {
    const response = await api.get(`/notas-saida/cliente/${clienteId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar notas por cliente:`, error);
    throw error;
  }
};

// Busca notas por situação
export const getNotasSaidaPorSituacao = async (situacao: string): Promise<NotaSaida[]> => {
  try {
    const response = await api.get(`/notas-saida/situacao/${situacao}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar notas por situação:`, error);
    throw error;
  }
};

// Cria uma nova nota de saída
export const createNotaSaida = async (nota: Partial<NotaSaida>): Promise<NotaSaida> => {
  try {
    const response = await api.post('/notas-saida', nota);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar nota de saída:', error);
    throw error;
  }
};

// Atualiza uma nota de saída existente
export const updateNotaSaida = async (
  numero: string,
  modelo: string,
  serie: string,
  clienteId: number,
  nota: Partial<NotaSaida>
): Promise<NotaSaida> => {
  try {
    const response = await api.put(`/notas-saida/${numero}/${modelo}/${serie}/${clienteId}`, nota);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar nota de saída:`, error);
    throw error;
  }
};

// Remove uma nota de saída
export const deleteNotaSaida = async (
  numero: string,
  modelo: string,
  serie: string,
  clienteId: number
): Promise<void> => {
  try {
    await api.delete(`/notas-saida/${numero}/${modelo}/${serie}/${clienteId}`);
  } catch (error) {
    console.error(`Erro ao deletar nota de saída:`, error);
    throw error;
  }
};

