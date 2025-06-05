import api from './api';
import { Marca } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptMarcaFromApi = (marca: any): Marca => {
  return {
    id: marca.id,
    marca: marca.marca || '',
    situacao: marca.situacao || null,
    ativo: true, // Campo fictício para o frontend, sempre ativo
    dataCriacao: marca.dataCriacao || null,
    dataAlteracao: marca.dataAlteracao || null,
    dataCadastro: marca.dataCadastro || null,
    ultimaModificacao: marca.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptMarcaToApi = (marca: Omit<Marca, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    marca: marca.marca,
    situacao: marca.situacao || new Date().toISOString().split('T')[0]
    // Removido campo 'ativo' que não existe no backend
  };
};

// Busca todas as marcas
export const getMarcas = async (): Promise<Marca[]> => {
  try {
    const response = await api.get('/marcas');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptMarcaFromApi);
    }
    
    throw new Error('Resposta inválida da API para marcas');
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    throw error;
  }
};

// Busca uma marca pelo ID
export const getMarca = async (id: number): Promise<Marca | null> => {
  try {
    const response = await api.get(`/marcas/${id}`);
    
    if (response.data) {
      return adaptMarcaFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para marca ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar marca ${id}:`, error);
    throw error;
  }
};

// Cria uma nova marca
export const createMarca = async (marca: Omit<Marca, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Marca> => {
  try {
    const dataToSend = adaptMarcaToApi(marca);
    console.log('Dados enviados para API (marca):', dataToSend);
    const response = await api.post('/marcas', dataToSend);
    
    if (response.data) {
      return adaptMarcaFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar marca');
  } catch (error) {
    console.error('Erro ao criar marca:', error);
    throw error;
  }
};

// Atualiza uma marca existente
export const updateMarca = async (id: number, marca: Omit<Marca, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Marca> => {
  try {
    const dataToSend = adaptMarcaToApi(marca);
    console.log(`Dados enviados para API (marca ${id}):`, dataToSend);
    const response = await api.put(`/marcas/${id}`, dataToSend);
    
    if (response.data) {
      return adaptMarcaFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar marca ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar marca ${id}:`, error);
    throw error;
  }
};

// Exclui uma marca
export const deleteMarca = async (id: number): Promise<void> => {
  try {
    await api.delete(`/marcas/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir marca ${id}:`, error);
    throw error;
  }
}; 