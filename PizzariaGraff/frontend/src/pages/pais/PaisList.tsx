import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getPaises, deletePais } from '../../services/paisService';
import { Pais } from '../../types';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

const PaisList: React.FC = () => {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPaises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando lista de países...');
      const data = await getPaises();
      console.log('Países recebidos:', data);
      setPaises(data);
    } catch (err) {
      console.error('Erro ao buscar países:', err);
      setError('Não foi possível carregar a lista de países. Tente novamente mais tarde.');
      toast.error('Erro ao carregar lista de países');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('PaisList montado ou location alterada, carregando países...');
    fetchPaises();
  }, [fetchPaises, location.key]);

  const handleEdit = (id: string | number) => {
    navigate(`/paises/${id}`);
  };

  const handleCreate = () => {
    console.log('Redirecionando para criar novo país');
    navigate('/paises/novo');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este país?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(prev => ({ ...prev, [numericId]: true }));
        await deletePais(numericId);
        setPaises(paises.filter(p => p.id !== numericId));
        toast.success('País excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir país:', err);
        toast.error('Erro ao excluir país. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(prev => ({ ...prev, [Number(id)]: false }));
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'País', accessor: 'nome' },
    { header: 'Sigla', accessor: 'sigla' },
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nacionalidade', accessor: 'nacionalidade' },
    {
      header: 'Status',
      accessor: 'ativo',
      cell: (item: Pais) => (
        <span className={`px-2 py-1 rounded text-xs ${item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Países</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo País
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
          data={paises}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Nenhum país cadastrado"
          title="Lista de Países"
        />
      </div>
    </div>
  );
};

export default PaisList; 