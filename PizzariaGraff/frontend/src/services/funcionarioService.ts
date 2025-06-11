import api from './api';
import { Funcionario } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptFuncionarioFromApi = (funcionario: any): Funcionario => {
  // Criar uma estrutura aninhada de cidade se necessário
  let cidade = null;
  if (funcionario.cidade) {
    // Garantir que a estrutura esteja completa, mesmo se vier do backend
    cidade = {
      ...funcionario.cidade,
      id: funcionario.cidade.id || funcionario.cidadeId,
      nome: funcionario.cidade.nome || funcionario.cidadeNome,
      estado: funcionario.cidade.estado || null
    };
    
    // Se não tem estado na cidade mas temos dados de estado, construir
    if (!cidade.estado && funcionario.estadoId && funcionario.estadoNome) {
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
  
  // Criar estrutura de função de funcionário se necessário
  let funcaoFuncionario = null;
  if (funcionario.funcaoFuncionario) {
    // Aplicar a mesma lógica do adaptador de função
    funcaoFuncionario = {
      ...funcionario.funcaoFuncionario,
      funcaoFuncionario: funcionario.funcaoFuncionario.funcaoFuncionario || funcionario.funcaoFuncionario.descricao || ''
    };
  } else if (funcionario.funcaoFuncionarioId && funcionario.funcaoFuncionarioNome) {
    funcaoFuncionario = {
      id: funcionario.funcaoFuncionarioId,
      funcaoFuncionario: funcionario.funcaoFuncionarioNome,
      ativo: true
    };
  }

  return {
    id: funcionario.id,
    funcionario: funcionario.funcionario || '',
    apelido: funcionario.apelido || '',
    cpfCpnj: funcionario.cpfCpnj || '',
    rgInscricaoEstadual: funcionario.rgInscricaoEstadual || '',
    email: funcionario.email || '',
    telefone: funcionario.telefone || '',
    endereco: funcionario.endereco || '',
    numero: funcionario.numero || '',
    complemento: funcionario.complemento || '',
    bairro: funcionario.bairro || '',
    cep: funcionario.cep || '',
    cidadeId: funcionario.cidadeId,
    dataAdmissao: funcionario.dataAdmissao || '',
    dataDemissao: funcionario.dataDemissao || '',
    dataCriacao: funcionario.dataCriacao,
    dataAlteracao: funcionario.dataAlteracao,
    cnh: funcionario.cnh || '',
    dataValidadeCnh: funcionario.dataValidadeCnh || '',
    sexo: funcionario.sexo,
    observacao: funcionario.observacao || '',
    estadoCivil: funcionario.estadoCivil,
    salario: funcionario.salario,
    nacionalidadeId: funcionario.nacionalidadeId,
    dataNascimento: funcionario.dataNascimento,
    funcaoFuncionarioId: funcionario.funcaoFuncionarioId,
    cidade: cidade,
    funcaoFuncionario: funcaoFuncionario,
    ativo: funcionario.ativo !== undefined ? funcionario.ativo : true,
    dataCadastro: funcionario.dataCadastro || funcionario.dataCriacao,
    ultimaModificacao: funcionario.ultimaModificacao || funcionario.dataAlteracao,
    
    // Campos para compatibilidade com versão anterior
    nome: funcionario.funcionario || funcionario.nome || '',
    cargo: funcionario.funcaoFuncionario?.funcaoFuncionario || funcionario.cargo || ''
  };
};

// Adaptador para converter dados do frontend para a API
const adaptFuncionarioToApi = (funcionario: any): any => {
  console.log('Funcionário recebido no adaptador:', funcionario);
  
  const payload = {
    funcionario: funcionario.funcionario,
    apelido: funcionario.apelido || '',
    cpfCpnj: funcionario.cpfCpnj || '',
    rgInscricaoEstadual: funcionario.rgInscricaoEstadual || '',
    email: funcionario.email || '',
    telefone: funcionario.telefone || '',
    endereco: funcionario.endereco || '',
    numero: funcionario.numero || '',
    complemento: funcionario.complemento || '',
    bairro: funcionario.bairro || '',
    cep: funcionario.cep || '',
    cidadeId: funcionario.cidadeId || null,
    dataAdmissao: funcionario.dataAdmissao || null,
    dataDemissao: funcionario.dataDemissao || null,
    cnh: funcionario.cnh || '',
    dataValidadeCnh: funcionario.dataValidadeCnh || null,
    sexo: funcionario.sexo || null,
    observacao: funcionario.observacao || '',
    estadoCivil: funcionario.estadoCivil || null,
    salario: funcionario.salario || null,
    nacionalidadeId: funcionario.nacionalidadeId || null,
    dataNascimento: funcionario.dataNascimento || null,
    funcaoFuncionarioId: funcionario.funcaoFuncionarioId || null,
    ativo: funcionario.ativo !== undefined ? funcionario.ativo : true
  };
  
  console.log('Payload enviado para API:', payload);
  return payload;
};

// Lista todos os funcionários
export const getFuncionarios = async (): Promise<Funcionario[]> => {
  try {
    const response = await api.get('/funcionarios');
    return response.data.map(adaptFuncionarioFromApi);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    throw error;
  }
};

// Busca um funcionário pelo ID
export const getFuncionario = async (id: number): Promise<Funcionario> => {
  try {
    const response = await api.get(`/funcionarios/${id}`);
    return adaptFuncionarioFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar funcionário ${id}:`, error);
    throw error;
  }
};

// Cria um novo funcionário
export const createFuncionario = async (funcionario: any): Promise<Funcionario> => {
  try {
    const payload = adaptFuncionarioToApi(funcionario);
    const response = await api.post('/funcionarios', payload);
    return adaptFuncionarioFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    throw error;
  }
};

// Atualiza um funcionário existente
export const updateFuncionario = async (id: number, funcionario: any): Promise<Funcionario> => {
  try {
    const payload = adaptFuncionarioToApi(funcionario);
    const response = await api.put(`/funcionarios/${id}`, payload);
    return adaptFuncionarioFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar funcionário ${id}:`, error);
    throw error;
  }
};

// Remove um funcionário
export const deleteFuncionario = async (id: number): Promise<void> => {
  try {
    await api.delete(`/funcionarios/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar funcionário ${id}:`, error);
    throw error;
  }
}; 