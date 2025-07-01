import api from './api';
import { Transportadora, Cidade } from '../types';

// Adapta a transportadora recebida da API para o formato usado no frontend
export const adaptTransportadoraFromApi = (transportadora: any): Transportadora => {
  const cidade = transportadora.cidade || null;
  
  const result: Transportadora = {
    id: transportadora.id,
    transportadora: transportadora.transportadora || '',
    apelido: transportadora.apelido || '',
    cpfCnpj: transportadora.cpfCnpj || '',
    rgIe: transportadora.rgIe || '',
    endereco: transportadora.endereco || '',
    numero: transportadora.numero || '',
    complemento: transportadora.complemento || '',
    bairro: transportadora.bairro || '',
    cep: transportadora.cep || '',
    cidade: cidade,
    cidadeId: transportadora.cidadeId,
    ativo: transportadora.ativo !== false,
    tipo: transportadora.tipo || 2,
    observacao: transportadora.observacao || '',
    condicaoPagamentoId: transportadora.condicaoPagamentoId,
    emailsAdicionais: transportadora.emailsAdicionais || [],
    telefonesAdicionais: transportadora.telefonesAdicionais || [],
    dataCadastro: transportadora.dataCadastro || transportadora.dataCriacao,
    ultimaModificacao: transportadora.ultimaModificacao || transportadora.dataAlteracao,
    
    // Campos legados que podem vir da API mas não são mais o padrão
    razaoSocial: transportadora.transportadora || transportadora.razaoSocial,
    nomeFantasia: transportadora.apelido || transportadora.nomeFantasia,
    cnpj: transportadora.cpfCnpj || transportadora.cnpj,
    veiculos: transportadora.veiculos || [],
    veiculoIds: transportadora.veiculoIds || (transportadora.veiculos || []).map((v: any) => v.id),
  };
  
  return result;
};

// Adapta a transportadora do frontend para o formato esperado pela API
export const adaptTransportadoraToApi = (transportadora: Partial<Transportadora>): any => {
  return {
    id: transportadora.id,
    transportadora: transportadora.transportadora,
    apelido: transportadora.apelido,
    endereco: transportadora.endereco,
    numero: transportadora.numero,
    complemento: transportadora.complemento,
    bairro: transportadora.bairro,
    cep: transportadora.cep,
    cidadeId: transportadora.cidade?.id || transportadora.cidadeId,
    rgIe: transportadora.rgIe,
    observacao: transportadora.observacao,
    condicaoPagamentoId: transportadora.condicaoPagamentoId,
    cpfCnpj: transportadora.cpfCnpj,
    ativo: transportadora.ativo,
    tipo: transportadora.tipo,
    emailsAdicionais: transportadora.emailsAdicionais,
    telefonesAdicionais: transportadora.telefonesAdicionais,
    veiculoIds: transportadora.veiculoIds,
  };
};

// Busca todas as transportadoras
export const getTransportadoras = async (): Promise<Transportadora[]> => {
  try {
    const response = await api.get('/transportadoras');
    
    if (!Array.isArray(response.data)) {
      throw new Error('API retornou dados inválidos para transportadoras');
    }
    
    return response.data.map(adaptTransportadoraFromApi);
  } catch (error) {
    console.error('Erro ao buscar transportadoras:', error);
    throw error;
  }
};

// Busca uma transportadora por ID
export const getTransportadora = async (id: number | string): Promise<Transportadora | null> => {
  try {
    const response = await api.get(`/transportadoras/${id}/complete`);
    
    if (!response.data || !response.data.id) {
      throw new Error(`API retornou dados inválidos para transportadora ${id}`);
    }
    
    return adaptTransportadoraFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar transportadora ${id}:`, error);
    throw error;
  }
};

// Cria uma nova transportadora
export const createTransportadora = async (transportadora: Partial<Transportadora>): Promise<Transportadora> => {
  try {
    const transportadoraApi = adaptTransportadoraToApi(transportadora);
    const response = await api.post('/transportadoras', transportadoraApi);
    return adaptTransportadoraFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar transportadora:', error);
    throw error;
  }
};

// Atualiza uma transportadora existente
export const updateTransportadora = async (id: number | string, transportadora: Partial<Transportadora>): Promise<Transportadora> => {
  try {
    const transportadoraApi = adaptTransportadoraToApi(transportadora);
    const response = await api.put(`/transportadoras/${id}`, transportadoraApi);
    return adaptTransportadoraFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar transportadora ${id}:`, error);
    throw error;
  }
};

// Exclui uma transportadora
export const deleteTransportadora = async (id: number | string): Promise<void> => {
  try {
    await api.delete(`/transportadoras/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir transportadora ${id}:`, error);
    throw error;
  }
}; 