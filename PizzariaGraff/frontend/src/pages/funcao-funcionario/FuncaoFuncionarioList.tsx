import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getFuncoesFuncionario, deleteFuncaoFuncionario } from '../../services/funcaoFuncionarioService';
import { FuncaoFuncionario } from '../../types';
import { FaPlus } from 'react-icons/fa';

const FuncaoFuncionarioList: React.FC = () => {
  const [funcoes, setFuncoes] = useState<FuncaoFuncionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchFuncoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFuncoesFuncionario();
      setFuncoes(data);
    } catch (err) {
      console.error('Erro ao carregar funções:', err);
      setError('Não foi possível carregar a lista de funções de funcionário. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFuncoes();
  }, [fetchFuncoes, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/funcoes-funcionario/${id}`);
  };

  const handleCreate = () => {
    navigate('/funcoes-funcionario/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta função?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteFuncaoFuncionario(numericId);
        setFuncoes(funcoes.filter(f => f.id !== numericId));
        alert('Função excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir função:', err);
        alert('Erro ao excluir função. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Função', 
      accessor: 'funcaoFuncionario',
      cell: (item: FuncaoFuncionario) => {
        const displayName = item.funcaoFuncionario || item.descricao || 'Sem nome';
        return <span>{displayName}</span>;
      }
    },
    { 
      header: 'Carga Horária', 
      accessor: 'cargaHoraria',
      cell: (item: FuncaoFuncionario) => (
        <span>{item.cargaHoraria ? `${item.cargaHoraria}h/sem` : '-'}</span>
      )
    },
    { 
      header: 'Salário Base', 
      accessor: 'salarioBase',
      cell: (item: FuncaoFuncionario) => (
        <span>{item.salarioBase ? `R$ ${item.salarioBase.toFixed(2)}` : '-'}</span>
      )
    },
    {
      header: 'CNH',
      accessor: 'requerCNH',
      cell: (item: FuncaoFuncionario) => (
        <span className={`px-2 py-1 rounded text-xs ${item.requerCNH ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
          {item.requerCNH ? 'Sim' : 'Não'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: FuncaoFuncionario) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Funções de Funcionário</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchFuncoes}
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
        <h1 className="text-xl font-bold text-gray-800">Funções de Funcionário</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
        >
          <FaPlus className="mr-2" />
          Nova Função
        </button>
      </div>
      
      <div className="flex-grow overflow-auto">
        {funcoes.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhuma função cadastrada ainda.</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center text-sm"
            >
              <FaPlus className="mr-2" />
              Cadastrar Primeira Função
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={funcoes}
            loading={loading}
            onEdit={handleEdit}
            onDelete={deleteLoading === null ? handleDelete : undefined}
            emptyMessage="Nenhuma função cadastrada"
          />
        )}
      </div>
    </div>
  );
};

export default FuncaoFuncionarioList; 