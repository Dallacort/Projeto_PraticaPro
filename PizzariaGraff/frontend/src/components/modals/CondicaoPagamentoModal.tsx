import React, { useState, useEffect, useCallback } from 'react';
import { CondicaoPagamento, FormaPagamento, ParcelaCondicaoPagamento } from '../../types';
import CondicaoPagamentoService, { CondicaoPagamentoInput } from '../../services/condicaoPagamentoService';
import FormaPagamentoService from '../../services/FormaPagamentoService';
import FormField from '../FormField';
import FormaPagamentoModal from '../FormaPagamentoModal';
import { FaSpinner, FaSearch, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface CondicaoPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (condicaoPagamento: CondicaoPagamento) => void;
}

const CondicaoPagamentoModal: React.FC<CondicaoPagamentoModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondicao, setSelectedCondicao] = useState<CondicaoPagamento | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState<CondicaoPagamentoInput>({
    condicaoPagamento: '',
    numeroParcelas: 1,
    diasPrimeiraParcela: 0,
    diasEntreParcelas: 0,
    percentualJuros: 0,
    percentualMulta: 0,
    percentualDesconto: 0,
    formaPagamentoPadraoId: null,
    parcelas: [],
    ativo: true
  });
  
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isFormaPagamentoModalOpen, setIsFormaPagamentoModalOpen] = useState(false);
  const [currentParcelaIndex, setCurrentParcelaIndex] = useState<number | null>(null);
  const [isFormaPagamentoPadraoModal, setIsFormaPagamentoPadraoModal] = useState(false);

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

  const fetchFormasPagamento = useCallback(async () => {
    try {
      const data = await FormaPagamentoService.listAtivos();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      toast.error('Erro ao carregar formas de pagamento');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCondicoesPagamento();
      fetchFormasPagamento();
      setSelectedCondicao(null);
      setSearchTerm('');
      setShowForm(false);
      // Resetar formulário
      setFormData({
        condicaoPagamento: '',
        numeroParcelas: 1,
        diasPrimeiraParcela: 0,
        diasEntreParcelas: 0,
        percentualJuros: 0,
        percentualMulta: 0,
        percentualDesconto: 0,
        formaPagamentoPadraoId: null,
        parcelas: [{ numero: 1, dias: 0, percentual: 100, formaPagamentoId: null }],
        ativo: true
      });
    }
  }, [isOpen, fetchCondicoesPagamento, fetchFormasPagamento]);

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

  const handleNovaCondicao = () => {
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const newValue = type === 'checkbox' 
      ? checked 
      : type === 'number' || name.includes('percentual')
        ? parseFloat(value) || 0
        : name === 'formaPagamentoPadraoId' && value === ''
          ? null
          : name === 'formaPagamentoPadraoId'
            ? parseInt(value, 10)
            : value;
    
    setFormData(prev => {
      const updatedData = { ...prev, [name]: newValue };
      
      // Se alterar número de parcelas, regenerar parcelas
      if (name === 'numeroParcelas' && updatedData.numeroParcelas > 0) {
        const tempCondicao: CondicaoPagamento = {
          ...updatedData,
          id: 0,
          ativo: updatedData.ativo
        };
        
        const novasParcelas = CondicaoPagamentoService.generateParcelas(tempCondicao);
        updatedData.parcelas = novasParcelas;
      }
      
      // Se alterar dias para 1ª parcela, atualizar primeira parcela
      if (name === 'diasPrimeiraParcela' && updatedData.parcelas.length > 0) {
        const parcelasAtualizadas = [...updatedData.parcelas];
        parcelasAtualizadas[0] = {
          ...parcelasAtualizadas[0],
          dias: updatedData.diasPrimeiraParcela
        };
        updatedData.parcelas = parcelasAtualizadas;
      }
      
      // Se alterar dias entre parcelas, recalcular dias de todas as parcelas
      if (name === 'diasEntreParcelas' && updatedData.parcelas.length > 1) {
        const parcelasAtualizadas = updatedData.parcelas.map((parcela, index) => {
          if (index === 0) {
            // Primeira parcela usa diasPrimeiraParcela
            return {
              ...parcela,
              dias: updatedData.diasPrimeiraParcela
            };
          } else {
            // Parcelas seguintes: dias da primeira + (número da parcela - 1) * dias entre parcelas
            return {
              ...parcela,
              dias: updatedData.diasPrimeiraParcela + (index * updatedData.diasEntreParcelas)
            };
          }
        });
        updatedData.parcelas = parcelasAtualizadas;
      }
      
      return updatedData;
    });
  };

  const handleSaveNovaCondicao = async () => {
    try {
      setSaving(true);
      
      // Validação básica
      if (!formData.condicaoPagamento.trim()) {
        toast.error('Nome da condição de pagamento é obrigatório');
        return;
      }
      
      if (formData.numeroParcelas <= 0) {
        toast.error('Número de parcelas deve ser maior que zero');
        return;
      }

      // Verificar parcelas
      if (!formData.parcelas || formData.parcelas.length === 0) {
        toast.error('É necessário pelo menos uma parcela');
        return;
      }

      // Verificar se o total dos percentuais é 100%
      let totalPercent = 0;
      formData.parcelas.forEach((parcela) => {
        totalPercent += parcela.percentual;
        if (!parcela.numero || parcela.numero <= 0) {
          toast.error('Número da parcela deve ser maior que zero');
          return;
        }
      });
      
      if (Math.abs(totalPercent - 100) > 0.01) {
        toast.error(`A soma dos percentuais das parcelas deve ser 100%. Atual: ${totalPercent.toFixed(2)}%`);
        return;
      }
      
      const condicaoCriada = await CondicaoPagamentoService.create(formData);
      
      // Atualizar lista
      await fetchCondicoesPagamento();
      
      // Selecionar a condição criada
      setSelectedCondicao(condicaoCriada);
      setShowForm(false);
      
      toast.success('Condição de pagamento criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar condição de pagamento:', error);
      toast.error('Erro ao criar condição de pagamento');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenFormaPagamentoPadraoModal = () => {
    setIsFormaPagamentoPadraoModal(true);
    setIsFormaPagamentoModalOpen(true);
  };

  const handleSelectFormaPagamento = (formaPagamento: FormaPagamento) => {
    if (isFormaPagamentoPadraoModal) {
      setFormData(prev => {
        // Atualizar forma de pagamento padrão
        const updatedData = {
          ...prev,
          formaPagamentoPadraoId: formaPagamento.id
        };
        
        // Aplicar a forma de pagamento padrão a todas as parcelas existentes
        if (updatedData.parcelas && updatedData.parcelas.length > 0) {
          const parcelasAtualizadas = updatedData.parcelas.map(parcela => ({
            ...parcela,
            formaPagamentoId: formaPagamento.id,
            formaPagamentoDescricao: formaPagamento.descricao
          }));
          updatedData.parcelas = parcelasAtualizadas;
        }
        
        return updatedData;
      });
      setIsFormaPagamentoPadraoModal(false);
    } else if (currentParcelaIndex !== null) {
      // Atualizar forma de pagamento da parcela específica
      handleParcelaChange(currentParcelaIndex, 'formaPagamentoId', formaPagamento.id);
    }
    setIsFormaPagamentoModalOpen(false);
  };

  const handleCloseFormaPagamentoModal = () => {
    setIsFormaPagamentoModalOpen(false);
    setIsFormaPagamentoPadraoModal(false);
    setCurrentParcelaIndex(null);
  };

  const handleParcelaChange = (index: number, field: keyof ParcelaCondicaoPagamento, value: any) => {
    setFormData(prev => {
      const updatedParcelas = [...prev.parcelas];
      const parcela = { ...updatedParcelas[index] };
      
      // Processar o valor conforme o tipo do campo
      if (field === 'dias' || field === 'numero') {
        parcela[field] = parseInt(value, 10) || 0;
      } else if (field === 'percentual') {
        parcela[field] = parseFloat(value) || 0;
      } else if (field === 'formaPagamentoId') {
        if (value === '') {
          parcela[field] = null;
          parcela.formaPagamentoDescricao = '';
        } else {
          parcela[field] = parseInt(value, 10);
          // Buscar descrição se disponível
          const formaPagamento = formasPagamento.find(fp => fp.id === parseInt(value, 10));
          if (formaPagamento) {
            parcela.formaPagamentoDescricao = formaPagamento.descricao;
          }
        }
      } else {
        // Tratar o campo como uma string para evitar o erro de tipo
        (parcela as any)[field] = value;
      }
      
      updatedParcelas[index] = parcela;
      return { ...prev, parcelas: updatedParcelas };
    });
  };

  const addParcela = () => {
    setFormData(prev => {
      const numeroNovaParcela = prev.parcelas.length + 1;
      
      // Calcular dias para a nova parcela baseado na fórmula correta
      let diasNovaParcela: number;
      if (numeroNovaParcela === 1) {
        // Primeira parcela usa diasPrimeiraParcela
        diasNovaParcela = prev.diasPrimeiraParcela || 0;
      } else {
        // Parcelas seguintes: dias da primeira + (número da parcela - 1) * dias entre parcelas
        diasNovaParcela = (prev.diasPrimeiraParcela || 0) + ((numeroNovaParcela - 1) * (prev.diasEntreParcelas || 0));
      }
      
      const novaParcela: ParcelaCondicaoPagamento = {
        numero: numeroNovaParcela,
        dias: diasNovaParcela,
        percentual: 100 / (prev.parcelas.length + 1),
        formaPagamentoId: prev.formaPagamentoPadraoId || null
      };
      
      // Se temos formaPagamentoPadraoId, buscar a descrição
      if (prev.formaPagamentoPadraoId) {
        const formaPagamento = formasPagamento.find(fp => fp.id === prev.formaPagamentoPadraoId);
        if (formaPagamento) {
          novaParcela.formaPagamentoDescricao = formaPagamento.descricao;
        }
      }
      
      // Redistribuir o percentual entre todas as parcelas
      const novasParcelas = [...prev.parcelas, novaParcela].map((parcela, index, arr) => ({
        ...parcela,
        percentual: 100 / arr.length
      }));
      
      return { ...prev, parcelas: novasParcelas };
    });
  };

  const removeParcela = (index: number) => {
    setFormData(prev => {
      if (prev.parcelas.length <= 1) {
        return prev; // Não permitir remover a última parcela
      }
      
      // Remover a parcela no índice especificado
      const parcelasAtualizadas = prev.parcelas.filter((_, i) => i !== index);
      
      // Atualizar os números das parcelas para manter a sequência
      const parcelasReordenadas = parcelasAtualizadas.map((parcela, i) => ({
        ...parcela,
        numero: i + 1
      }));
      
      // Redistribuir o percentual entre as parcelas restantes
      const percentualPorParcela = 100 / parcelasReordenadas.length;
      const parcelasComPercentualAtualizado = parcelasReordenadas.map((parcela, i, arr) => {
        // Se é a última parcela, ajustar para garantir que a soma seja exatamente 100%
        if (i === arr.length - 1) {
          const somaAnterior = arr.slice(0, -1).reduce((sum, p) => sum + p.percentual, 0);
          return { ...parcela, percentual: 100 - somaAnterior };
        }
        return { ...parcela, percentual: percentualPorParcela };
      });
      
      return { ...prev, parcelas: parcelasComPercentualAtualizado };
    });
  };

  const handleOpenParcelaFormaPagamentoModal = (index: number) => {
    setIsFormaPagamentoPadraoModal(false);
    setIsFormaPagamentoModalOpen(true);
    setCurrentParcelaIndex(index);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            {showForm ? 'Nova Condição de Pagamento' : 'Selecionar Condição de Pagamento'}
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
                    placeholder="Buscar condição de pagamento..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={handleNovaCondicao}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
                >
                  <FaPlus />
                  <span>Nova Condição</span>
                </button>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nenhuma condição de pagamento encontrada.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Título da seção e Toggle Ativo */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Nova Condição de Pagamento</h3>
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </div>
                </label>
              </div>

              {/* Campos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    name="condicaoPagamento"
                    label="Condição de Pagamento"
                    value={formData.condicaoPagamento}
                    onChange={handleChange}
                    required
                    placeholder="Digite a condição de pagamento"
                  />
                </div>

                <FormField
                  name="numeroParcelas"
                  label="Número de Parcelas"
                  type="number"
                  value={formData.numeroParcelas}
                  onChange={handleChange}
                  required
                />

                <FormField
                  name="diasPrimeiraParcela"
                  label="Dias para 1ª Parcela"
                  type="number"
                  value={formData.diasPrimeiraParcela}
                  onChange={handleChange}
                />

                <FormField
                  name="diasEntreParcelas"
                  label="Dias Entre Parcelas"
                  type="number"
                  value={formData.diasEntreParcelas}
                  onChange={handleChange}
                  disabled={formData.numeroParcelas <= 1}
                />

                <FormField
                  name="percentualJuros"
                  label="Percentual de Juros (%)"
                  type="number"
                  value={formData.percentualJuros}
                  onChange={handleChange}
                  step="0.01"
                />

                <FormField
                  name="percentualMulta"
                  label="Percentual de Multa (%)"
                  type="number"
                  value={formData.percentualMulta}
                  onChange={handleChange}
                  step="0.01"
                />

                <FormField
                  name="percentualDesconto"
                  label="Percentual de Desconto (%)"
                  type="number"
                  value={formData.percentualDesconto}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>

              {/* Forma de pagamento padrão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento Padrão
                </label>
                <div 
                  className="flex-1 border border-gray-300 rounded-md p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                  onClick={handleOpenFormaPagamentoPadraoModal}
                >
                  {formData.formaPagamentoPadraoId ? 
                    formasPagamento.find(f => f.id === formData.formaPagamentoPadraoId)?.descricao || 'Forma não encontrada'
                    : 
                    <span className="text-gray-500">Clique para selecionar uma forma de pagamento</span>
                  }
                </div>
              </div>

              {/* Seção de Parcelas */}
              <div className="col-span-1 md:col-span-2 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Parcelas</h3>
                  <button
                    type="button"
                    onClick={addParcela}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none flex items-center text-sm"
                  >
                    <FaPlus className="mr-1" /> Adicionar Parcela
                  </button>
                </div>
                
                {formData.parcelas && formData.parcelas.length > 0 ? (
                  <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nº
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dias
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentual (%)
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Forma de Pagamento
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.parcelas.map((parcela, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <input
                                type="number"
                                value={parcela.numero}
                                onChange={(e) => handleParcelaChange(index, 'numero', e.target.value)}
                                className="block w-16 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <input
                                type="number"
                                value={parcela.dias}
                                onChange={(e) => handleParcelaChange(index, 'dias', e.target.value)}
                                className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <input
                                type="number"
                                value={parcela.percentual}
                                onChange={(e) => handleParcelaChange(index, 'percentual', e.target.value)}
                                className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                step="0.01"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <div 
                                className="flex-1 border border-gray-300 rounded-md p-2 bg-gray-50 max-w-xs truncate cursor-pointer hover:bg-gray-100 transition"
                                onClick={() => handleOpenParcelaFormaPagamentoModal(index)}
                              >
                                {parcela.formaPagamentoId ? 
                                  (formasPagamento.find(f => f.id === parcela.formaPagamentoId)?.descricao || 'Forma não encontrada')
                                  : 
                                  <span className="text-gray-500">Clique para selecionar</span>
                                }
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <button
                                type="button"
                                onClick={() => removeParcela(index)}
                                className="text-red-600 hover:text-red-900"
                                disabled={formData.parcelas.length <= 1}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>Nenhuma parcela configurada.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50">
          {!showForm ? (
            <>
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
            </>
          ) : (
            <>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Voltar
              </button>
              <button
                onClick={handleSaveNovaCondicao}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
              >
                {saving && <FaSpinner className="animate-spin" />}
                <span>Salvar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal de Forma de Pagamento */}
      {isFormaPagamentoModalOpen && (
        <FormaPagamentoModal
          isOpen={isFormaPagamentoModalOpen}
          onClose={handleCloseFormaPagamentoModal}
          onSelect={handleSelectFormaPagamento}
        />
      )}
    </div>
  );
};

export default CondicaoPagamentoModal; 