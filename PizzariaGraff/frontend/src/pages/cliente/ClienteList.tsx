import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getClientes, deleteCliente, getCliente } from '../../services/clienteService';
import { Cliente } from '../../types';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ClienteViewModal from '../../components/modals/ClienteViewModal';

const ClienteList: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClienteView, setSelectedClienteView] = useState<Cliente | null>(null);
  const [viewModalLoading, setViewModalLoading] = useState(false);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Não foi possível carregar a lista de clientes. Tente novamente mais tarde.');
      toast.error('Falha ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes, location.key]);

  const handleView = async (id: string | number) => {
    setViewModalLoading(true);
    setIsViewModalOpen(true);
    try {
      const clienteData = await getCliente(Number(id));
      setSelectedClienteView(clienteData);
    } catch (err) {
      console.error('Erro ao buscar cliente para visualização:', err);
      toast.error('Erro ao carregar detalhes do cliente.');
      setIsViewModalOpen(false);
    } finally {
      setViewModalLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedClienteView(null);
  };

  const handleEdit = (id: string | number) => {
    navigate(`/clientes/${id}`);
  };

  const handleCreate = () => {
    navigate('/clientes/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteCliente(numericId);
        setClientes(clientes.filter(c => c.id !== numericId));
        toast.success('Cliente excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        toast.error('Erro ao excluir cliente. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Nome', 
      accessor: 'cliente',
      cell: (item: Cliente) => (
        <span>{item.cliente || item.nome}</span>
      )
    },
    { 
      header: 'CPF/CNPJ', 
      accessor: 'cpfCpnj',
      cell: (item: Cliente) => (
        <span>{item.cpfCpnj || item.cpfCnpj || 'N/A'}</span>
      )
    },
    { header: 'Telefone', accessor: 'telefone' },
    { header: 'E-mail', accessor: 'email' },
    { 
      header: 'Cidade', 
      accessor: 'cidade.nome',
      cell: (item: Cliente) => (
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
      cell: (item: Cliente) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
        >
          <FaPlus className="mr-2" />
          Novo Cliente
        </button>
      </div>
      
      <div className="flex-grow overflow-auto">
        {clientes.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhum cliente cadastrado ainda.</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center text-sm"
            >
              <FaPlus className="mr-2" />
              Cadastrar Primeiro Cliente
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={clientes}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteLoading === null ? handleDelete : undefined}
            emptyMessage="Nenhum cliente encontrado."
          />
        )}
      </div>

      <ClienteViewModal 
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        cliente={selectedClienteView}
        loading={viewModalLoading}
      />
    </div>
  );
};

export default ClienteList; 