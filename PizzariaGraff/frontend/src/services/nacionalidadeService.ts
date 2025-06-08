import api from './api';
import { Pais } from '../types';

export interface NacionalidadeResponse {
  id: number;
  nome: string;
  codigo: string;
  sigla: string;
  nacionalidade: string;
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

// Listar todas as nacionalidades
export const getNacionalidades = async (): Promise<NacionalidadeResponse[]> => {
  try {
    console.log('Buscando nacionalidades...');
    const response = await api.get('/nacionalidades');
    console.log('Nacionalidades recebidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar nacionalidades:', error);
    throw error;
  }
};

// Buscar nacionalidade por ID
export const getNacionalidadeById = async (id: number): Promise<NacionalidadeResponse> => {
  try {
    console.log(`Buscando nacionalidade com ID: ${id}`);
    const response = await api.get(`/nacionalidades/${id}`);
    console.log('Nacionalidade recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar nacionalidade ${id}:`, error);
    throw error;
  }
};

// Buscar nacionalidade por nome
export const getNacionalidadeByNome = async (nome: string): Promise<NacionalidadeResponse> => {
  try {
    console.log(`Buscando nacionalidade com nome: ${nome}`);
    const response = await api.get(`/nacionalidades/buscar?nome=${encodeURIComponent(nome)}`);
    console.log('Nacionalidade recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar nacionalidade ${nome}:`, error);
    throw error;
  }
};

// Função para gerar o nome da nacionalidade baseado no país
const gerarNacionalidade = (nomePais: string): string => {
  const nacionalidadeMap: { [key: string]: string } = {
    'Brasil': 'Brasileiro',
    'Argentina': 'Argentino',
    'Estados Unidos': 'Americano',
    'França': 'Francês',
    'Alemanha': 'Alemão',
    'Itália': 'Italiano',
    'Espanha': 'Espanhol',
    'Portugal': 'Português',
    'Reino Unido': 'Britânico',
    'Japão': 'Japonês',
    'China': 'Chinês',
    'Coreia do Sul': 'Sul-coreano',
    'México': 'Mexicano',
    'Canadá': 'Canadense',
    'Chile': 'Chileno',
    'Uruguai': 'Uruguaio',
    'Paraguai': 'Paraguaio',
    'Bolívia': 'Boliviano',
    'Peru': 'Peruano',
    'Colômbia': 'Colombiano',
    'Venezuela': 'Venezuelano',
    'Equador': 'Equatoriano',
    'Rússia': 'Russo',
    'Índia': 'Indiano',
    'Austrália': 'Australiano',
    'África do Sul': 'Sul-africano'
  };

  return nacionalidadeMap[nomePais] || `${nomePais}ense`;
};

// Criar nova nacionalidade (baseada no país)
export const createNacionalidade = async (paisData: Pais): Promise<NacionalidadeResponse> => {
  try {
    console.log(`Criando nacionalidade baseada no país: ${paisData.nome}`);
    
    // Gerar o nome da nacionalidade de forma inteligente
    const nacionalidadeNome = gerarNacionalidade(paisData.nome);
    
    // Como as nacionalidades são derivadas dos países, vamos criar uma nacionalidade baseada no país
    const nacionalidadeData = {
      nome: paisData.nome,
      codigo: paisData.codigo,
      sigla: paisData.sigla,
      nacionalidade: nacionalidadeNome,
      ativo: paisData.ativo
    };
    
    // Por enquanto, vamos simular a criação retornando os dados com um ID gerado
    // Quando o backend tiver o endpoint, trocar por uma chamada real à API
    const novoId = Date.now(); // ID temporário
    
    const nacionalidadeCriada: NacionalidadeResponse = {
      id: novoId,
      ...nacionalidadeData
    };
    
    console.log('Nacionalidade criada (simulada):', nacionalidadeCriada);
    return nacionalidadeCriada;
    
    // TODO: Quando o backend tiver o endpoint POST /nacionalidades, usar:
    // const response = await api.post('/nacionalidades', nacionalidadeData);
    // return response.data;
  } catch (error) {
    console.error(`Erro ao criar nacionalidade:`, error);
    throw error;
  }
}; 