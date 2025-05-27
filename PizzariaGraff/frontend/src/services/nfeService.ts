import api from './api';
import { formatToBackend, formatFromBackend } from '../utils/dateUtils';
import { Nfe, Cliente, FormaPagamento, CondicaoPagamento, ModalidadeNfe, Cidade, Estado, Pais, StatusNfe, MovimentacaoNfe, ItemNfe } from '../types';

// Exportar funções individuais para compatibilidade com código existente
export const getNfes = async (): Promise<Nfe[]> => {
  return nfeService.list();
};

export const getNfe = async (id: number): Promise<Nfe | null> => {
  return nfeService.getById(id);
};

export const createNfe = async (nfe: Omit<Nfe, 'id'>): Promise<Nfe> => {
  return nfeService.create(nfe);
};

export const updateNfe = async (id: number, nfe: Omit<Nfe, 'id'>): Promise<Nfe> => {
  return nfeService.update(id, nfe);
};

export const deleteNfe = async (id: number): Promise<void> => {
  return nfeService.delete(id);
};

export interface NfeInput {
  numero: string;
  dataEmissao: string;
  dataRecebimento: string;
  valorTotal: number;
  observacao?: string;
  clienteId: string;
  formaPagamentoId: string;
  condicaoPagamentoId: string;
  modalidadeNfeId: string;
  status: string;
}

const adaptNfeFromApi = (data: any): Nfe => {
  return {
    id: data.id,
    numeroNf: data.numero,
    dataEmissao: formatFromBackend(data.dataEmissao),
    dataRecebimento: formatFromBackend(data.dataRecebimento),
    valorTotal: data.valorTotal,
    observacao: data.observacao,
    cliente: data.cliente,
    formaPagamento: data.formaPagamento,
    condicaoPagamento: data.condicaoPagamento,
    modalidadeNfe: data.modalidadeNfe,
    statusNfe: data.statusNfe,
    dataCadastro: data.dataCadastro ? formatFromBackend(data.dataCadastro) : undefined,
    ultimaModificacao: data.ultimaModificacao ? formatFromBackend(data.ultimaModificacao) : undefined,
  };
};

const adaptNfeToApi = (nfe: NfeInput): any => {
  return {
    numero: nfe.numero,
    dataEmissao: formatToBackend(nfe.dataEmissao),
    dataRecebimento: formatToBackend(nfe.dataRecebimento),
    valorTotal: nfe.valorTotal,
    observacao: nfe.observacao,
    clienteId: nfe.clienteId,
    formaPagamentoId: nfe.formaPagamentoId,
    condicaoPagamentoId: nfe.condicaoPagamentoId,
    modalidadeNfeId: nfe.modalidadeNfeId,
    status: nfe.status
  };
};

const nfeService = {
  // Busca todas as NFEs
  async list(): Promise<Nfe[]> {
    try {
      const response = await api.get('/nfes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar NFEs:', error);
      throw error;
    }
  },
  
  // Busca uma NFE pelo ID
  async getById(id: number): Promise<Nfe | null> {
    try {
      const response = await api.get(`/nfes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar NFE com ID ${id}:`, error);
      throw error;
    }
  },
  
  // Cria uma nova NFE
  async create(nfe: Omit<Nfe, 'id'>): Promise<Nfe> {
    try {
      const response = await api.post('/nfes', nfe);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar NFE:', error);
      throw error;
    }
  },
  
  // Atualiza uma NFE existente
  async update(id: number, nfe: Omit<Nfe, 'id'>): Promise<Nfe> {
    try {
      const response = await api.put(`/nfes/${id}`, nfe);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar NFE com ID ${id}:`, error);
      throw error;
    }
  },
  
  // Exclui uma NFE
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/nfes/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir NFE com ID ${id}:`, error);
      throw error;
    }
  },
  
  // Busca as movimentações de uma NFE
  async getMovimentacoes(nfeId: number): Promise<MovimentacaoNfe[]> {
    try {
      const response = await api.get(`/nfes/${nfeId}/movimentacoes`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar movimentações da NFE ${nfeId}:`, error);
      throw error;
    }
  },
  
  // Busca os itens de uma NFE
  async getItens(nfeId: number): Promise<ItemNfe[]> {
    try {
      const response = await api.get(`/nfes/${nfeId}/itens`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens da NFE ${nfeId}:`, error);
      throw error;
    }
  }
};

export default nfeService; 