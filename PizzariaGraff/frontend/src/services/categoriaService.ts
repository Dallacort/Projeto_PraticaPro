import api from './api';
import { Categoria } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptCategoriaFromApi = (categoria: any): Categoria => {
  return {
    id: categoria.id,
    categoria: categoria.categoria || '',
    ativo: categoria.ativo !== undefined ? categoria.ativo : true, // Usar valor real da API
    dataCriacao: categoria.dataCriacao || null,
    dataAlteracao: categoria.dataAlteracao || null,
    dataCadastro: categoria.dataCadastro || null,
    ultimaModificacao: categoria.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptCategoriaToApi = (categoria: Omit<Categoria, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    categoria: categoria.categoria,
    ativo: categoria.ativo !== undefined ? categoria.ativo : true
  };
};

export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get('/categorias');
    return response.data.map(adaptCategoriaFromApi);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw new Error('Erro ao carregar categorias');
  }
};

export const getCategoriasAtivas = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get('/categorias/ativos');
    return response.data.map(adaptCategoriaFromApi);
  } catch (error) {
    console.error('Erro ao buscar categorias ativas:', error);
    throw new Error('Erro ao carregar categorias ativas');
  }
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  try {
    const response = await api.get(`/categorias/${id}`);
    return adaptCategoriaFromApi(response.data);
  } catch (error) {
    console.error('Erro ao buscar categoria por ID:', error);
    throw new Error('Erro ao carregar categoria');
  }
};

export const createCategoria = async (categoria: Omit<Categoria, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Categoria> => {
  try {
    const categoriaToSend = adaptCategoriaToApi(categoria);
    const response = await api.post('/categorias', categoriaToSend);
    return adaptCategoriaFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw new Error('Erro ao criar categoria');
  }
};

export const updateCategoria = async (id: number, categoria: Omit<Categoria, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Categoria> => {
  try {
    const categoriaToSend = adaptCategoriaToApi(categoria);
    const response = await api.put(`/categorias/${id}`, categoriaToSend);
    return adaptCategoriaFromApi(response.data);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw new Error('Erro ao atualizar categoria');
  }
};

export const deleteCategoria = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categorias/${id}`);
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw new Error('Erro ao deletar categoria');
  }
}; 