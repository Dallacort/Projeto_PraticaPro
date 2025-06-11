import api from './api';
import { Produto, Marca, UnidadeMedida } from '../types';

// Adaptador para converter dados da API para o frontend
const adaptProdutoFromApi = (produto: any): Produto => {
  return {
    id: produto.id,
    produto: produto.produto || '',
    nome: produto.nome || produto.produto || '',
    codigoBarras: produto.codigoBarras || '',
    referencia: produto.referencia || '',
    descricao: produto.descricao || '',
    observacoes: produto.observacoes || '',
    valorCompra: produto.valorCompra || 0,
    valorVenda: produto.valorVenda || 0,
    percentualLucro: produto.percentualLucro || 0,
    quantidade: produto.quantidade || 0,
    quantidadeMinima: produto.quantidadeMinima || 0,
    marcaId: produto.marcaId || null,
    marcaNome: produto.marcaNome || '',
    marca: produto.marca ? {
      id: produto.marca.id || produto.marcaId,
      marca: produto.marca.marca || produto.marcaNome || '',
      ativo: produto.marca.ativo !== undefined ? produto.marca.ativo : true,
      situacao: produto.marca.situacao || null,
      dataCriacao: produto.marca.dataCriacao || null,
      dataAlteracao: produto.marca.dataAlteracao || null,
      dataCadastro: produto.marca.dataCadastro || null,
      ultimaModificacao: produto.marca.ultimaModificacao || null
    } : null,
    unidadeMedidaId: produto.unidadeMedidaId || null,
    unidadeMedidaNome: produto.unidadeMedidaNome || '',
    unidadeMedida: produto.unidadeMedida ? {
      id: produto.unidadeMedida.id || produto.unidadeMedidaId,
      unidadeMedida: produto.unidadeMedida.unidadeMedida || produto.unidadeMedidaNome || '',
      ativo: produto.unidadeMedida.ativo !== undefined ? produto.unidadeMedida.ativo : true,
      situacao: produto.unidadeMedida.situacao || null,
      dataCriacao: produto.unidadeMedida.dataCriacao || null,
      dataAlteracao: produto.unidadeMedida.dataAlteracao || null,
      dataCadastro: produto.unidadeMedida.dataCadastro || null,
      ultimaModificacao: produto.unidadeMedida.ultimaModificacao || null
    } : null,
    situacao: produto.situacao || null,
    ativo: produto.ativo !== undefined ? produto.ativo : true, // Usar valor real da API
    dataCriacao: produto.dataCriacao || null,
    dataAlteracao: produto.dataAlteracao || null,
    dataCadastro: produto.dataCadastro || null,
    ultimaModificacao: produto.ultimaModificacao || null,
    // Campos antigos para compatibilidade
    codigo: produto.codigo || produto.codigoBarras || '',
    precoVenda: produto.precoVenda || produto.valorVenda || 0,
    precoCusto: produto.precoCusto || produto.valorCompra || 0,
    unidade: produto.unidade || produto.unidadeMedidaNome || '',
    estoque: produto.estoque || produto.quantidade || 0,
    estoqueMinimo: produto.estoqueMinimo || produto.quantidadeMinima || 0,
    estoqueMaximo: produto.estoqueMaximo || 0,
    valor: produto.valor || produto.valorVenda || 0
  };
};

// Adaptador para converter dados do frontend para a API
const adaptProdutoToApi = (produto: Omit<Produto, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao' | 'marcaNome' | 'unidadeMedidaNome' | 'marca' | 'unidadeMedida'>): any => {
  // Garantir que campos obrigatórios não sejam enviados vazios
  const produtoNome = produto.produto || produto.nome || '';
  const codigoBarras = produto.codigoBarras || produto.codigo || '';
  const referencia = produto.referencia || '';
  const descricao = produto.descricao || '';
  const observacoes = produto.observacoes || '';
  const situacao = produto.situacao && produto.situacao !== '' ? produto.situacao : new Date().toISOString().split('T')[0];
  
  // Conversão mais tolerante de IDs
  let marcaId = null;
  let unidadeMedidaId = null;
  
  if (produto.marcaId && String(produto.marcaId).trim() !== '' && String(produto.marcaId) !== '0') {
    marcaId = Number(produto.marcaId);
  }
  
  if (produto.unidadeMedidaId && String(produto.unidadeMedidaId).trim() !== '' && String(produto.unidadeMedidaId) !== '0') {
    unidadeMedidaId = Number(produto.unidadeMedidaId);
  }
  
  const dataPayload = {
    produto: produtoNome.trim(),
    codigoBarras: codigoBarras.trim(),
    referencia: referencia.trim(),
    descricao: descricao.trim(),
    observacoes: observacoes.trim(),
    valorCompra: produto.valorCompra || produto.precoCusto || 0,
    valorVenda: produto.valorVenda || produto.precoVenda || produto.valor || 0,
    percentualLucro: produto.percentualLucro || 0,
    quantidade: produto.quantidade || produto.estoque || 0,
    quantidadeMinima: produto.quantidadeMinima || produto.estoqueMinimo || 0,
    marcaId: marcaId,
    unidadeMedidaId: unidadeMedidaId,
    situacao: situacao,
    ativo: produto.ativo !== undefined ? produto.ativo : true
  };
  
  console.log('Dados convertidos para API:', dataPayload);
  console.log('Validação dos dados principais:');
  console.log('- produtoNome:', produtoNome);
  console.log('- codigoBarras:', codigoBarras);
  console.log('- referencia:', referencia);
  console.log('- descricao:', descricao);
  console.log('- observacoes:', observacoes);
  console.log('- marcaId:', marcaId);
  console.log('- unidadeMedidaId:', unidadeMedidaId);
  console.log('- situacao:', situacao);
  
  return dataPayload;
};

// Busca todos os produtos
export const getProdutos = async (): Promise<Produto[]> => {
  try {
    const response = await api.get('/produtos');
    
    if (Array.isArray(response.data)) {
      return response.data.map(adaptProdutoFromApi);
    }
    
    throw new Error('Resposta inválida da API para produtos');
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Busca um produto pelo ID
export const getProduto = async (id: number): Promise<Produto | null> => {
  try {
    const response = await api.get(`/produtos/${id}`);
    
    if (response.data) {
      return adaptProdutoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API para produto ${id}`);
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    throw error;
  }
};

// Cria um novo produto
export const createProduto = async (produto: Omit<Produto, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao' | 'marcaNome' | 'unidadeMedidaNome' | 'marca' | 'unidadeMedida'>): Promise<Produto> => {
  try {
    const dataToSend = adaptProdutoToApi(produto);
    console.log('Dados enviados para API (produto):', dataToSend);
    const response = await api.post('/produtos', dataToSend);
    
    if (response.data) {
      return adaptProdutoFromApi(response.data);
    }
    
    throw new Error('Resposta inválida da API ao criar produto');
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

// Atualiza um produto existente
export const updateProduto = async (id: number, produto: Omit<Produto, 'id' | 'dataCriacao' | 'dataAlteracao' | 'dataCadastro' | 'ultimaModificacao' | 'marcaNome' | 'unidadeMedidaNome' | 'marca' | 'unidadeMedida'>): Promise<Produto> => {
  try {
    console.log('=== DEBUG PRODUTO UPDATE ===');
    console.log('ID:', id);
    console.log('Dados brutos recebidos:', produto);
    
    const dataToSend = adaptProdutoToApi(produto);
    console.log(`Dados finais enviados para API (produto ${id}):`, dataToSend);
    console.log('JSON enviado:', JSON.stringify(dataToSend, null, 2));
    
    const response = await api.put(`/produtos/${id}`, dataToSend);
    
    if (response.data) {
      return adaptProdutoFromApi(response.data);
    }
    
    throw new Error(`Resposta inválida da API ao atualizar produto ${id}`);
  } catch (error) {
    console.error(`Erro ao atualizar produto ${id}:`, error);
    
    // Capturar mais detalhes do erro
    const axiosError = error as any;
    if (axiosError.response) {
      console.error('Status:', axiosError.response.status);
      console.error('Headers:', axiosError.response.headers);
      console.error('Data:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('Request:', axiosError.request);
    } else {
      console.error('Message:', axiosError.message);
    }
    
    throw error;
  }
};

// Exclui um produto
export const deleteProduto = async (id: number): Promise<void> => {
  try {
    await api.delete(`/produtos/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir produto ${id}:`, error);
    throw error;
  }
}; 