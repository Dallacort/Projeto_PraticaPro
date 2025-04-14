import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Nfe, Cliente, FormaPagamento, CondicaoPagamento, StatusNfe, ModalidadeNfe } from '../../types';
import FormField from '../../components/FormField';
import api from '../../services/api';
import { formatToBackend, formatFromBackend } from '../../utils/dateUtils';

const NfeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'novo';
  
  const [formData, setFormData] = useState<Partial<Nfe>>({
    numeroNf: '',
    dataEmissao: '',
    dataRecebimento: '',
    valorTotal: 0,
    observacao: '',
    cliente: {} as Cliente,
    formaPagamento: {} as FormaPagamento,
    condicaoPagamento: {} as CondicaoPagamento,
    statusNfe: {} as StatusNfe,
    modalidadeNfe: {} as ModalidadeNfe
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  
  // Estados para armazenar as listas de opções
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [statusNfe, setStatusNfe] = useState<StatusNfe[]>([]);
  const [modalidadesNfe, setModalidadesNfe] = useState<ModalidadeNfe[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isNew) {
        try {
          setLoading(true);
          setError(null);
          
          // Buscar dados da nota fiscal
          const response = await api.get(`/api/notas-fiscais/${id}`);
          const data = response.data;
          
          setFormData({
            id: data.id,
            numeroNf: data.numeroNf,
            dataEmissao: data.dataEmissao,
            dataRecebimento: data.dataRecebimento,
            valorTotal: data.valorTotal,
            observacao: data.observacao || '',
            cliente: data.cliente,
            formaPagamento: data.formaPagamento,
            condicaoPagamento: data.condicaoPagamento,
            statusNfe: data.statusNfe,
            modalidadeNfe: data.modalidadeNfe
          });
          
          if (data.ultimaModificacao) {
            setLastModified(formatFromBackend(data.ultimaModificacao));
          }
          
          if (data.dataCadastro) {
            setCreatedAt(formatFromBackend(data.dataCadastro));
          }
        } catch (error) {
          console.error('Erro ao buscar dados da nota fiscal:', error);
          setError('Não foi possível carregar os dados da nota fiscal. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      }
      
      // Buscar dados para os selects
      try {
        // Buscar clientes
        const clientesResponse = await api.get('/api/clientes');
        setClientes(clientesResponse.data);
        
        // Buscar formas de pagamento
        const formasPagamentoResponse = await api.get('/api/formas-pagamento');
        setFormasPagamento(formasPagamentoResponse.data);
        
        // Buscar condições de pagamento
        const condicoesPagamentoResponse = await api.get('/api/condicoes-pagamento');
        setCondicoesPagamento(condicoesPagamentoResponse.data);
        
        // Buscar status de NFe
        const statusNfeResponse = await api.get('/api/status-nfe');
        setStatusNfe(statusNfeResponse.data);
        
        // Buscar modalidades de NFe
        const modalidadesNfeResponse = await api.get('/api/modalidades-nfe');
        setModalidadesNfe(modalidadesNfeResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados para os selects:', error);
        setError('Não foi possível carregar alguns dados necessários. Tente novamente mais tarde.');
      }
    };
    
    fetchData();
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'cliente' || name === 'formaPagamento' || name === 'condicaoPagamento' || 
        name === 'statusNfe' || name === 'modalidadeNfe') {
      // Para campos de relacionamento, precisamos encontrar o objeto completo
      const selectedId = parseInt(value);
      let selectedItem;
      
      if (name === 'cliente') {
        selectedItem = clientes.find(c => c.id === selectedId);
      } else if (name === 'formaPagamento') {
        selectedItem = formasPagamento.find(f => f.id === selectedId);
      } else if (name === 'condicaoPagamento') {
        selectedItem = condicoesPagamento.find(c => c.id === selectedId);
      } else if (name === 'statusNfe') {
        selectedItem = statusNfe.find(s => s.id === selectedId);
      } else if (name === 'modalidadeNfe') {
        selectedItem = modalidadesNfe.find(m => m.id === selectedId);
      }
      
      if (selectedItem) {
        setFormData(prev => ({
          ...prev,
          [name]: selectedItem
        }));
      }
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.numeroNf) {
      setError('O número da nota fiscal é obrigatório');
      return false;
    }
    
    if (!formData.dataEmissao) {
      setError('A data de emissão é obrigatória');
      return false;
    }
    
    if (!formData.cliente || !formData.cliente.id) {
      setError('O cliente é obrigatório');
      return false;
    }
    
    if (!formData.formaPagamento || !formData.formaPagamento.id) {
      setError('A forma de pagamento é obrigatória');
      return false;
    }
    
    if (!formData.condicaoPagamento || !formData.condicaoPagamento.id) {
      setError('A condição de pagamento é obrigatória');
      return false;
    }
    
    if (!formData.statusNfe || !formData.statusNfe.id) {
      setError('O status da nota fiscal é obrigatório');
      return false;
    }
    
    if (!formData.modalidadeNfe || !formData.modalidadeNfe.id) {
      setError('A modalidade da nota fiscal é obrigatória');
      return false;
    }
    
    if (formData.valorTotal <= 0) {
      setError('O valor total deve ser maior que zero');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        dataEmissao: formatToBackend(formData.dataEmissao as string),
        dataRecebimento: formData.dataRecebimento ? formatToBackend(formData.dataRecebimento as string) : null,
        cliente: { id: formData.cliente?.id },
        formaPagamento: { id: formData.formaPagamento?.id },
        condicaoPagamento: { id: formData.condicaoPagamento?.id },
        statusNfe: { id: formData.statusNfe?.id },
        modalidadeNfe: { id: formData.modalidadeNfe?.id }
      };
      
      if (isNew) {
        // Criar nova nota fiscal
        await api.post('/api/notas-fiscais', dataToSend);
        alert('Nota fiscal criada com sucesso!');
      } else {
        // Atualizar nota fiscal existente
        await api.put(`/api/notas-fiscais/${id}`, dataToSend);
        alert('Nota fiscal atualizada com sucesso!');
      }
      
      navigate('/notas-fiscais');
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
      setError('Não foi possível salvar a nota fiscal. Tente novamente mais tarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Nova Nota Fiscal' : 'Editar Nota Fiscal'}
        </h1>
        <button
          onClick={() => navigate('/notas-fiscais')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Número da Nota Fiscal"
              name="numeroNf"
              value={formData.numeroNf || ''}
              onChange={handleChange}
              required
              placeholder="Digite o número da nota fiscal"
              error={error && !formData.numeroNf ? 'Campo obrigatório' : ''}
            />
            
            <FormField
              label="Data de Emissão"
              name="dataEmissao"
              type="date"
              value={formData.dataEmissao || ''}
              onChange={handleChange}
              required
              error={error && !formData.dataEmissao ? 'Campo obrigatório' : ''}
            />
            
            <FormField
              label="Data de Recebimento"
              name="dataRecebimento"
              type="date"
              value={formData.dataRecebimento || ''}
              onChange={handleChange}
            />
            
            <FormField
              label="Valor Total"
              name="valorTotal"
              type="number"
              value={formData.valorTotal || 0}
              onChange={handleChange}
              required
              placeholder="Digite o valor total"
              error={error && (!formData.valorTotal || formData.valorTotal <= 0) ? 'Valor deve ser maior que zero' : ''}
            />
            
            <div className="col-span-2">
              <FormField
                label="Observação"
                name="observacao"
                value={formData.observacao || ''}
                onChange={handleChange}
                placeholder="Digite uma observação (opcional)"
              />
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                name="cliente"
                value={formData.cliente?.id || ''}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  error && !formData.cliente?.id ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpfCnpj}
                  </option>
                ))}
              </select>
              {error && !formData.cliente?.id && (
                <p className="text-red-500 text-xs italic">Campo obrigatório</p>
              )}
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Forma de Pagamento <span className="text-red-500">*</span>
              </label>
              <select
                name="formaPagamento"
                value={formData.formaPagamento?.id || ''}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  error && !formData.formaPagamento?.id ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Selecione uma forma de pagamento</option>
                {formasPagamento.map(forma => (
                  <option key={forma.id} value={forma.id}>
                    {forma.descricao}
                  </option>
                ))}
              </select>
              {error && !formData.formaPagamento?.id && (
                <p className="text-red-500 text-xs italic">Campo obrigatório</p>
              )}
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Condição de Pagamento <span className="text-red-500">*</span>
              </label>
              <select
                name="condicaoPagamento"
                value={formData.condicaoPagamento?.id || ''}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  error && !formData.condicaoPagamento?.id ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Selecione uma condição de pagamento</option>
                {condicoesPagamento.map(condicao => (
                  <option key={condicao.id} value={condicao.id}>
                    {condicao.descricao}
                  </option>
                ))}
              </select>
              {error && !formData.condicaoPagamento?.id && (
                <p className="text-red-500 text-xs italic">Campo obrigatório</p>
              )}
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status da Nota Fiscal <span className="text-red-500">*</span>
              </label>
              <select
                name="statusNfe"
                value={formData.statusNfe?.id || ''}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  error && !formData.statusNfe?.id ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Selecione um status</option>
                {statusNfe.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.descricao}
                  </option>
                ))}
              </select>
              {error && !formData.statusNfe?.id && (
                <p className="text-red-500 text-xs italic">Campo obrigatório</p>
              )}
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Modalidade da Nota Fiscal <span className="text-red-500">*</span>
              </label>
              <select
                name="modalidadeNfe"
                value={formData.modalidadeNfe?.id || ''}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  error && !formData.modalidadeNfe?.id ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Selecione uma modalidade</option>
                {modalidadesNfe.map(modalidade => (
                  <option key={modalidade.id} value={modalidade.id}>
                    {modalidade.descricao}
                  </option>
                ))}
              </select>
              {error && !formData.modalidadeNfe?.id && (
                <p className="text-red-500 text-xs italic">Campo obrigatório</p>
              )}
            </div>
          </div>
          
          {!isNew && (
            <div className="mt-6 text-sm text-gray-500">
              <p>Criado em: {createdAt || 'N/A'}</p>
              <p>Última modificação: {lastModified || 'N/A'}</p>
            </div>
          )}
          
          <div className="flex items-center justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate('/notas-fiscais')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NfeForm; 