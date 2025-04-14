import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getClientes, deleteCliente } from '../../services/clienteService';
import { Cliente } from '../../types';

const ClienteList: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de clientes...');
      const data = await getClientes();
      console.log('Clientes recebidos:', data);
      setClientes(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Não foi possível carregar a lista de clientes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('ClienteList montado ou location alterada, carregando clientes...');
    fetchClientes();
  }, [fetchClientes, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/clientes/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar novo cliente');
    navigate('/clientes/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteCliente(numericId);
        setClientes(clientes.filter(c => c.id !== numericId));
        alert('Cliente excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        alert('Erro ao excluir cliente. Verifique se não há registros dependentes.');
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
    { header: 'CPF/CNPJ', accessor: 'cpfCnpj' },
    { header: 'Telefone', accessor: 'telefone' },
    { header: 'E-mail', accessor: 'email' },
    { 
      header: 'Cidade/Estado', 
      accessor: 'cidade.nome',
      cell: (item: Cliente) => {
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
      header: 'Status', 
      accessor: 'ativo',
      cell: (item: Cliente) => (
        <span className={item.ativo ? 'text-green-600' : 'text-red-600'}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchClientes}
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
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchClientes}
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
            Novo Cliente
          </button>
        </div>
      </div>
      
      {clientes.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum cliente cadastrado ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeiro Cliente
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={clientes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhum cliente cadastrado"
        />
      )}
    </div>
  );
};

export default ClienteList; 