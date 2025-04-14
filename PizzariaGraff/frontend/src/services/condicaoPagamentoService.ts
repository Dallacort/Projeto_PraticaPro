import { CondicaoPagamento, ParcelaCondicaoPagamento } from '../types';
import api from './api';
import { formatToBackend, formatFromBackend } from '../utils/dateUtils';

const isDevelopmentMode = process.env.REACT_APP_USE_MOCK_DATA === 'true';

export type CondicaoPagamentoInput = Omit<CondicaoPagamento, 'id' | 'dataCadastro' | 'ultimaModificacao' | 'formaPagamentoPadrao'> & {
  formaPagamentoPadraoId?: number | null;
};

const mockCondicoesPagamento: CondicaoPagamento[] = [
  {
    id: 1,
    codigo: "A_VISTA",
    nome: "À Vista",
    descricao: 'Pagamento à vista',
    numeroParcelas: 1,
    diasPrimeiraParcela: 0,
    diasEntreParcelas: 0,
    percentualJuros: 0,
    percentualMulta: 0,
    percentualDesconto: 0,
    formaPagamentoPadraoId: 1,
    ativo: true,
    parcelas: [
      {
        id: 1,
        numero: 1,
        dias: 0,
        percentual: 100,
        formaPagamentoId: 1
      }
    ],
    dataCadastro: '2024-01-01',
    ultimaModificacao: '2024-01-01'
  },
  {
    id: 2,
    codigo: "30_60_90",
    nome: "Parcelado 30/60/90",
    descricao: 'Parcelamento em 3x de 30/60/90 dias',
    numeroParcelas: 3,
    diasPrimeiraParcela: 30,
    diasEntreParcelas: 30,
    percentualJuros: 1.5,
    percentualMulta: 2,
    percentualDesconto: 1,
    formaPagamentoPadraoId: 1,
    parcelas: [
      {
        id: 2,
        numero: 1,
        dias: 30,
        percentual: 33,
        formaPagamentoId: 1
      },
      {
        id: 3,
        numero: 2,
        dias: 60,
        percentual: 33,
        formaPagamentoId: 1
      },
      {
        id: 4,
        numero: 3,
        dias: 90,
        percentual: 34,
        formaPagamentoId: 1
      }
    ],
    ativo: true,
    dataCadastro: '2024-01-01',
    ultimaModificacao: '2024-01-01'
  },
  {
    id: 3,
    codigo: "30_DIAS",
    nome: "30 dias",
    descricao: 'Pagamento em 30 dias',
    numeroParcelas: 1,
    diasPrimeiraParcela: 30,
    diasEntreParcelas: 0,
    percentualJuros: 0,
    percentualMulta: 0,
    percentualDesconto: 0,
    formaPagamentoPadraoId: 1,
    parcelas: [
      {
        id: 5,
        numero: 1,
        dias: 30,
        percentual: 100,
        formaPagamentoId: 1
      }
    ],
    ativo: true,
    dataCadastro: '2024-01-01',
    ultimaModificacao: '2024-01-01'
  }
];

const CondicaoPagamentoService = {
  async list(): Promise<CondicaoPagamento[]> {
    if (isDevelopmentMode) {
      console.log('Usando dados mock para CondicaoPagamentoService.list()');
      return mockCondicoesPagamento;
    }

    const response = await api.get<CondicaoPagamento[]>('/condicoes-pagamento');
    // Mapear o campo parcelasCondPagto para parcelas e gerar parcelas automaticamente quando necessário
    return response.data.map(condicao => {
      // Mapear todas as parcelas recebidas do backend para o formato esperado pelo frontend
      let parcelas: ParcelaCondicaoPagamento[] = [];
      if (condicao.parcelasCondPagto && condicao.parcelasCondPagto.length > 0) {
        // @ts-ignore - O backend retorna parcelasCondPagto que tem uma estrutura diferente
        parcelas = condicao.parcelasCondPagto.map((parcela: any) => ({
          id: parcela.id,
          numero: parcela.numero,
          dias: parcela.dias,
          percentual: parcela.percentual,
          formaPagamentoId: parcela.formaPagamentoId || null,
          formaPagamentoDescricao: parcela.formaPagamentoDescricao || ''
        }));
      }
      
      const mappedCondicao = {
        ...condicao,
        parcelas: parcelas
      };
      
      // Se não tiver parcelas mas tiver numeroParcelas > 0, gerar parcelas automaticamente
      if ((!mappedCondicao.parcelas || mappedCondicao.parcelas.length === 0) && mappedCondicao.numeroParcelas > 0) {
        console.log(`Condição ${mappedCondicao.id} tem ${mappedCondicao.numeroParcelas} parcelas definidas mas não retornou parcelas. Gerando automaticamente...`);
        
        const parcelas = CondicaoPagamentoService.generateParcelas(mappedCondicao);
        
        mappedCondicao.parcelas = parcelas;
      }
      
      return mappedCondicao;
    });
  },

  async listAtivos(): Promise<CondicaoPagamento[]> {
    if (isDevelopmentMode) {
      console.log('Usando dados mock para CondicaoPagamentoService.listAtivos()');
      return mockCondicoesPagamento.filter(condicao => condicao.ativo);
    }

    const response = await api.get<CondicaoPagamento[]>('/condicoes-pagamento/ativos');
    // Mapear o campo parcelasCondPagto para parcelas e gerar parcelas automaticamente quando necessário
    return response.data.map(condicao => {
      // Mapear todas as parcelas recebidas do backend para o formato esperado pelo frontend
      let parcelas: ParcelaCondicaoPagamento[] = [];
      if (condicao.parcelasCondPagto && condicao.parcelasCondPagto.length > 0) {
        // @ts-ignore - O backend retorna parcelasCondPagto que tem uma estrutura diferente
        parcelas = condicao.parcelasCondPagto.map((parcela: any) => ({
          id: parcela.id,
          numero: parcela.numero,
          dias: parcela.dias,
          percentual: parcela.percentual,
          formaPagamentoId: parcela.formaPagamentoId || null,
          formaPagamentoDescricao: parcela.formaPagamentoDescricao || ''
        }));
      }
      
      const mappedCondicao = {
        ...condicao,
        parcelas: parcelas
      };
      
      // Se não tiver parcelas mas tiver numeroParcelas > 0, gerar parcelas automaticamente
      if ((!mappedCondicao.parcelas || mappedCondicao.parcelas.length === 0) && mappedCondicao.numeroParcelas > 0) {
        console.log(`Condição ${mappedCondicao.id} tem ${mappedCondicao.numeroParcelas} parcelas definidas mas não retornou parcelas. Gerando automaticamente...`);
        
        const parcelas = CondicaoPagamentoService.generateParcelas(mappedCondicao);
        
        mappedCondicao.parcelas = parcelas;
      }
      
      return mappedCondicao;
    });
  },

  async getById(id: number): Promise<CondicaoPagamento> {
    if (isDevelopmentMode) {
      console.log(`Usando dados mock para CondicaoPagamentoService.getById(${id})`);
      const condicao = mockCondicoesPagamento.find(c => c.id === id);
      if (!condicao) {
        throw new Error('Condição de pagamento não encontrada');
      }
      return condicao;
    }

    const response = await api.get<CondicaoPagamento>(`/condicoes-pagamento/${id}`);
    console.log('Dados recebidos do backend:', response.data);
    
    // Mapear todas as parcelas recebidas do backend para o formato esperado pelo frontend
    let parcelas: ParcelaCondicaoPagamento[] = [];
    if (response.data.parcelasCondPagto && response.data.parcelasCondPagto.length > 0) {
      // @ts-ignore - O backend retorna parcelasCondPagto que tem uma estrutura diferente 
      parcelas = response.data.parcelasCondPagto.map((parcela: any) => ({
        id: parcela.id,
        numero: parcela.numero,
        dias: parcela.dias,
        percentual: parcela.percentual,
        formaPagamentoId: parcela.formaPagamentoId || null,
        formaPagamentoDescricao: parcela.formaPagamentoDescricao || ''
      }));
    }
    
    // Certifique-se de que o formaPagamentoPadraoId seja explicitamente mapeado
    // e não seja undefined ou nulo, a menos que realmente seja nulo no backend
    const condicao = {
      ...response.data,
      parcelas: parcelas,
      formaPagamentoPadraoId: response.data.formaPagamentoPadraoId !== undefined ? 
        response.data.formaPagamentoPadraoId : 
        null
    };
    
    // Registrar para debug
    console.log('formaPagamentoPadraoId mapeado:', condicao.formaPagamentoPadraoId);
    
    // Se não tiver parcelas mas tiver numeroParcelas > 0, gerar parcelas automaticamente
    if ((!condicao.parcelas || condicao.parcelas.length === 0) && condicao.numeroParcelas > 0) {
      console.log(`Condição ${id} tem ${condicao.numeroParcelas} parcelas definidas mas não retornou parcelas. Gerando automaticamente...`);
      
      const parcelas = CondicaoPagamentoService.generateParcelas(condicao);
      
      condicao.parcelas = parcelas;
      console.log('Parcelas geradas automaticamente:', parcelas);
    }
    
    return condicao;
  },

  async create(data: CondicaoPagamentoInput): Promise<CondicaoPagamento> {
    if (isDevelopmentMode) {
      console.log('Usando dados mock para CondicaoPagamentoService.create()', data);
      const newId = Math.max(...mockCondicoesPagamento.map(c => c.id)) + 1;
      const newCondicao: CondicaoPagamento = {
        ...data,
        id: newId,
        dataCadastro: new Date().toISOString(),
        ultimaModificacao: new Date().toISOString()
      };
      mockCondicoesPagamento.push(newCondicao);
      return newCondicao;
    }

    // Mapear os dados para o formato esperado pelo backend
    const dataToSend = {
      ...data,
      parcelasCondPagto: data.parcelas // Renomear parcelas para parcelasCondPagto para o backend
    };
    
    console.log('Dados enviados para o backend:', dataToSend);
    const response = await api.post<CondicaoPagamento>('/condicoes-pagamento', dataToSend);
    return response.data;
  },

  async update(id: number, data: CondicaoPagamentoInput): Promise<CondicaoPagamento> {
    if (isDevelopmentMode) {
      console.log(`Usando dados mock para CondicaoPagamentoService.update(${id})`, data);
      const index = mockCondicoesPagamento.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Condição de pagamento não encontrada');
      }
      const updatedCondicao = {
        ...mockCondicoesPagamento[index],
        ...data,
        ultimaModificacao: new Date().toISOString()
      };
      mockCondicoesPagamento[index] = updatedCondicao;
      return updatedCondicao;
    }

    // Mapear os dados para o formato esperado pelo backend
    const dataToSend = {
      ...data,
      parcelasCondPagto: data.parcelas // Renomear parcelas para parcelasCondPagto para o backend
    };
    
    console.log('Dados enviados para atualização:', dataToSend);
    const response = await api.put<CondicaoPagamento>(`/condicoes-pagamento/${id}`, dataToSend);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    if (isDevelopmentMode) {
      console.log(`Usando dados mock para CondicaoPagamentoService.delete(${id})`);
      const index = mockCondicoesPagamento.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Condição de pagamento não encontrada');
      }
      mockCondicoesPagamento.splice(index, 1);
      return;
    }

    await api.delete(`/condicoes-pagamento/${id}`);
  },

  /**
   * Gera parcelas para uma condição de pagamento com base no número de parcelas,
   * dias da primeira parcela e dias entre parcelas
   */
  generateParcelas: (condicaoPagamento: CondicaoPagamento): ParcelaCondicaoPagamento[] => {
    const { numeroParcelas, diasPrimeiraParcela, diasEntreParcelas, formaPagamentoPadraoId } = condicaoPagamento;
    const novasParcelas: ParcelaCondicaoPagamento[] = [];
    const percentualPorParcela = 100 / numeroParcelas;
    
    // Tentar obter descrição da forma de pagamento padrão
    let formaPagamentoPadraoDescricao = '';
    
    // No ambiente de desenvolvimento, buscar a descrição nos dados mockados
    if (isDevelopmentMode && formaPagamentoPadraoId) {
      try {
        if (mockCondicoesPagamento.length > 0) {
          // Buscar nas condições mockadas que têm a mesma forma de pagamento
          const condicaoExistente = mockCondicoesPagamento.find(cp => cp.formaPagamentoPadraoId === formaPagamentoPadraoId);
          if (condicaoExistente && condicaoExistente.parcelas && condicaoExistente.parcelas.length > 0) {
            const parcela = condicaoExistente.parcelas.find(p => p.formaPagamentoId === formaPagamentoPadraoId);
            if (parcela && parcela.formaPagamento) {
              formaPagamentoPadraoDescricao = parcela.formaPagamento.descricao || '';
            } else if (parcela && parcela.formaPagamentoDescricao) {
              formaPagamentoPadraoDescricao = parcela.formaPagamentoDescricao;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar forma de pagamento padrão:', error);
      }
    }
    
    // Se temos formaPagamentoPadraoDescricao na própria condição, usar ela
    if (condicaoPagamento.formaPagamentoPadrao && condicaoPagamento.formaPagamentoPadrao.descricao) {
      formaPagamentoPadraoDescricao = condicaoPagamento.formaPagamentoPadrao.descricao;
    }
    
    for (let i = 0; i < numeroParcelas; i++) {
      novasParcelas.push({
        numero: i + 1,
        dias: diasPrimeiraParcela + (i * diasEntreParcelas),
        percentual: i === numeroParcelas - 1 
          ? 100 - Math.floor(percentualPorParcela) * (numeroParcelas - 1)  // ajuste para a última parcela
          : Math.floor(percentualPorParcela),
        formaPagamentoId: formaPagamentoPadraoId || null,
        formaPagamentoDescricao: formaPagamentoPadraoId ? formaPagamentoPadraoDescricao : ''
      });
    }
    
    return novasParcelas;
  }
};

export default CondicaoPagamentoService; 