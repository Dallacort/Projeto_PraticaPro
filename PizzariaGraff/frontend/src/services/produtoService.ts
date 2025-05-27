import api from './api';
import { Produto } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptProdutoFromApi = (produto: any): Produto => {
  return {
    id: produto.id,
    codigo: produto.codigo || '',
    nome: produto.nome || '',
    descricao: produto.descricao || '',
    precoVenda: produto.precoVenda || 0,
    precoCusto: produto.precoCusto || 0,
    unidade: produto.unidade || '',
    estoque: produto.estoque || 0,
    estoqueMinimo: produto.estoqueMinimo || 0,
    estoqueMaximo: produto.estoqueMaximo || 0,
    ativo: produto.ativo === undefined ? true : produto.ativo,
    dataCadastro: produto.dataCadastro || null,
    ultimaModificacao: produto.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptProdutoToApi = (produto: Omit<Produto, 'id' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    codigo: produto.codigo,
    nome: produto.nome,
    descricao: produto.descricao || '',
    precoVenda: produto.precoVenda || 0,
    precoCusto: produto.precoCusto || 0,
    unidade: produto.unidade || 'UN',
    estoque: produto.estoque || 0,
    estoqueMinimo: produto.estoqueMinimo || 0,
    estoqueMaximo: produto.estoqueMaximo || 0,
    ativo: produto.ativo
  };
};

// Busca todos os produtos
export const getProdutos = async (): Promise<Produto[]> => {
  try {
    const response = await api.get('/produtos');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptProdutoFromApi);
    }
    
    throw new Error('Resposta inválida da API para produtos');
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Busca um produto pelo ID
export const getProduto = async (id: number): Promise<Produto | null> => {
  try {
    const response = await api.get(`/produtos/${id}`);
    
    if (response.data) {
      return adaptProdutoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para produto ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    throw error;
  }
};

// Cria um novo produto
export const createProduto = async (produto: Omit<Produto, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Produto> => {
  try {
    const dataToSend = adaptProdutoToApi(produto);
    const response = await api.post('/produtos', dataToSend);
    
    if (response.data) {
      return adaptProdutoFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar produto');
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

// Atualiza um produto existente
export const updateProduto = async (id: number, produto: Omit<Produto, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Produto> => {
  try {
    const dataToSend = adaptProdutoToApi(produto);
    const response = await api.put(`/produtos/${id}`, dataToSend);
    
    if (response.data) {
      return adaptProdutoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar produto ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar produto ${id}:`, error);
    throw error;
  }
};

// Exclui um produto
export const deleteProduto = async (id: number): Promise<void> => {
  try {
    await api.delete(`/produtos/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir produto ${id}:`, error);
    throw error;
  }
}; 