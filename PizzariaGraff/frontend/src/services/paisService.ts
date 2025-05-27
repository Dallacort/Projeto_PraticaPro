import api from './api';
import { Pais } from '../types';

// Adaptador para converter dados da API para o frontend
export const adaptPaisFromApi = (apiPais: any): Pais => {
  // Log para debugging
  console.log('Dados brutos do país recebidos do backend:', apiPais);

  // Verificar especificamente os campos de data
  console.log('data_cadastro do backend:', apiPais.dataCadastro);
  console.log('ultima_modificacao do backend:', apiPais.ultimaModificacao || apiPais.dataModificacao);

  // Ajustar datas para corresponder ao formato esperado pelo frontend
  let dataCadastro = 'Não disponível';
  let ultimaModificacao = 'Não disponível';
  
  // Tratar data de cadastro
  if (apiPais.dataCadastro) {
    // Verificar se é um objeto Date ou uma string de data válida
    try {
      const date = new Date(apiPais.dataCadastro);
      if (!isNaN(date.getTime())) {
        dataCadastro = apiPais.dataCadastro;
      }
    } catch (e) {
      console.error('Erro ao processar data de cadastro:', e);
    }
  }
  
  // Tratar data de modificação
  if (apiPais.ultimaModificacao || apiPais.dataModificacao) {
    try {
      const dateStr = apiPais.ultimaModificacao || apiPais.dataModificacao;
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        ultimaModificacao = dateStr;
      }
    } catch (e) {
      console.error('Erro ao processar data de modificação:', e);
    }
  }

  console.log('Datas após processamento:', {
    dataCadastro,
    ultimaModificacao
  });

  return {
    id: apiPais.id,
    nome: apiPais.nome,
    sigla: apiPais.sigla || '',
    codigo: apiPais.codigo || '',
    dataCadastro,
    ultimaModificacao,
    ativo: apiPais.ativo !== undefined ? apiPais.ativo : true
  };
};

// Adaptador para converter dados do frontend para a API
export const adaptPaisToApi = (pais: Omit<Pais, 'id'>): any => {
  return {
    nome: pais.nome,
    sigla: pais.sigla,
    codigo: pais.codigo,
    ativo: pais.ativo !== undefined ? pais.ativo : true
  };
};

// Busca todos os países
export const getPaises = async (): Promise<Pais[]> => {
  try {
    console.log('Buscando países da API...');
    const response = await api.get('/paises');
    console.log('Resposta da API (paises):', response.data);
    
    // Converter para formato do frontend
    const paises = Array.isArray(response.data)
      ? response.data.map(adaptPaisFromApi)
      : [];
    
    console.log('Países convertidos:', paises);
    return paises;
  } catch (error) {
    console.error('Erro ao buscar países:', error);
    throw error;
  }
};

// Busca país por ID
export const getPais = async (id: string): Promise<Pais | null> => {
  // Validar se o ID é uma string não vazia
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error(`ID de país inválido: ${id}`);
    throw new Error(`ID de país inválido: ${id}`);
  }
  
  try {
    console.log(`Buscando país com ID ${id}...`);
    const response = await api.get(`/paises/${id}`);
    console.log(`Resposta da API (país ${id}):`, response.data);
    
    return adaptPaisFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar país com ID ${id}:`, error);
    throw error;
  }
};

// Cria novo país
export const createPais = async (pais: Omit<Pais, 'id'>): Promise<Pais> => {
  try {
    console.log('Criando novo país:', pais);
    
    // Adaptar dados para API
    const paisApiFormat = adaptPaisToApi(pais);
    console.log('Dados formatados para API:', paisApiFormat);
    
    const response = await api.post('/paises', paisApiFormat);
    console.log('País criado com sucesso:', response.data);
    
    return adaptPaisFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar país:', error);
    throw error;
  }
};

// Atualiza país existente
export const updatePais = async (id: string, pais: Omit<Pais, 'id'>): Promise<Pais> => {
  // Validar se o ID é uma string não vazia
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error(`ID de país inválido para atualização: ${id}`);
    throw new Error(`ID de país inválido para atualização: ${id}`);
  }
  
  try {
    console.log(`Atualizando país ${id}:`, pais);
    
    // Adaptar dados para API
    const paisApiFormat = adaptPaisToApi(pais);
    console.log('Dados formatados para API:', paisApiFormat);
    
    const response = await api.put(`/paises/${id}`, paisApiFormat);
    console.log(`País ${id} atualizado com sucesso:`, response.data);
    
    return adaptPaisFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar país ${id}:`, error);
    throw error;
  }
};

// Remove país
export const deletePais = async (id: string): Promise<void> => {
  // Validar se o ID é uma string não vazia
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error(`ID de país inválido para exclusão: ${id}`);
    throw new Error(`ID de país inválido para exclusão: ${id}`);
  }
  
  try {
    console.log(`Excluindo país ${id}...`);
    await api.delete(`/paises/${id}`);
    console.log(`País ${id} excluído com sucesso`);
  } catch (error) {
    console.error(`Erro ao excluir país ${id}:`, error);
    throw error;
  }
}; 