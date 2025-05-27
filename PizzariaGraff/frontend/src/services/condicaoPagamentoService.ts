import { CondicaoPagamento, ParcelaCondicaoPagamento } from '../types';
import api from './api';
import { formatToBackend, formatFromBackend } from '../utils/dateUtils';
import axios from 'axios';

export type CondicaoPagamentoInput = Omit<CondicaoPagamento, 'id' | 'dataCadastro' | 'ultimaModificacao' | 'formaPagamentoPadrao'> & {
  formaPagamentoPadraoId?: number | null;
  parcelas: ParcelaCondicaoPagamento[];
};

const CondicaoPagamentoService = {
  async list(): Promise<CondicaoPagamento[]> {
    try {
      const response = await api.get<CondicaoPagamento[]>('/condicoes-pagamento');
      return this.processarDados(response.data);
    } catch (error) {
      console.error('Erro ao buscar condições de pagamento:', error);
      throw error;
    }
  },

  // Método para processar os dados recebidos do backend
  processarDados(data: any[]): CondicaoPagamento[] {
    // Mapear os campos de parcelas recebidos do backend para o formato esperado pelo frontend
    return data.map(condicao => {
      // Mapear todas as parcelas recebidas do backend para o formato esperado pelo frontend
      let parcelas: ParcelaCondicaoPagamento[] = [];
      
      // Primeiro verificar parcelasCondicaoPagamento (novo formato da API)
      if (condicao.parcelasCondicaoPagamento && condicao.parcelasCondicaoPagamento.length > 0) {
        console.log(`Condição ${condicao.id} tem ${condicao.parcelasCondicaoPagamento.length} parcelas em parcelasCondicaoPagamento`);
        
        parcelas = condicao.parcelasCondicaoPagamento.map((parcela: any) => ({
          id: parcela.id,
          numero: parcela.numero,
          dias: parcela.dias,
          percentual: parcela.percentual,
          formaPagamentoId: parcela.formaPagamentoId || null,
          formaPagamentoDescricao: parcela.formaPagamentoNome || ''
        }));
      } 
      // Depois verificar parcelasCondPagto (formato antigo)
      else if (condicao.parcelasCondPagto && condicao.parcelasCondPagto.length > 0) {
        console.log(`Condição ${condicao.id} tem ${condicao.parcelasCondPagto.length} parcelas em parcelasCondPagto`);
        
        parcelas = condicao.parcelasCondPagto.map((parcela: any) => ({
          id: parcela.id,
          numero: parcela.numero,
          dias: parcela.dias,
          percentual: parcela.percentual,
          formaPagamentoId: parcela.formaPagamentoId || null,
          formaPagamentoDescricao: parcela.formaPagamentoDescricao || ''
        }));
      } 
      // Por último, verificar se já existe em parcelas
      else if (condicao.parcelas && Array.isArray(condicao.parcelas) && condicao.parcelas.length > 0) {
        parcelas = condicao.parcelas;
      }
      
      const mappedCondicao = {
        ...condicao,
        parcelas: parcelas
      };
      
      return mappedCondicao;
    });
  },

  async listAtivos(): Promise<CondicaoPagamento[]> {
    try {
      const response = await api.get<CondicaoPagamento[]>('/condicoes-pagamento/ativos');
      return this.processarDados(response.data);
    } catch (error) {
      console.error('Erro ao buscar condições de pagamento ativas:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<CondicaoPagamento> {
    try {
      const response = await api.get<CondicaoPagamento>(`/condicoes-pagamento/${id}`);
      console.log('Dados recebidos do backend:', response.data);
      
      // Mapear todas as parcelas recebidas do backend para o formato esperado pelo frontend
      let parcelas: ParcelaCondicaoPagamento[] = [];
      
      // Primeiro verificar parcelasCondicaoPagamento (novo formato da API)
      if (response.data.parcelasCondicaoPagamento && response.data.parcelasCondicaoPagamento.length > 0) {
        console.log(`Condição ${id} tem ${response.data.parcelasCondicaoPagamento.length} parcelas em parcelasCondicaoPagamento`);
        
        parcelas = response.data.parcelasCondicaoPagamento.map((parcela: any) => ({
          id: parcela.id,
          numero: parcela.numero,
          dias: parcela.dias,
          percentual: parcela.percentual,
          formaPagamentoId: parcela.formaPagamentoId || null,
          formaPagamentoDescricao: parcela.formaPagamentoNome || ''
        }));
      } 
      // Verificar formato antigo (parcelasCondPagto)
      else if (response.data.parcelasCondPagto && response.data.parcelasCondPagto.length > 0) {
        console.log(`Condição ${id} tem ${response.data.parcelasCondPagto.length} parcelas em parcelasCondPagto`);
        
        parcelas = response.data.parcelasCondPagto.map((parcela: any) => ({
          id: parcela.id,
          numero: parcela.numero,
          dias: parcela.dias,
          percentual: parcela.percentual,
          formaPagamentoId: parcela.formaPagamentoId || null,
          formaPagamentoDescricao: parcela.formaPagamentoDescricao || ''
        }));
      }
      // Se não tiver parcelas, gera automaticamente
      else {
        console.log(`Condição ${id} não tem parcelas, gerando automaticamente`);
        
        const tempCondicao: CondicaoPagamento = {
          ...response.data,
          id: id,
          ativo: response.data.ativo !== false
        };
        
        parcelas = this.generateParcelas(tempCondicao);
      }
      
      // Certifique-se de que o formaPagamentoPadraoId seja explicitamente mapeado
      const condicao = {
        ...response.data,
        parcelas: parcelas,
        formaPagamentoPadraoId: response.data.formaPagamentoPadraoId !== undefined ? 
          response.data.formaPagamentoPadraoId : 
          null
      };
      
      // Registrar para debug
      console.log('Condição mapeada:', condicao);
      console.log('formaPagamentoPadraoId mapeado:', condicao.formaPagamentoPadraoId);
      console.log('parcelas mapeadas:', condicao.parcelas);
      
      return condicao;
    } catch (error) {
      console.error('Erro ao buscar condição de pagamento:', error);
      throw error;
    }
  },

  async create(data: CondicaoPagamentoInput): Promise<CondicaoPagamento> {
    try {
      // Verifica se temos os campos obrigatórios
      if (!data.condicaoPagamento) {
        throw new Error("Condição de pagamento é obrigatória");
      }
      
      if (data.numeroParcelas <= 0) {
        throw new Error("Número de parcelas deve ser maior que zero");
      }
      
      if (!data.parcelas || data.parcelas.length === 0) {
        throw new Error("É necessário pelo menos uma parcela");
      }
      
      // Verifica se o percentual das parcelas soma 100%
      const somaPercentuais = data.parcelas.reduce((soma, parcela) => soma + parcela.percentual, 0);
      if (Math.abs(somaPercentuais - 100) > 0.01) {
        throw new Error("A soma dos percentuais das parcelas deve ser 100%");
      }
      
      // Log das parcelas para debug
      console.log('Parcelas a serem enviadas:', JSON.stringify(data.parcelas, null, 2));
      
      // Mapear os dados para o formato esperado pelo backend
      const dataToSend = {
        condicaoPagamento: data.condicaoPagamento.trim(),
        numeroParcelas: data.numeroParcelas || 1,
        parcelas: data.numeroParcelas || 1, // Aqui enviamos o número inteiro de parcelas
        ativo: Boolean(data.ativo !== false),
        parcelasCondicaoPagamento: data.parcelas.map(parcela => ({
          numero: parcela.numero || 1,
          dias: parcela.dias || 0,
          percentual: parcela.percentual || 100,
          formaPagamentoId: parcela.formaPagamentoId ? Number(parcela.formaPagamentoId) : null
        }))
      };
      
      // Log detalhado para debug
      console.log('Dados enviados para criação:', JSON.stringify(dataToSend, null, 2));
      
      try {
        // Adicionar um timeout maior para dar tempo ao backend processar
        const response = await api.post<CondicaoPagamento>('/condicoes-pagamento', dataToSend, {
          timeout: 10000 // 10 segundos
        });
        
        return response.data;
      } catch (innerError) {
        console.error('Erro na requisição:', innerError);
        if (axios.isAxiosError(innerError) && innerError.response) {
          console.error('Dados da resposta de erro:', innerError.response.data);
        }
        throw innerError;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Erro detalhado:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      }
      throw error;
    }
  },

  async update(id: number, data: CondicaoPagamentoInput): Promise<CondicaoPagamento> {
    try {
      // Verifica se temos os campos obrigatórios
      if (!data.condicaoPagamento) {
        throw new Error("Condição de pagamento é obrigatória");
      }
      
      if (data.numeroParcelas <= 0) {
        throw new Error("Número de parcelas deve ser maior que zero");
      }
      
      if (!data.parcelas || data.parcelas.length === 0) {
        throw new Error("É necessário pelo menos uma parcela");
      }
      
      // Verifica se o percentual das parcelas soma 100%
      const somaPercentuais = data.parcelas.reduce((soma, parcela) => soma + parcela.percentual, 0);
      if (Math.abs(somaPercentuais - 100) > 0.01) {
        throw new Error("A soma dos percentuais das parcelas deve ser 100%");
      }
      
      // Log das parcelas para debug
      console.log('Parcelas a serem enviadas:', JSON.stringify(data.parcelas, null, 2));
      
      // Mapear os dados para o formato esperado pelo backend
      const dataToSend = {
        id,
        condicaoPagamento: data.condicaoPagamento.trim(),
        numeroParcelas: data.numeroParcelas || 1,
        parcelas: data.numeroParcelas || 1,
        ativo: Boolean(data.ativo !== false),
        formaPagamentoPadraoId: data.formaPagamentoPadraoId, // Garantir o envio deste campo
        parcelasCondicaoPagamento: data.parcelas.map(parcela => ({
          numero: parcela.numero || 1,
          dias: parcela.dias || 0,
          percentual: parcela.percentual || 100,
          formaPagamentoId: parcela.formaPagamentoId ? Number(parcela.formaPagamentoId) : null
        }))
      };
      
      // Log detalhado para debug
      console.log('Dados enviados para atualização:', JSON.stringify(dataToSend, null, 2));
      
      const response = await api.put<CondicaoPagamento>(`/condicoes-pagamento/${id}`, dataToSend, {
        timeout: 10000 // 10 segundos
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar condição de pagamento:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Dados da resposta de erro:', error.response.data);
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/condicoes-pagamento/${id}`);
    } catch (error) {
      console.error('Erro ao excluir condição de pagamento:', error);
      throw error;
    }
  },

  // Método para gerar parcelas com base na condição de pagamento
  generateParcelas(condicao: CondicaoPagamento): ParcelaCondicaoPagamento[] {
    const parcelas: ParcelaCondicaoPagamento[] = [];
    const numParcelas = condicao.numeroParcelas || 1;
    
    // Para cada parcela, calcular os dias e percentual
    const percentualPorParcela = 100 / numParcelas;
    
    for (let i = 0; i < numParcelas; i++) {
      const diasParcela = i === 0 
        ? (condicao.diasPrimeiraParcela || 0) 
        : (condicao.diasPrimeiraParcela || 0) + (i * (condicao.diasEntreParcelas || 30));
      
      parcelas.push({
        numero: i + 1,
        dias: diasParcela,
        percentual: percentualPorParcela,
        formaPagamentoId: condicao.formaPagamentoPadraoId || null,
        formaPagamentoDescricao: condicao.formaPagamentoPadrao?.descricao || ''
      });
    }
    
    return parcelas;
  }
}

export default CondicaoPagamentoService; 