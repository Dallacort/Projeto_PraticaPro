import { Pais } from '../../types';

// Dados de mock para países
let mockPaises: Pais[] = [
  {
    id: 'BRA',
    nome: 'Brasil',
    codigo: '55',
    sigla: 'BR',
    dataCadastro: new Date().toISOString(),
    ultimaModificacao: new Date().toISOString()
  },
  {
    id: 'USA',
    nome: 'Estados Unidos',
    codigo: '1',
    sigla: 'US',
    dataCadastro: new Date().toISOString(),
    ultimaModificacao: new Date().toISOString()
  },
  {
    id: 'CAN',
    nome: 'Canadá',
    codigo: '1',
    sigla: 'CA',
    dataCadastro: new Date().toISOString(),
    ultimaModificacao: new Date().toISOString()
  },
  {
    id: 'ARG',
    nome: 'Argentina',
    codigo: '54',
    sigla: 'AR',
    dataCadastro: new Date().toISOString(),
    ultimaModificacao: new Date().toISOString()
  },
  {
    id: 'PRT',
    nome: 'Portugal',
    codigo: '351',
    sigla: 'PT',
    dataCadastro: new Date().toISOString(),
    ultimaModificacao: new Date().toISOString()
  }
];

// Gera um ID para o próximo país
const gerarNovoId = (nome: string): string => {
  // Gera um código de 3 letras baseado no nome do país
  const id = nome.substring(0, 3).toUpperCase();
  
  // Verifica se já existe um país com esse ID
  const existeId = mockPaises.some(p => p.id === id);
  if (!existeId) return id;
  
  // Se já existe, adiciona um número ao final
  let contador = 1;
  while (mockPaises.some(p => p.id === `${id}${contador}`)) {
    contador++;
  }
  
  return `${id}${contador}`;
};

// Busca todos os países
export const getMockPaises = async (): Promise<Pais[]> => {
  return Promise.resolve([...mockPaises]);
};

// Busca país por ID
export const getMockPais = async (id: string): Promise<Pais | null> => {
  const pais = mockPaises.find(p => p.id === id);
  return Promise.resolve(pais || null);
};

// Cria novo país
export const createMockPais = async (pais: Omit<Pais, 'id'>): Promise<Pais> => {
  const newPais: Pais = {
    id: gerarNovoId(pais.nome),
    ...pais,
    dataCadastro: new Date().toISOString(),
    ultimaModificacao: new Date().toISOString()
  };
  
  mockPaises.push(newPais);
  return Promise.resolve(newPais);
};

// Atualiza país existente
export const updateMockPais = async (id: string, pais: Omit<Pais, 'id'>): Promise<Pais> => {
  const index = mockPaises.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error(`País com ID ${id} não encontrado`);
  }
  
  const updatedPais: Pais = {
    id,
    ...pais,
    dataCadastro: mockPaises[index].dataCadastro,
    ultimaModificacao: new Date().toISOString()
  };
  
  mockPaises[index] = updatedPais;
  return Promise.resolve(updatedPais);
};

// Remove país
export const deleteMockPais = async (id: string): Promise<void> => {
  const index = mockPaises.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error(`País com ID ${id} não encontrado`);
  }
  
  mockPaises = mockPaises.filter(p => p.id !== id);
  return Promise.resolve();
}; 