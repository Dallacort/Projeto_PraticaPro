import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import EntityLink from '../../components/EntityLink';
import { getEstados, deleteEstado, getEstado } from '../../services/estadoService';
import { Estado } from '../../types';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';
import EstadoViewModal from '../../components/modals/EstadoViewModal';

const EstadoList: React.FC = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<{ [key: string]: boolean }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchEstados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando estados...');
      const data = await getEstados();
      console.log('Estados recebidos:', data);
      
      // Garantir que todos os estados têm dados válidos
      const estadosValidos = data.filter(estado => 
        estado && 
        estado.id && 
        estado.nome && 
        estado.pais && 
        estado.pais.id
      );
      
      if (estadosValidos.length < data.length) {
        console.warn(`${data.length - estadosValidos.length} estados foram filtrados por terem dados incompletos`);
      }
      
      setEstados(estadosValidos);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      setError('Não foi possível carregar a lista de estados. Tente novamente mais tarde.');
      toast.error('Erro ao carregar lista de estados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstados();
  }, [fetchEstados, location.key]);

  const handleView = async (id: string | number) => {
    setModalLoading(true);
    setModalOpen(true);
    try {
      const estado = await getEstado(Number(id));
      setSelectedEstado(estado);
    } catch (error) {
      console.error('Erro ao carregar estado:', error);
      toast.error('Erro ao carregar detalhes do estado');
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (id: string | number) => {
    navigate(`/estados/${id}`);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este estado?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(prev => ({ ...prev, [numericId.toString()]: true }));
        await deleteEstado(numericId);
        setEstados(estados.filter(estado => estado.id !== numericId));
        toast.success('Estado excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir estado:', error);
        toast.error('Erro ao excluir estado. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(prev => ({ ...prev, [id.toString()]: false }));
      }
    }
  };

  const handleCreate = () => {
    navigate('/estados/novo');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEstado(null);
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Estado', accessor: 'nome' },
    { header: 'UF', accessor: 'uf' },
    { 
      header: 'País', 
      accessor: 'pais.nome',
      cell: (item: Estado) => {
        // Verificação robusta de país
        if (!item || !item.pais) {
          return <span className="text-red-500">País não definido</span>;
        }
        return (
          <div className="flex items-center">
            <span>{item.pais.nome}</span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: Estado) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
  
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Estados</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Estado
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="p-4 flex-grow overflow-auto">
        <DataTable
          columns={columns}
          data={estados}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Nenhum estado cadastrado"
          title="Lista de Estados"
        />
      </div>

      {/* Modal de visualização */}
      <EstadoViewModal
        isOpen={modalOpen}
        onClose={closeModal}
        estado={selectedEstado}
        loading={modalLoading}
      />
    </div>
  );
};

export default EstadoList; 