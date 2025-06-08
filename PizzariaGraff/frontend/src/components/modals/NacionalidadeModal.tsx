import React, { useState, useEffect, useCallback } from 'react';
import { getNacionalidades, NacionalidadeResponse, createNacionalidade } from '../../services/nacionalidadeService';
import { Pais } from '../../types';
import PaisModal from '../PaisModal';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface NacionalidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nacionalidade: NacionalidadeResponse) => void;
}

const NacionalidadeModal: React.FC<NacionalidadeModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [nacionalidades, setNacionalidades] = useState<NacionalidadeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNacionalidade, setSelectedNacionalidade] = useState<NacionalidadeResponse | null>(null);
  const [isPaisModalOpen, setIsPaisModalOpen] = useState(false);

  const fetchNacionalidades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNacionalidades();
      setNacionalidades(data);
    } catch (error) {
      console.error('Erro ao buscar nacionalidades:', error);
      toast.error('Erro ao carregar nacionalidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNacionalidades();
      setSelectedNacionalidade(null);
      setSearchTerm('');
    }
  }, [isOpen, fetchNacionalidades]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredNacionalidades = nacionalidades.filter(nacionalidade =>
    nacionalidade.nacionalidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nacionalidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nacionalidade.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nacionalidade.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectNacionalidadeRow = (nacionalidade: NacionalidadeResponse) => {
    setSelectedNacionalidade(nacionalidade);
  };

  const handleConfirmSelection = () => {
    if (selectedNacionalidade) {
      onSelect(selectedNacionalidade);
      onClose();
    }
  };

  const handleOpenPaisModal = () => {
    setIsPaisModalOpen(true);
  };

  const handleClosePaisModal = () => {
    setIsPaisModalOpen(false);
  };

  const handleSelectPais = async (pais: Pais) => {
    setSaving(true);
    try {
      // Criar nacionalidade baseada no país selecionado
      const nacionalidadeCriada = await createNacionalidade(pais);
      
      // Atualizar a lista de nacionalidades
      await fetchNacionalidades();
      
      // Selecionar a nacionalidade recém-criada
      onSelect(nacionalidadeCriada);
      toast.success(`Nacionalidade "${nacionalidadeCriada.nacionalidade}" criada com sucesso!`);
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar nacionalidade:', error);
      toast.error('Erro ao criar nacionalidade. Tente novamente.');
    } finally {
      setSaving(false);
      setIsPaisModalOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            Selecionar Nacionalidade
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
                placeholder="Buscar nacionalidade por nome, país ou código..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleOpenPaisModal}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm disabled:opacity-50"
            >
              {saving ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPlus />
              )}
              <span>Nova Nacionalidade</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : (
            <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
              {filteredNacionalidades.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nacionalidade</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sigla</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNacionalidades.map((nacionalidade) => (
                      <tr
                        key={nacionalidade.id}
                        onClick={() => handleSelectNacionalidadeRow(nacionalidade)}
                        className={`cursor-pointer hover:bg-gray-100 ${selectedNacionalidade?.id === nacionalidade.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nacionalidade.nacionalidade}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{nacionalidade.nome}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{nacionalidade.sigla}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{nacionalidade.codigo}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            nacionalidade.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {nacionalidade.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma nacionalidade encontrada.</p>
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
            disabled={!selectedNacionalidade}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Selecionar
          </button>
        </div>
      </div>

      {/* Modal de País para criar nova nacionalidade */}
      <PaisModal
        isOpen={isPaisModalOpen}
        onClose={handleClosePaisModal}
        onSelect={handleSelectPais}
      />
    </div>
  );
};

export default NacionalidadeModal; 