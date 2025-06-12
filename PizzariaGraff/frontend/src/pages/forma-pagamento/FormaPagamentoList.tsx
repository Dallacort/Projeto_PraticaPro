import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormaPagamentoService from '../../services/FormaPagamentoService';
import { FormaPagamento } from '../../types';
import DataTable from '../../components/DataTable';
import FormaPagamentoViewModal from '../../components/modals/FormaPagamentoViewModal';
import { toast } from 'react-toastify';

// Define a interface Column localmente
interface Column<T> {
  header: string;
  accessor: keyof T | string;
  width?: string;
  cell?: (value: any, row?: T) => React.ReactNode;
}

const FormaPagamentoList: React.FC = () => {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<{ [key: string]: boolean }>({});
  
  // Estados para o modal de visualização
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFormaPagamentoView, setSelectedFormaPagamentoView] = useState<FormaPagamento | null>(null);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  
  const navigate = useNavigate();

  const fetchFormasPagamento = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando formas de pagamento...');
      
      // Usar o serviço que já verifica se está em modo de desenvolvimento
      const data = await FormaPagamentoService.list();
      
      console.log('Formas de pagamento recebidas:', data);
      setFormasPagamento(data);
    } catch (error: any) {
      console.error('Erro ao buscar formas de pagamento:', error);
      setError('Não foi possível carregar as formas de pagamento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormasPagamento();
  }, [fetchFormasPagamento]);

  const handleView = async (id: string | number) => {
    setViewModalLoading(true);
    setIsViewModalOpen(true);
    try {
      const formaPagamentoData = await FormaPagamentoService.getById(Number(id));
      setSelectedFormaPagamentoView(formaPagamentoData);
    } catch (err) {
      console.error('Erro ao buscar forma de pagamento para visualização:', err);
      toast.error('Erro ao carregar detalhes da forma de pagamento.');
      setIsViewModalOpen(false);
    } finally {
      setViewModalLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedFormaPagamentoView(null);
  };

  const handleEdit = (id: string | number) => {
    navigate(`/formas-pagamento/${id}`);
  };

  const handleCreate = () => {
    navigate('/formas-pagamento/novo');
  };

  const handleDelete = async (id: string | number) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta forma de pagamento?');
    
    if (confirmDelete) {
      try {
        const idStr = id.toString();
        setDeleteLoading(prev => ({ ...prev, [idStr]: true }));
        console.log('Excluindo forma de pagamento com ID:', id);
        
        await FormaPagamentoService.delete(Number(id));
        await fetchFormasPagamento();
        toast.success('Forma de pagamento excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir forma de pagamento:', error);
        toast.error('Erro ao excluir forma de pagamento. Tente novamente.');
      } finally {
        setDeleteLoading(prev => ({ ...prev, [id.toString()]: false }));
      }
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'w-20'
    },
    {
      header: 'Nome',
      accessor: 'nome'
    },
    {
      header: 'Descrição',
      accessor: 'descricao'
    },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: FormaPagamento) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Formas de Pagamento</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Forma de Pagamento
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={formasPagamento}
        loading={loading}
        emptyMessage="Nenhuma forma de pagamento encontrada."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Lista de Formas de Pagamento"
      />

      <FormaPagamentoViewModal 
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        formaPagamento={selectedFormaPagamentoView}
        loading={viewModalLoading}
      />
    </div>
  );
};

export default FormaPagamentoList; 