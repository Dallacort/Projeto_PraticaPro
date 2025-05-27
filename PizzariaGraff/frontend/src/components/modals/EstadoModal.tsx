import React, { useState, useEffect, useCallback } from 'react';
import { Estado, Pais } from '../../types';
import { getEstados, createEstado } from '../../services/estadoService';
import PaisModal from '../PaisModal'; // Ajustar caminho se PaisModal estiver em /components
import FormField from '../FormField'; // Ajustar caminho se FormField estiver em /components
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface EstadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (estado: Estado) => void;
}

const EstadoModal: React.FC<EstadoModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [novoEstadoData, setNovoEstadoData] = useState<Omit<Estado, 'id' | 'dataCadastro' | 'ultimaModificacao'> & { paisId?: string | number }>(
    {
      nome: '',
      uf: '',
      ativo: true,
      pais: {} as Pais, // Inicializa com um objeto Pais vazio, será preenchido
      paisId: undefined
    }
  );
  const [isPaisModalOpen, setIsPaisModalOpen] = useState(false);

  const fetchEstados = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEstados();
      setEstados(data);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      toast.error('Erro ao carregar estados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchEstados();
      setSelectedEstado(null);
      setShowForm(false); // Resetar para a visualização de lista ao abrir
      setSearchTerm('');
      // Resetar dados do formulário de novo estado
      setNovoEstadoData({
        nome: '',
        uf: '',
        ativo: true,
        pais: {} as Pais,
        paisId: undefined
      });
    }
  }, [isOpen, fetchEstados]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredEstados = estados.filter(estado =>
    estado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estado.uf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEstadoRow = (estado: Estado) => {
    setSelectedEstado(estado);
  };

  const handleConfirmSelection = () => {
    if (selectedEstado) {
      onSelect(selectedEstado);
      onClose();
    }
  };

  const handleNovoEstadoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setNovoEstadoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePaisSelecionado = (pais: Pais) => {
    setNovoEstadoData(prev => ({
      ...prev,
      pais: pais,
      paisId: pais.id
    }));
    setIsPaisModalOpen(false);
  };

  const handleSaveNovoEstado = async () => {
    if (!novoEstadoData.nome.trim() || !novoEstadoData.uf.trim()) {
      toast.error('Nome e UF do estado são obrigatórios.');
      return;
    }
    if (novoEstadoData.uf.length !== 2) {
        toast.error('UF deve ter exatamente 2 caracteres.');
        return;
    }
    if (!novoEstadoData.pais || !novoEstadoData.paisId) {
      toast.error('País é obrigatório para o novo estado.');
      return;
    }

    setSaving(true);
    try {
      // Certifique-se de que o objeto `pais` está completo, se o backend esperar o objeto inteiro
      // Se o backend espera apenas `paisId`, o payload já está correto.
      const payload = {
        ...novoEstadoData,
        uf: novoEstadoData.uf.toUpperCase(),
        // pais: undefined, // Remova se o backend não espera o objeto `pais` aninhado na criação
      };
      const estadoCriado = await createEstado(payload as Omit<Estado, 'id'>);
      toast.success('Estado criado com sucesso!');
      onSelect(estadoCriado); // Seleciona o estado recém-criado
      onClose(); // Fecha o modal principal
    } catch (error) {
      console.error('Erro ao criar estado:', error);
      toast.error('Erro ao criar estado.');
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh]">
          {/* Cabeçalho do Modal */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {showForm ? 'Novo Estado' : 'Selecionar Estado'}
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
                      placeholder="Buscar estado por nome ou UF..."
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
                    <span>Novo Estado</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredEstados.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UF</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredEstados.map((estado) => (
                            <tr
                              key={estado.id}
                              onClick={() => handleSelectEstadoRow(estado)}
                              className={`cursor-pointer hover:bg-gray-100 ${selectedEstado?.id === estado.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{estado.nome}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{estado.uf}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{estado.pais?.nome}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center text-gray-500 py-10">Nenhum estado encontrado.</div>
                    )}
                  </div>
                )}
              </> 
            ) : ( // Formulário de Novo Estado
              <div className="space-y-4">
                {/* Título da seção e Toggle Ativo */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Novo Estado</h3>
                  <label className="flex items-center cursor-pointer">
                    <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="ativo"
                        id="ativoNovoEstado"
                        checked={novoEstadoData.ativo}
                        onChange={handleNovoEstadoChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </div>
                  </label>
                </div>

                <FormField
                  label="Nome do Estado"
                  name="nome"
                  value={novoEstadoData.nome}
                  onChange={handleNovoEstadoChange}
                  required
                  placeholder="Ex: São Paulo"
                />
                <FormField
                  label="UF (Sigla)"
                  name="uf"
                  value={novoEstadoData.uf}
                  onChange={handleNovoEstadoChange}
                  required
                  placeholder="Ex: SP"
                />
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <div 
                    onClick={() => setIsPaisModalOpen(true)}
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setIsPaisModalOpen(true)}
                  >
                    <input 
                        type="text" 
                        readOnly 
                        value={novoEstadoData.pais?.nome ? `${novoEstadoData.pais.nome} (${novoEstadoData.pais.sigla})` : 'Selecione um país...'} 
                        className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                        placeholder="Selecione um país..."
                    />
                    <FaSearch className="text-gray-500" /> 
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé do Modal */}
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
                disabled={!selectedEstado || loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${selectedEstado && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Confirmar Seleção
              </button>
            ) : (
              <button
                onClick={handleSaveNovoEstado}
                disabled={saving || loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {saving ? <FaSpinner className="animate-spin mr-2 inline" /> : null}
                Salvar Novo Estado
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de País (Aninhado) */}
      {isPaisModalOpen && (
        <PaisModal
          isOpen={isPaisModalOpen}
          onClose={() => setIsPaisModalOpen(false)}
          onSelect={handlePaisSelecionado}
        />
      )}
    </>
  );
};

export default EstadoModal; 