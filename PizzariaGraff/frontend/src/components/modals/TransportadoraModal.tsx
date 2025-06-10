import React, { useState, useEffect, useCallback } from 'react';
import { getTransportadoras } from '../../services/transportadoraService';
import { Transportadora } from '../../types';
import { FaSpinner, FaSearch, FaTimes, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface TransportadoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (transportadora: Transportadora) => void;
}

const TransportadoraModal: React.FC<TransportadoraModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);

  const fetchTransportadoras = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransportadoras();
      setTransportadoras(data);
    } catch (error) {
      console.error('Erro ao buscar transportadoras:', error);
      toast.error('Erro ao carregar transportadoras.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTransportadoras();
      setSelectedTransportadora(null);
      setSearchTerm('');
    }
  }, [isOpen, fetchTransportadoras]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredTransportadoras = transportadoras.filter(transportadora =>
    transportadora.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transportadora.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transportadora.cnpj && transportadora.cnpj.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transportadora.email && transportadora.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectTransportadoraRow = (transportadora: Transportadora) => {
    setSelectedTransportadora(transportadora);
  };

  const handleConfirmSelection = () => {
    if (selectedTransportadora) {
      onSelect(selectedTransportadora);
      onClose();
    }
  };

  const handleNovaTransportadora = () => {
    // Navegar para a tela de criação de transportadora
    window.open('/transportadoras/novo', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            Selecionar Transportadora
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
                placeholder="Buscar transportadora por razão social, nome fantasia, CNPJ ou email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleNovaTransportadora}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
            >
              <FaPlus />
              <span>Nova Transportadora</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : (
            <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
              {filteredTransportadoras.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Fantasia</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransportadoras.map((transportadora) => (
                      <tr
                        key={transportadora.id}
                        onClick={() => handleSelectTransportadoraRow(transportadora)}
                        className={`cursor-pointer hover:bg-gray-100 ${selectedTransportadora?.id === transportadora.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{transportadora.razaoSocial}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transportadora.nomeFantasia}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transportadora.cnpj}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transportadora.telefone}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transportadora.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transportadora.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transportadora.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma transportadora encontrada.</p>
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
            disabled={!selectedTransportadora}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Selecionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportadoraModal; 