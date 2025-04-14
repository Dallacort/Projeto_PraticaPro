import api from './api';
import { Cliente, Cidade } from '../types';

// Dados mock para usar em caso de falha da API
const mockClientes: Cliente[] = [
  {
    id: 1,
    nome: 'Cliente Exemplo',
    cpfCnpj: '123.456.789-00',
    email: 'exemplo@email.com',
    telefone: '(11) 99999-9999',
    endereco: 'Rua Exemplo, 123',
    numero: '123',
    complemento: 'Apto 101',
    bairro: 'Centro',
    cidade: {
      id: 1,
      nome: 'São Paulo',
      estado: {
        id: 1,
        nome: 'São Paulo',
        uf: 'SP',
        pais: {
          id: 'BRA',
          nome: 'Brasil',
          codigo: '55',
          sigla: 'BR'
        }
      }
    },
    ativo: true,
    dataCadastro: '2023-01-01T10:00:00',
    ultimaModificacao: '2023-01-01T10:00:00'
  }
];

// Adapta o cliente recebido da API para o formato usado no frontend
export const adaptClienteFromApi = (cliente: any): Cliente => {
  // Log detalhado dos dados recebidos da API
  console.log('Dados brutos do cliente:', JSON.stringify(cliente, null, 2));
  
  // Criar a estrutura aninhada de cidade, estado e país
  let cidade = null;
  
  // Se a API retornou cidadeId e cidadeNome, criar o objeto cidade
  if (cliente.cidadeId && cliente.cidadeNome) {
    console.log(`Criando objeto cidade para ${cliente.cidadeNome} (ID: ${cliente.cidadeId})`);
    
    cidade = {
      id: cliente.cidadeId,
      nome: cliente.cidadeNome,
      estado: null
    };
    
    // Se a API retornou estadoId e estadoNome, criar o objeto estado
    if (cliente.estadoId && cliente.estadoNome) {
      console.log(`Criando objeto estado para ${cliente.estadoNome} (ID: ${cliente.estadoId})`);
      
      // Verificar todas as propriedades do cliente para encontrar a UF
      let estadoUf = '';
      if (cliente.estadoUf) {
        estadoUf = cliente.estadoUf;
        console.log(`UF encontrada em cliente.estadoUf: ${estadoUf}`);
      } else if (cliente.uf) {
        estadoUf = cliente.uf;
        console.log(`UF encontrada em cliente.uf: ${estadoUf}`);
      } else if (cliente.estado && cliente.estado.uf) {
        estadoUf = cliente.estado.uf;
        console.log(`UF encontrada em cliente.estado.uf: ${estadoUf}`);
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
        
        const estadoNomeUpper = cliente.estadoNome?.toUpperCase();
        if (estadoNomeUpper && estados[estadoNomeUpper]) {
          estadoUf = estados[estadoNomeUpper];
          console.log(`UF deduzida do nome do estado (${cliente.estadoNome}): ${estadoUf}`);
        } else {
          console.log(`Não foi possível encontrar a UF para o estado ${cliente.estadoNome}`);
        }
      }
      
      cidade.estado = {
        id: cliente.estadoId,
        nome: cliente.estadoNome,
        uf: estadoUf,
        pais: null
      };
      
      // Se a API retornou paisId e paisNome, criar o objeto país
      if (cliente.paisId && cliente.paisNome) {
        console.log(`Criando objeto país para ${cliente.paisNome} (ID: ${cliente.paisId})`);
        
        cidade.estado.pais = {
          id: cliente.paisId,
          nome: cliente.paisNome,
          codigo: cliente.paisId,
          sigla: cliente.paisId.substring(0, 2)
        };
      }
    }
  } else if (cliente.cidade) {
    // Se já veio um objeto cidade estruturado, usá-lo como está
    console.log('Usando objeto cidade já estruturado:', JSON.stringify(cliente.cidade, null, 2));
    cidade = cliente.cidade;
  }
  
  return {
    id: cliente.id,
    nome: cliente.nome || '',
    cpfCnpj: cliente.cpfCnpj || '',
    email: cliente.email || '',
    telefone: cliente.telefone || '',
    endereco: cliente.endereco || '',
    numero: cliente.numero || '',
    complemento: cliente.complemento || '',
    bairro: cliente.bairro || '',
    cidade: cidade,
    ativo: cliente.ativo !== false,
    dataCadastro: cliente.dataCadastro,
    ultimaModificacao: cliente.ultimaModificacao
  };
};

// Adaptador para converter o formato do frontend para o formato esperado pela API
const adaptClienteToApi = (cliente: Omit<Cliente, 'id'>): any => {
  // Determinar se é CPF ou CNPJ baseado no comprimento
  const cpfCnpj = cliente.cpfCnpj.replace(/[^\d]/g, '');
  const isCpf = cpfCnpj.length <= 11;

  return {
    nome: cliente.nome,
    cpf: isCpf ? cliente.cpfCnpj : null,
    cnpj: !isCpf ? cliente.cpfCnpj : null,
    email: cliente.email,
    telefone: cliente.telefone,
    endereco: cliente.endereco,
    numero: cliente.numero,
    complemento: cliente.complemento,
    bairro: cliente.bairro,
    cidadeId: cliente.cidade.id,
    ativo: cliente.ativo
  };
};

// Busca todos os clientes
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    console.log('Buscando clientes da API...');
    const response = await api.get('/clientes');
    console.log('Resposta da API (clientes):', response.data);
    
    // Converter os dados da API para o formato do frontend
    const clientes = Array.isArray(response.data) 
      ? response.data.map(adaptClienteFromApi)
      : [];
      
    console.log('Clientes convertidos:', clientes);
    return clientes;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    // Retornar dados mock em caso de falha
    console.log('Retornando dados mock para clientes');
    return mockClientes;
  }
};

// Busca cliente por ID
export const getCliente = async (id: number): Promise<Cliente | null> => {
  try {
    console.log(`Buscando cliente com ID ${id} da API...`);
    const response = await api.get(`/clientes/${id}`);
    console.log(`Resposta da API (cliente ${id}):`, response.data);
    
    // Converter os dados da API para o formato do frontend
    const cliente = adaptClienteFromApi(response.data);
    return cliente;
  } catch (error) {
    console.error(`Erro ao buscar cliente com ID ${id}:`, error);
    // Tentar encontrar nos dados mock
    const mockCliente = mockClientes.find(c => c.id === id);
    if (mockCliente) {
      console.log(`Retornando dados mock para cliente ${id}`);
      return mockCliente;
    }
    return null;
  }
};

// Cria novo cliente
export const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    console.log('Criando novo cliente:', cliente);
    
    // Converter para o formato esperado pela API
    const clienteApiFormat = adaptClienteToApi(cliente);
    console.log('Dados formatados para API:', clienteApiFormat);
    
    const response = await api.post('/clientes', clienteApiFormat);
    console.log('Cliente criado com sucesso:', response.data);
    
    // Converter a resposta da API de volta para o formato do frontend
    return adaptClienteFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

// Atualiza cliente existente
export const updateCliente = async (id: number, cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    console.log(`Atualizando cliente ${id}:`, cliente);
    
    // Converter para o formato esperado pela API
    const clienteApiFormat = adaptClienteToApi(cliente);
    console.log('Dados formatados para API:', clienteApiFormat);
    
    const response = await api.put(`/clientes/${id}`, clienteApiFormat);
    console.log(`Cliente ${id} atualizado com sucesso:`, response.data);
    
    // Converter a resposta da API de volta para o formato do frontend
    return adaptClienteFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${id}:`, error);
    throw error;
  }
};

// Remove cliente
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    console.log(`Excluindo cliente ${id}...`);
    await api.delete(`/clientes/${id}`);
    console.log(`Cliente ${id} excluído com sucesso`);
  } catch (error) {
    console.error(`Erro ao excluir cliente ${id}:`, error);
    throw error;
  }
}; 