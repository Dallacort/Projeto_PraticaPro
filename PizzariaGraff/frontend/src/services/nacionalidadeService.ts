import api from './api';
import { Pais } from '../types';

export interface NacionalidadeResponse {
  id: number;
  nome: string;
  codigo: string;
  sigla: string;
  nacionalidade: string;
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

// Listar todas as nacionalidades
export const getNacionalidades = async (): Promise<NacionalidadeResponse[]> => {
  try {
    console.log('Buscando nacionalidades...');
    const response = await api.get('/nacionalidades');
    console.log('Nacionalidades recebidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar nacionalidades:', error);
    throw error;
  }
};

// Buscar nacionalidade por ID
export const getNacionalidadeById = async (id: number): Promise<NacionalidadeResponse> => {
  try {
    console.log(`Buscando nacionalidade com ID: ${id}`);
    const response = await api.get(`/nacionalidades/${id}`);
    console.log('Nacionalidade recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar nacionalidade ${id}:`, error);
    throw error;
  }
};

// Buscar nacionalidade por nome
export const getNacionalidadeByNome = async (nome: string): Promise<NacionalidadeResponse> => {
  try {
    console.log(`Buscando nacionalidade com nome: ${nome}`);
    const response = await api.get(`/nacionalidades/buscar?nome=${encodeURIComponent(nome)}`);
    console.log('Nacionalidade recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar nacionalidade ${nome}:`, error);
    throw error;
  }
}; 