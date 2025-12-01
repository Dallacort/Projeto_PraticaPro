import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContasPagar, pagarConta, cancelarContaPagar } from '../../services/contaPagarService';
import FormaPagamentoService from '../../services/FormaPagamentoService';
import { ContaPagar, FormaPagamento, ContaPagarAvulsa, Fornecedor } from '../../types';
import { createContaPagarAvulsa } from '../../services/contaPagarAvulsaService';
import { getFornecedores } from '../../services/fornecedorService';
import DataTable from '../../components/DataTable';
import { FaPlus, FaMoneyBillWave, FaBan, FaSearch, FaSpinner } from 'react-icons/fa';
import { getCurrentDateString } from '../../utils/dateUtils';
import FornecedorModal from '../../components/modals/FornecedorModal';
import FormaPagamentoModal from '../../components/FormaPagamentoModal';

const ContasPagarList: React.FC = () => {
  const navigate = useNavigate();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroSituacao, setFiltroSituacao] = useState<string>('TODAS');
  
  // Modal de pagamento
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | null>(null);
  const [valorPago, setValorPago] = useState('');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [formaPagamentoId, setFormaPagamentoId] = useState('');
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);

  // Modal de nota avulsa
  const [showNotaAvulsaModal, setShowNotaAvulsaModal] = useState(false);
  const [notaFormData, setNotaFormData] = useState({
    numeroNota: '',
    modelo: '',
    serie: '',
    fornecedorId: '',
    dataEmissao: getCurrentDateString(),
    formaPagamentoId: '',
    numParcela: '1',
    valorParcela: '0',
    dataVencimento: getCurrentDateString(),
    juros: '0',
    multa: '0',
    desconto: '0',
    dataPagamento: '',
    observacao: ''
  });
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState<FormaPagamento | null>(null);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [savingNota, setSavingNota] = useState(false);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showFormaPagamentoModal, setShowFormaPagamentoModal] = useState(false);

  useEffect(() => {
    loadContas();
    loadFormasPagamento();
    loadNotaData();
  }, []);

  const loadNotaData = async () => {
    try {
      const fornecedoresData = await getFornecedores();
      setFornecedores(fornecedoresData);
    } catch (err) {
      console.error('Erro ao carregar dados para nota:', err);
    }
  };

  const loadContas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContasPagar();
      setContas(data);
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Erro ao carregar as contas a pagar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadFormasPagamento = async () => {
    try {
      const data = await FormaPagamentoService.list();
      setFormasPagamento(data);
    } catch (err) {
      console.error('Erro ao carregar formas de pagamento:', err);
    }
  };

  const formatDateBR = (dateString: string | undefined) => {
    if (!dateString) return '-';
    
    try {
      // Corrigir problema de timezone - tratar como data local
      // Adicionar 'T00:00:00' para evitar conversão de timezone
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const getSituacaoBadge = (situacao: string | undefined) => {
    const badges: { [key: string]: string } = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'PAGA': 'bg-green-100 text-green-800',
      'VENCIDA': 'bg-red-100 text-red-800',
      'CANCELADA': 'bg-gray-100 text-gray-800',
      'PARCIALMENTE_PAGA': 'bg-blue-100 text-blue-800'
    };
    return badges[situacao || 'PENDENTE'] || 'bg-gray-100 text-gray-800';
  };

  const handlePagar = (conta: ContaPagar) => {
    setContaSelecionada(conta);
    setValorPago(String(conta.valorTotal));
    setDataPagamento(new Date().toISOString().split('T')[0]);
    setShowPagamentoModal(true);
  };

  const handleConfirmarPagamento = async () => {
    if (!contaSelecionada) return;

    if (!valorPago || parseFloat(valorPago) <= 0) {
      alert('Informe um valor válido');
      return;
    }

    try {
      // Enviar formaPagamentoId como undefined/null já que não é mais obrigatório
      await pagarConta(
        contaSelecionada.id!,
        parseFloat(valorPago),
        dataPagamento,
        undefined
      );
      alert('Pagamento registrado com sucesso!');
      setShowPagamentoModal(false);
      loadContas();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao registrar pagamento');
    }
  };

  const handleCancelar = async (conta: ContaPagar) => {
    if (!window.confirm(`Deseja realmente cancelar a conta ${conta.numeroParcela}/${conta.totalParcelas}?`)) {
      return;
    }

    try {
      await cancelarContaPagar(conta.id!);
      alert('Conta cancelada com sucesso!');
      loadContas();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao cancelar conta');
    }
  };

  const contasFiltradas = contas.filter(conta => {
    if (filtroSituacao === 'TODAS') return true;
    return conta.situacao === filtroSituacao;
  });

  // Funções para modal de nota avulsa
  const handleAbrirNotaAvulsa = () => {
    setNotaFormData({
      numeroNota: '',
      modelo: '',
      serie: '',
      fornecedorId: '',
      dataEmissao: getCurrentDateString(),
      formaPagamentoId: '',
      numParcela: '1',
      valorParcela: '0',
      dataVencimento: getCurrentDateString(),
      juros: '0',
      multa: '0',
      desconto: '0',
      dataPagamento: '',
      observacao: ''
    });
    setFornecedorSelecionado(null);
    setFormaPagamentoSelecionada(null);
    setShowNotaAvulsaModal(true);
  };

  const handleFecharNotaAvulsa = () => {
    setShowNotaAvulsaModal(false);
  };

  const handleNotaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dataEmissao') {
      const dataEmissao = new Date(value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataEmissao > hoje) {
        alert('A data de emissão não pode ser futura!');
        return;
      }
    }
    
    if (name === 'dataVencimento') {
      const dataVencimento = new Date(value);
      const dataEmissao = new Date(notaFormData.dataEmissao);
      
      if (dataVencimento < dataEmissao) {
        alert('A data de vencimento não pode ser anterior à data de emissão!');
        return;
      }
    }
    
    setNotaFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFornecedorSelect = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setNotaFormData(prev => ({ ...prev, fornecedorId: String(fornecedor.id) }));
    setShowFornecedorModal(false);
  };

  const handleFormaPagamentoSelect = (formaPagamento: FormaPagamento) => {
    setFormaPagamentoSelecionada(formaPagamento);
    setNotaFormData(prev => ({ ...prev, formaPagamentoId: String(formaPagamento.id) }));
    setShowFormaPagamentoModal(false);
    // Atualizar lista de formas de pagamento se necessário
    if (!formasPagamento.find(f => f.id === formaPagamento.id)) {
      setFormasPagamento(prev => [...prev, formaPagamento]);
    }
  };

  const calcularTotalPagar = () => {
    const valorParcela = parseFloat(notaFormData.valorParcela) || 0;
    const desconto = parseFloat(notaFormData.desconto) || 0;
    // Juros e multa não são somados aqui - só serão somados no backend se o pagamento for depois do vencimento
    return valorParcela - desconto;
  };

  const handleSalvarNotaAvulsa = async () => {
    if (!fornecedorSelecionado) {
      alert('Selecione um fornecedor');
      return;
    }

    if (!notaFormData.valorParcela || parseFloat(notaFormData.valorParcela) <= 0) {
      alert('O valor da parcela deve ser maior que zero');
      return;
    }

    if (!notaFormData.dataVencimento) {
      alert('Informe a data de vencimento');
      return;
    }

    const dataEmissao = new Date(notaFormData.dataEmissao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataEmissao > hoje) {
      alert('A data de emissão não pode ser futura!');
      return;
    }

    try {
      setSavingNota(true);
      const contaData: Partial<ContaPagarAvulsa> = {
        numeroNota: notaFormData.numeroNota || undefined,
        modelo: notaFormData.modelo || undefined,
        serie: notaFormData.serie || undefined,
        fornecedorId: parseInt(notaFormData.fornecedorId),
        numParcela: parseInt(notaFormData.numParcela),
        valorParcela: parseFloat(notaFormData.valorParcela),
        dataEmissao: notaFormData.dataEmissao,
        dataVencimento: notaFormData.dataVencimento,
        juros: parseFloat(notaFormData.juros) || 0, // Será somado ao total apenas se pagamento for depois do vencimento
        multa: parseFloat(notaFormData.multa) || 0, // Será somada ao total apenas se pagamento for depois do vencimento
        desconto: parseFloat(notaFormData.desconto) || 0,
        formaPagamentoId: notaFormData.formaPagamentoId ? parseInt(notaFormData.formaPagamentoId) : undefined,
        observacao: notaFormData.observacao || undefined,
        status: 'PENDENTE'
      };

      await createContaPagarAvulsa(contaData);
      alert('Conta a pagar avulsa criada com sucesso!');
      handleFecharNotaAvulsa();
      loadContas();
    } catch (err: any) {
      console.error('Erro ao salvar conta avulsa:', err);
      alert(err?.response?.data?.message || 'Erro ao salvar conta a pagar avulsa');
    } finally {
      setSavingNota(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cell: (conta: ContaPagar) => conta.id
    },
    {
      header: 'Fornecedor',
      accessor: 'fornecedor',
      cell: (conta: ContaPagar) => conta.fornecedorNome || '-'
    },
    {
      header: 'Nota',
      accessor: 'nota',
      cell: (conta: ContaPagar) => `${conta.notaNumero}/${conta.notaModelo}/${conta.notaSerie}`
    },
    {
      header: 'Parcela',
      accessor: 'parcela',
      cell: (conta: ContaPagar) => `${conta.numeroParcela}/${conta.totalParcelas}`
    },
    {
      header: 'Vencimento',
      accessor: 'dataVencimento',
      cell: (conta: ContaPagar) => formatDateBR(conta.dataVencimento)
    },
    {
      header: 'Valor',
      accessor: 'valorTotal',
      cell: (conta: ContaPagar) => formatCurrency(conta.valorTotal)
    },
    {
      header: 'Situação',
      accessor: 'situacao',
      cell: (conta: ContaPagar) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSituacaoBadge(conta.situacao)}`}>
          {conta.situacao}
        </span>
      )
    },
    {
      header: 'Ações',
      accessor: 'actions',
      cell: (conta: ContaPagar) => (
        <div className="flex gap-2">
          {conta.situacao === 'PENDENTE' && (
            <>
              <button
                onClick={() => handlePagar(conta)}
                className="text-green-600 hover:text-green-800"
                title="Pagar"
              >
                <FaMoneyBillWave />
              </button>
              <button
                onClick={() => handleCancelar(conta)}
                className="text-red-600 hover:text-red-800"
                title="Cancelar"
              >
                <FaBan />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Contas a Pagar</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAbrirNotaAvulsa}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
          >
            <FaPlus className="mr-2" />
            Nota Avulsa
          </button>
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="TODAS">Todas</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="PAGA">Pagas</option>
            <option value="VENCIDA">Vencidas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      <div className="p-4">
        <DataTable
          data={contasFiltradas}
          columns={columns}
          emptyMessage="Nenhuma conta a pagar encontrada"
        />
      </div>

      {/* Modal de Pagamento */}
      {showPagamentoModal && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Registrar Pagamento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={contaSelecionada.fornecedorNome}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parcela
                </label>
                <input
                  type="text"
                  value={`${contaSelecionada.numeroParcela}/${contaSelecionada.totalParcelas}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total *
                </label>
                <input
                  type="number"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Pagamento *
                </label>
                <input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPagamentoModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarPagamento}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nota Avulsa */}
      {showNotaAvulsaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Cadastrar Conta a Pagar</h2>
            
            <div className="space-y-6">
              {/* Dados da Nota */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Dados da Nota</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Emissão *
                    </label>
                    <input
                      type="date"
                      name="dataEmissao"
                      value={notaFormData.dataEmissao}
                      onChange={handleNotaFormChange}
                      max={getCurrentDateString()}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      name="numeroNota"
                      value={notaFormData.numeroNota}
                      onChange={handleNotaFormChange}
                      placeholder="22232"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      name="modelo"
                      value={notaFormData.modelo}
                      onChange={handleNotaFormChange}
                      placeholder="55"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Série
                    </label>
                    <input
                      type="text"
                      name="serie"
                      value={notaFormData.serie}
                      onChange={handleNotaFormChange}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Fornecedor e Pagamento */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Dados do Fornecedor e Pagamento</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cód. Fornecedor *
                    </label>
                    <div 
                      onClick={() => setShowFornecedorModal(true)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 h-10"
                    >
                      <input
                        type="text"
                        readOnly
                        value={fornecedorSelecionado ? String(fornecedorSelecionado.id) : ''}
                        className="flex-grow bg-transparent outline-none cursor-pointer text-sm text-right"
                        placeholder="Selecione..."
                      />
                      <FaSearch className="text-gray-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={fornecedorSelecionado ? fornecedorSelecionado.fornecedor : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cód. Forma Pag. *
                    </label>
                    <div 
                      onClick={() => setShowFormaPagamentoModal(true)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 h-10"
                    >
                      <input
                        type="text"
                        readOnly
                        value={formaPagamentoSelecionada ? String(formaPagamentoSelecionada.id) : ''}
                        className="flex-grow bg-transparent outline-none cursor-pointer text-sm text-right"
                        placeholder="Selecione..."
                      />
                      <FaSearch className="text-gray-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de Pagamento
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formaPagamentoSelecionada ? formaPagamentoSelecionada.nome : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Detalhes da Parcela */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Detalhes da Parcela</h3>
                
                <div className="grid grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N° Parcela *
                    </label>
                    <input
                      type="number"
                      name="numParcela"
                      value={notaFormData.numParcela}
                      onChange={handleNotaFormChange}
                      min="1"
                      required
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Parcela *
                    </label>
                    <input
                      type="number"
                      name="valorParcela"
                      value={notaFormData.valorParcela}
                      onChange={handleNotaFormChange}
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Vencimento *
                    </label>
                    <input
                      type="date"
                      name="dataVencimento"
                      value={notaFormData.dataVencimento}
                      onChange={handleNotaFormChange}
                      min={notaFormData.dataEmissao}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      % Juros
                    </label>
                    <input
                      type="number"
                      name="juros"
                      value={notaFormData.juros}
                      onChange={handleNotaFormChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
                      title="Porcentagem de juros (ex: 0.21 = 21%). Será convertido para valor e somado ao total apenas se o pagamento for feito depois da data de vencimento"
                      placeholder="0.21"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      % Multa
                    </label>
                    <input
                      type="number"
                      name="multa"
                      value={notaFormData.multa}
                      onChange={handleNotaFormChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
                      title="Porcentagem de multa (ex: 2.00 = 2%). Será convertida para valor e somada ao total apenas se o pagamento for feito depois da data de vencimento"
                      placeholder="2.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      R$ Desconto
                    </label>
                    <input
                      type="number"
                      name="desconto"
                      value={notaFormData.desconto}
                      onChange={handleNotaFormChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    * Juros e multa devem ser informados como porcentagem (ex: 0.21 = 0.21%, 2.00 = 2%). 
                    Serão convertidos para valor e somados ao total apenas se o pagamento for feito depois da data de vencimento.
                  </p>
                </div>
              </div>

              {/* Dados de Pagamento */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Dados de Pagamento</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Pagamento
                    </label>
                    <input
                      type="date"
                      name="dataPagamento"
                      value={notaFormData.dataPagamento}
                      onChange={handleNotaFormChange}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-10 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total a Pagar
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`R$ ${calcularTotalPagar().toFixed(2).replace('.', ',')}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Observação */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Observação</h3>
                <textarea
                  name="observacao"
                  value={notaFormData.observacao}
                  onChange={handleNotaFormChange}
                  placeholder="Digite observações sobre a conta..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                <div>Data Criação: {new Date().toLocaleString('pt-BR')}</div>
                <div>Data Últ. Alteração: N/A</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFecharNotaAvulsa}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sair
                </button>
                <button
                  onClick={handleSalvarNotaAvulsa}
                  disabled={savingNota}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {savingNota ? (
                    <span className="inline-flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais auxiliares */}
      <FornecedorModal
        isOpen={showFornecedorModal}
        onClose={() => setShowFornecedorModal(false)}
        onSelect={(fornecedor) => {
          handleFornecedorSelect(fornecedor);
          getFornecedores().then(setFornecedores);
        }}
      />

      <FormaPagamentoModal
        isOpen={showFormaPagamentoModal}
        onClose={() => setShowFormaPagamentoModal(false)}
        onSelect={(formaPagamento) => {
          handleFormaPagamentoSelect(formaPagamento);
          loadFormasPagamento();
        }}
        initialFormasPagamento={formasPagamento}
      />
    </div>
  );
};

export default ContasPagarList;

