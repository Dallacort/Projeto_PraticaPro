import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nfe } from '../../types';
import { getNfes, deleteNfe } from '../../services/nfeService';
import TableAdapter from '../../components/TableAdapter';
import { formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { DataTableColumn } from '../../components/DataTable/types';

const NfeList: React.FC = () => {
  const navigate = useNavigate();
  const [nfes, setNfes] = useState<Nfe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNfes();
  }, []);

  const fetchNfes = async () => {
    try {
      const data = await getNfes();
      setNfes(data);
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      toast.error('Erro ao carregar lista de notas fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        await deleteNfe(Number(id));
        toast.success('Nota fiscal excluída com sucesso!');
        fetchNfes();
      } catch (error) {
        console.error('Erro ao excluir nota fiscal:', error);
        toast.error('Erro ao excluir nota fiscal');
      }
    }
  };

  const columns: DataTableColumn[] = [
    {
      header: 'Número',
      accessorKey: 'numeroNf'
    },
    {
      header: 'Data de Emissão',
      accessorKey: 'dataEmissao',
      cell: ({ value }) => formatDate(value)
    },
    {
      header: 'Data de Recebimento',
      accessorKey: 'dataRecebimento',
      cell: ({ value }) => formatDate(value)
    },
    {
      header: 'Valor Total',
      accessorKey: 'valorTotal',
      cell: ({ value }) => {
        const numero = typeof value === 'string' ? parseFloat(value) : value;
        return numero ? `R$ ${numero.toFixed(2)}` : 'R$ 0,00';
      }
    },
    {
      header: 'Cliente',
      accessorKey: 'cliente.nome'
    },
    {
      header: 'Status',
      accessorKey: 'statusNfe.descricao'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notas Fiscais</h1>
        <button
          onClick={() => navigate('/notas-fiscais/novo')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nova Nota Fiscal
        </button>
      </div>

      <TableAdapter
        data={nfes}
        columns={columns}
        onEdit={(id) => navigate(`/notas-fiscais/${id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default NfeList; 