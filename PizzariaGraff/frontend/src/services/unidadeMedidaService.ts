import api from './api';
import { UnidadeMedida } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptUnidadeMedidaFromApi = (unidadeMedida: any): UnidadeMedida => {
  return {
    id: unidadeMedida.id,
    unidadeMedida: unidadeMedida.unidadeMedida || '',

    ativo: unidadeMedida.ativo !== undefined ? unidadeMedida.ativo : true, // Usar valor real da API
    dataCriacao: unidadeMedida.dataCriacao || null,
    dataAlteracao: unidadeMedida.dataAlteracao || null,
    dataCadastro: unidadeMedida.dataCadastro || null,
    ultimaModificacao: unidadeMedida.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptUnidadeMedidaToApi = (unidadeMedida: Omit<UnidadeMedida, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    unidadeMedida: unidadeMedida.unidadeMedida,

    ativo: unidadeMedida.ativo !== undefined ? unidadeMedida.ativo : true
  };
};

// Busca todas as unidades de medida
export const getUnidadesMedida = async (): Promise<UnidadeMedida[]> => {
  try {
    const response = await api.get('/unidades-medida');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptUnidadeMedidaFromApi);
    }
    
    throw new Error('Resposta inválida da API para unidades de medida');
  } catch (error) {
    console.error('Erro ao buscar unidades de medida:', error);
    throw error;
  }
};

// Busca uma unidade de medida pelo ID
export const getUnidadeMedida = async (id: number): Promise<UnidadeMedida | null> => {
  try {
    const response = await api.get(`/unidades-medida/${id}`);
    
    if (response.data) {
      return adaptUnidadeMedidaFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para unidade de medida ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar unidade de medida ${id}:`, error);
    throw error;
  }
};

// Cria uma nova unidade de medida
export const createUnidadeMedida = async (unidadeMedida: Omit<UnidadeMedida, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<UnidadeMedida> => {
  try {
    const dataToSend = adaptUnidadeMedidaToApi(unidadeMedida);
    console.log('Dados enviados para API (unidade de medida):', dataToSend);
    const response = await api.post('/unidades-medida', dataToSend);
    
    if (response.data) {
      return adaptUnidadeMedidaFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar unidade de medida');
  } catch (error) {
    console.error('Erro ao criar unidade de medida:', error);
    throw error;
  }
};

// Atualiza uma unidade de medida existente
export const updateUnidadeMedida = async (id: number, unidadeMedida: Omit<UnidadeMedida, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<UnidadeMedida> => {
  try {
    const dataToSend = adaptUnidadeMedidaToApi(unidadeMedida);
    console.log(`Dados enviados para API (unidade de medida ${id}):`, dataToSend);
    const response = await api.put(`/unidades-medida/${id}`, dataToSend);
    
    if (response.data) {
      return adaptUnidadeMedidaFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar unidade de medida ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar unidade de medida ${id}:`, error);
    throw error;
  }
};

// Exclui uma unidade de medida
export const deleteUnidadeMedida = async (id: number): Promise<void> => {
  try {
    await api.delete(`/unidades-medida/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir unidade de medida ${id}:`, error);
    throw error;
  }
}; 