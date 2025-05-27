import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getModalidadesNfe, deleteModalidadeNfe, mockModalidadesNfe } from '../../services/modalidadeNfeService';
import { ModalidadeNfe } from '../../types';
import DataTable from '../../components/DataTable';

const ModalidadeNfeList: React.FC = () => {
  const [modalidadesNfe, setModalidadesNfe] = useState<ModalidadeNfe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  const fetchModalidadesNfe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Em ambiente de desenvolvimento, usar mock ou API real
      const data = process.env.REACT_APP_USE_MOCK_DATA === 'true' 
        ? mockModalidadesNfe 
        : await getModalidadesNfe();
      
      setModalidadesNfe(data);
    } catch (error) {
      console.error('Erro ao buscar modalidades de NFe:', error);
      setError('Não foi possível carregar as modalidades de NFe. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModalidadesNfe();
  }, [fetchModalidadesNfe]);

  const handleEdit = (id: string | number) => {
    navigate(`/modalidades-nfe/${id}`);
  };

  const handleCreate = () => {
    navigate('/modalidades-nfe/novo');
  };

  const handleDelete = async (id: string | number) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta modalidade de NFe?');
    
    if (confirmDelete) {
      try {
        const idStr = id.toString();
        setDeleteLoading(prev => ({ ...prev, [idStr]: true }));
        await deleteModalidadeNfe(Number(idStr));
        await fetchModalidadesNfe();
        alert('Modalidade de NFe excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir modalidade de NFe:', error);
        alert('Erro ao excluir modalidade de NFe. Tente novamente.');
      } finally {
        setDeleteLoading(prev => ({ ...prev, [id.toString()]: false }));
      }
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'w-16'
    },
    {
      header: 'Código',
      accessor: 'codigo',
      className: 'w-32'
    },
    {
      header: 'Descrição',
      accessor: 'descricao'
    },
    {
      header: 'Status',
      accessor: 'ativo',
      className: 'w-24',
      cell: (item: ModalidadeNfe) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Modalidades de NFe</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Modalidade de NFe
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={modalidadesNfe}
        loading={loading}
        emptyMessage="Nenhuma modalidade de NFe encontrada."
        onEdit={handleEdit}
        onDelete={handleDelete}
        createLink="/modalidades-nfe/novo"
        title="Lista de Modalidades de NFe"
      />
    </div>
  );
};

export default ModalidadeNfeList; 