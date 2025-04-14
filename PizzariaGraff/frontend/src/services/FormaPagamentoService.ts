import { FormaPagamento } from '../types';
import api from './api';

export interface FormaPagamentoInput {
  nome: string;
  descricao: string;
  ativo: boolean;
}

// Função para verificar se estamos em modo de desenvolvimento
const isDevelopmentMode = () => {
  console.log('Verificando modo de desenvolvimento...');
  console.log('REACT_APP_USE_MOCK_DATA:', process.env.REACT_APP_USE_MOCK_DATA);
  
  // Forçar modo de desenvolvimento para evitar chamadas ao backend
  return true;
};

// Função para converter string para Date se necessário
const convertToDate = (value: Date | string | undefined): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return new Date(value);
};

// Dados mockados para desenvolvimento
const mockFormasPagamento: FormaPagamento[] = [
  {
    id: 1,
    nome: 'Dinheiro',
    descricao: 'Dinheiro',
    ativo: true,
    dataCadastro: new Date(),
    ultimaModificacao: new Date()
  },
  {
    id: 2,
    nome: 'Cartão de Crédito',
    descricao: 'Cartão de Crédito',
    ativo: true,
    dataCadastro: new Date(),
    ultimaModificacao: new Date()
  },
  {
    id: 3,
    nome: 'Cartão de Débito',
    descricao: 'Cartão de Débito',
    ativo: true,
    dataCadastro: new Date(),
    ultimaModificacao: new Date()
  }
];

const FormaPagamentoService = {
  async list(): Promise<FormaPagamento[]> {
    try {
      if (isDevelopmentMode()) {
        console.log('Usando dados mockados para listar formas de pagamento');
        return mockFormasPagamento;
      }
      
      const response = await api.get('/formas-pagamento');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      throw error;
    }
  },

  async listAtivos(): Promise<FormaPagamento[]> {
    try {
      if (isDevelopmentMode()) {
        console.log('Usando dados mockados para listar formas de pagamento ativas');
        return mockFormasPagamento.filter(fp => fp.ativo);
      }
      
      const response = await api.get('/formas-pagamento/ativos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento ativas:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<FormaPagamento> {
    try {
      if (isDevelopmentMode()) {
        console.log('Usando dados mockados para buscar forma de pagamento por ID:', id);
        const formaPagamento = mockFormasPagamento.find(fp => fp.id === id);
        if (!formaPagamento) {
          throw new Error('Forma de pagamento não encontrada');
        }
        return formaPagamento;
      }
      
      const response = await api.get(`/formas-pagamento/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar forma de pagamento:', error);
      throw error;
    }
  },

  async create(formaPagamento: FormaPagamentoInput): Promise<FormaPagamento> {
    try {
      if (isDevelopmentMode()) {
        console.log('Usando dados mockados para criar forma de pagamento:', formaPagamento);
        const newId = Math.max(...mockFormasPagamento.map(fp => fp.id)) + 1;
        const newFormaPagamento: FormaPagamento = {
          id: newId,
          nome: formaPagamento.nome,
          descricao: formaPagamento.descricao,
          ativo: formaPagamento.ativo,
          dataCadastro: new Date(),
          ultimaModificacao: new Date()
        };
        mockFormasPagamento.push(newFormaPagamento);
        return newFormaPagamento;
      }
      
      const dataToSend = {
        nome: formaPagamento.nome,
        descricao: formaPagamento.descricao,
        ativo: formaPagamento.ativo
      };
      
      console.log('Dados enviados para criação:', dataToSend);
      const response = await api.post('/formas-pagamento', dataToSend);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar forma de pagamento:', error);
      
      // Se estiver em modo de desenvolvimento, retornar um objeto mockado em caso de erro
      if (isDevelopmentMode()) {
        console.warn('Erro em modo de desenvolvimento, retornando objeto mockado');
        const newId = Math.max(...mockFormasPagamento.map(fp => fp.id)) + 1;
        const newFormaPagamento: FormaPagamento = {
          id: newId,
          nome: formaPagamento.nome,
          descricao: formaPagamento.descricao,
          ativo: formaPagamento.ativo,
          dataCadastro: new Date(),
          ultimaModificacao: new Date()
        };
        mockFormasPagamento.push(newFormaPagamento);
        return newFormaPagamento;
      }
      
      throw error;
    }
  },

  async update(id: number, formaPagamento: FormaPagamentoInput): Promise<FormaPagamento> {
    try {
      if (isDevelopmentMode()) {
        console.log('Usando dados mockados para atualizar forma de pagamento:', id, formaPagamento);
        const index = mockFormasPagamento.findIndex(fp => fp.id === id);
        if (index === -1) {
          throw new Error('Forma de pagamento não encontrada');
        }
        
        mockFormasPagamento[index] = {
          ...mockFormasPagamento[index],
          nome: formaPagamento.nome,
          descricao: formaPagamento.descricao,
          ativo: formaPagamento.ativo,
          ultimaModificacao: new Date()
        };
        
        return mockFormasPagamento[index];
      }
      
      const dataToSend = {
        nome: formaPagamento.nome,
        descricao: formaPagamento.descricao,
        ativo: formaPagamento.ativo
      };
      
      console.log('Dados enviados para atualização:', dataToSend);
      const response = await api.put(`/formas-pagamento/${id}`, dataToSend);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar forma de pagamento:', error);
      
      // Se estiver em modo de desenvolvimento, retornar um objeto mockado em caso de erro
      if (isDevelopmentMode()) {
        console.warn('Erro em modo de desenvolvimento, retornando objeto mockado');
        const index = mockFormasPagamento.findIndex(fp => fp.id === id);
        if (index === -1) {
          throw new Error('Forma de pagamento não encontrada');
        }
        
        mockFormasPagamento[index] = {
          ...mockFormasPagamento[index],
          nome: formaPagamento.nome,
          descricao: formaPagamento.descricao,
          ativo: formaPagamento.ativo,
          ultimaModificacao: new Date()
        };
        
        return mockFormasPagamento[index];
      }
      
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      if (isDevelopmentMode()) {
        console.log('Usando dados mockados para excluir forma de pagamento:', id);
        const index = mockFormasPagamento.findIndex(fp => fp.id === id);
        if (index === -1) {
          throw new Error('Forma de pagamento não encontrada');
        }
        
        mockFormasPagamento.splice(index, 1);
        return;
      }
      
      await api.delete(`/formas-pagamento/${id}`);
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error);
      throw error;
    }
  }
};

export default FormaPagamentoService; 