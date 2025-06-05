import React, { useState, useEffect, useCallback } from 'react';
import { CondicaoPagamento } from '../../types';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import { FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface CondicaoPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (condicaoPagamento: CondicaoPagamento) => void;
}

const CondicaoPagamentoModal: React.FC<CondicaoPagamentoModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondicao, setSelectedCondicao] = useState<CondicaoPagamento | null>(null);

  const fetchCondicoesPagamento = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CondicaoPagamentoService.list();
      setCondicoesPagamento(data);
    } catch (error) {
      console.error('Erro ao buscar condições de pagamento:', error);
      toast.error('Erro ao carregar condições de pagamento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCondicoesPagamento();
      setSelectedCondicao(null);
      setSearchTerm('');
    }
  }, [isOpen, fetchCondicoesPagamento]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCondicoes = condicoesPagamento.filter(condicao =>
    condicao.condicaoPagamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condicao.numeroParcelas?.toString().includes(searchTerm.toLowerCase())
  );

  const handleSelectCondicaoRow = (condicao: CondicaoPagamento) => {
    setSelectedCondicao(condicao);
  };

  const handleConfirmSelection = () => {
    if (selectedCondicao) {
      onSelect(selectedCondicao);
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            Selecionar Condição de Pagamento
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full sm:w-2/3">
              <input
                type="text"
                placeholder="Buscar condição de pagamento..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : (
            <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
              {filteredCondicoes.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condição</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelas</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias 1ª Parcela</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias Entre Parcelas</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCondicoes.map((condicao) => (
                      <tr
                        key={condicao.id}
                        onClick={() => handleSelectCondicaoRow(condicao)}
                        className={`cursor-pointer hover:bg-gray-100 ${selectedCondicao?.id === condicao.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{condicao.condicaoPagamento}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{condicao.numeroParcelas || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{condicao.diasPrimeiraParcela || 0} dias</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{condicao.diasEntreParcelas || 0} dias</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${condicao.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {condicao.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma condição de pagamento encontrada.</p>
              )}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedCondicao}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Selecionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CondicaoPagamentoModal; 