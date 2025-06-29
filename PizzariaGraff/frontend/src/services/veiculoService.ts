import api from './api';
import { Veiculo } from '../types';

// Busca todos os veículos
export const getVeiculos = async (): Promise<Veiculo[]> => {
  try {
    const response = await api.get('/veiculos');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    throw error;
  }
};

// Busca veículos de uma transportadora
export const getVeiculosByTransportadora = async (transportadoraId: number): Promise<Veiculo[]> => {
  try {
    const response = await api.get(`/veiculos/transportadora/${transportadoraId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar veículos da transportadora ${transportadoraId}:`, error);
    throw error;
  }
};

// Busca um veículo pelo ID
export const getVeiculo = async (id: number): Promise<Veiculo | null> => {
  try {
    const response = await api.get(`/veiculos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar veículo ${id}:`, error);
    return null;
  }
};

// Cria um novo veículo
export const createVeiculo = async (veiculoData: Partial<Veiculo>): Promise<Veiculo> => {
  try {
    const response = await api.post('/veiculos', veiculoData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    throw error;
  }
};

// Atualiza um veículo existente
export const updateVeiculo = async (id: number, veiculoData: Partial<Veiculo>): Promise<Veiculo> => {
  try {
    const response = await api.put(`/veiculos/${id}`, veiculoData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar veículo ${id}:`, error);
    throw error;
  }
};

// Exclui um veículo
export const deleteVeiculo = async (id: number): Promise<void> => {
  try {
    await api.delete(`/veiculos/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir veículo ${id}:`, error);
    throw error;
  }
}; 