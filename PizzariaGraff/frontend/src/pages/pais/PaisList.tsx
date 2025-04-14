import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { getPaises, deletePais } from '../../services/paisService';
import { Pais } from '../../types';

const PaisList: React.FC = () => {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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
    // Use replace para forçar um recarregamento completo da página e garantir que o componente seja corretamente inicializado
    window.location.href = '/paises/novo';
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir este país?')) {
      try {
        const idString = String(id);
        setDeleteLoading(idString);
        await deletePais(idString);
        setPaises(paises.filter(p => p.id !== idString));
        alert('País excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir país:', err);
        alert('Erro ao excluir país. Verifique se não há registros dependentes.');
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
    { header: 'Nome', accessor: 'nome' },
    { header: 'Sigla', accessor: 'sigla' },
    { header: 'Código Telefônico', accessor: 'codigo' },
    { 
      header: 'Data de Cadastro', 
      accessor: 'dataCadastro',
      cell: (item: Pais) => formatDate(item.dataCadastro)
    },
    { 
      header: 'Última Modificação', 
      accessor: 'ultimaModificacao',
      cell: (item: Pais) => formatDate(item.ultimaModificacao)
    },
  ];

  if (error) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Países</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchPaises}
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
        <h1 className="text-2xl font-bold text-gray-800">Países</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchPaises}
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
            Novo País
          </button>
        </div>
      </div>
      
      {paises.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum país cadastrado ainda.</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar Primeiro País
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={paises}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteLoading === null ? handleDelete : undefined}
          emptyMessage="Nenhum país cadastrado"
        />
      )}
    </div>
  );
};

export default PaisList; 