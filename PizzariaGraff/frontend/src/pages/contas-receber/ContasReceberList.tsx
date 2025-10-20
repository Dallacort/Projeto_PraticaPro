import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContasReceber, receberConta, cancelarContaReceber } from '../../services/contaReceberService';
import FormaPagamentoService from '../../services/FormaPagamentoService';
import { ContaReceber, FormaPagamento } from '../../types';
import DataTable from '../../components/DataTable';
import { FaPlus, FaEye, FaMoneyBillWave, FaBan } from 'react-icons/fa';

const ContasReceberList: React.FC = () => {
  const navigate = useNavigate();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroSituacao, setFiltroSituacao] = useState<string>('TODAS');
  
  // Modal de recebimento
  const [showRecebimentoModal, setShowRecebimentoModal] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaReceber | null>(null);
  const [valorRecebido, setValorRecebido] = useState('');
  const [dataRecebimento, setDataRecebimento] = useState(new Date().toISOString().split('T')[0]);
  const [formaPagamentoId, setFormaPagamentoId] = useState('');
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);

  useEffect(() => {
    loadContas();
    loadFormasPagamento();
  }, []);

  const loadContas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContasReceber();
      setContas(data);
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Erro ao carregar as contas a receber. Tente novamente.');
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
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR');
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
      'RECEBIDA': 'bg-green-100 text-green-800',
      'VENCIDA': 'bg-red-100 text-red-800',
      'CANCELADA': 'bg-gray-100 text-gray-800',
      'PARCIALMENTE_RECEBIDA': 'bg-blue-100 text-blue-800'
    };
    return badges[situacao || 'PENDENTE'] || 'bg-gray-100 text-gray-800';
  };

  const handleReceber = (conta: ContaReceber) => {
    setContaSelecionada(conta);
    setValorRecebido(String(conta.valorTotal));
    setDataRecebimento(new Date().toISOString().split('T')[0]);
    setFormaPagamentoId('');
    setShowRecebimentoModal(true);
  };

  const handleConfirmarRecebimento = async () => {
    if (!contaSelecionada) return;

    if (!valorRecebido || parseFloat(valorRecebido) <= 0) {
      alert('Informe um valor válido');
      return;
    }

    if (!formaPagamentoId) {
      alert('Selecione uma forma de pagamento');
      return;
    }

    try {
      await receberConta(
        contaSelecionada.id!,
        parseFloat(valorRecebido),
        dataRecebimento,
        parseInt(formaPagamentoId)
      );
      alert('Recebimento registrado com sucesso!');
      setShowRecebimentoModal(false);
      loadContas();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao registrar recebimento');
    }
  };

  const handleCancelar = async (conta: ContaReceber) => {
    if (!window.confirm(`Deseja realmente cancelar a conta ${conta.numeroParcela}/${conta.totalParcelas}?`)) {
      return;
    }

    try {
      await cancelarContaReceber(conta.id!);
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

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cell: (conta: ContaReceber) => conta.id
    },
    {
      header: 'Cliente',
      accessor: 'cliente',
      cell: (conta: ContaReceber) => conta.clienteNome || '-'
    },
    {
      header: 'Nota',
      accessor: 'nota',
      cell: (conta: ContaReceber) => `${conta.notaNumero}/${conta.notaModelo}/${conta.notaSerie}`
    },
    {
      header: 'Parcela',
      accessor: 'parcela',
      cell: (conta: ContaReceber) => `${conta.numeroParcela}/${conta.totalParcelas}`
    },
    {
      header: 'Vencimento',
      accessor: 'dataVencimento',
      cell: (conta: ContaReceber) => formatDateBR(conta.dataVencimento)
    },
    {
      header: 'Valor',
      accessor: 'valorTotal',
      cell: (conta: ContaReceber) => formatCurrency(conta.valorTotal)
    },
    {
      header: 'Situação',
      accessor: 'situacao',
      cell: (conta: ContaReceber) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSituacaoBadge(conta.situacao)}`}>
          {conta.situacao}
        </span>
      )
    },
    {
      header: 'Ações',
      accessor: 'actions',
      cell: (conta: ContaReceber) => (
        <div className="flex gap-2">
          {conta.situacao === 'PENDENTE' && (
            <>
              <button
                onClick={() => handleReceber(conta)}
                className="text-green-600 hover:text-green-800"
                title="Receber"
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
        <h1 className="text-xl font-bold text-gray-800">Contas a Receber</h1>
        <div className="flex gap-2">
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="TODAS">Todas</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="RECEBIDA">Recebidas</option>
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
          emptyMessage="Nenhuma conta a receber encontrada"
        />
      </div>

      {/* Modal de Recebimento */}
      {showRecebimentoModal && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Registrar Recebimento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={contaSelecionada.clienteNome}
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
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Recebimento *
                </label>
                <input
                  type="date"
                  value={dataRecebimento}
                  onChange={(e) => setDataRecebimento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento *
                </label>
                <select
                  value={formaPagamentoId}
                  onChange={(e) => setFormaPagamentoId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione...</option>
                  {formasPagamento.map(forma => (
                    <option key={forma.id} value={forma.id}>
                      {forma.formaPagamento}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowRecebimentoModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRecebimento}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContasReceberList;

