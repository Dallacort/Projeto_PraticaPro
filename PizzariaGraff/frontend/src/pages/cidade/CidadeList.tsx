import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import EntityLink from '../../components/EntityLink';
import { getCidades, deleteCidade } from '../../services/cidadeService';
import { Cidade } from '../../types';

const CidadeList: React.FC = () => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchCidades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de cidades...');
      const data = await getCidades();
      console.log('Cidades recebidas:', data);
      setCidades(data);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setError('Não foi possível carregar a lista de cidades. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('CidadeList montado ou location alterada, carregando cidades...');
    fetchCidades();
  }, [fetchCidades, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/cidades/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar nova cidade');
    // Use replace para forçar um recarregamento completo da página e garantir que o componente seja corretamente inicializado
    window.location.href = '/cidades/novo';
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteCidade(numericId);
        setCidades(cidades.filter(c => c.id !== numericId));
        alert('Cidade excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir cidade:', err);
        alert('Erro ao excluir cidade. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome', accessor: 'nome' },
    { 
      header: 'Estado', 
      accessor: 'estado.nome',
      cell: (item: Cidade) => (
        <div className="flex items-center">
          {item.estado && item.estado.id ? (
            <Link 
              to={`/estados/${item.estado.id}`}
              className="text-blue-600 hover:underline"
            >
              {item.estado.nome} ({item.estado.uf})
            </Link>
          ) : (
            <span>{item.estado?.nome || 'N/A'} {item.estado?.uf ? `(${item.estado.uf})` : ''}</span>
          )}
        </div>
      )
    },
    { 
      header: 'País', 
      accessor: 'estado.pais.nome',
      cell: (item: Cidade) => (
        <div className="flex items-center">
          {item.estado?.pais && item.estado.pais.id ? (
            <Link 
              to={`/paises/${item.estado.pais.id}`}
              className="text-blue-600 hover:underline"
            >
              {item.estado.pais.nome}
            </Link>
          ) : (
            <span>{item.estado?.pais?.nome || 'N/A'}</span>
          )}
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cidades</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchCidades}
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
        <h1 className="text-2xl font-bold text-gray-800">Cidades</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchCidades}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
            disabled={loading}
          >
            <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Cidade
          </button>
        </div>
      </div>
      
      {cidades.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma cidade cadastrada ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeira Cidade
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={cidades}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhuma cidade cadastrada"
        />
      )}
    </div>
  );
};

export default CidadeList; 