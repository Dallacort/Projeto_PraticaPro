import React, { useState, useEffect } from 'react';
import { FaPlus, FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import { FormaPagamento } from '../types';
import FormaPagamentoService, { FormaPagamentoInput } from '../services/FormaPagamentoService';
import { toast } from 'react-toastify';
import FormField from './FormField';

interface FormaPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (formaPagamento: FormaPagamento) => void;
  initialFormasPagamento?: FormaPagamento[];
  modalType?: 'padrao' | 'parcela';
  parcelaNumero?: number;
}

const FormaPagamentoModal: React.FC<FormaPagamentoModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialFormasPagamento = [],
  modalType = 'padrao',
  parcelaNumero
}) => {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>(initialFormasPagamento);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<FormaPagamento | null>(null);
  
  const [formData, setFormData] = useState<FormaPagamentoInput>({
    nome: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchFormasPagamento();
      setSelectedFormaPagamento(null);
      setShowForm(false);
      setSearchTerm('');
      setFormData({ nome: '', descricao: '', ativo: true });
    }
  }, [isOpen]);

  const fetchFormasPagamento = async () => {
    setLoading(true);
    try {
      const data = await FormaPagamentoService.listAtivos();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      toast.error('Erro ao carregar formas de pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFormasPagamento = formasPagamento.filter(
    forma => forma.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
             forma.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    
    if (!formData.nome.trim() || !formData.descricao.trim()) {
      toast.error('Nome e Descrição são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const novaFormaPagamento = await FormaPagamentoService.create(formData);
      toast.success('Forma de pagamento cadastrada com sucesso!');
      onSelect(novaFormaPagamento);
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar forma de pagamento:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao cadastrar forma de pagamento.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectClick = (forma: FormaPagamento) => {
    setSelectedFormaPagamento(forma);
  };

  const handleConfirmSelection = () => {
    if (selectedFormaPagamento) {
      onSelect(selectedFormaPagamento);
      onClose();
    }
  };
  
  const getModalHeaderTitle = () => {
    if (modalType === 'padrao') return 'Selecionar Forma de Pagamento Padrão';
    return `Selecionar Forma de Pagamento - Parcela ${parcelaNumero || ''}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh]"> 
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">{getModalHeaderTitle()}</h2>
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
                      placeholder="Buscar por nome ou descrição..."
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
                    <span>Nova Forma de Pagamento</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredFormasPagamento.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredFormasPagamento.map((forma) => (
                            <tr
                              key={forma.id}
                              onClick={() => handleSelectClick(forma)}
                              className={`cursor-pointer hover:bg-gray-100 ${selectedFormaPagamento?.id === forma.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{forma.nome}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{forma.descricao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center text-gray-500 py-10">Nenhuma forma de pagamento encontrada.</div>
                    )}
                  </div>
                )}
              </> 
            ) : ( 
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Nova Forma de Pagamento</h3>
                  <label className="flex items-center cursor-pointer">
                    <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="ativo"
                        id="ativoNovaFormaPagamento"
                        checked={formData.ativo}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </div>
                  </label>
                </div>

                <FormField
                  label="Nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Cartão de Crédito"
                />
                <FormField
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Visa, Master (até 12x)"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  setFormData({ nome: '', descricao: '', ativo: true });
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none"
            >
              {showForm ? 'Cancelar Cadastro' : 'Cancelar'} 
            </button>
            {!showForm ? (
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedFormaPagamento || loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${selectedFormaPagamento && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Confirmar Seleção
              </button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={saving || loading} 
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {saving ? <FaSpinner className="animate-spin mr-2 inline" /> : null}
                Salvar Nova Forma
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FormaPagamentoModal; 