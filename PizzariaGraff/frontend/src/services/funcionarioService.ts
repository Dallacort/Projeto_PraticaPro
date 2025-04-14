import api from './api';
import { Funcionario, Cidade, Estado } from '../types';

// Função de adaptação de cidade da API
function adaptCidadeFromApi(cidadeApi: any): Cidade {
  return {
    id: cidadeApi.id,
    nome: cidadeApi.nome,
    estado: {
      id: cidadeApi.estado?.id || 0,
      nome: cidadeApi.estado?.nome || '',
      uf: cidadeApi.estado?.uf || '',
      pais: cidadeApi.estado?.pais || { 
        id: '',
        nome: '',
        codigo: '',
        sigla: '' 
      }
    }
  };
}

// Dados de exemplo para uso em caso de falha da API
export const funcionariosMock: Funcionario[] = [
  {
    id: 1,
    nome: 'João Silva',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '1990-01-01',
    telefone: '(11) 99999-9999',
    email: 'joao.silva@example.com',
    endereco: 'Rua Exemplo',
    numero: '123',
    complemento: 'Apto 101',
    bairro: 'Centro',
    cep: '12345-678',
    cidade: {
      id: 1,
      nome: 'São Paulo',
      estado: {
        id: 1,
        nome: 'São Paulo',
        uf: 'SP',
        pais: {
          id: '1',
          nome: 'Brasil',
          codigo: '55',
          sigla: 'BR'
        }
      }
    },
    cargo: 'Desenvolvedor',
    salario: 5000,
    dataAdmissao: '2020-01-01',
    dataDemissao: '',
    ativo: true,
    dataCadastro: '2020-01-01',
    ultimaModificacao: '2023-01-01'
  }
];

// Adaptar dados do funcionário recebido da API para o formato do frontend
export function adaptFuncionarioFromApi(funcionario: any): Funcionario {
  console.log('Adaptando funcionário da API:', funcionario);
  
  // Verificar se há cidade encadeada e adaptar
  let cidadeAdaptada: Cidade | null = null;
  if (funcionario.cidade) {
    cidadeAdaptada = adaptCidadeFromApi(funcionario.cidade);
  }

  return {
    id: funcionario.id,
    nome: funcionario.nome || '',
    cpf: funcionario.cpf || '',
    rg: funcionario.rg || '',
    dataNascimento: funcionario.dataNascimento || '',
    telefone: funcionario.telefone || '',
    email: funcionario.email || '',
    endereco: funcionario.endereco || '',
    numero: funcionario.numero || '',
    complemento: funcionario.complemento || '',
    bairro: funcionario.bairro || '',
    cep: funcionario.cep || '',
    cidade: cidadeAdaptada || { 
      id: 0, 
      nome: '', 
      estado: { 
        id: 0, 
        nome: '', 
        uf: '',
        pais: { 
          id: '',
          nome: '',
          codigo: '',
          sigla: ''
        } 
      } 
    },
    cargo: funcionario.cargo || '',
    salario: funcionario.salario || 0,
    dataAdmissao: funcionario.dataAdmissao || '',
    dataDemissao: funcionario.dataDemissao || '',
    ativo: funcionario.ativo !== false,
    dataCadastro: funcionario.dataCadastro || '',
    ultimaModificacao: funcionario.ultimaModificacao || ''
  };
}

// Adaptar dados do funcionário do frontend para enviar à API
export function adaptFuncionarioToApi(funcionario: Omit<Funcionario, 'id'>): any {
  console.log('Adaptando funcionário para API:', funcionario);
  
  return {
    nome: funcionario.nome,
    cpf: funcionario.cpf,
    rg: funcionario.rg,
    dataNascimento: funcionario.dataNascimento,
    telefone: funcionario.telefone,
    email: funcionario.email,
    endereco: funcionario.endereco,
    numero: funcionario.numero,
    complemento: funcionario.complemento,
    bairro: funcionario.bairro,
    cep: funcionario.cep,
    cidadeId: funcionario.cidade?.id,
    cargo: funcionario.cargo,
    salario: funcionario.salario,
    dataAdmissao: funcionario.dataAdmissao,
    dataDemissao: funcionario.dataDemissao,
    ativo: funcionario.ativo
  };
}

// Busca todos os funcionários
export const getFuncionarios = async (): Promise<Funcionario[]> => {
  try {
    console.log('Buscando funcionários na API...');
    const response = await api.get('/funcionario');
    console.log('Resposta da API (funcionários):', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API retornou dados inválidos para funcionários. Usando dados mockados.');
      return funcionariosMock;
    }
    
    return response.data.map(adaptFuncionarioFromApi);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    console.warn('Usando dados mockados para funcionários devido a erro na API.');
    return funcionariosMock;
  }
};

// Busca um funcionário por ID
export const getFuncionario = async (id: number | string): Promise<Funcionario | null> => {
  try {
    console.log(`Buscando funcionário com ID ${id} na API...`);
    const response = await api.get(`/funcionario/${id}`);
    console.log(`Resposta da API (funcionário ${id}):`, response.data);
    
    if (!response.data || !response.data.id) {
      console.warn(`API retornou dados inválidos para funcionário ${id}. Usando dados mockados.`);
      return funcionariosMock.find(f => String(f.id) === String(id)) || null;
    }
    
    return adaptFuncionarioFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar funcionário ${id}:`, error);
    console.warn(`Usando dados mockados para funcionário ${id} devido a erro na API.`);
    return funcionariosMock.find(f => String(f.id) === String(id)) || null;
  }
};

// Cria um novo funcionário
export const createFuncionario = async (funcionario: Omit<Funcionario, 'id'>): Promise<Funcionario> => {
  try {
    console.log('Criando novo funcionário na API:', funcionario);
    const funcionarioApi = adaptFuncionarioToApi(funcionario);
    const response = await api.post('/funcionario', funcionarioApi);
    console.log('Resposta da API (criar funcionário):', response.data);
    
    return adaptFuncionarioFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    throw error;
  }
};

// Atualiza um funcionário existente
export const updateFuncionario = async (id: number | string, funcionario: Omit<Funcionario, 'id'>): Promise<Funcionario> => {
  try {
    console.log(`Atualizando funcionário ${id} na API:`, funcionario);
    const funcionarioApi = adaptFuncionarioToApi(funcionario);
    const response = await api.put(`/funcionario/${id}`, funcionarioApi);
    console.log(`Resposta da API (atualizar funcionário ${id}):`, response.data);
    
    return adaptFuncionarioFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar funcionário ${id}:`, error);
    throw error;
  }
};

// Exclui um funcionário
export const deleteFuncionario = async (id: number | string): Promise<void> => {
  try {
    console.log(`Excluindo funcionário ${id} na API...`);
    await api.delete(`/funcionario/${id}`);
    console.log(`Funcionário ${id} excluído com sucesso.`);
  } catch (error) {
    console.error(`Erro ao excluir funcionário ${id}:`, error);
    throw error;
  }
}; 