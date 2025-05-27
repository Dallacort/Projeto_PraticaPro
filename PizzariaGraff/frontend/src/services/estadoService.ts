import api from './api';
import { Estado } from '../types';

// Adaptador para converter dados da API para o frontend
export const adaptEstadoFromApi = (apiEstado: any): Estado => {
  return {
    id: apiEstado.id,
    nome: apiEstado.nome,
    uf: apiEstado.uf || '',
    ativo: apiEstado.ativo !== undefined ? apiEstado.ativo : true,
    pais: apiEstado.pais ? {
      id: apiEstado.pais.id,
      nome: apiEstado.pais.nome,
      codigo: apiEstado.pais.codigo || '',
      sigla: apiEstado.pais.sigla || ''
    } : (apiEstado.paisId ? {
      id: apiEstado.paisId,
      nome: apiEstado.paisNome || '',
      codigo: apiEstado.paisCodigo || '',
      sigla: apiEstado.paisSigla || ''
    } : null),
    dataCadastro: apiEstado.dataCadastro || null,
    ultimaModificacao: apiEstado.ultimaModificacao || apiEstado.dataModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
export const adaptEstadoToApi = (estado: Omit<Estado, 'id'>): any => {
  return {
    nome: estado.nome,
    uf: estado.uf,
    paisId: estado.pais?.id,
    ativo: estado.ativo
  };
};

// Busca todos os estados
export const getEstados = async (): Promise<Estado[]> => {
  try {
    const response = await api.get('/estados');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptEstadoFromApi);
    }
    
    throw new Error('Resposta inválida da API para estados');
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    throw error;
  }
};

// Busca estados por país
export const getEstadosByPais = async (paisId: string): Promise<Estado[]> => {
  try {
    const response = await api.get(`/estados/pais/${paisId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptEstadoFromApi);
    }
    
    throw new Error(`Resposta inválida da API para estados do país ${paisId}`);
  } catch (error) {
    console.error(`Erro ao buscar estados do país ${paisId}:`, error);
    throw error;
  }
};

// Busca estado por ID
export const getEstado = async (id: number): Promise<Estado | null> => {
  try {
    const response = await api.get(`/estados/${id}`);
    
    if (response.data) {
      return adaptEstadoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para estado ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar estado ${id}:`, error);
    throw error;
  }
};

// Cria novo estado
export const createEstado = async (estado: Omit<Estado, 'id'>): Promise<Estado> => {
  try {
    const dataToSend = adaptEstadoToApi(estado);
    const response = await api.post('/estados', dataToSend);
    
    if (response.data) {
      return adaptEstadoFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar estado');
  } catch (error) {
    console.error('Erro ao criar estado:', error);
    throw error;
  }
};

// Atualiza estado existente
export const updateEstado = async (id: number, estado: Omit<Estado, 'id'>): Promise<Estado> => {
  try {
    const dataToSend = adaptEstadoToApi(estado);
    const response = await api.put(`/estados/${id}`, dataToSend);
    
    if (response.data) {
      return adaptEstadoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar estado ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar estado ${id}:`, error);
    throw error;
  }
};

// Remove estado
export const deleteEstado = async (id: number): Promise<void> => {
  try {
    await api.delete(`/estados/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir estado ${id}:`, error);
    throw error;
  }
}; 