import React, { useState, useEffect, useCallback } from 'react';
import { FuncaoFuncionario } from '../../types';
import { getFuncoesFuncionarioAtivas, createFuncaoFuncionario } from '../../services/funcaoFuncionarioService';
import FormField from '../FormField';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface FuncaoFuncionarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (funcao: FuncaoFuncionario) => void;
}

const FuncaoFuncionarioModal: React.FC<FuncaoFuncionarioModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [funcoes, setFuncoes] = useState<FuncaoFuncionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFuncao, setSelectedFuncao] = useState<FuncaoFuncionario | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [novaFuncaoData, setNovaFuncaoData] = useState({
    funcaoFuncionario: '',
    descricao: '',
    cargaHoraria: '',
    requerCNH: false,
    ativo: true,
  });

  const fetchFuncoes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFuncoesFuncionarioAtivas();
      setFuncoes(data);
    } catch (error) {
      console.error('Erro ao buscar funções:', error);
      toast.error('Erro ao carregar funções.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFuncoes();
      setSelectedFuncao(null);
      setShowForm(false);
      setSearchTerm('');
      setNovaFuncaoData({
        funcaoFuncionario: '',
        descricao: '',
        cargaHoraria: '',
        requerCNH: false,
        ativo: true,
      });
    }
  }, [isOpen, fetchFuncoes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFuncoes = funcoes.filter(funcao =>
    funcao.funcaoFuncionario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcao.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectFuncaoRow = (funcao: FuncaoFuncionario) => {
    setSelectedFuncao(funcao);
  };

  const handleConfirmSelection = () => {
    if (selectedFuncao) {
      onSelect(selectedFuncao);
      onClose();
    }
  };

  const handleNovaFuncaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setNovaFuncaoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveNovaFuncao = async () => {
    if (!novaFuncaoData.funcaoFuncionario.trim()) {
      toast.error('Nome da função é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const funcaoCriada = await createFuncaoFuncionario({
        funcaoFuncionario: novaFuncaoData.funcaoFuncionario,
        descricao: novaFuncaoData.descricao,
        cargaHoraria: novaFuncaoData.cargaHoraria ? Number(novaFuncaoData.cargaHoraria) : null,
        requerCNH: novaFuncaoData.requerCNH,
        ativo: novaFuncaoData.ativo,
        observacao: '',
        salarioBase: null,
      });
      toast.success('Função criada com sucesso!');
      onSelect(funcaoCriada);
      onClose();
    } catch (error) {
      console.error('Erro ao criar função:', error);
      toast.error('Erro ao criar função.');
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            {showForm ? 'Nova Função' : 'Selecionar Função'}
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
                    placeholder="Buscar função por nome..."
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
                  <span>Nova Função</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                </div>
              ) : (
                <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                  {filteredFuncoes.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFuncoes.map((funcao) => (
                          <tr
                            key={funcao.id}
                            onClick={() => handleSelectFuncaoRow(funcao)}
                            className={`cursor-pointer hover:bg-gray-100 ${selectedFuncao?.id === funcao.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{funcao.id}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{funcao.funcaoFuncionario}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nenhuma função encontrada.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Título da seção e Toggle Ativo */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Cadastrar Nova Função</h3>
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="ativo"
                      id="ativoNovaFuncao"
                      checked={novaFuncaoData.ativo}
                      onChange={handleNovaFuncaoChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </div>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Nome da Função"
                  type="text"
                  name="funcaoFuncionario"
                  value={novaFuncaoData.funcaoFuncionario}
                  onChange={handleNovaFuncaoChange}
                  required
                  placeholder="Ex: Gerente, Vendedor, Motorista..."
                />
                
                <FormField
                  label="Carga Horária (horas/semana)"
                  type="number"
                  name="cargaHoraria"
                  value={novaFuncaoData.cargaHoraria}
                  onChange={handleNovaFuncaoChange}
                  placeholder="Ex: 40"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  label="Descrição"
                  type="textarea"
                  name="descricao"
                  value={novaFuncaoData.descricao}
                  onChange={handleNovaFuncaoChange}
                  placeholder="Descrição das responsabilidades..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requerCNH"
                  id="requerCNH"
                  checked={novaFuncaoData.requerCNH}
                  onChange={handleNovaFuncaoChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requerCNH" className="ml-2 block text-sm text-gray-900">
                  Requer CNH
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
                onClick={handleSaveNovaFuncao}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar Função'
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
                disabled={!selectedFuncao}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Selecionar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuncaoFuncionarioModal; 