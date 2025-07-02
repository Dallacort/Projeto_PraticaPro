import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getCategorias, deleteCategoria } from '../../services/categoriaService';
import { Categoria } from '../../types';
import { toast } from 'react-toastify';

const CategoriaList: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategorias();
      setCategorias(data);
    } catch (err) {
      setError('Erro ao carregar categorias');
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleEdit = (id: string | number) => {
    navigate(`/categorias/${id}/editar`);
  };

  const handleCreate = () => {
    navigate('/categorias/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteCategoria(numericId);
        toast.success('Categoria excluída com sucesso!');
        setCategorias(categorias.filter(c => c.id !== numericId));
      } catch (err) {
        toast.error('Erro ao excluir categoria. Verifique se não há produtos vinculados.');
        console.error('Erro ao excluir categoria:', err);
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
      header: 'Categoria', 
      accessor: 'categoria',
    },
    { 
      header: 'Data Criação', 
      accessor: 'dataCriacao',
      cell: (item: Categoria) => formatDate(item.dataCriacao)
    },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: Categoria) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Categorias</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={loadCategorias}
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
        <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Categoria
          </button>
        </div>
      </div>
      
      {categorias.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma categoria cadastrada ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeira Categoria
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={categorias}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhuma categoria cadastrada"
        />
      )}
    </div>
  );
};

export default CategoriaList; 