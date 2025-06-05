import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getUnidadesMedida, deleteUnidadeMedida } from '../../services/unidadeMedidaService';
import { UnidadeMedida } from '../../types';

const UnidadeMedidaList: React.FC = () => {
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadeMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnidadesMedida = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de unidades de medida...');
      const data = await getUnidadesMedida();
      console.log('Unidades de medida recebidas:', data);
      setUnidadesMedida(data);
    } catch (err) {
      console.error('Erro ao buscar unidades de medida:', err);
      setError('Não foi possível carregar a lista de unidades de medida. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('UnidadeMedidaList montado ou location alterada, carregando unidades de medida...');
    fetchUnidadesMedida();
  }, [fetchUnidadesMedida, location.key]);

  const handleView = (id: string | number) => {
    navigate(`/unidades-medida/${id}/visualizar`);
  };

  const handleEdit = (id: string | number) => {
    navigate(`/unidades-medida/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar nova unidade de medida');
    navigate('/unidades-medida/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade de medida?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteUnidadeMedida(numericId);
        setUnidadesMedida(unidadesMedida.filter(u => u.id !== numericId));
        alert('Unidade de medida excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir unidade de medida:', err);
        alert('Erro ao excluir unidade de medida. Verifique se não há registros dependentes.');
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
      header: 'Unidade de Medida', 
      accessor: 'unidadeMedida',
      cell: (item: UnidadeMedida) => (
        <div className="font-medium">{item.unidadeMedida}</div>
      )
    },
    { 
      header: 'Situação', 
      accessor: 'situacao',
      cell: (item: UnidadeMedida) => formatDate(item.situacao)
    },
    { 
      header: 'Status', 
      accessor: 'ativo',
      cell: (item: UnidadeMedida) => (
        <span className={item.ativo ? 'text-green-600' : 'text-red-600'}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    { 
      header: 'Data Criação', 
      accessor: 'dataCriacao',
      cell: (item: UnidadeMedida) => formatDate(item.dataCriacao)
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Unidades de Medida</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchUnidadesMedida}
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
        <h1 className="text-2xl font-bold text-gray-800">Unidades de Medida</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Unidade de Medida
          </button>
        </div>
      </div>
      
      {unidadesMedida.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma unidade de medida cadastrada ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeira Unidade de Medida
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={unidadesMedida}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhuma unidade de medida cadastrada"
        />
      )}
    </div>
  );
};

export default UnidadeMedidaList; 