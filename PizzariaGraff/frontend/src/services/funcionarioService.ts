import api from './api';
import { Funcionario } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptFuncionarioFromApi = (funcionario: any): Funcionario => {
  // Criar uma estrutura aninhada de cidade, estado e país se necessário
  let cidade = null;
  if (funcionario.cidade) {
    cidade = funcionario.cidade;
  } else if (funcionario.cidadeId && funcionario.cidadeNome) {
    cidade = {
      id: funcionario.cidadeId,
      nome: funcionario.cidadeNome,
      estado: null
    };
    
    // Se temos informações do estado, adicionar
    if (funcionario.estadoId && funcionario.estadoNome) {
      cidade.estado = {
        id: funcionario.estadoId,
        nome: funcionario.estadoNome,
        uf: funcionario.estadoUf || '',
        pais: null
      };
      
      // Se temos informações do país, adicionar
      if (funcionario.paisId && funcionario.paisNome) {
        cidade.estado.pais = {
          id: funcionario.paisId,
          nome: funcionario.paisNome,
          codigo: funcionario.paisCodigo || '',
          sigla: funcionario.paisSigla || ''
        };
      }
    }
  }

  return {
    id: funcionario.id,
    nome: funcionario.nome || '',
    cpf: funcionario.cpf || '',
    email: funcionario.email || '',
    telefone: funcionario.telefone || '',
    endereco: funcionario.endereco || '',
    cargo: funcionario.cargo || '',
    salario: funcionario.salario || 0,
    dataContratacao: funcionario.dataContratacao || null,
    cidade: cidade,
    ativo: funcionario.ativo === undefined ? true : funcionario.ativo,
    dataCadastro: funcionario.dataCadastro || null,
    ultimaModificacao: funcionario.ultimaModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptFuncionarioToApi = (funcionario: Omit<Funcionario, 'id' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    nome: funcionario.nome,
    cpf: funcionario.cpf || '',
    email: funcionario.email || '',
    telefone: funcionario.telefone || '',
    endereco: funcionario.endereco || '',
    cargo: funcionario.cargo || '',
    salario: funcionario.salario || 0,
    dataContratacao: funcionario.dataContratacao || null,
    cidadeId: funcionario.cidade?.id || null,
    ativo: funcionario.ativo
  };
};

// Busca todos os funcionários
export const getFuncionarios = async (): Promise<Funcionario[]> => {
  try {
    const response = await api.get('/funcionario');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptFuncionarioFromApi);
    }
    
    throw new Error('Resposta inválida da API para funcionários');
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    throw error;
  }
};

// Busca um funcionário pelo ID
export const getFuncionario = async (id: number): Promise<Funcionario | null> => {
  try {
    const response = await api.get(`/funcionario/${id}`);
    
    if (response.data) {
      return adaptFuncionarioFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para funcionário ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar funcionário ${id}:`, error);
    throw error;
  }
};

// Cria um novo funcionário
export const createFuncionario = async (funcionario: Omit<Funcionario, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Funcionario> => {
  try {
    const dataToSend = adaptFuncionarioToApi(funcionario);
    const response = await api.post('/funcionario', dataToSend);
    
    if (response.data) {
      return adaptFuncionarioFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar funcionário');
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    throw error;
  }
};

// Atualiza um funcionário existente
export const updateFuncionario = async (id: number, funcionario: Omit<Funcionario, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Funcionario> => {
  try {
    const dataToSend = adaptFuncionarioToApi(funcionario);
    const response = await api.put(`/funcionario/${id}`, dataToSend);
    
    if (response.data) {
      return adaptFuncionarioFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar funcionário ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar funcionário ${id}:`, error);
    throw error;
  }
};

// Exclui um funcionário
export const deleteFuncionario = async (id: number): Promise<void> => {
  try {
    await api.delete(`/funcionario/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir funcionário ${id}:`, error);
    throw error;
  }
}; 