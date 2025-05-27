import api from './api';
import { Veiculo } from '../types';

// Converte os dados da API para o formato do frontend
const adaptVeiculoFromApi = (apiVeiculo: any): Veiculo => {
  return {
    id: apiVeiculo.id,
    placa: apiVeiculo.placa,
    descricao: apiVeiculo.descricao || '',
    anoModelo: apiVeiculo.anoModelo || '',
    anoFabricacao: apiVeiculo.anoFabricacao || '',
    capacidadeCarga: apiVeiculo.capacidadeCarga || 0,
    observacoes: apiVeiculo.observacoes || '',
    ativo: apiVeiculo.ativo !== undefined ? apiVeiculo.ativo : true,
    transportadora: {
      id: apiVeiculo.transportadoraId || 0,
      nome: apiVeiculo.transportadoraNome || '',
      razaoSocial: apiVeiculo.transportadoraRazaoSocial || '',
      nomeFantasia: apiVeiculo.transportadoraNomeFantasia || apiVeiculo.transportadoraNome || '',
      cnpj: '',
      inscricaoEstadual: '',
      endereco: '',
      numero: '',
      bairro: '',
      telefone: '',
      email: '',
      cidade: { id: 0, nome: '', estado: null },
      ativo: true,
      veiculos: [],
      itens: []
    },
    dataCadastro: apiVeiculo.dataCadastro || null,
    ultimaModificacao: apiVeiculo.ultimaModificacao || null
  };
};

// Converte os dados do frontend para o formato da API
const adaptVeiculoToApi = (veiculo: Omit<Veiculo, 'id' | 'dataCadastro' | 'ultimaModificacao'>): any => {
  return {
    placa: veiculo.placa,
    descricao: veiculo.descricao || '',
    anoModelo: veiculo.anoModelo || '',
    anoFabricacao: veiculo.anoFabricacao || '',
    capacidadeCarga: veiculo.capacidadeCarga || 0,
    observacoes: veiculo.observacoes || '',
    ativo: veiculo.ativo,
    transportadoraId: veiculo.transportadora.id
  };
};

// Busca todos os veículos
export const getVeiculos = async (): Promise<Veiculo[]> => {
  try {
    const response = await api.get('/veiculos');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptVeiculoFromApi);
    }
    
    throw new Error('Resposta inválida da API para veículos');
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    throw error;
  }
};

// Busca veículos de uma transportadora
export const getVeiculosByTransportadora = async (transportadoraId: number): Promise<Veiculo[]> => {
  try {
    const response = await api.get(`/veiculos/transportadora/${transportadoraId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptVeiculoFromApi);
    }
    
    throw new Error(`Resposta inválida da API para veículos da transportadora ${transportadoraId}`);
  } catch (error) {
    console.error(`Erro ao buscar veículos da transportadora ${transportadoraId}:`, error);
    throw error;
  }
};

// Busca um veículo pelo ID
export const getVeiculo = async (id: number): Promise<Veiculo | null> => {
  try {
    const response = await api.get(`/veiculos/${id}`);
    
    if (response.data) {
      return adaptVeiculoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para veículo ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar veículo ${id}:`, error);
    throw error;
  }
};

// Cria um novo veículo
export const createVeiculo = async (veiculo: Omit<Veiculo, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Veiculo> => {
  try {
    const dataToSend = adaptVeiculoToApi(veiculo);
    const response = await api.post('/veiculos', dataToSend);
    
    if (response.data) {
      return adaptVeiculoFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar veículo');
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    throw error;
  }
};

// Atualiza um veículo existente
export const updateVeiculo = async (id: number, veiculo: Omit<Veiculo, 'id' | 'dataCadastro' | 'ultimaModificacao'>): Promise<Veiculo> => {
  try {
    const dataToSend = adaptVeiculoToApi(veiculo);
    const response = await api.put(`/veiculos/${id}`, dataToSend);
    
    if (response.data) {
      return adaptVeiculoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar veículo ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar veículo ${id}:`, error);
    throw error;
  }
};

// Exclui um veículo
export const deleteVeiculo = async (id: number): Promise<void> => {
  try {
    await api.delete(`/veiculos/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir veículo ${id}:`, error);
    throw error;
  }
}; 