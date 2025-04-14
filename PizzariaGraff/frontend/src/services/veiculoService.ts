import api from './api';
import { Veiculo, Transportadora } from '../types';
import { adaptTransportadoraFromApi } from './transportadoraService';

// Dados de exemplo para uso em caso de falha da API
export const veiculosMock: Veiculo[] = [
  {
    id: 1,
    descricao: 'Furgão de Entregas',
    placa: 'ABC-1234',
    transportadora: {
      id: 1,
      razaoSocial: 'Transportadora Exemplo LTDA',
      nomeFantasia: 'Trans Express',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rodovia Principal, Km 10',
      telefone: '(11) 3333-5555',
      email: 'contato@transexpress.com',
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
            codigo: 'BRA',
            sigla: 'BR'
          }
        }
      },
      ativo: true,
      itens: [],
      veiculos: []
    },
    dataCadastro: '2023-01-01',
    ultimaModificacao: '2023-01-01'
  }
];

// Adaptar dados do veículo recebido da API para o formato do frontend
export function adaptVeiculoFromApi(veiculo: any): Veiculo {
  console.log('Adaptando veículo da API:', veiculo);
  
  let transportadoraAdaptada = null;
  
  // Se veio uma transportadora ou dados dela, adaptar
  if (veiculo.transportadora) {
    transportadoraAdaptada = adaptTransportadoraFromApi(veiculo.transportadora);
  } else if (veiculo.transportadoraId && veiculo.transportadoraNome) {
    transportadoraAdaptada = {
      id: veiculo.transportadoraId,
      razaoSocial: veiculo.transportadoraNome,
      nomeFantasia: veiculo.transportadoraNome,
      cnpj: '',
      cidade: null as any,
      ativo: true,
      itens: [],
      veiculos: []
    };
  }
  
  return {
    id: veiculo.id,
    descricao: veiculo.modelo || veiculo.descricao || '',
    placa: veiculo.placa || '',
    transportadora: transportadoraAdaptada || {
      id: 0,
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      cidade: null as any,
      ativo: true,
      itens: [],
      veiculos: []
    },
    dataCadastro: veiculo.dataCadastro || '',
    ultimaModificacao: veiculo.ultimaModificacao || ''
  };
}

// Adaptar dados do veículo do frontend para enviar à API
export function adaptVeiculoToApi(veiculo: Omit<Veiculo, 'id'>): any {
  console.log('Adaptando veículo para API:', veiculo);
  
  return {
    placa: veiculo.placa,
    modelo: veiculo.descricao, // O backend espera 'modelo'
    marca: 'N/A', // Obrigatório no backend
    ano: new Date().getFullYear(), // Obrigatório no backend
    capacidade: 0, // Obrigatório no backend
    transportadoraId: veiculo.transportadora?.id,
    ativo: true
  };
}

// Busca todos os veículos
export const getVeiculos = async (): Promise<Veiculo[]> => {
  try {
    console.log('Buscando veículos na API...');
    const response = await api.get('/veiculos');
    console.log('Resposta da API (veículos):', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API retornou dados inválidos para veículos. Usando dados mockados.');
      return veiculosMock;
    }
    
    return response.data.map(adaptVeiculoFromApi);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    console.warn('Usando dados mockados para veículos devido a erro na API.');
    return veiculosMock;
  }
};

// Busca veículos por transportadora
export const getVeiculosPorTransportadora = async (transportadoraId: number | string): Promise<Veiculo[]> => {
  try {
    console.log(`Buscando veículos da transportadora ${transportadoraId} na API...`);
    const response = await api.get(`/veiculos/transportadora/${transportadoraId}`);
    console.log(`Resposta da API (veículos da transportadora ${transportadoraId}):`, response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`API retornou dados inválidos para veículos da transportadora ${transportadoraId}. Usando dados mockados.`);
      return veiculosMock.filter(v => String(v.transportadora.id) === String(transportadoraId));
    }
    
    return response.data.map(adaptVeiculoFromApi);
  } catch (error) {
    console.error(`Erro ao buscar veículos da transportadora ${transportadoraId}:`, error);
    console.warn(`Usando dados mockados para veículos da transportadora ${transportadoraId} devido a erro na API.`);
    return veiculosMock.filter(v => String(v.transportadora.id) === String(transportadoraId));
  }
};

// Busca um veículo por ID
export const getVeiculo = async (id: number | string): Promise<Veiculo | null> => {
  try {
    console.log(`Buscando veículo com ID ${id} na API...`);
    const response = await api.get(`/veiculos/${id}`);
    console.log(`Resposta da API (veículo ${id}):`, response.data);
    
    if (!response.data || !response.data.id) {
      console.warn(`API retornou dados inválidos para veículo ${id}. Usando dados mockados.`);
      return veiculosMock.find(v => String(v.id) === String(id)) || null;
    }
    
    return adaptVeiculoFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar veículo ${id}:`, error);
    console.warn(`Usando dados mockados para veículo ${id} devido a erro na API.`);
    return veiculosMock.find(v => String(v.id) === String(id)) || null;
  }
};

// Cria um novo veículo
export const createVeiculo = async (veiculo: Omit<Veiculo, 'id'>): Promise<Veiculo> => {
  try {
    console.log('Criando novo veículo na API:', veiculo);
    const veiculoApi = adaptVeiculoToApi(veiculo);
    const response = await api.post('/veiculos', veiculoApi);
    console.log('Resposta da API (criar veículo):', response.data);
    
    return adaptVeiculoFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    throw error;
  }
};

// Atualiza um veículo existente
export const updateVeiculo = async (id: number | string, veiculo: Omit<Veiculo, 'id'>): Promise<Veiculo> => {
  try {
    console.log(`Atualizando veículo ${id} na API:`, veiculo);
    const veiculoApi = adaptVeiculoToApi(veiculo);
    const response = await api.put(`/veiculos/${id}`, veiculoApi);
    console.log(`Resposta da API (atualizar veículo ${id}):`, response.data);
    
    return adaptVeiculoFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar veículo ${id}:`, error);
    throw error;
  }
};

// Exclui um veículo
export const deleteVeiculo = async (id: number | string): Promise<void> => {
  try {
    console.log(`Excluindo veículo ${id} na API...`);
    await api.delete(`/veiculos/${id}`);
    console.log(`Veículo ${id} excluído com sucesso.`);
  } catch (error) {
    console.error(`Erro ao excluir veículo ${id}:`, error);
    throw error;
  }
}; 