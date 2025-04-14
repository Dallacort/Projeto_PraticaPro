import api from './api';
import { Produto } from '../types';

// Dados de exemplo para uso em caso de falha da API
export const produtosMock: Produto[] = [
  {
    id: 1,
    nome: 'Pizza de Calabresa',
    quantidade: 10,
    valor: 45.90,
    dataCadastro: '2023-01-01',
    ultimaModificacao: '2023-01-01'
  },
  {
    id: 2,
    nome: 'Pizza de Mussarela',
    quantidade: 15,
    valor: 42.90,
    dataCadastro: '2023-01-01',
    ultimaModificacao: '2023-01-01'
  }
];

// Adaptar dados do produto recebido da API para o formato do frontend
export function adaptProdutoFromApi(produto: any): Produto {
  console.log('Adaptando produto da API:', produto);
  
  return {
    id: produto.id,
    nome: produto.nome || '',
    quantidade: parseFloat(produto.quantidade) || 0,
    valor: parseFloat(produto.preco || produto.valor) || 0,
    dataCadastro: produto.dataCadastro || '',
    ultimaModificacao: produto.ultimaModificacao || ''
  };
}

// Adaptar dados do produto do frontend para enviar à API
export function adaptProdutoToApi(produto: Omit<Produto, 'id'>): any {
  console.log('Adaptando produto para API:', produto);
  
  return {
    nome: produto.nome,
    quantidade: produto.quantidade,
    preco: produto.valor, // O backend espera 'preco'
    ativo: true
  };
}

// Busca todos os produtos
export const getProdutos = async (): Promise<Produto[]> => {
  try {
    console.log('Buscando produtos na API...');
    const response = await api.get('/produtos');
    console.log('Resposta da API (produtos):', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API retornou dados inválidos para produtos. Usando dados mockados.');
      return produtosMock;
    }
    
    return response.data.map(adaptProdutoFromApi);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    console.warn('Usando dados mockados para produtos devido a erro na API.');
    return produtosMock;
  }
};

// Busca um produto por ID
export const getProduto = async (id: number | string): Promise<Produto | null> => {
  try {
    console.log(`Buscando produto com ID ${id} na API...`);
    const response = await api.get(`/produtos/${id}`);
    console.log(`Resposta da API (produto ${id}):`, response.data);
    
    if (!response.data || !response.data.id) {
      console.warn(`API retornou dados inválidos para produto ${id}. Usando dados mockados.`);
      return produtosMock.find(p => String(p.id) === String(id)) || null;
    }
    
    return adaptProdutoFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    console.warn(`Usando dados mockados para produto ${id} devido a erro na API.`);
    return produtosMock.find(p => String(p.id) === String(id)) || null;
  }
};

// Cria um novo produto
export const createProduto = async (produto: Omit<Produto, 'id'>): Promise<Produto> => {
  try {
    console.log('Criando novo produto na API:', produto);
    const produtoApi = adaptProdutoToApi(produto);
    const response = await api.post('/produtos', produtoApi);
    console.log('Resposta da API (criar produto):', response.data);
    
    return adaptProdutoFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

// Atualiza um produto existente
export const updateProduto = async (id: number | string, produto: Omit<Produto, 'id'>): Promise<Produto> => {
  try {
    console.log(`Atualizando produto ${id} na API:`, produto);
    const produtoApi = adaptProdutoToApi(produto);
    const response = await api.put(`/produtos/${id}`, produtoApi);
    console.log(`Resposta da API (atualizar produto ${id}):`, response.data);
    
    return adaptProdutoFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar produto ${id}:`, error);
    throw error;
  }
};

// Exclui um produto
export const deleteProduto = async (id: number | string): Promise<void> => {
  try {
    console.log(`Excluindo produto ${id} na API...`);
    await api.delete(`/produtos/${id}`);
    console.log(`Produto ${id} excluído com sucesso.`);
  } catch (error) {
    console.error(`Erro ao excluir produto ${id}:`, error);
    throw error;
  }
}; 