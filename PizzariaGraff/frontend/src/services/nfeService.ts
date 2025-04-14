import api from './api';
import { formatToBackend, formatFromBackend } from '../utils/dateUtils';
import { Nfe, Cliente, FormaPagamento, CondicaoPagamento, ModalidadeNfe, Cidade, Estado, Pais, StatusNfe } from '../types';

const isDevelopmentMode = process.env.REACT_APP_USE_MOCK_DATA === 'true';

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

// Mock para desenvolvimento
export const mockNfes: Nfe[] = [
  {
    id: 1,
    numeroNf: '000001',
    dataEmissao: '2024-03-20',
    dataRecebimento: '2024-03-20',
    valorTotal: 1500.00,
    observacao: 'Primeira venda do dia',
    cliente: {
      id: 1,
      nome: 'Cliente Exemplo',
      cpfCnpj: '123.456.789-00',
      email: 'cliente@exemplo.com',
      telefone: '11999999999',
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
            codigo: '076',
            sigla: 'BR'
          }
        }
      },
      ativo: true
    },
    formaPagamento: {
      id: 1,
      descricao: 'Cartão de Crédito',
      ativo: true
    },
    condicaoPagamento: {
      id: 1,
      codigo: 'A_VISTA',
      nome: 'À Vista',
      descricao: 'À Vista',
      numeroParcelas: 1,
      diasPrimeiraParcela: 0,
      diasEntreParcelas: 0,
      ativo: true
    },
    statusNfe: {
      id: 1,
      descricao: 'EMITIDA',
      ativo: true
    },
    modalidadeNfe: {
      id: 1,
      descricao: 'Saída'
    }
  }
];

export const getNfes = async (): Promise<Nfe[]> => {
  if (isDevelopmentMode) {
    console.log('Usando dados mock para getNfes()');
    return mockNfes;
  }

  try {
    const response = await api.get('/nfes');
    return response.data.map(adaptNfeFromApi);
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    throw error;
  }
};

export const getNfe = async (id: string): Promise<Nfe> => {
  if (isDevelopmentMode) {
    console.log(`Usando dados mock para getNfe(${id})`);
    const nfe = mockNfes.find(n => n.id === Number(id));
    if (!nfe) throw new Error('Nota fiscal não encontrada');
    return nfe;
  }

  try {
    const response = await api.get(`/nfes/${id}`);
    return adaptNfeFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar nota fiscal com ID ${id}:`, error);
    throw error;
  }
};

export const createNfe = async (nfe: NfeInput): Promise<Nfe> => {
  if (isDevelopmentMode) {
    console.log('Usando dados mock para createNfe()', nfe);
    const newNfe: Nfe = {
      ...mockNfes[0],
      id: Math.max(...mockNfes.map(n => n.id)) + 1,
      numeroNf: nfe.numero,
      dataEmissao: nfe.dataEmissao,
      dataRecebimento: nfe.dataRecebimento,
      valorTotal: nfe.valorTotal,
      observacao: nfe.observacao
    };
    mockNfes.push(newNfe);
    return newNfe;
  }

  try {
    const response = await api.post('/nfes', adaptNfeToApi(nfe));
    return adaptNfeFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar nota fiscal:', error);
    throw error;
  }
};

export const updateNfe = async (id: string, nfe: NfeInput): Promise<Nfe> => {
  if (isDevelopmentMode) {
    console.log(`Usando dados mock para updateNfe(${id})`, nfe);
    const index = mockNfes.findIndex(n => n.id === Number(id));
    if (index === -1) throw new Error('Nota fiscal não encontrada');
    const updatedNfe = {
      ...mockNfes[index],
      numeroNf: nfe.numero,
      dataEmissao: nfe.dataEmissao,
      dataRecebimento: nfe.dataRecebimento,
      valorTotal: nfe.valorTotal,
      observacao: nfe.observacao
    };
    mockNfes[index] = updatedNfe;
    return updatedNfe;
  }

  try {
    const response = await api.put(`/nfes/${id}`, adaptNfeToApi(nfe));
    return adaptNfeFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar nota fiscal com ID ${id}:`, error);
    throw error;
  }
};

export const deleteNfe = async (id: string): Promise<void> => {
  if (isDevelopmentMode) {
    console.log(`Usando dados mock para deleteNfe(${id})`);
    const index = mockNfes.findIndex(n => n.id === Number(id));
    if (index === -1) throw new Error('Nota fiscal não encontrada');
    mockNfes.splice(index, 1);
    return;
  }

  try {
    await api.delete(`/nfes/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir nota fiscal com ID ${id}:`, error);
    throw error;
  }
}; 