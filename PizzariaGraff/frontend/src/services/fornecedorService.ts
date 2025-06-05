import api from './api';
import { Fornecedor } from '../types';
import { getCidade } from './cidadeService';

interface FornecedorPayload {
  fornecedor: string;
  apelido: string;
  cpfCnpj: string;
  rgInscricaoEstadual: string;
  email: string;
  contato: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  tipo: number;
  observacoes: string;
  limiteCredito: number;
  situacao: string; // LocalDate no backend, enviado como string "yyyy-MM-dd"
  cidadeId: number;
  condicaoPagamentoId?: number;
}

// Adaptador para converter dados da API para o frontend
const adaptFornecedorFromApi = async (fornecedor: any): Promise<Fornecedor> => {
  console.log('Dados recebidos da API fornecedor:', fornecedor);
  
  // Buscar cidade completa se só temos o ID
  let cidade = null;
  if (fornecedor.cidade) {
    cidade = fornecedor.cidade;
  } else if (fornecedor.cidadeId) {
    try {
      console.log(`Buscando cidade completa para ID: ${fornecedor.cidadeId}`);
      cidade = await getCidade(fornecedor.cidadeId);
      console.log('Cidade encontrada:', cidade);
    } catch (error) {
      console.error('Erro ao buscar cidade:', error);
      // Criar estrutura mínima se não conseguir buscar
      cidade = {
        id: fornecedor.cidadeId,
        nome: 'Cidade não encontrada',
        estado: {
          id: 0,
          nome: 'Estado não encontrado',
          uf: '',
          pais: null
        }
      };
    }
  }
  
  return {
    id: fornecedor.id,
    // Campos principais do DTO
    fornecedor: fornecedor.fornecedor || fornecedor.razaoSocial || '',
    apelido: fornecedor.apelido || fornecedor.nomeFantasia || '',
    cpfCnpj: fornecedor.cpfCnpj || fornecedor.cnpj || '',
    rgInscricaoEstadual: fornecedor.rgInscricaoEstadual || fornecedor.inscricaoEstadual || '',
    email: fornecedor.email || '',
    contato: fornecedor.contato || '',
    telefone: fornecedor.telefone || '',
    endereco: fornecedor.endereco || '',
    numero: fornecedor.numero || '',
    complemento: fornecedor.complemento || '',
    bairro: fornecedor.bairro || '',
    cep: fornecedor.cep || '',
    tipo: fornecedor.tipo || 2,
    observacoes: fornecedor.observacoes || '',
    limiteCredito: Number(fornecedor.limiteCredito) || 0,
    situacao: fornecedor.situacao || '',
    condicaoPagamentoId: fornecedor.condicaoPagamentoId || null,
    cidadeId: fornecedor.cidadeId || fornecedor.cidade?.id || null,
    // Compatibilidade com campos antigos
    razaoSocial: fornecedor.fornecedor || fornecedor.razaoSocial || '',
    nomeFantasia: fornecedor.apelido || fornecedor.nomeFantasia || '',
    cnpj: fornecedor.cpfCnpj || fornecedor.cnpj || '',
    inscricaoEstadual: fornecedor.rgInscricaoEstadual || fornecedor.inscricaoEstadual || '',
    cidade: cidade,
    ativo: fornecedor.ativo === undefined ? true : fornecedor.ativo,
    dataCadastro: fornecedor.dataCadastro || fornecedor.dataCriacao,
    ultimaModificacao: fornecedor.ultimaModificacao || fornecedor.dataAlteracao,
    dataCriacao: fornecedor.dataCriacao,
    dataAlteracao: fornecedor.dataAlteracao
  };
};

// Adaptador para converter dados do frontend para a API
const adaptFornecedorToApi = (fornecedor: any): FornecedorPayload => {
  console.log('Dados recebidos do formulário fornecedor:', fornecedor);
  
  // Garantir que campos obrigatórios tenham valores padrão
  const hoje = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  const payload: FornecedorPayload = {
    // Campos obrigatórios com valores padrão se necessário
    fornecedor: String(fornecedor.fornecedor || fornecedor.razaoSocial || '').trim() || 'Fornecedor',
    apelido: String(fornecedor.apelido || fornecedor.nomeFantasia || '').trim() || 'Apelido',
    email: String(fornecedor.email || '').trim() || 'contato@fornecedor.com',
    telefone: String(fornecedor.telefone || '').trim() || '00000000000',
    tipo: Number(fornecedor.tipo) || 2,
    limiteCredito: Number(fornecedor.limiteCredito) || 0,
    situacao: String(fornecedor.situacao || '').trim() || hoje,
    cidadeId: Number(fornecedor.cidade?.id || fornecedor.cidadeId),
    
    // Campos opcionais 
    cpfCnpj: String(fornecedor.cpfCnpj || fornecedor.cnpj || '').trim(),
    rgInscricaoEstadual: String(fornecedor.rgInscricaoEstadual || fornecedor.inscricaoEstadual || '').trim(),
    contato: String(fornecedor.contato || '').trim(),
    endereco: String(fornecedor.endereco || '').trim(),
    numero: String(fornecedor.numero || '').trim(),
    complemento: String(fornecedor.complemento || '').trim(),
    bairro: String(fornecedor.bairro || '').trim(),
    cep: String(fornecedor.cep || '').trim(),
    observacoes: String(fornecedor.observacoes || '').trim()
  };

  // Só incluir condicaoPagamentoId se tiver valor válido
  if (fornecedor.condicaoPagamentoId && fornecedor.condicaoPagamentoId !== '') {
    payload.condicaoPagamentoId = Number(fornecedor.condicaoPagamentoId);
  }
  
  console.log('Payload final sendo enviado para API fornecedor:', JSON.stringify(payload, null, 2));
  return payload;
};

// Busca todos os fornecedores
export const getFornecedores = async (): Promise<Fornecedor[]> => {
  try {
    const response = await api.get('/fornecedores');
    
    if (Array.isArray(response.data)) {
      // Usar Promise.all para buscar cidades em paralelo
      return await Promise.all(response.data.map(adaptFornecedorFromApi));
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
      return await adaptFornecedorFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para fornecedor ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar fornecedor ${id}:`, error);
    throw error;
  }
};

// Cria um novo fornecedor
export const createFornecedor = async (fornecedor: any): Promise<Fornecedor> => {
  try {
    const dataToSend = adaptFornecedorToApi(fornecedor);
    console.log('Enviando POST para /fornecedores com dados:', dataToSend);
    
    const response = await api.post('/fornecedores', dataToSend);
    
    if (response.data) {
      return await adaptFornecedorFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar fornecedor');
  } catch (error: any) {
    console.error('Erro ao criar fornecedor:', error);
    console.error('Detalhes do erro:', error.response?.data);
    throw error;
  }
};

// Atualiza um fornecedor existente
export const updateFornecedor = async (id: number, fornecedor: any): Promise<Fornecedor> => {
  try {
    const dataToSend = adaptFornecedorToApi(fornecedor);
    console.log(`Enviando PUT para /fornecedores/${id} com dados:`, dataToSend);
    
    const response = await api.put(`/fornecedores/${id}`, dataToSend);
    
    if (response.data) {
      return await adaptFornecedorFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar fornecedor ${id}`);
  } catch (error: any) {
    console.error(`Erro ao atualizar fornecedor ${id}:`, error);
    console.error('Detalhes do erro:', error.response?.data);
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