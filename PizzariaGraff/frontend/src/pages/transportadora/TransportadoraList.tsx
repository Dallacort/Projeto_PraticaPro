import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getTransportadoras, deleteTransportadora } from '../../services/transportadoraService';
import { Transportadora } from '../../types';

const TransportadoraList: React.FC = () => {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchTransportadoras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de transportadoras...');
      const data = await getTransportadoras();
      console.log('Transportadoras recebidas:', data);
      setTransportadoras(data);
    } catch (err) {
      console.error('Erro ao buscar transportadoras:', err);
      setError('Não foi possível carregar a lista de transportadoras. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('TransportadoraList montado ou location alterada, carregando transportadoras...');
    fetchTransportadoras();
  }, [fetchTransportadoras, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/transportadoras/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar nova transportadora');
    navigate('/transportadoras/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transportadora?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteTransportadora(numericId);
        setTransportadoras(transportadoras.filter(t => t.id !== numericId));
        alert('Transportadora excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir transportadora:', err);
        alert('Erro ao excluir transportadora. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Razão Social', accessor: 'razaoSocial' },
    { header: 'Nome Fantasia', accessor: 'nomeFantasia' },
    { header: 'CNPJ', accessor: 'cnpj' },
    { header: 'Telefone', accessor: 'telefone' },
    { header: 'E-mail', accessor: 'email' },
    { 
      header: 'Cidade/Estado', 
      accessor: 'cidade.nome',
      cell: (item: Transportadora) => {
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
      header: 'Veículos', 
      accessor: 'veiculos.length',
      cell: (item: Transportadora) => (
        <div className="text-center">
          {item.veiculos?.length || 0}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'ativo',
      cell: (item: Transportadora) => (
        <span className={item.ativo ? 'text-green-600' : 'text-red-600'}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Transportadoras</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchTransportadoras}
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
        <h1 className="text-2xl font-bold text-gray-800">Transportadoras</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchTransportadoras}
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
            Nova Transportadora
          </button>
        </div>
      </div>
      
      {transportadoras.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma transportadora cadastrada ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeira Transportadora
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={transportadoras}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhuma transportadora cadastrada"
        />
      )}
    </div>
  );
};

export default TransportadoraList; 