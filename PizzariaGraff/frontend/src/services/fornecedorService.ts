import api from './api';
import { Fornecedor, Cidade } from '../types';

// Dados de exemplo para uso em caso de falha da API
const MOCK_FORNECEDORES: Fornecedor[] = [
  {
    id: 1,
    razaoSocial: 'Fornecedor Exemplo LTDA',
    nomeFantasia: 'Fornecedor Exemplo',
    cnpj: '12.345.678/0001-90',
    endereco: 'Avenida Principal',
    numero: '1000',
    complemento: 'Sala 101',
    bairro: 'Centro',
    cep: '12345-678',
    telefone: '(11) 3333-4444',
    email: 'contato@fornecedorexemplo.com',
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
    ativo: true
  }
];

// Adapta o fornecedor recebido da API para o formato usado no frontend
export const adaptFornecedorFromApi = (fornecedor: any): Fornecedor => {
  // Log detalhado dos dados recebidos da API
  console.log('Dados brutos do fornecedor:', JSON.stringify(fornecedor, null, 2));
  
  // Criar a estrutura aninhada de cidade, estado e país
  let cidade = null;
  
  // Se a API retornou cidadeId e cidadeNome, criar o objeto cidade
  if (fornecedor.cidadeId && fornecedor.cidadeNome) {
    console.log(`Criando objeto cidade para ${fornecedor.cidadeNome} (ID: ${fornecedor.cidadeId})`);
    
    cidade = {
      id: fornecedor.cidadeId,
      nome: fornecedor.cidadeNome,
      estado: null
    };
    
    // Se a API retornou estadoId e estadoNome, criar o objeto estado
    if (fornecedor.estadoId && fornecedor.estadoNome) {
      console.log(`Criando objeto estado para ${fornecedor.estadoNome} (ID: ${fornecedor.estadoId})`);
      
      // Verificar todas as propriedades do fornecedor para encontrar a UF
      let estadoUf = '';
      if (fornecedor.estadoUf) {
        estadoUf = fornecedor.estadoUf;
        console.log(`UF encontrada em fornecedor.estadoUf: ${estadoUf}`);
      } else if (fornecedor.uf) {
        estadoUf = fornecedor.uf;
        console.log(`UF encontrada em fornecedor.uf: ${estadoUf}`);
      } else if (fornecedor.estado && fornecedor.estado.uf) {
        estadoUf = fornecedor.estado.uf;
        console.log(`UF encontrada em fornecedor.estado.uf: ${estadoUf}`);
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
        
        const estadoNomeUpper = fornecedor.estadoNome?.toUpperCase();
        if (estadoNomeUpper && estados[estadoNomeUpper]) {
          estadoUf = estados[estadoNomeUpper];
          console.log(`UF deduzida do nome do estado (${fornecedor.estadoNome}): ${estadoUf}`);
        } else {
          console.log(`Não foi possível encontrar a UF para o estado ${fornecedor.estadoNome}`);
        }
      }
      
      cidade.estado = {
        id: fornecedor.estadoId,
        nome: fornecedor.estadoNome,
        uf: estadoUf,
        pais: null
      };
      
      // Se a API retornou paisId e paisNome, criar o objeto país
      if (fornecedor.paisId && fornecedor.paisNome) {
        console.log(`Criando objeto país para ${fornecedor.paisNome} (ID: ${fornecedor.paisId})`);
        
        cidade.estado.pais = {
          id: fornecedor.paisId,
          nome: fornecedor.paisNome,
          codigo: fornecedor.paisId,
          sigla: fornecedor.paisId.substring(0, 2)
        };
      }
    }
  } else if (fornecedor.cidade) {
    // Se já veio um objeto cidade estruturado, usá-lo como está
    console.log('Usando objeto cidade já estruturado:', JSON.stringify(fornecedor.cidade, null, 2));
    cidade = fornecedor.cidade;
  }
  
  return {
    id: fornecedor.id,
    razaoSocial: fornecedor.razaoSocial || '',
    nomeFantasia: fornecedor.nomeFantasia || '',
    cnpj: fornecedor.cnpj || '',
    endereco: fornecedor.endereco || '',
    numero: fornecedor.numero || '',
    complemento: fornecedor.complemento || '',
    bairro: fornecedor.bairro || '',
    cep: fornecedor.cep || '',
    telefone: fornecedor.telefone || '',
    email: fornecedor.email || '',
    cidade: cidade,
    ativo: fornecedor.ativo !== false,
    dataCadastro: fornecedor.dataCadastro,
    ultimaModificacao: fornecedor.ultimaModificacao
  };
};

// Adapta o fornecedor do frontend para o formato esperado pela API
export const adaptFornecedorToApi = (fornecedor: Omit<Fornecedor, 'id'>): any => {
  return {
    razaoSocial: fornecedor.razaoSocial,
    nomeFantasia: fornecedor.nomeFantasia,
    cnpj: fornecedor.cnpj,
    endereco: fornecedor.endereco,
    numero: fornecedor.numero,
    complemento: fornecedor.complemento,
    bairro: fornecedor.bairro,
    cep: fornecedor.cep,
    telefone: fornecedor.telefone,
    email: fornecedor.email,
    cidadeId: fornecedor.cidade?.id,
    ativo: fornecedor.ativo
  };
};

// Busca todos os fornecedores
export const getFornecedores = async (): Promise<Fornecedor[]> => {
  try {
    console.log('Buscando fornecedores na API...');
    const response = await api.get('/fornecedores');
    console.log('Resposta da API (fornecedores):', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API retornou dados inválidos para fornecedores. Usando dados mockados.');
      return MOCK_FORNECEDORES;
    }
    
    return response.data.map(adaptFornecedorFromApi);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    console.warn('Usando dados mockados para fornecedores devido a erro na API.');
    return MOCK_FORNECEDORES;
  }
};

// Busca um fornecedor por ID
export const getFornecedor = async (id: number | string): Promise<Fornecedor | null> => {
  try {
    console.log(`Buscando fornecedor com ID ${id} na API...`);
    const response = await api.get(`/fornecedores/${id}`);
    console.log(`Resposta da API (fornecedor ${id}):`, response.data);
    
    if (!response.data || !response.data.id) {
      console.warn(`API retornou dados inválidos para fornecedor ${id}. Usando dados mockados.`);
      return MOCK_FORNECEDORES.find(f => String(f.id) === String(id)) || null;
    }
    
    return adaptFornecedorFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar fornecedor ${id}:`, error);
    console.warn(`Usando dados mockados para fornecedor ${id} devido a erro na API.`);
    return MOCK_FORNECEDORES.find(f => String(f.id) === String(id)) || null;
  }
};

// Cria um novo fornecedor
export const createFornecedor = async (fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> => {
  try {
    console.log('Criando novo fornecedor na API:', fornecedor);
    const fornecedorApi = adaptFornecedorToApi(fornecedor);
    const response = await api.post('/fornecedores', fornecedorApi);
    console.log('Resposta da API (criar fornecedor):', response.data);
    
    return adaptFornecedorFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    throw error;
  }
};

// Atualiza um fornecedor existente
export const updateFornecedor = async (id: number | string, fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> => {
  try {
    console.log(`Atualizando fornecedor ${id} na API:`, fornecedor);
    const fornecedorApi = adaptFornecedorToApi(fornecedor);
    const response = await api.put(`/fornecedores/${id}`, fornecedorApi);
    console.log(`Resposta da API (atualizar fornecedor ${id}):`, response.data);
    
    return adaptFornecedorFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar fornecedor ${id}:`, error);
    throw error;
  }
};

// Exclui um fornecedor
export const deleteFornecedor = async (id: number | string): Promise<void> => {
  try {
    console.log(`Excluindo fornecedor ${id} na API...`);
    await api.delete(`/fornecedores/${id}`);
    console.log(`Fornecedor ${id} excluído com sucesso.`);
  } catch (error) {
    console.error(`Erro ao excluir fornecedor ${id}:`, error);
    throw error;
  }
}; 