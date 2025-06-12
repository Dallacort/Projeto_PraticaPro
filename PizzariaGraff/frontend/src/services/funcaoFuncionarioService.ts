import api from './api';
import { FuncaoFuncionario } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptFuncaoFromApi = (funcao: any): FuncaoFuncionario => {
  return {
    id: funcao.id,
    funcaoFuncionario: funcao.funcaoFuncionario || funcao.descricao || '',
    requerCNH: funcao.requerCNH || false,
    cargaHoraria: funcao.cargaHoraria || null,
    descricao: funcao.descricao || '',
    observacao: funcao.observacao || '',

    dataCriacao: funcao.dataCriacao || null,
    dataAlteracao: funcao.dataAlteracao || null,
    
    // Campos legados
    salarioBase: funcao.salarioBase || null,
    ativo: funcao.ativo !== undefined ? funcao.ativo : true,
    dataCadastro: funcao.dataCadastro || null,
    ultimaModificacao: funcao.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptFuncaoToApi = (funcao: Omit<FuncaoFuncionario, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  console.log('Dados recebidos no adaptador:', funcao);
  
  const payload = {
    funcaoFuncionario: funcao.funcaoFuncionario?.trim() || null,
    requerCNH: Boolean(funcao.requerCNH),
    cargaHoraria: funcao.cargaHoraria && funcao.cargaHoraria.toString().trim() ? Number(funcao.cargaHoraria) : null,
    descricao: funcao.descricao?.trim() || null,
    observacao: funcao.observacao?.trim() || null,

    
    // Campos legados
    salarioBase: funcao.salarioBase && funcao.salarioBase.toString().trim() ? Number(funcao.salarioBase) : null,
    ativo: Boolean(funcao.ativo)
  };
  
  console.log('Payload após conversão:', payload);
  return payload;
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
export const createFuncaoFuncionario = async (funcao: Omit<FuncaoFuncionario, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<FuncaoFuncionario> => {
  try {
    console.log('Dados ORIGINAIS recebidos na função create:', funcao);
    const dataToSend = adaptFuncaoToApi(funcao);
    console.log('Dados FINAIS enviados para API (função funcionário):', dataToSend);
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
export const updateFuncaoFuncionario = async (id: number, funcao: Omit<FuncaoFuncionario, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao'>): Promise<FuncaoFuncionario> => {
  try {
    console.log(`Dados ORIGINAIS recebidos no update (ID ${id}):`, funcao);
    
    // TESTE: Enviando dados DIRETOS sem adaptador
    const dataToSend = {
      funcaoFuncionario: funcao.funcaoFuncionario,
      requerCNH: funcao.requerCNH,
      cargaHoraria: Number(funcao.cargaHoraria),
      descricao: funcao.descricao,
      observacao: funcao.observacao,
  
      salarioBase: Number(funcao.salarioBase),
      ativo: funcao.ativo
    };
    
    console.log(`Dados DIRETOS enviados para API (função ${id}):`, dataToSend);
    
    const response = await api.put(`/funcoes-funcionario/${id}`, dataToSend);
    
    console.log(`Resposta da API (função ${id}):`, response.data);
    
    if (response.data) {
      return adaptFuncaoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar função ${id}`);
  } catch (error: any) {
    console.error(`Erro ao atualizar função ${id}:`, error);
    if (error.response) {
      console.error('Erro da API:', error.response.data);
      console.error('Status:', error.response.status);
    }
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