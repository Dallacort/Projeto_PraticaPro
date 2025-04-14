import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import EntityLink from '../../components/EntityLink';
import { getEstados, deleteEstado } from '../../services/estadoService';
import { Estado } from '../../types';

const EstadoList: React.FC = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchEstados = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstados();
  }, []);

  const handleEdit = (id: string | number) => {
    navigate(`/estados/${id}`);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este estado?')) {
      try {
        const numericId = Number(id);
        setDeleteLoading(numericId);
        await deleteEstado(numericId);
        setEstados(estados.filter(estado => estado.id !== numericId));
        alert('Estado excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir estado:', error);
        alert('Erro ao excluir estado. Verifique se não há registros dependentes.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleCreate = () => {
    navigate('/estados/novo');
  };

  const handleRetry = () => {
    fetchEstados();
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome', accessor: 'nome' },
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
            {item.pais.id ? (
              <Link 
                to={`/paises/${item.pais.id}`}
                className="text-blue-600 hover:underline"
              >
                {item.pais.nome || 'Nome não disponível'}
              </Link>
            ) : (
              <span>{item.pais.nome || 'Nome não disponível'}</span>
            )}
          </div>
        );
      }
    }
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Estados</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={handleRetry}
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
        <h1 className="text-2xl font-bold text-gray-800">Estados</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Novo Estado
        </button>
      </div>
      
      {estados.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum estado cadastrado ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeiro Estado
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={estados}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhum estado cadastrado"
        />
      )}
    </div>
  );
};

export default EstadoList; 