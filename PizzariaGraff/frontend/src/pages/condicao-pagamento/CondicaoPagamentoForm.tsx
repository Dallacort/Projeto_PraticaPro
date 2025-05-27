import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CondicaoPagamento, FormaPagamento, ParcelaCondicaoPagamento } from '../../types';
import CondicaoPagamentoService, { CondicaoPagamentoInput } from '../../services/condicaoPagamentoService';
import FormaPagamentoService from '../../services/FormaPagamentoService';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import Icon from '../../components/Icon';
import { FaPlus, FaTrash, FaSpinner, FaSearch, FaArrowLeft } from 'react-icons/fa';
import FormaPagamentoModal from '../../components/FormaPagamentoModal';

interface CondicaoPagamentoFormProps {
  mode?: 'edit' | 'view';
}

const CondicaoPagamentoForm: React.FC<CondicaoPagamentoFormProps> = ({ mode = 'edit' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isViewMode = mode === 'view';

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
  
  // Estado para armazenar dados da entidade original, incluindo datas
  const [entityData, setEntityData] = useState<{
    dataCadastro?: string;
    ultimaModificacao?: string;
  }>({});

  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormaPagamentoModalOpen, setIsFormaPagamentoModalOpen] = useState(false);
  const [currentParcelaIndex, setCurrentParcelaIndex] = useState<number | null>(null);
  const [isFormaPagamentoPadraoModal, setIsFormaPagamentoPadraoModal] = useState(false);

  const fetchFormasPagamento = useCallback(async () => {
    console.log('Iniciando fetchFormasPagamento');
    try {
      console.log('Antes de chamar FormaPagamentoService.listAtivos()');
      const data = await FormaPagamentoService.listAtivos();
      console.log('Formas de pagamento recebidas:', data);
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      toast.error('Erro ao carregar formas de pagamento');
    }
  }, []);

  useEffect(() => {
    // Adicionar uma chamada direta para testar
    console.log('Testando serviço diretamente:');
    FormaPagamentoService.listAtivos()
      .then(data => console.log('Teste direto - Formas de pagamento:', data))
      .catch(error => console.error('Teste direto - Erro:', error));
    
    const fetchData = async () => {
        setLoading(true);
        try {
        await fetchFormasPagamento();
        
        if (id && id !== 'novo') {
          const data = await CondicaoPagamentoService.getById(Number(id));
          console.log('Dados da condição carregada:', data); // Adicionar log para debug
          console.log('formaPagamentoPadraoId recebido:', data.formaPagamentoPadraoId);
          
          // Guardar as datas no estado separado
          setEntityData({
            dataCadastro: data.dataCadastro,
            ultimaModificacao: data.ultimaModificacao
          });
          
          // Garante que formaPagamentoPadraoId não seja undefined
          const formaPagamentoPadraoId = data.formaPagamentoPadraoId !== undefined ? 
            data.formaPagamentoPadraoId : 
            null;
            
          setFormData({
            condicaoPagamento: data.condicaoPagamento,
            numeroParcelas: data.numeroParcelas,
            diasPrimeiraParcela: data.diasPrimeiraParcela,
            diasEntreParcelas: data.diasEntreParcelas,
            percentualJuros: data.percentualJuros || 0,
            percentualMulta: data.percentualMulta || 0,
            percentualDesconto: data.percentualDesconto || 0,
            formaPagamentoPadraoId: formaPagamentoPadraoId,
            parcelas: data.parcelas || [],
            ativo: data.ativo
          });
          
          // Log para debug
          console.log('formaPagamentoPadraoId definido no formulário:', formaPagamentoPadraoId);
        } else {
          // Para novo registro, inicializa pelo menos uma parcela
          setFormData(prev => ({
            ...prev,
            parcelas: [
              {
                numero: 1,
                dias: 0,
                percentual: 100,
                formaPagamentoId: null
              }
            ]
          }));
        }
        } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
        } finally {
          setLoading(false);
      }
    };

    fetchData();
  }, [id, fetchFormasPagamento]);

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
    
    // Atualizar o estado com o novo valor
    setFormData(prev => {
      const updatedData = { ...prev, [name]: newValue };
      
      // Se estiver alterando a forma de pagamento padrão, buscar a descrição
      if (name === 'formaPagamentoPadraoId' && newValue) {
        const formaPagamentoSelecionada = formasPagamento.find(fp => fp.id === newValue);
        if (formaPagamentoSelecionada) {
          // Podemos armazenar a descrição separadamente se necessário
          console.log(`Forma de pagamento padrão selecionada: ${formaPagamentoSelecionada.descricao}`);
        }
      }
      
      // Verificar se o campo alterado afeta as parcelas
      const camposQueAfetamParcelas = [
        'numeroParcelas', 
        'diasPrimeiraParcela', 
        'diasEntreParcelas', 
        'formaPagamentoPadraoId'
      ];
      
      // Se algum dos campos que afetam as parcelas foi alterado e temos número de parcelas válido
      if (camposQueAfetamParcelas.includes(name) && updatedData.numeroParcelas > 0) {
        // Criar objeto temporário com os dados atualizados para gerar parcelas
        const tempCondicao: CondicaoPagamento = {
          ...updatedData,
          id: parseInt(id || '0'), // Usar o ID atual ou 0 para novas condições
          ativo: updatedData.ativo
        };
        
        // Se estiver alterando a forma de pagamento padrão, incluir a descrição no objeto temporário
        if (name === 'formaPagamentoPadraoId' && newValue) {
          const formaPagamentoSelecionada = formasPagamento.find(fp => fp.id === newValue);
          if (formaPagamentoSelecionada) {
            tempCondicao.formaPagamentoPadrao = formaPagamentoSelecionada;
          }
        }
        
        // Usar o CondicaoPagamentoService para gerar parcelas
        const novasParcelas = CondicaoPagamentoService.generateParcelas(tempCondicao);
        
        // Preservar as formas de pagamento das parcelas existentes se possível
        if (prev.parcelas && Array.isArray(prev.parcelas) && prev.parcelas.length > 0) {
          novasParcelas.forEach((novaParcela, index) => {
            // Se existe uma parcela correspondente no array anterior, tentar manter a forma de pagamento
            if (index < prev.parcelas!.length) {
              const parcelaAnterior = prev.parcelas![index];
              if (parcelaAnterior.formaPagamentoId) {
                novaParcela.formaPagamentoId = parcelaAnterior.formaPagamentoId;
                
                // Manter a descrição da forma de pagamento também
                const formaPagamento = formasPagamento.find(fp => fp.id === parcelaAnterior.formaPagamentoId);
                if (formaPagamento) {
                  novaParcela.formaPagamentoDescricao = formaPagamento.descricao;
                } else if (parcelaAnterior.formaPagamentoDescricao) {
                  novaParcela.formaPagamentoDescricao = parcelaAnterior.formaPagamentoDescricao;
                }
              }
            }
          });
        }
        
        // Atualizar com as novas parcelas
        return { ...updatedData, parcelas: novasParcelas };
      }
    
    // Limpar erro ao editar campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
      
      return updatedData;
    });
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
      // Verificar se já existe alguma parcela para usar como base
      const ultimaParcela = prev.parcelas.length > 0 
        ? prev.parcelas[prev.parcelas.length - 1] 
        : null;
      
      const novaParcela: ParcelaCondicaoPagamento = {
        numero: prev.parcelas.length + 1,
        dias: ultimaParcela 
          ? ultimaParcela.dias + (prev.diasEntreParcelas || 30) 
          : (prev.diasPrimeiraParcela || 0),
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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.condicaoPagamento?.trim()) {
      errors.condicaoPagamento = "Condição de pagamento é obrigatória";
    }
    
    if (!formData.numeroParcelas || formData.numeroParcelas <= 0) {
      errors.numeroParcelas = "Número de parcelas deve ser maior que zero";
    }
    
    if (formData.diasPrimeiraParcela < 0) {
      errors.diasPrimeiraParcela = "Dias para primeira parcela não pode ser negativo";
    }
    
    if (formData.diasEntreParcelas < 0) {
      errors.diasEntreParcelas = "Dias entre parcelas não pode ser negativo";
    }
    
    // Verificar parcelas
    if (!formData.parcelas || formData.parcelas.length === 0) {
      errors.parcelas = "É necessário pelo menos uma parcela";
    } else {
      let totalPercent = 0;
      formData.parcelas.forEach((parcela, index) => {
        totalPercent += parcela.percentual;
        if (!parcela.numero || parcela.numero <= 0) {
          errors[`parcelas[${index}].numero`] = "Número da parcela deve ser maior que zero";
        }
      });
      
      // Verificar se o total é próximo de 100%
      if (Math.abs(totalPercent - 100) > 0.01) {
        errors.parcelas = `A soma dos percentuais das parcelas deve ser 100%. Atual: ${totalPercent.toFixed(2)}%`;
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(`Erro de validação: ${firstError}`);
      return;
    }
    
    setSaving(true);
    
    try {
      if (id && id !== 'novo') {
        // Atualizar condição existente
        await CondicaoPagamentoService.update(Number(id), formData);
        toast.success('Condição de pagamento atualizada com sucesso!');
      } else {
        // Criar nova condição
        await CondicaoPagamentoService.create(formData);
        toast.success('Condição de pagamento criada com sucesso!');
      }
      
      // Redirecionar para a lista após salvar
      navigate('/condicoes-pagamento');
    } catch (error: any) {
      // Tratar mensagens de erro específicas
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar condição de pagamento';
      toast.error(errorMessage);
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  // Funções para abrir modal para forma de pagamento padrão
  const handleOpenFormaPagamentoPadraoModal = () => {
    setIsFormaPagamentoPadraoModal(true);
    setIsFormaPagamentoModalOpen(true);
    setCurrentParcelaIndex(null);
  };

  // Função para abrir modal para forma de pagamento de parcela
  const handleOpenParcelaFormaPagamentoModal = (index: number) => {
    setIsFormaPagamentoPadraoModal(false);
    setIsFormaPagamentoModalOpen(true);
    setCurrentParcelaIndex(index);
  };

  // Função para selecionar forma de pagamento do modal
  const handleSelectFormaPagamento = (formaPagamento: FormaPagamento) => {
    if (isFormaPagamentoPadraoModal) {
      // Atualizar forma de pagamento padrão diretamente no estado
      setFormData(prev => ({
        ...prev,
        formaPagamentoPadraoId: formaPagamento.id
      }));
      
      // Verificar se o campo afeta as parcelas
      const tempCondicao: CondicaoPagamento = {
        ...formData,
        id: parseInt(id || '0'),
        ativo: formData.ativo,
        formaPagamentoPadraoId: formaPagamento.id,
        formaPagamentoPadrao: formaPagamento
      };
      
      // Se temos parcelas, atualizar com a nova forma de pagamento padrão
      if (formData.numeroParcelas > 0) {
        const novasParcelas = CondicaoPagamentoService.generateParcelas(tempCondicao);
        
        // Preservar as formas de pagamento das parcelas existentes
        if (formData.parcelas && formData.parcelas.length > 0) {
          novasParcelas.forEach((novaParcela, index) => {
            // Aplicar a nova forma de pagamento para todas as parcelas
            novaParcela.formaPagamentoId = formaPagamento.id;
            novaParcela.formaPagamentoDescricao = formaPagamento.descricao;
            
            // Manter outros dados da parcela como número e dias
            if (index < formData.parcelas.length) {
              const parcelaAnterior = formData.parcelas[index];
              novaParcela.numero = parcelaAnterior.numero;
              novaParcela.dias = parcelaAnterior.dias;
            }
          });
        }
        
        setFormData(prev => ({
          ...prev,
          formaPagamentoPadraoId: formaPagamento.id,
          parcelas: novasParcelas
        }));
      }
    } else if (currentParcelaIndex !== null) {
      // Atualizar forma de pagamento da parcela
      handleParcelaChange(currentParcelaIndex, 'formaPagamentoId', formaPagamento.id.toString());
    }
    
    // Fechar o modal após a seleção
    setIsFormaPagamentoModalOpen(false);
  };

  // Função para fechar o modal
  const handleCloseFormaPagamentoModal = () => {
    setIsFormaPagamentoModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-primary">
          <Icon IconComponent={FaSpinner} size={24} spinning />
        </div>
      </div>
    );
  }
  
  // Adicionar log para debug
  console.log('Estado atual de formasPagamento:', formasPagamento);

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-4xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isViewMode ? 'Visualizar' : id && id !== 'novo' ? 'Editar' : 'Nova'} Condição de Pagamento
        </h1>
        {isViewMode && (
          <button
            type="button"
            onClick={() => navigate('/condicoes-pagamento')}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none flex items-center"
          >
            <FaArrowLeft className="mr-1" /> Voltar
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-4 flex justify-center items-center">
          <span className="inline-flex items-center">
            <FaSpinner className="animate-spin mr-2" />
            Carregando...
          </span>
        </div>
      ) : (
        <form onSubmit={isViewMode ? (e) => e.preventDefault() : handleSubmit} className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados básicos */}
            <div className="col-span-1 md:col-span-2 border-b pb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Dados Básicos</h2>
                {!isViewMode && (
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="ativo"
                          checked={formData.ativo}
                          onChange={handleChange}
                          className="sr-only"
                          disabled={isViewMode}
                        />
                        <div className={`block w-14 h-8 rounded-full ${formData.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${formData.ativo ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                )}
                {isViewMode && (
                  <span className={`px-2 py-1 rounded text-xs ${formData.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {formData.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="condicaoPagamento"
                  label="Condição de Pagamento"
                  placeholder="Digite a condição de pagamento"
                  value={formData.condicaoPagamento || ''}
                  onChange={handleChange}
                  required
                  error={errors.condicaoPagamento}
                  disabled={isViewMode}
                />
                
                <FormField
                  name="numeroParcelas"
                  label="Número de Parcelas"
                  type="number"
                  value={formData.numeroParcelas || 1}
                  onChange={handleChange}
                  required
                  error={errors.numeroParcelas}
                  disabled={isViewMode}
                />
                
                <FormField
                  name="diasPrimeiraParcela"
                  label="Dias para 1ª Parcela"
                  type="number"
                  value={formData.diasPrimeiraParcela || 0}
                  onChange={handleChange}
                  error={errors.diasPrimeiraParcela}
                  disabled={isViewMode}
                />
                
                <FormField
                  name="diasEntreParcelas"
                  label="Dias Entre Parcelas"
                  type="number"
                  value={formData.diasEntreParcelas || 0}
                  onChange={handleChange}
                  disabled={formData.numeroParcelas <= 1 || isViewMode}
                  error={errors.diasEntreParcelas}
                />
                
                <FormField
                  name="percentualJuros"
                  label="Percentual de Juros (%)"
                  type="number"
                  value={formData.percentualJuros || 0}
                  onChange={handleChange}
                  step="0.01"
                  error={errors.percentualJuros}
                  disabled={isViewMode}
                />
                
                <FormField
                  name="percentualMulta"
                  label="Percentual de Multa (%)"
                  type="number"
                  value={formData.percentualMulta || 0}
                  onChange={handleChange}
                  step="0.01"
                  error={errors.percentualMulta}
                  disabled={isViewMode}
                />
                
                <FormField
                  name="percentualDesconto"
                  label="Percentual de Desconto (%)"
                  type="number"
                  value={formData.percentualDesconto || 0}
                  onChange={handleChange}
                  step="0.01"
                  error={errors.percentualDesconto}
                  disabled={isViewMode}
                />
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento Padrão
                  </label>
                  {!isViewMode ? (
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
                  ) : (
                    <div className="flex-1 border border-gray-300 rounded-md p-2 bg-gray-50">
                      {formData.formaPagamentoPadraoId ? 
                        formasPagamento.find(f => f.id === formData.formaPagamentoPadraoId)?.descricao || 'Forma não encontrada'
                        : 
                        <span className="text-gray-500">Nenhuma forma de pagamento selecionada</span>
                      }
                    </div>
                  )}
                  {errors.formaPagamentoPadraoId && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.formaPagamentoPadraoId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Parcelas */}
            <div className="col-span-1 md:col-span-2 border-b pb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Parcelas</h2>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={addParcela}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none flex items-center"
                    disabled={isViewMode}
                  >
                    <FaPlus className="mr-1" /> Adicionar Parcela
                  </button>
                )}
              </div>
              
              {errors.parcelas && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                  <p>{errors.parcelas}</p>
                </div>
              )}
              
              {formData.parcelas && formData.parcelas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nº
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dias
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentual (%)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Forma de Pagamento
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.parcelas.map((parcela, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="number"
                              value={parcela.numero}
                              onChange={(e) => handleParcelaChange(index, 'numero', e.target.value)}
                              className="block w-16 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="1"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="number"
                              value={parcela.dias}
                              onChange={(e) => handleParcelaChange(index, 'dias', e.target.value)}
                              className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="number"
                              value={parcela.percentual}
                              onChange={(e) => handleParcelaChange(index, 'percentual', e.target.value)}
                              className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              step="0.01"
                              min="0"
                              max="100"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {!isViewMode ? (
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
                            ) : (
                              <div className="flex-1 border border-gray-300 rounded-md p-2 bg-gray-50 max-w-xs truncate">
                                {parcela.formaPagamentoId ? 
                                  (formasPagamento.find(f => f.id === parcela.formaPagamentoId)?.descricao || 'Forma não encontrada')
                                  : 
                                  <span className="text-gray-500">Nenhuma forma selecionada</span>
                                }
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {!isViewMode && (
                              <button
                                type="button"
                                onClick={() => removeParcela(index)}
                                className="text-red-600 hover:text-red-900"
                                disabled={formData.parcelas.length <= 1 || isViewMode}
                              >
                                <FaTrash />
                              </button>
                            )}
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
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <div className="flex-1 text-sm text-gray-500">
              {id && id !== 'novo' && (
                <div className="flex flex-col">
                  <span className="font-medium mb-1">Informações do Registro:</span>
                  {entityData.dataCadastro && (
                    <span className="mb-1 ml-2">Cadastrado em: {new Date(entityData.dataCadastro).toLocaleDateString('pt-BR')}</span>
                  )}
                  {entityData.ultimaModificacao && (
                    <span className="ml-2">Última modificação: {new Date(entityData.ultimaModificacao).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate('/condicoes-pagamento')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              {isViewMode ? 'Voltar' : 'Cancelar'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                disabled={saving}
              >
                {saving ? (
                  <span className="inline-flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar'
                )}
              </button>
            )}
          </div>
        </form>
      )}

      {/* Modal de Forma de Pagamento */}
      {!isViewMode && (
        <FormaPagamentoModal 
          isOpen={isFormaPagamentoModalOpen}
          onClose={handleCloseFormaPagamentoModal}
          onSelect={handleSelectFormaPagamento}
          initialFormasPagamento={formasPagamento}
          modalType={isFormaPagamentoPadraoModal ? 'padrao' : 'parcela'}
          parcelaNumero={currentParcelaIndex !== null ? formData.parcelas[currentParcelaIndex]?.numero : undefined}
        />
      )}
    </div>
  );
};

export default CondicaoPagamentoForm; 