import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import { Pais } from '../types';
import { getPaises, createPais } from '../services/paisService';
import { toast } from 'react-toastify';
import FormField from './FormField';

interface PaisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pais: Pais) => void;
}

const PaisModal: React.FC<PaisModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null);
  
  const [novoPaisData, setNovoPaisData] = useState<Omit<Pais, 'id' | 'dataCadastro' | 'ultimaModificacao'>>({
    nome: '',
    sigla: '',
    codigo: '',
    nacionalidade: '',
    ativo: true
  });

  const fetchPaises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaises();
      setPaises(data);
    } catch (error) {
      console.error('Erro ao carregar países:', error);
      toast.error('Erro ao carregar países.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPaises();
      setSelectedPais(null);
      setShowForm(false);
      setSearchTerm('');
      setNovoPaisData({
        nome: '',
        sigla: '',
        codigo: '',
        nacionalidade: '',
        ativo: true
      });
    }
  }, [isOpen, fetchPaises]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPaises = paises.filter(
    pais => 
      pais.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pais.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pais.codigo && pais.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNovoPaisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let processedValue = type === 'checkbox' ? checked : value;
    if (name === 'sigla') {
      processedValue = String(value).toUpperCase();
    }

    setNovoPaisData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSaveNovoPais = async () => {
    if (!novoPaisData.nome.trim() || !novoPaisData.sigla.trim() || !novoPaisData.codigo.trim()) {
      toast.error('Nome, Sigla e Código do país são obrigatórios.');
      return;
    }
    if (novoPaisData.sigla.length !== 2) {
        toast.error('Sigla deve ter 2 caracteres.');
        return;
    }
    if (novoPaisData.codigo.length > 5) {
        toast.error('Código do país deve ter no máximo 5 caracteres.');
        return;
    }

    setSaving(true);
    try {
      const paisCriado = await createPais(novoPaisData);
      toast.success('País criado com sucesso!');
      onSelect(paisCriado);
      onClose();
    } catch (error) {
      console.error('Erro ao criar país:', error);
      toast.error('Erro ao criar país.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPaisRow = (pais: Pais) => {
    setSelectedPais(pais);
  };

  const handleConfirmSelection = () => {
    if (selectedPais) {
      onSelect(selectedPais);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh]">
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {showForm ? 'Novo País' : 'Selecionar País'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {!showForm ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-full sm:w-2/3">
                    <input
                      type="text"
                      placeholder="Buscar país por nome, sigla ou código..."
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
                    <span>Novo País</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredPaises.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sigla</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPaises.map((pais) => (
                            <tr
                              key={pais.id}
                              onClick={() => handleSelectPaisRow(pais)}
                              className={`cursor-pointer hover:bg-gray-100 ${selectedPais?.id === pais.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{pais.nome}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{pais.sigla}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{pais.codigo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center text-gray-500 py-10">Nenhum país encontrado.</div>
                    )}
                  </div>
                )}
              </> 
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Novo País</h3>
                  <label className="flex items-center cursor-pointer">
                    <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="ativo"
                        id="ativoNovoPais" 
                        checked={novoPaisData.ativo} 
                        onChange={handleNovoPaisChange} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </div>
                  </label>
                </div>

                <FormField
                  label="Nome do País"
                  name="nome"
                  value={novoPaisData.nome}
                  onChange={handleNovoPaisChange}
                  required
                  placeholder="Ex: Brasil"
                />
                <FormField
                  label="Sigla (2 letras)"
                  name="sigla"
                  value={novoPaisData.sigla}
                  onChange={handleNovoPaisChange}
                  required
                  placeholder="Ex: BR"
                />
                <FormField
                  label="Código BACEN / Outro"
                  name="codigo"
                  value={novoPaisData.codigo}
                  onChange={handleNovoPaisChange}
                  required
                  placeholder="Ex: 055"
                />
                <FormField
                  label="Nacionalidade"
                  name="nacionalidade"
                  value={novoPaisData.nacionalidade || ''}
                  onChange={handleNovoPaisChange}
                  placeholder="Ex: Brasileiro"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none"
            >
              Cancelar
            </button>
            {!showForm ? (
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedPais || loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${selectedPais && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Confirmar Seleção
              </button>
            ) : (
              <button
                onClick={handleSaveNovoPais}
                disabled={saving || loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {saving ? <FaSpinner className="animate-spin mr-2 inline" /> : null}
                Salvar Novo País
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaisModal; 