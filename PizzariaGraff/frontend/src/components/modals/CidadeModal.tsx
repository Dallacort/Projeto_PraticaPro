import React, { useState, useEffect, useCallback } from 'react';
import { Cidade, Estado } from '../../types';
import { getCidades, createCidade } from '../../services/cidadeService';
import EstadoModal from './EstadoModal';
import FormField from '../FormField';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface CidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cidade: Cidade) => void;
}

const CidadeModal: React.FC<CidadeModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [novaCidadeData, setNovaCidadeData] = useState<Omit<Cidade, 'id' | 'dataCadastro' | 'ultimaModificacao'> & { estadoId?: string | number }>(
    {
      nome: '',
      ativo: true,
      estado: {} as Estado,
      estadoId: undefined
    }
  );
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);

  const fetchCidades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCidades();
      setCidades(data);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast.error('Erro ao carregar cidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCidades();
      setSelectedCidade(null);
      setShowForm(false);
      setSearchTerm('');
      setNovaCidadeData({
        nome: '',
        ativo: true,
        estado: {} as Estado,
        estadoId: undefined
      });
    }
  }, [isOpen, fetchCidades]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCidades = cidades.filter(cidade =>
    cidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cidade.estado?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cidade.estado?.uf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCidadeRow = (cidade: Cidade) => {
    setSelectedCidade(cidade);
  };

  const handleConfirmSelection = () => {
    if (selectedCidade) {
      onSelect(selectedCidade);
      onClose();
    }
  };

  const handleNovaCidadeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setNovaCidadeData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEstadoSelecionado = (estado: Estado) => {
    setNovaCidadeData(prev => ({
      ...prev,
      estado: estado,
      estadoId: estado.id
    }));
    setIsEstadoModalOpen(false);
  };

  const handleSaveNovaCidade = async () => {
    if (!novaCidadeData.nome.trim()) {
      toast.error('Nome da cidade é obrigatório.');
      return;
    }
    if (!novaCidadeData.estado || !novaCidadeData.estadoId) {
      toast.error('Estado é obrigatório para a nova cidade.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...novaCidadeData,
      };
      const cidadeCriada = await createCidade(payload as Omit<Cidade, 'id'>);
      toast.success('Cidade criada com sucesso!');
      onSelect(cidadeCriada);
      onClose();
    } catch (error) {
      console.error('Erro ao criar cidade:', error);
      toast.error('Erro ao criar cidade.');
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh]">
          {/* Cabeçalho do Modal */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {showForm ? 'Nova Cidade' : 'Selecionar Cidade'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>

          {/* Corpo do Modal */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {!showForm ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-full sm:w-2/3">
                    <input
                      type="text"
                      placeholder="Buscar cidade por nome, estado ou UF..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
                  >
                    <FaPlus />
                    <span>Nova Cidade</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredCidades.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UF</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredCidades.map((cidade) => (
                            <tr
                              key={cidade.id}
                              onClick={() => handleSelectCidadeRow(cidade)}
                              className={`cursor-pointer hover:bg-gray-100 ${selectedCidade?.id === cidade.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{cidade.nome}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cidade.estado?.nome || 'N/A'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cidade.estado?.uf || 'N/A'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cidade.estado?.pais?.nome || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Nenhuma cidade encontrada.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Cadastrar Nova Cidade</h3>
                
                <FormField
                  label="Nome da Cidade"
                  name="nome"
                  value={novaCidadeData.nome}
                  onChange={handleNovaCidadeChange}
                  required
                  placeholder="Ex: Curitiba"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <div 
                    onClick={() => setIsEstadoModalOpen(true)} 
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEstadoModalOpen(true)}
                  >
                    <input
                      type="text"
                      readOnly
                      value={novaCidadeData.estado?.nome ? `${novaCidadeData.estado.nome} (${novaCidadeData.estado.uf})` : 'Selecione um estado...'}
                      className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                      placeholder="Selecione um estado..."
                    />
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={novaCidadeData.ativo}
                      onChange={handleNovaCidadeChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Cidade Ativa</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé do Modal */}
          <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50">
            {showForm ? (
              <>
                <button
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSaveNovaCidade}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Cidade'
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={!selectedCidade}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Selecionar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <EstadoModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onSelect={handleEstadoSelecionado}
      />
    </>
  );
};

export default CidadeModal; 