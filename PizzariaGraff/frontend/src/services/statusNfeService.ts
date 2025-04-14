import { StatusNfe } from '../types';
import api from './api';

const isDevelopmentMode = process.env.REACT_APP_USE_MOCK_DATA === 'true';

export type StatusNfeInput = Omit<StatusNfe, 'id' | 'dataCadastro' | 'ultimaModificacao'>;

const mockStatusNfe: StatusNfe[] = [
  {
    id: 1,
    descricao: 'Pendente',
    ativo: true,
    dataCadastro: '2024-01-01',
    ultimaModificacao: '2024-01-01'
  },
  {
    id: 2,
    descricao: 'Emitida',
    ativo: true,
    dataCadastro: '2024-01-01',
    ultimaModificacao: '2024-01-01'
  },
  {
    id: 3,
    descricao: 'Cancelada',
    ativo: false,
    dataCadastro: '2024-01-01',
    ultimaModificacao: '2024-01-01'
  }
];

const StatusNfeService = {
  async list(): Promise<StatusNfe[]> {
    if (isDevelopmentMode) {
      console.log('Usando dados mock para StatusNfe.list()');
      return mockStatusNfe;
    }

    const response = await api.get<StatusNfe[]>('/status-nfe');
    return response.data;
  },

  async listAtivos(): Promise<StatusNfe[]> {
    if (isDevelopmentMode) {
      console.log('Usando dados mock para StatusNfe.listAtivos()');
      return mockStatusNfe.filter(status => status.ativo);
    }

    const response = await api.get<StatusNfe[]>('/status-nfe/ativos');
    return response.data;
  },

  async getById(id: number): Promise<StatusNfe> {
    if (isDevelopmentMode) {
      console.log(`Usando dados mock para StatusNfe.getById(${id})`);
      const status = mockStatusNfe.find(s => s.id === id);
      if (!status) {
        throw new Error('Status não encontrado');
      }
      return status;
    }

    const response = await api.get<StatusNfe>(`/status-nfe/${id}`);
    return response.data;
  },

  async create(data: StatusNfeInput): Promise<StatusNfe> {
    if (isDevelopmentMode) {
      console.log('Usando dados mock para StatusNfe.create()', data);
      return {
        ...data,
        id: Math.max(...mockStatusNfe.map(s => s.id)) + 1,
        dataCadastro: new Date().toISOString(),
        ultimaModificacao: new Date().toISOString()
      };
    }

    const response = await api.post<StatusNfe>('/status-nfe', data);
    return response.data;
  },

  async update(id: number, data: StatusNfeInput): Promise<StatusNfe> {
    if (isDevelopmentMode) {
      console.log(`Usando dados mock para StatusNfe.update(${id})`, data);
      const index = mockStatusNfe.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error('Status não encontrado');
      }
      const updatedStatus = {
        ...mockStatusNfe[index],
        ...data,
        ultimaModificacao: new Date().toISOString()
      };
      mockStatusNfe[index] = updatedStatus;
      return updatedStatus;
    }

    const response = await api.put<StatusNfe>(`/status-nfe/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    if (isDevelopmentMode) {
      console.log(`Usando dados mock para StatusNfe.delete(${id})`);
      const index = mockStatusNfe.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error('Status não encontrado');
      }
      mockStatusNfe.splice(index, 1);
      return;
    }

    await api.delete(`/status-nfe/${id}`);
  }
};

export default StatusNfeService; 