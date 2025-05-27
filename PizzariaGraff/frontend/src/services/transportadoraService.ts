import api from './api';
import { Transportadora, Cidade } from '../types';

// Adapta a transportadora recebida da API para o formato usado no frontend
export const adaptTransportadoraFromApi = (transportadora: any): Transportadora => {
  // Criar a estrutura aninhada de cidade, estado e país
  let cidade = null;
  
  // Se a API retornou cidadeId e cidadeNome, criar o objeto cidade
  if (transportadora.cidadeId && transportadora.cidadeNome) {
    cidade = {
      id: transportadora.cidadeId,
      nome: transportadora.cidadeNome,
      estado: null
    };
    
    // Se a API retornou estadoId e estadoNome, criar o objeto estado
    if (transportadora.estadoId && transportadora.estadoNome) {
      // Verificar todas as propriedades da transportadora para encontrar a UF
      let estadoUf = '';
      if (transportadora.estadoUf) {
        estadoUf = transportadora.estadoUf;
      } else if (transportadora.uf) {
        estadoUf = transportadora.uf;
      } else if (transportadora.estado && transportadora.estado.uf) {
        estadoUf = transportadora.estado.uf;
      } else {
        // Se não encontrou, tentar extrair a UF do nome do estado
        const estados = {
          'ACRE': 'AC', 'ALAGOAS': 'AL', 'AMAPÁ': 'AP', 'AMAZONAS': 'AM', 'BAHIA': 'BA',
          'CEARÁ': 'CE', 'DISTRITO FEDERAL': 'DF', 'ESPÍRITO SANTO': 'ES', 'GOIÁS': 'GO',
          'MARANHÃO': 'MA', 'MATO GROSSO': 'MT', 'MATO GROSSO DO SUL': 'MS', 'MINAS GERAIS': 'MG',
          'PARÁ': 'PA', 'PARAÍBA': 'PB', 'PARANÁ': 'PR', 'PERNAMBUCO': 'PE', 'PIAUÍ': 'PI',
          'RIO DE JANEIRO': 'RJ', 'RIO GRANDE DO NORTE': 'RN', 'RIO GRANDE DO SUL': 'RS',
          'RONDÔNIA': 'RO', 'RORAIMA': 'RR', 'SANTA CATARINA': 'SC', 'SÃO PAULO': 'SP',
          'SERGIPE': 'SE', 'TOCANTINS': 'TO'
        };
        
        const estadoNomeUpper = transportadora.estadoNome?.toUpperCase();
        if (estadoNomeUpper && estados[estadoNomeUpper]) {
          estadoUf = estados[estadoNomeUpper];
        }
      }
      
      cidade.estado = {
        id: transportadora.estadoId,
        nome: transportadora.estadoNome,
        uf: estadoUf,
        pais: null
      };
      
      // Se a API retornou paisId e paisNome, criar o objeto país
      if (transportadora.paisId && transportadora.paisNome) {
        cidade.estado.pais = {
          id: transportadora.paisId,
          nome: transportadora.paisNome,
          codigo: transportadora.paisId,
          sigla: transportadora.paisId.substring(0, 2)
        };
      }
    }
  } else if (transportadora.cidade) {
    // Se já veio um objeto cidade estruturado, usá-lo como está
    cidade = transportadora.cidade;
  }
  
  const result = {
    id: transportadora.id,
    razaoSocial: transportadora.razaoSocial || '',
    nomeFantasia: transportadora.nomeFantasia || '',
    cnpj: transportadora.cnpj || '',
    endereco: transportadora.endereco || '',
    telefone: transportadora.telefone || '',
    email: transportadora.email || '',
    cidade: cidade,
    ativo: transportadora.ativo !== false,
    itens: transportadora.itens || [],
    veiculos: transportadora.veiculos || [],
    dataCadastro: transportadora.dataCadastro,
    ultimaModificacao: transportadora.ultimaModificacao
  };
  
  return result;
};

// Adapta a transportadora do frontend para o formato esperado pela API
export const adaptTransportadoraToApi = (transportadora: Omit<Transportadora, 'id'>): any => {
  return {
    razaoSocial: transportadora.razaoSocial,
    nomeFantasia: transportadora.nomeFantasia,
    cnpj: transportadora.cnpj,
    endereco: transportadora.endereco,
    telefone: transportadora.telefone,
    email: transportadora.email,
    cidadeId: transportadora.cidade?.id,
    ativo: transportadora.ativo,
    itens: transportadora.itens || [],
    veiculos: transportadora.veiculos || []
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
    const response = await api.get(`/transportadoras/${id}`);
    
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
export const createTransportadora = async (transportadora: Omit<Transportadora, 'id'>): Promise<Transportadora> => {
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
export const updateTransportadora = async (id: number | string, transportadora: Omit<Transportadora, 'id'>): Promise<Transportadora> => {
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