import api from './api';
import { Cliente } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptClienteFromApi = (cliente: any): Cliente => {
  // Criar uma estrutura aninhada de cidade, estado e país se necessário
  let cidade = null;
  if (cliente.cidade) {
    cidade = cliente.cidade;
  } else if (cliente.cidadeId && cliente.cidadeNome) {
    cidade = {
      id: cliente.cidadeId,
      nome: cliente.cidadeNome,
      estado: null
    };
    
    // Se temos informações do estado, adicionar
    if (cliente.estadoId && cliente.estadoNome) {
      cidade.estado = {
        id: cliente.estadoId,
        nome: cliente.estadoNome,
        uf: cliente.estadoUf || '',
        pais: null
      };
      
      // Se temos informações do país, adicionar
      if (cliente.paisId && cliente.paisNome) {
        cidade.estado.pais = {
          id: cliente.paisId,
          nome: cliente.paisNome,
          codigo: cliente.paisCodigo || '',
          sigla: cliente.paisSigla || ''
        };
      }
    }
  }
  
  return {
    id: cliente.id,
    nome: cliente.nome || '',
    cpfCnpj: cliente.cpfCnpj || '',
    inscricaoEstadual: cliente.inscricaoEstadual || '',
    endereco: cliente.endereco || '',
    telefone: cliente.telefone || '',
    email: cliente.email || '',
    cidade: cidade,
    ativo: cliente.ativo === undefined ? true : cliente.ativo,
    dataCadastro: cliente.dataCadastro || null,
    ultimaModificacao: cliente.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptClienteToApi = (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    nome: cliente.nome,
    cpfCnpj: cliente.cpfCnpj || '',
    inscricaoEstadual: cliente.inscricaoEstadual || '',
    endereco: cliente.endereco || '',
    telefone: cliente.telefone || '',
    email: cliente.email || '',
    cidadeId: cliente.cidade?.id || null,
    ativo: cliente.ativo
  };
};

// Busca todos os clientes
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await api.get('/clientes');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptClienteFromApi);
    }
    
    throw new Error('Resposta inválida da API para clientes');
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};

// Busca um cliente pelo ID
export const getCliente = async (id: number): Promise<Cliente | null> => {
  try {
    const response = await api.get(`/clientes/${id}`);
    
    if (response.data) {
      return adaptClienteFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para cliente ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar cliente ${id}:`, error);
    throw error;
  }
};

// Cria um novo cliente
export const createCliente = async (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Cliente> => {
  try {
    const dataToSend = adaptClienteToApi(cliente);
    const response = await api.post('/clientes', dataToSend);
    
    if (response.data) {
      return adaptClienteFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar cliente');
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

// Atualiza um cliente existente
export const updateCliente = async (id: number, cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Cliente> => {
  try {
    const dataToSend = adaptClienteToApi(cliente);
    const response = await api.put(`/clientes/${id}`, dataToSend);
    
    if (response.data) {
      return adaptClienteFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar cliente ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${id}:`, error);
    throw error;
  }
};

// Exclui um cliente
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    await api.delete(`/clientes/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir cliente ${id}:`, error);
    throw error;
  }
}; 