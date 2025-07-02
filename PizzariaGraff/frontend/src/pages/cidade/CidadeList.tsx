import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getCidades, deleteCidade, getCidade } from '../../services/cidadeService';
import { Cidade } from '../../types';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import CidadeViewModal from '../../components/modals/CidadeViewModal';

const CidadeList: React.FC = () => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCidadeView, setSelectedCidadeView] = useState<Cidade | null>(null);
  const [viewModalLoading, setViewModalLoading] = useState(false);

  const fetchCidades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCidades();
      setCidades(data);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setError('Não foi possível carregar a lista de cidades. Tente novamente mais tarde.');
      toast.error('Falha ao carregar cidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCidades();
  }, [fetchCidades, location.key]);

  const handleView = async (id: string | number) => {
    setViewModalLoading(true);
    setIsViewModalOpen(true);
    try {
      const cidadeData = await getCidade(Number(id));
      setSelectedCidadeView(cidadeData);
    } catch (err) {
      console.error('Erro ao buscar cidade para visualização:', err);
      toast.error('Erro ao carregar detalhes da cidade.');
      setIsViewModalOpen(false);
    } finally {
      setViewModalLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCidadeView(null);
  };

  const handleEdit = (id: string | number) => {
    navigate(`/cidades/${id}`);
  };

  const handleCreate = () => {
    navigate('/cidades/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteCidade(numericId);
        setCidades(cidades.filter(c => c.id !== numericId));
        toast.success('Cidade excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir cidade:', err);
        toast.error('Erro ao excluir cidade. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Cidade', accessor: 'nome' },
    { 
      header: 'Estado', 
      accessor: 'estado.nome',
      cell: (item: Cidade) => (
        <div className="flex items-center">
          {item.estado && item.estado.id ? (
            <span>{item.estado.nome}</span>
          ) : (
            <span>{item.estado?.nome || 'N/A'}</span>
          )}
        </div>
      )
    },
    { 
      header: 'País', 
      accessor: 'estado.pais.nome',
      cell: (item: Cidade) => (
        <div className="flex items-center">
          {item.estado?.pais && item.estado.pais.id ? (
            <span>{item.estado.pais.nome}</span>
          ) : (
            <span>{item.estado?.pais?.nome || 'N/A'}</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: Cidade) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cidades</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchCidades}
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
        <h1 className="text-xl font-bold text-gray-800">Cidades</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
        >
          <FaPlus className="mr-2" />
          Nova Cidade
        </button>
      </div>
      
      <div className="flex-grow overflow-auto">
        {cidades.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhuma cidade cadastrada ainda.</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center text-sm"
            >
              <FaPlus className="mr-2" />
              Cadastrar Primeira Cidade
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={cidades}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteLoading === null ? handleDelete : undefined}
            emptyMessage="Nenhuma cidade encontrada."
          />
        )}
      </div>

      <CidadeViewModal 
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        cidade={selectedCidadeView}
        loading={viewModalLoading}
      />
    </div>
  );
};

export default CidadeList; 