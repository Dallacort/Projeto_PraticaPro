import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getVeiculos, deleteVeiculo } from '../../services/veiculoService';
import { Veiculo } from '../../types';

const VeiculoList: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchVeiculos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de veículos...');
      const data = await getVeiculos();
      console.log('Veículos recebidos:', data);
      setVeiculos(data);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      setError('Não foi possível carregar a lista de veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('VeiculoList montado ou location alterada, carregando veículos...');
    fetchVeiculos();
  }, [fetchVeiculos, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/veiculos/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar novo veículo');
    navigate('/veiculos/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteVeiculo(numericId);
        setVeiculos(veiculos.filter(v => v.id !== numericId));
        alert('Veículo excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir veículo:', err);
        alert('Erro ao excluir veículo. Verifique se não há registros dependentes.');
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
    { header: 'Placa', accessor: 'placa' },
    { header: 'Descrição', accessor: 'descricao' },
    { 
      header: 'Transportadora', 
      accessor: 'transportadora.razaoSocial',
      cell: (item: Veiculo) => {
        if (!item.transportadora || !item.transportadora.id) {
          return <div>Não definida</div>;
        }
        
        return (
          <div>
            <Link 
              to={`/transportadoras/${item.transportadora.id}`}
              className="text-blue-600 hover:underline"
            >
              {item.transportadora.razaoSocial || item.transportadora.nomeFantasia}
            </Link>
          </div>
        );
      }
    },
    { 
      header: 'Data de Cadastro', 
      accessor: 'dataCadastro',
      cell: (item: Veiculo) => formatDate(item.dataCadastro)
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Veículos</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchVeiculos}
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
        <h1 className="text-2xl font-bold text-gray-800">Veículos</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchVeiculos}
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
            Novo Veículo
          </button>
        </div>
      </div>
      
      {veiculos.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum veículo cadastrado ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeiro Veículo
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={veiculos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhum veículo cadastrado"
        />
      )}
    </div>
  );
};

export default VeiculoList; 