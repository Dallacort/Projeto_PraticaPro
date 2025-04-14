import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CondicaoPagamento } from '../../types';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import { formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';

const CondicaoPagamentoList: React.FC = () => {
  const [condicoesList, setCondicoesList] = useState<CondicaoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  const fetchCondicoesPagamento = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CondicaoPagamentoService.list();
      setCondicoesList(data);
    } catch (error) {
      console.error('Erro ao carregar condições de pagamento:', error);
      setError('Erro ao carregar lista de condições de pagamento');
      toast.error('Erro ao carregar lista de condições de pagamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCondicoesPagamento();
  }, [fetchCondicoesPagamento]);

  const handleEdit = (id: string | number) => {
    navigate(`/condicoes-pagamento/${id}`);
  };

  const handleCreate = () => {
    navigate('/condicoes-pagamento/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta condição de pagamento?')) {
      const idStr = id.toString();
      setDeleteLoading(prev => ({ ...prev, [idStr]: true }));
      try {
        await CondicaoPagamentoService.delete(Number(id));
        toast.success('Condição de pagamento excluída com sucesso!');
        fetchCondicoesPagamento();
      } catch (error) {
        console.error('Erro ao excluir condição de pagamento:', error);
        toast.error('Erro ao excluir condição de pagamento');
      } finally {
        setDeleteLoading(prev => ({ ...prev, [idStr]: false }));
      }
    }
  };

  const columns = [
    {
      header: 'Código',
      accessor: 'codigo'
    },
    {
      header: 'Nome',
      accessor: 'nome'
    },
    {
      header: 'Descrição',
      accessor: 'descricao'
    },
    {
      header: 'Dias 1ª Parcela',
      accessor: 'diasPrimeiraParcela'
    },
    {
      header: 'Dias Entre Parcelas',
      accessor: 'diasEntreParcelas'
    },
    {
      header: 'Juros (%)',
      accessor: 'percentualJuros',
      cell: (item: CondicaoPagamento) => 
        item.percentualJuros ? item.percentualJuros.toFixed(2) : '0.00'
    },
    {
      header: 'Multa (%)',
      accessor: 'percentualMulta',
      cell: (item: CondicaoPagamento) => 
        item.percentualMulta ? item.percentualMulta.toFixed(2) : '0.00'
    },
    {
      header: 'Desconto (%)',
      accessor: 'percentualDesconto',
      cell: (item: CondicaoPagamento) => 
        item.percentualDesconto ? item.percentualDesconto.toFixed(2) : '0.00'
    },
    {
      header: 'Parcelas',
      accessor: 'parcelas',
      cell: (item: CondicaoPagamento) => 
        item.parcelas?.length ? item.parcelas.length : '1'
    },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: CondicaoPagamento) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      header: 'Data de Cadastro',
      accessor: 'dataCadastro',
      cell: (item: CondicaoPagamento) => (
        item.dataCadastro ? formatDate(item.dataCadastro) : '-'
      )
    }
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Condições de Pagamento</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Condição
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="p-4 flex-grow overflow-auto">
        <DataTable
          columns={columns}
          data={condicoesList}
          loading={loading}
          emptyMessage="Nenhuma condição de pagamento encontrada."
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="Lista de Condições de Pagamento"
        />
      </div>
    </div>
  );
};

export default CondicaoPagamentoList; 