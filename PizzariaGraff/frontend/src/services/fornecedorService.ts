import api from './api';
import { Fornecedor } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptFornecedorFromApi = (fornecedor: any): Fornecedor => {
  // Criar uma estrutura aninhada de cidade, estado e país se necessário
  let cidade = null;
  if (fornecedor.cidade) {
    cidade = fornecedor.cidade;
  } else if (fornecedor.cidadeId && fornecedor.cidadeNome) {
    cidade = {
      id: fornecedor.cidadeId,
      nome: fornecedor.cidadeNome,
      estado: null
    };
    
    // Se temos informações do estado, adicionar
    if (fornecedor.estadoId && fornecedor.estadoNome) {
      cidade.estado = {
        id: fornecedor.estadoId,
        nome: fornecedor.estadoNome,
        uf: fornecedor.estadoUf || '',
        pais: null
      };
      
      // Se temos informações do país, adicionar
      if (fornecedor.paisId && fornecedor.paisNome) {
        cidade.estado.pais = {
          id: fornecedor.paisId,
          nome: fornecedor.paisNome,
          codigo: fornecedor.paisCodigo || '',
          sigla: fornecedor.paisSigla || ''
        };
      }
    }
  }
  
  return {
    id: fornecedor.id,
    razaoSocial: fornecedor.razaoSocial || '',
    nomeFantasia: fornecedor.nomeFantasia || '',
    cnpj: fornecedor.cnpj || '',
    inscricaoEstadual: fornecedor.inscricaoEstadual || '',
    endereco: fornecedor.endereco || '',
    telefone: fornecedor.telefone || '',
    email: fornecedor.email || '',
    cidade: cidade,
    ativo: fornecedor.ativo === undefined ? true : fornecedor.ativo,
    dataCadastro: fornecedor.dataCadastro || null,
    ultimaModificacao: fornecedor.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptFornecedorToApi = (fornecedor: Omit<Fornecedor, 'id' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    razaoSocial: fornecedor.razaoSocial,
    nomeFantasia: fornecedor.nomeFantasia || '',
    cnpj: fornecedor.cnpj || '',
    inscricaoEstadual: fornecedor.inscricaoEstadual || '',
    endereco: fornecedor.endereco || '',
    telefone: fornecedor.telefone || '',
    email: fornecedor.email || '',
    cidadeId: fornecedor.cidade?.id || null,
    ativo: fornecedor.ativo
  };
};

// Busca todos os fornecedores
export const getFornecedores = async (): Promise<Fornecedor[]> => {
  try {
    const response = await api.get('/fornecedores');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptFornecedorFromApi);
    }
    
    throw new Error('Resposta inválida da API para fornecedores');
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    throw error;
  }
};

// Busca um fornecedor pelo ID
export const getFornecedor = async (id: number): Promise<Fornecedor | null> => {
  try {
    const response = await api.get(`/fornecedores/${id}`);
    
    if (response.data) {
      return adaptFornecedorFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para fornecedor ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar fornecedor ${id}:`, error);
    throw error;
  }
};

// Cria um novo fornecedor
export const createFornecedor = async (fornecedor: Omit<Fornecedor, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Fornecedor> => {
  try {
    const dataToSend = adaptFornecedorToApi(fornecedor);
    const response = await api.post('/fornecedores', dataToSend);
    
    if (response.data) {
      return adaptFornecedorFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar fornecedor');
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    throw error;
  }
};

// Atualiza um fornecedor existente
export const updateFornecedor = async (id: number, fornecedor: Omit<Fornecedor, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Fornecedor> => {
  try {
    const dataToSend = adaptFornecedorToApi(fornecedor);
    const response = await api.put(`/fornecedores/${id}`, dataToSend);
    
    if (response.data) {
      return adaptFornecedorFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar fornecedor ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar fornecedor ${id}:`, error);
    throw error;
  }
};

// Exclui um fornecedor
export const deleteFornecedor = async (id: number): Promise<void> => {
  try {
    await api.delete(`/fornecedores/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir fornecedor ${id}:`, error);
    throw error;
  }
}; 