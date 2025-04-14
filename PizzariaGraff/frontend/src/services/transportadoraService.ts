import api from './api';
import { Transportadora, Cidade } from '../types';

// Dados de exemplo para uso em caso de falha da API
const MOCK_TRANSPORTADORAS: Transportadora[] = [
  {
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
  }
];

// Adapta a transportadora recebida da API para o formato usado no frontend
export const adaptTransportadoraFromApi = (transportadora: any): Transportadora => {
  // Log detalhado dos dados recebidos da API
  console.log('Dados brutos da transportadora:', JSON.stringify(transportadora, null, 2));
  
  // Criar a estrutura aninhada de cidade, estado e país
  let cidade = null;
  
  // Se a API retornou cidadeId e cidadeNome, criar o objeto cidade
  if (transportadora.cidadeId && transportadora.cidadeNome) {
    console.log(`Criando objeto cidade para ${transportadora.cidadeNome} (ID: ${transportadora.cidadeId})`);
    
    cidade = {
      id: transportadora.cidadeId,
      nome: transportadora.cidadeNome,
      estado: null
    };
    
    // Se a API retornou estadoId e estadoNome, criar o objeto estado
    if (transportadora.estadoId && transportadora.estadoNome) {
      console.log(`Criando objeto estado para ${transportadora.estadoNome} (ID: ${transportadora.estadoId})`);
      
      // Verificar todas as propriedades da transportadora para encontrar a UF
      let estadoUf = '';
      if (transportadora.estadoUf) {
        estadoUf = transportadora.estadoUf;
        console.log(`UF encontrada em transportadora.estadoUf: ${estadoUf}`);
      } else if (transportadora.uf) {
        estadoUf = transportadora.uf;
        console.log(`UF encontrada em transportadora.uf: ${estadoUf}`);
      } else if (transportadora.estado && transportadora.estado.uf) {
        estadoUf = transportadora.estado.uf;
        console.log(`UF encontrada em transportadora.estado.uf: ${estadoUf}`);
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
          console.log(`UF deduzida do nome do estado (${transportadora.estadoNome}): ${estadoUf}`);
        } else {
          console.log(`Não foi possível encontrar a UF para o estado ${transportadora.estadoNome}`);
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
        console.log(`Criando objeto país para ${transportadora.paisNome} (ID: ${transportadora.paisId})`);
        
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
    console.log('Usando objeto cidade já estruturado:', JSON.stringify(transportadora.cidade, null, 2));
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
  
  console.log('Objeto transportadora adaptado:', JSON.stringify(result, null, 2));
  
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
    console.log('Buscando transportadoras na API...');
    const response = await api.get('/transportadoras');
    console.log('Resposta da API (transportadoras):', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API retornou dados inválidos para transportadoras. Usando dados mockados.');
      return MOCK_TRANSPORTADORAS;
    }
    
    return response.data.map(adaptTransportadoraFromApi);
  } catch (error) {
    console.error('Erro ao buscar transportadoras:', error);
    console.warn('Usando dados mockados para transportadoras devido a erro na API.');
    return MOCK_TRANSPORTADORAS;
  }
};

// Busca uma transportadora por ID
export const getTransportadora = async (id: number | string): Promise<Transportadora | null> => {
  try {
    console.log(`Buscando transportadora com ID ${id} na API...`);
    const response = await api.get(`/transportadoras/${id}`);
    console.log(`Resposta da API (transportadora ${id}):`, response.data);
    
    if (!response.data || !response.data.id) {
      console.warn(`API retornou dados inválidos para transportadora ${id}. Usando dados mockados.`);
      return MOCK_TRANSPORTADORAS.find(t => String(t.id) === String(id)) || null;
    }
    
    return adaptTransportadoraFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar transportadora ${id}:`, error);
    console.warn(`Usando dados mockados para transportadora ${id} devido a erro na API.`);
    return MOCK_TRANSPORTADORAS.find(t => String(t.id) === String(id)) || null;
  }
};

// Cria uma nova transportadora
export const createTransportadora = async (transportadora: Omit<Transportadora, 'id'>): Promise<Transportadora> => {
  try {
    console.log('Criando nova transportadora na API:', transportadora);
    const transportadoraApi = adaptTransportadoraToApi(transportadora);
    const response = await api.post('/transportadoras', transportadoraApi);
    console.log('Resposta da API (criar transportadora):', response.data);
    
    return adaptTransportadoraFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar transportadora:', error);
    throw error;
  }
};

// Atualiza uma transportadora existente
export const updateTransportadora = async (id: number | string, transportadora: Omit<Transportadora, 'id'>): Promise<Transportadora> => {
  try {
    console.log(`Atualizando transportadora ${id} na API:`, transportadora);
    const transportadoraApi = adaptTransportadoraToApi(transportadora);
    const response = await api.put(`/transportadoras/${id}`, transportadoraApi);
    console.log(`Resposta da API (atualizar transportadora ${id}):`, response.data);
    
    return adaptTransportadoraFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar transportadora ${id}:`, error);
    throw error;
  }
};

// Exclui uma transportadora
export const deleteTransportadora = async (id: number | string): Promise<void> => {
  try {
    console.log(`Excluindo transportadora ${id} na API...`);
    await api.delete(`/transportadoras/${id}`);
    console.log(`Transportadora ${id} excluída com sucesso.`);
  } catch (error) {
    console.error(`Erro ao excluir transportadora ${id}:`, error);
    throw error;
  }
}; 