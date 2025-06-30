import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getFornecedores, deleteFornecedor } from '../../services/fornecedorService';
import { Fornecedor } from '../../types';
import { FaPlus } from 'react-icons/fa';

const FornecedorList: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchFornecedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFornecedores();
      setFornecedores(data);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
      setError('Não foi possível carregar a lista de fornecedores. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores, location.key]);

  const handleView = (id: string | number) => {
    navigate(`/fornecedores/${id}/visualizar`);
  };

  const handleEdit = (id: string | number) => {
    navigate(`/fornecedores/${id}`);
  };

  const handleCreate = () => {
    navigate('/fornecedores/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteFornecedor(numericId);
        setFornecedores(fornecedores.filter(f => f.id !== numericId));
        alert('Fornecedor excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir fornecedor:', err);
        alert('Erro ao excluir fornecedor. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Fornecedor', 
      accessor: 'fornecedor',
      cell: (item: Fornecedor) => (
        <span>{item.fornecedor || item.razaoSocial}</span>
      )
    },
    { 
      header: 'CPF/CNPJ', 
      accessor: 'cpfCnpj',
      cell: (item: Fornecedor) => (
        <span>{item.cpfCnpj || item.cnpj || 'N/A'}</span>
      )
    },
    { header: 'Telefone', accessor: 'telefone' },
    { header: 'E-mail', accessor: 'email' },
    { 
      header: 'Cidade', 
      accessor: 'cidade.nome',
      cell: (item: Fornecedor) => (
        <div className="flex items-center">
          {item.cidade && item.cidade.id ? (
            <Link 
              to={`/cidades/${item.cidade.id}`}
              className="text-blue-600 hover:underline"
            >
              {item.cidade.nome}
            </Link>
          ) : (
            <span>{item.cidade?.nome || 'N/A'}</span>
          )}
        </div>
      )
    },

    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: Fornecedor) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Fornecedores</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchFornecedores}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Fornecedores</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
        >
          <FaPlus className="mr-2" />
          Novo Fornecedor
        </button>
      </div>
      
      <div className="flex-grow overflow-auto">
        {fornecedores.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhum fornecedor cadastrado ainda.</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center text-sm"
            >
              <FaPlus className="mr-2" />
              Cadastrar Primeiro Fornecedor
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={fornecedores}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteLoading === null ? handleDelete : undefined}
            emptyMessage="Nenhum fornecedor cadastrado"
          />
        )}
      </div>
    </div>
  );
};

export default FornecedorList; 