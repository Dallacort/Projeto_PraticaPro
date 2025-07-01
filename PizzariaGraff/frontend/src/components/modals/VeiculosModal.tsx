import React, { useState, useEffect, useCallback } from 'react';
import { Veiculo } from '../../types';
import { getVeiculos } from '../../services/veiculoService';
import { FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface VeiculosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
  initialSelectedIds: number[];
}

const VeiculosModal: React.FC<VeiculosModalProps> = ({ isOpen, onClose, onConfirm, initialSelectedIds }) => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchVeiculos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVeiculos();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchVeiculos();
      setSearchTerm('');
    }
  }, [isOpen, fetchVeiculos]);

  useEffect(() => {
    setSelectedIds(initialSelectedIds || []);
  }, [initialSelectedIds, isOpen]);


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSelection = (id: number) => {
    setSelectedIds(prevSelectedIds =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter(selectedId => selectedId !== id)
        : [...prevSelectedIds, id]
    );
  };

  const handleConfirmSelection = () => {
    onConfirm(selectedIds);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
          {/* Cabeçalho do Modal */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              Selecionar Veículos
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
                  placeholder="Buscar por placa, modelo ou marca..."
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
                {filteredVeiculos.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVeiculos.map((veiculo) => (
                        <tr
                          key={veiculo.id}
                          onClick={() => handleToggleSelection(veiculo.id!)}
                          className={`cursor-pointer hover:bg-gray-100 ${selectedIds.includes(veiculo.id!) ? 'bg-blue-100' : ''}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(veiculo.id!)}
                              onChange={() => handleToggleSelection(veiculo.id!)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{veiculo.placa}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{veiculo.modelo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{veiculo.marca}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${veiculo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {veiculo.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhum veículo encontrado.</p>
                )}
              </div>
            )}
          </div>

          {/* Rodapé do Modal */}
          <div className="flex justify-end items-center border-t px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VeiculosModal; 