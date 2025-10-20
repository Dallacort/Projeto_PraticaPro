import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotasSaida } from '../../services/notaSaidaService';
import { NotaSaida } from '../../types';
import DataTable from '../../components/DataTable';
import { NotaSaidaViewModal } from '../../components/modals';
import { FaPlus } from 'react-icons/fa';

const NotaSaidaList: React.FC = () => {
  const navigate = useNavigate();
  const [notas, setNotas] = useState<NotaSaida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNota, setSelectedNota] = useState<NotaSaida | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadNotas();
  }, []);

  const loadNotas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotasSaida();
      setNotas(data);
    } catch (err) {
      console.error('Erro ao carregar notas:', err);
      setError('Erro ao carregar as notas de saída. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (nota: NotaSaida) => {
    setSelectedNota(nota);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedNota(null);
  };

  const handleUpdateNota = () => {
    loadNotas(); // Recarregar a lista após atualização
  };

  // Função para formatar data no padrão brasileiro
  const formatDateBR = (dateString: string | undefined) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const columns = [
    { header: 'Modelo', accessor: 'modelo' },
    { header: 'Série', accessor: 'serie' },
    { header: 'Número', accessor: 'numero' },
    { 
      header: 'Cliente',
      accessor: 'clienteNome',
      cell: (item: NotaSaida) => item.clienteNome || '-'
    },
    { 
      header: 'Data Emissão',
      accessor: 'dataEmissao',
      cell: (item: NotaSaida) => formatDateBR(item.dataEmissao)
    },
    { 
      header: 'Valor Total',
      accessor: 'valorTotal',
      cell: (item: NotaSaida) => `R$ ${parseFloat(String(item.valorTotal || 0)).toFixed(2).replace('.', ',')}`
    },
    { 
      header: 'Situação',
      accessor: 'situacao',
      cell: (item: NotaSaida) => {
        const situacao = item.situacao || 'PENDENTE';
        const colors: any = {
          'PENDENTE': 'bg-yellow-100 text-yellow-800',
          'CONFIRMADA': 'bg-green-100 text-green-800',
          'CANCELADA': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[situacao] || 'bg-gray-100 text-gray-800'}`}>
            {situacao}
          </span>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Notas de Saída</h1>
        <button
          onClick={() => navigate('/notas-saida/novo')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Nova Nota
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <DataTable
          data={notas}
          columns={columns}
          onView={(id) => {
            const nota = notas.find(n => `${n.numero}-${n.modelo}-${n.serie}-${n.clienteId}` === id);
            if (nota) handleView(nota);
          }}
          keyExtractor={(item) => `${item.numero}-${item.modelo}-${item.serie}-${item.clienteId}`}
          emptyMessage="Nenhuma nota de saída cadastrada"
        />
      </div>

      {/* Modal de Visualização */}
      {selectedNota && showViewModal && (
        <NotaSaidaViewModal
          nota={selectedNota}
          isOpen={showViewModal}
          onClose={handleCloseModal}
          onUpdate={handleUpdateNota}
        />
      )}
      
    </div>
  );
};

export default NotaSaidaList;

