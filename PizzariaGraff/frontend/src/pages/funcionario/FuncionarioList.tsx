import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getFuncionarios, deleteFuncionario } from '../../services/funcionarioService';
import { Funcionario } from '../../types';

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
      console.log('Buscando lista de funcionários...');
      const data = await getFuncionarios();
      console.log('Funcionários recebidos:', data);
      setFuncionarios(data);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setError('Não foi possível carregar a lista de funcionários. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('FuncionarioList montado ou location alterada, carregando funcionários...');
    fetchFuncionarios();
  }, [fetchFuncionarios, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/funcionarios/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar novo funcionário');
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
    { header: 'Nome', accessor: 'nome' },
    { header: 'CPF', accessor: 'cpf' },
    { header: 'Cargo', accessor: 'cargo' },
    { header: 'Telefone', accessor: 'telefone' },
    { header: 'E-mail', accessor: 'email' },
    { 
      header: 'Cidade/Estado', 
      accessor: 'cidade.nome',
      cell: (item: Funcionario) => {
        if (!item.cidade || !item.cidade.nome) {
          return <div>Não definido</div>;
        }
        
        if (!item.cidade.estado || !item.cidade.estado.uf) {
          return (
            <div>
              {item.cidade.id ? (
                <Link 
                  to={`/cidades/${item.cidade.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {item.cidade.nome}
                </Link>
              ) : (
                item.cidade.nome
              )}
            </div>
          );
        }
        
        return (
          <div>
            {item.cidade.id ? (
              <Link 
                to={`/cidades/${item.cidade.id}`}
                className="text-blue-600 hover:underline"
              >
                {item.cidade.nome}
              </Link>
            ) : (
              item.cidade.nome
            )}{item.cidade.estado.uf ? `, ${item.cidade.estado.uf}` : ''}
          </div>
        );
      }
    },
    { 
      header: 'Admissão', 
      accessor: 'dataAdmissao',
      cell: (item: Funcionario) => formatDate(item.dataAdmissao)
    },
    { 
      header: 'Status', 
      accessor: 'ativo',
      cell: (item: Funcionario) => (
        <span className={item.ativo ? 'text-green-600' : 'text-red-600'}>
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
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Funcionários</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchFuncionarios}
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
            Novo Funcionário
          </button>
        </div>
      </div>
      
      {funcionarios.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum funcionário cadastrado ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
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
  );
};

export default FuncionarioList; 