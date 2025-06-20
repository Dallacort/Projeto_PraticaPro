import React, { useEffect, useState } from 'react';
import { FuncaoFuncionario } from '../../types';
import { getFuncoesFuncionarioAtivas } from '../../services/funcaoFuncionarioService';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';

interface FuncaoFuncionarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (funcao: FuncaoFuncionario) => void;
  selectedFuncaoId?: number;
}

const FuncaoFuncionarioModal: React.FC<FuncaoFuncionarioModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedFuncaoId
}) => {
  const [funcoes, setFuncoes] = useState<FuncaoFuncionario[]>([]);
  const [filteredFuncoes, setFilteredFuncoes] = useState<FuncaoFuncionario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFuncao, setSelectedFuncao] = useState<FuncaoFuncionario | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFuncoes();
      setSelectedFuncao(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    filterFuncoes();
  }, [funcoes, searchTerm]);

  const fetchFuncoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFuncoesFuncionarioAtivas();
      setFuncoes(data);
    } catch (err) {
      console.error('Erro ao carregar funções:', err);
      setError('Erro ao carregar funções');
    } finally {
      setLoading(false);
    }
  };

  const filterFuncoes = () => {
    let filtered = funcoes;

    if (searchTerm) {
      filtered = filtered.filter(funcao =>
        funcao.funcaoFuncionario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funcao.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFuncoes(filtered);
  };

  const handleSelectFuncaoRow = (funcao: FuncaoFuncionario) => {
    setSelectedFuncao(funcao);
  };

  const handleConfirmSelection = () => {
    if (selectedFuncao) {
      onSelect(selectedFuncao);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Selecionar Função</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-blue-500" size={24} />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            {error}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carga Horária
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFuncoes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma função encontrada
                    </td>
                  </tr>
                ) : (
                  filteredFuncoes.map((funcao) => (
                    <tr 
                      key={funcao.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedFuncao?.id === funcao.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleSelectFuncaoRow(funcao)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {funcao.funcaoFuncionario || 'Nome não informado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {funcao.cargaHoraria ? `${funcao.cargaHoraria}h/sem` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs ${funcao.requerCNH ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                          {funcao.requerCNH ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs ${funcao.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {funcao.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedFuncao}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Selecionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuncaoFuncionarioModal; 