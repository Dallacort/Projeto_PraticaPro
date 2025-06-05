import api from './api';
import { FuncaoFuncionario } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptFuncaoFromApi = (funcao: any): FuncaoFuncionario => {
  return {
    id: funcao.id,
    descricao: funcao.descricao || '',
    salarioBase: funcao.salarioBase || 0,
    ativo: funcao.ativo !== undefined ? funcao.ativo : true,
    dataCadastro: funcao.dataCadastro || null,
    ultimaModificacao: funcao.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptFuncaoToApi = (funcao: Omit<FuncaoFuncionario, 'id' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    descricao: funcao.descricao,
    salarioBase: funcao.salarioBase || 0,
    ativo: funcao.ativo !== undefined ? funcao.ativo : true
  };
};

// Busca todas as funções de funcionário
export const getFuncoesFuncionario = async (): Promise<FuncaoFuncionario[]> => {
  try {
    const response = await api.get('/funcoes-funcionario');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptFuncaoFromApi);
    }
    
    throw new Error('Resposta inválida da API para funções de funcionário');
  } catch (error) {
    console.error('Erro ao buscar funções de funcionário:', error);
    throw error;
  }
};

// Busca apenas funções ativas
export const getFuncoesFuncionarioAtivas = async (): Promise<FuncaoFuncionario[]> => {
  try {
    const todasFuncoes = await getFuncoesFuncionario();
    return todasFuncoes.filter(funcao => funcao.ativo);
  } catch (error) {
    console.error('Erro ao buscar funções de funcionário ativas:', error);
    throw error;
  }
};

// Busca uma função pelo ID
export const getFuncaoFuncionario = async (id: number): Promise<FuncaoFuncionario | null> => {
  try {
    const response = await api.get(`/funcoes-funcionario/${id}`);
    
    if (response.data) {
      return adaptFuncaoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para função ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar função ${id}:`, error);
    throw error;
  }
};

// Cria uma nova função
export const createFuncaoFuncionario = async (funcao: Omit<FuncaoFuncionario, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<FuncaoFuncionario> => {
  try {
    const dataToSend = adaptFuncaoToApi(funcao);
    console.log('Dados enviados para API (função funcionário):', dataToSend);
    const response = await api.post('/funcoes-funcionario', dataToSend);
    
    if (response.data) {
      return adaptFuncaoFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar função');
  } catch (error) {
    console.error('Erro ao criar função:', error);
    throw error;
  }
};

// Atualiza uma função existente
export const updateFuncaoFuncionario = async (id: number, funcao: Omit<FuncaoFuncionario, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<FuncaoFuncionario> => {
  try {
    const dataToSend = adaptFuncaoToApi(funcao);
    console.log(`Dados enviados para API (função ${id}):`, dataToSend);
    const response = await api.put(`/funcoes-funcionario/${id}`, dataToSend);
    
    if (response.data) {
      return adaptFuncaoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar função ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar função ${id}:`, error);
    throw error;
  }
};

// Exclui uma função
export const deleteFuncaoFuncionario = async (id: number): Promise<void> => {
  try {
    await api.delete(`/funcoes-funcionario/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir função ${id}:`, error);
    throw error;
  }
}; 