import api from './api';
import { formatToBackend, formatFromBackend } from '../utils/dateUtils';

export interface ModalidadeNfe {
  id: string;
  codigo: string;
  descricao: string;
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface ModalidadeNfeInput {
  codigo: string;
  descricao: string;
  ativo: boolean;
}

const adaptModalidadeNfeFromApi = (data: any): ModalidadeNfe => {
  return {
    id: data.id.toString(),
    codigo: data.codigo,
    descricao: data.descricao,
    ativo: data.ativo,
    dataCadastro: data.dataCadastro ? formatFromBackend(data.dataCadastro) : undefined,
    ultimaModificacao: data.ultimaModificacao ? formatFromBackend(data.ultimaModificacao) : undefined,
  };
};

const adaptModalidadeNfeToApi = (modalidadeNfe: ModalidadeNfeInput): any => {
  return {
    codigo: modalidadeNfe.codigo,
    descricao: modalidadeNfe.descricao,
    ativo: modalidadeNfe.ativo
  };
};

export const getModalidadesNfe = async (): Promise<ModalidadeNfe[]> => {
  try {
    const response = await api.get('/api/modalidades-nfe');
    return response.data.map(adaptModalidadeNfeFromApi);
  } catch (error) {
    console.error('Erro ao buscar modalidades de NFe:', error);
    throw error;
  }
};

export const getModalidadesNfeAtivas = async (): Promise<ModalidadeNfe[]> => {
  try {
    const response = await api.get('/api/modalidades-nfe/ativos');
    return response.data.map(adaptModalidadeNfeFromApi);
  } catch (error) {
    console.error('Erro ao buscar modalidades de NFe ativas:', error);
    throw error;
  }
};

export const getModalidadeNfe = async (id: string): Promise<ModalidadeNfe> => {
  try {
    const response = await api.get(`/api/modalidades-nfe/${id}`);
    return adaptModalidadeNfeFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar modalidade de NFe com ID ${id}:`, error);
    throw error;
  }
};

export const createModalidadeNfe = async (modalidadeNfe: ModalidadeNfeInput): Promise<ModalidadeNfe> => {
  try {
    const response = await api.post('/api/modalidades-nfe', adaptModalidadeNfeToApi(modalidadeNfe));
    return adaptModalidadeNfeFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar modalidade de NFe:', error);
    throw error;
  }
};

export const updateModalidadeNfe = async (id: string, modalidadeNfe: ModalidadeNfeInput): Promise<ModalidadeNfe> => {
  try {
    const response = await api.put(`/api/modalidades-nfe/${id}`, adaptModalidadeNfeToApi(modalidadeNfe));
    return adaptModalidadeNfeFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar modalidade de NFe com ID ${id}:`, error);
    throw error;
  }
};

export const deleteModalidadeNfe = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/modalidades-nfe/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir modalidade de NFe com ID ${id}:`, error);
    throw error;
  }
};

// Mock para desenvolvimento
export const mockModalidadesNfe: ModalidadeNfe[] = [
  { id: '1', codigo: '00', descricao: 'Entrada', ativo: true },
  { id: '2', codigo: '01', descricao: 'Saída', ativo: true },
  { id: '3', codigo: '02', descricao: 'Complementar', ativo: true },
  { id: '4', codigo: '03', descricao: 'Ajuste', ativo: true },
  { id: '5', codigo: '04', descricao: 'Devolução/Retorno', ativo: true }
]; 