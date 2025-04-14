import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormaPagamentoService from '../../services/FormaPagamentoService';
import { FormaPagamento } from '../../types';
import DataTable from '../../components/DataTable';

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
  const navigate = useNavigate();

  const fetchFormasPagamento = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Modo de desenvolvimento:', process.env.REACT_APP_USE_MOCK_DATA);
      console.log('Buscando formas de pagamento...');
      
      // Usar o serviço que já verifica se está em modo de desenvolvimento
      const data = await FormaPagamentoService.list();
      
      console.log('Formas de pagamento recebidas:', data);
      setFormasPagamento(data);
    } catch (error: any) {
      console.error('Erro ao buscar formas de pagamento:', error);
      
      // Se estiver em modo de desenvolvimento, usar dados mockados em caso de erro
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.warn('Usando dados mockados em caso de erro');
        setFormasPagamento([
          {
            id: 1,
            descricao: 'Dinheiro',
            ativo: true,
            dataCadastro: new Date(),
            ultimaModificacao: new Date()
          },
          {
            id: 2,
            descricao: 'Cartão de Crédito',
            ativo: true,
            dataCadastro: new Date(),
            ultimaModificacao: new Date()
          },
          {
            id: 3,
            descricao: 'Cartão de Débito',
            ativo: true,
            dataCadastro: new Date(),
            ultimaModificacao: new Date()
          }
        ]);
      } else {
        setError('Não foi possível carregar as formas de pagamento. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormasPagamento();
  }, [fetchFormasPagamento]);

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
        
        try {
          await FormaPagamentoService.delete(Number(id));
          await fetchFormasPagamento();
          alert('Forma de pagamento excluída com sucesso!');
        } catch (deleteError: any) {
          console.error('Erro específico ao excluir forma de pagamento:', deleteError);
          
          // Se estiver em modo de desenvolvimento, continuar mesmo com erro
          if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
            console.warn('Continuando em modo de desenvolvimento mesmo com erro');
            // Remover o item da lista localmente
            setFormasPagamento(prev => prev.filter(item => item.id !== id));
            alert('Forma de pagamento excluída com sucesso! (Modo de desenvolvimento)');
          } else {
            throw deleteError;
          }
        }
      } catch (error) {
        console.error('Erro ao excluir forma de pagamento:', error);
        alert('Erro ao excluir forma de pagamento. Tente novamente.');
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Lista de Formas de Pagamento"
      />
    </div>
  );
};

export default FormaPagamentoList; 