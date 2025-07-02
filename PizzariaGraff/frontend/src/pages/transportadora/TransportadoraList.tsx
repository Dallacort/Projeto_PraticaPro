import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getTransportadoras, deleteTransportadora, getTransportadora } from '../../services/transportadoraService';
import { Pais, Transportadora } from '../../types';
import { FaPlus } from 'react-icons/fa';
import TransportadoraViewModal from '../../components/modals/TransportadoraViewModal';

const TransportadoraList: React.FC = () => {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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

  const handleView = async (id: string | number) => {
    try {
      const transportadora = await getTransportadora(Number(id));
      setSelectedTransportadora(transportadora);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar transportadora:', error);
      alert('Erro ao carregar dados da transportadora');
    }
  };

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
    { header: 'transportadora', accessor: 'transportadora' },
    { header: 'Nome Fantasia', accessor: 'apelido' },
    { header: 'CNPJ', accessor: 'cpfCnpj' },
    { 
      header: 'Telefone', 
      accessor: 'telefonesAdicionais',
      cell: (item: Transportadora) => (
        <span>{item.telefonesAdicionais?.[0] || 'N/A'}</span>
      )
    },
    { 
      header: 'E-mail', 
      accessor: 'emailsAdicionais',
      cell: (item: Transportadora) => (
        <span>{item.emailsAdicionais?.[0] || 'N/A'}</span>
      )
    },
    { 
      header: 'Cidade', 
      accessor: 'cidade.nome',
      cell: (item: Transportadora) => {
        if (!item.cidade || !item.cidade.nome) {
          return <div>Não definido</div>;
        }
        
        if (!item.cidade.estado || !item.cidade.estado.uf) {
          return (
            <div>
              {item.cidade.nome}
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
            )}
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
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Transportadoras</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
        >
          <FaPlus className="mr-2" />
          Nova Transportadora
        </button>
      </div>
      
      <div className="flex-grow overflow-auto">
        {transportadoras.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhuma transportadora cadastrada ainda.</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center text-sm"
            >
              <FaPlus className="mr-2" />
              Cadastrar Primeira Transportadora
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={transportadoras}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteLoading === null ? handleDelete : undefined}
            emptyMessage="Nenhuma transportadora cadastrada"
          />
        )}
      </div>

      <TransportadoraViewModal
        transportadora={selectedTransportadora}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default TransportadoraList; 