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
  
  // Converter data de nascimento se for array
  let dataNascimento = '';
  if (cliente.dataNascimento) {
    if (Array.isArray(cliente.dataNascimento) && cliente.dataNascimento.length >= 3) {
      // Formato: [ano, mes, dia]
      const [ano, mes, dia] = cliente.dataNascimento;
      dataNascimento = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    } else {
      dataNascimento = cliente.dataNascimento;
    }
  }

  return {
    id: cliente.id,
    cliente: cliente.cliente || cliente.nome || '',
    nome: cliente.nome || cliente.cliente || '',
    apelido: cliente.apelido || '',
    cpfCpnj: cliente.cpfCpnj || cliente.cpfCnpj || '',
    cpfCnpj: cliente.cpfCnpj || cliente.cpfCpnj || '',
    rgInscricaoEstadual: cliente.rgInscricaoEstadual || cliente.inscricaoEstadual || '',
    inscricaoEstadual: cliente.inscricaoEstadual || cliente.rgInscricaoEstadual || '',
    email: cliente.email || '',
    telefone: cliente.telefone || '',
    endereco: cliente.endereco || '',
    numero: cliente.numero || '',
    complemento: cliente.complemento || '',
    bairro: cliente.bairro || '',
    cep: cliente.cep || '',
    nacionalidadeId: cliente.nacionalidadeId || null,
    dataNascimento: dataNascimento,
    estadoCivil: cliente.estadoCivil || '',
    sexo: cliente.sexo || '',
    tipo: cliente.tipo || 1,
    limiteCredito: cliente.limiteCredito || 0,
    observacao: cliente.observacao || '',
    condicaoPagamentoId: cliente.condicaoPagamentoId || null,
    condicaoPagamentoNome: cliente.condicaoPagamentoNome || null,
    cidade: cidade,
    ativo: cliente.ativo === undefined ? true : cliente.ativo,
    dataCadastro: cliente.dataCadastro || cliente.dataCriacao || null,
    ultimaModificacao: cliente.ultimaModificacao || cliente.dataAlteracao || null
  };
};

// Adaptador para converter dados do frontend para a API
const adaptClienteToApi = (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    cliente: cliente.cliente || cliente.nome || '',
    apelido: cliente.apelido || null,
    bairro: cliente.bairro || null,
    cep: cliente.cep || null,
    numero: cliente.numero || null,
    endereco: cliente.endereco || null,
    cidadeId: cliente.cidade?.id ? Number(cliente.cidade.id) : null,
    complemento: cliente.complemento || null,
    limiteCredito: cliente.limiteCredito ? Number(cliente.limiteCredito) : 0,
    nacionalidadeId: cliente.nacionalidadeId ? Number(cliente.nacionalidadeId) : null,
    rgInscricaoEstadual: cliente.rgInscricaoEstadual || cliente.inscricaoEstadual || null,
    cpfCpnj: cliente.cpfCpnj || cliente.cpfCnpj || null,
    dataNascimento: cliente.dataNascimento || null,
    email: cliente.email || null,
    telefone: cliente.telefone || null,
    estadoCivil: cliente.estadoCivil || null,
    tipo: cliente.tipo ? Number(cliente.tipo) : 1,
    sexo: cliente.sexo || null,
    condicaoPagamentoId: cliente.condicaoPagamentoId ? Number(cliente.condicaoPagamentoId) : null,
    observacao: cliente.observacao || null,
    ativo: cliente.ativo !== undefined ? cliente.ativo : true,
    dataCriacao: null,
    dataAlteracao: null
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
    
    // DEBUG: Log do payload enviado
    console.log('=== PAYLOAD ENVIADO PARA BACKEND ===');
    console.log('Cliente original:', cliente);
    console.log('Data to send:', dataToSend);
    console.log('JSON enviado:', JSON.stringify(dataToSend, null, 2));
    console.log('=====================================');
    
    const response = await api.post('/clientes', dataToSend);
    
    if (response.data) {
      return adaptClienteFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar cliente');
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    if (error.response?.data) {
      console.error('Resposta do servidor:', error.response.data);
    }
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