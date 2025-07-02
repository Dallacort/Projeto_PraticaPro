import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getFuncionarios, deleteFuncionario } from '../../services/funcionarioService';
import { Funcionario } from '../../types';
import { FaPlus } from 'react-icons/fa';

const FuncionarioList: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchFuncionarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFuncionarios();
      setFuncionarios(data);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setError('Não foi possível carregar a lista de funcionários. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/funcionarios/${id}`);
  };

  const handleCreate = () => {
    navigate('/funcionarios/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteFuncionario(numericId);
        setFuncionarios(funcionarios.filter(f => f.id !== numericId));
        alert('Funcionário excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir funcionário:', err);
        alert('Erro ao excluir funcionário. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'funcionario', 
      accessor: 'funcionario',
      cell: (item: Funcionario) => (
        <span>{item.funcionario || item.nome}</span>
      )
    },

    { header: 'Telefone', accessor: 'telefone' },
    { header: 'E-mail', accessor: 'email' },
    { 
      header: 'Função', 
      accessor: 'funcaoFuncionario.funcaoFuncionario',
      cell: (item: Funcionario) => (
        <span>{item.funcaoFuncionario?.funcaoFuncionario || item.cargo || 'N/A'}</span>
      )
    },
    { 
      header: 'Tipo', 
      accessor: 'tipo',
      cell: (item: Funcionario) => (
        <span className={`px-2 py-1 rounded text-xs ${item.tipo === 1 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
          {item.tipo === 1 ? 'Pessoa Física' : item.tipo === 2 ? 'Pessoa Jurídica' : 'N/A'}
        </span>
      )
    },
    { 
      header: 'Cidade', 
      accessor: 'cidade.nome',
      cell: (item: Funcionario) => (
        <div className="flex items-center">
          {item.cidade && item.cidade.id ? (
            <span>{item.cidade.nome}</span>
              ) : (
            <span>{item.cidade?.nome || 'N/A'}</span>
              )}
            </div>
      )
    },
   
    { 
      header: 'Status', 
      accessor: 'ativo',
      cell: (item: Funcionario) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Funcionários</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchFuncionarios}
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
        <h1 className="text-xl font-bold text-gray-800">Funcionários</h1>
          <button
            onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
          >
          <FaPlus className="mr-2" />
            Novo Funcionário
          </button>
      </div>
      
      <div className="flex-grow overflow-auto">
        {funcionarios.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum funcionário cadastrado ainda.</p>
          <button
            onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center text-sm"
          >
              <FaPlus className="mr-2" />
            Cadastrar Primeiro Funcionário
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={funcionarios}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhum funcionário cadastrado"
        />
      )}
      </div>
    </div>
  );
};

export default FuncionarioList; 