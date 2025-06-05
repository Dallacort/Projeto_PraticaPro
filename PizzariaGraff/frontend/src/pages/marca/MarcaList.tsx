import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getMarcas, deleteMarca } from '../../services/marcaService';
import { Marca } from '../../types';

const MarcaList: React.FC = () => {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchMarcas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de marcas...');
      const data = await getMarcas();
      console.log('Marcas recebidas:', data);
      setMarcas(data);
    } catch (err) {
      console.error('Erro ao buscar marcas:', err);
      setError('Não foi possível carregar a lista de marcas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('MarcaList montado ou location alterada, carregando marcas...');
    fetchMarcas();
  }, [fetchMarcas, location.key]);

  const handleView = (id: string | number) => {
    navigate(`/marcas/${id}/visualizar`);
  };

  const handleEdit = (id: string | number) => {
    navigate(`/marcas/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar nova marca');
    navigate('/marcas/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta marca?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteMarca(numericId);
        setMarcas(marcas.filter(m => m.id !== numericId));
        alert('Marca excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir marca:', err);
        alert('Erro ao excluir marca. Verifique se não há registros dependentes.');
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

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Marca', 
      accessor: 'marca',
      cell: (item: Marca) => (
        <div className="font-medium">{item.marca}</div>
      )
    },
    { 
      header: 'Situação', 
      accessor: 'situacao',
      cell: (item: Marca) => formatDate(item.situacao)
    },
    { 
      header: 'Status', 
      accessor: 'ativo',
      cell: (item: Marca) => (
        <span className={item.ativo ? 'text-green-600' : 'text-red-600'}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    { 
      header: 'Data Criação', 
      accessor: 'dataCriacao',
      cell: (item: Marca) => formatDate(item.dataCriacao)
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Marcas</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchMarcas}
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
        <h1 className="text-2xl font-bold text-gray-800">Marcas</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Marca
          </button>
        </div>
      </div>
      
      {marcas.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma marca cadastrada ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeira Marca
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={marcas}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhuma marca cadastrada"
        />
      )}
    </div>
  );
};

export default MarcaList; 