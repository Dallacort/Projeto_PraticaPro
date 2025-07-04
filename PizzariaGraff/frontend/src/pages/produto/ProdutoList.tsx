import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getProdutos, deleteProduto } from '../../services/produtoService';
import { Produto } from '../../types';
import ProdutoViewModal from '../../components/modals/ProdutoViewModal';

const ProdutoList: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de produtos...');
      const data = await getProdutos();
      console.log('Produtos recebidos:', data);
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Não foi possível carregar a lista de produtos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('ProdutoList montado ou location alterada, carregando produtos...');
    fetchProdutos();
  }, [fetchProdutos, location.key]);

  const handleView = (id: string | number) => {
    const produto = produtos.find(p => p.id === Number(id));
    if (produto) {
      setSelectedProduto(produto);
      setIsViewModalOpen(true);
    }
  };

  const handleEdit = (id: string | number) => {
    navigate(`/produtos/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar novo produto');
    navigate('/produtos/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteProduto(numericId);
        setProdutos(produtos.filter(p => p.id !== numericId));
        alert('Produto excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir produto:', err);
        alert('Erro ao excluir produto. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Produto', 
      accessor: 'produto',
      cell: (item: Produto) => (
        <div>{item.produto || item.nome}</div>
      )
    },

    { 
      header: 'Marca', 
      accessor: 'marcaNome',
      cell: (item: Produto) => (
        <div className="text-sm">
          {item.marcaNome || '-'}
        </div>
      )
    },
    { 
      header: 'Unidade', 
      accessor: 'unidadeMedidaNome',
      cell: (item: Produto) => (
        <div className="text-sm">
          {item.unidadeMedidaNome || '-'}
        </div>
      )
    },
    { 
      header: 'Quantidade', 
      accessor: 'quantidade',
      cell: (item: Produto) => {
        const qtd = item.quantidade !== undefined ? item.quantidade : item.estoque;
        return <div className="text-center">{qtd !== undefined ? qtd.toString() : '0'}</div>;
      }
    },
    { 
      header: 'Valor Venda', 
      accessor: 'valorVenda',
      cell: (item: Produto) => {
        const valor = item.valorVenda || item.precoVenda || item.valor;
        return formatCurrency(valor);
      }
    },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: Produto) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Produtos</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchProdutos}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Produto
          </button>
        </div>
      </div>
      
      {produtos.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum produto cadastrado ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeiro Produto
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={produtos}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhum produto cadastrado"
        />
      )}

      <ProdutoViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        produto={selectedProduto}
      />
    </div>
  );
};

export default ProdutoList; 