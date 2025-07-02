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
// import { formatDate } from '../../utils/dateUtils';

// Função simples para formatar datas
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

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
    
    let newValue: any;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'number') {
      // Tratamento específico para cada campo numérico
      if (name === 'numeroParcelas') {
        const intValue = parseInt(value) || 0;
        newValue = Math.max(1, Math.min(60, intValue)); // Limitar entre 1 e 60 parcelas
      } else if (name === 'diasPrimeiraParcela' || name === 'diasEntreParcelas') {
        const intValue = parseInt(value) || 0;
        newValue = Math.max(0, Math.min(9999, intValue)); // Limitar entre 0 e 9999
      } else {
        newValue = parseFloat(value) || 0;
      }
    } else if (name === 'formaPagamentoPadraoId') {
      newValue = value === '' ? null : parseInt(value, 10);
    } else if (name.includes('percentual')) {
      // Permitir apenas números, vírgula e ponto
      const validInput = /^[0-9,.]$/.test(value[value.length - 1] || '');
      const hasOneDecimalSeparator = (value.match(/[,.]/g) || []).length <= 1;
      
      if (value === '') {
        newValue = 0;
      } else if (validInput && hasOneDecimalSeparator) {
        // Manter o valor como string durante a edição
        newValue = value;
        
        // Se for um número válido, verificar os limites
        const processedValue = value.replace(',', '.');
        if (!isNaN(parseFloat(processedValue))) {
          const floatValue = parseFloat(processedValue);
          if (floatValue < 0 || floatValue > 100) {
            // Se estiver fora dos limites, manter o valor anterior
            newValue = formData[name as keyof typeof formData];
          }
        }
      } else {
        // Se não for um input válido, manter o valor anterior
        newValue = formData[name as keyof typeof formData];
      }
    } else {
      newValue = value;
    }
    
    // Atualizar o estado com o novo valor
    setFormData(prev => {
      const updatedData = { ...prev, [name]: newValue };
      
      // Se estiver alterando a forma de pagamento padrão, buscar a descrição
      if (name === 'formaPagamentoPadraoId' && newValue) {
        const formaPagamentoSelecionada = formasPagamento.find(fp => fp.id === newValue);
        if (formaPagamentoSelecionada) {
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
          id: parseInt(id || '0'),
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
            if (index < prev.parcelas!.length) {
              const parcelaAnterior = prev.parcelas![index];
              if (parcelaAnterior.formaPagamentoId) {
                novaParcela.formaPagamentoId = parcelaAnterior.formaPagamentoId;
                
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
        
        return { ...updatedData, parcelas: novasParcelas };
      }
      
      return updatedData;
    });
    
    // Limpar erros relacionados ao campo editado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleParcelaChange = (index: number, field: keyof ParcelaCondicaoPagamento, value: any) => {
    setFormData(prev => {
      const parcelas = [...prev.parcelas];
      const parcela = { ...parcelas[index] };

      if (field === 'percentual') {
        // Permitir apenas números, vírgula e ponto
        const validInput = /^[0-9,.]$/.test(value[value.length - 1] || '');
        const hasOneDecimalSeparator = (value.match(/[,.]/g) || []).length <= 1;
        
        if (value === '') {
          parcela.percentual = 0;
        } else if (validInput && hasOneDecimalSeparator) {
          // Manter o valor como string durante a edição
          parcela.percentual = value;
          
          // Se for um número válido, verificar os limites
          const processedValue = value.replace(',', '.');
          if (!isNaN(parseFloat(processedValue))) {
            const floatValue = parseFloat(processedValue);
            if (floatValue < 0 || floatValue > 100) {
              // Se estiver fora dos limites, manter o valor anterior
              parcela.percentual = formData.parcelas[index].percentual;
            }
          }
        } else {
          // Se não for um input válido, manter o valor anterior
          parcela.percentual = formData.parcelas[index].percentual;
        }
      } else if (field === 'numero') {
        parcela.numero = parseInt(value) || 1;
      } else if (field === 'dias') {
        parcela.dias = parseInt(value) || 0;
      } else if (field === 'formaPagamentoId') {
        parcela.formaPagamentoId = value === '' ? null : parseInt(value);
      }

      parcelas[index] = parcela;
      return { ...prev, parcelas };
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
    
    // Validação do nome da condição
    if (!formData.condicaoPagamento?.trim()) {
      errors.condicaoPagamento = "Condição de pagamento é obrigatória";
    } else if (formData.condicaoPagamento.trim().length < 3) {
      errors.condicaoPagamento = "Condição de pagamento deve ter pelo menos 3 caracteres";
    } else if (formData.condicaoPagamento.trim().length > 100) {
      errors.condicaoPagamento = "Condição de pagamento deve ter no máximo 100 caracteres";
    }
    
    // Validação do número de parcelas
    if (!formData.numeroParcelas || formData.numeroParcelas <= 0) {
      errors.numeroParcelas = "Número de parcelas deve ser maior que zero";
    } else if (formData.numeroParcelas > 999) {
      errors.numeroParcelas = "Número de parcelas não pode ser maior que 999";
    } else if (!Number.isInteger(formData.numeroParcelas)) {
      errors.numeroParcelas = "Número de parcelas deve ser um número inteiro";
    }
    
    // Validação dos dias para primeira parcela
    if (formData.diasPrimeiraParcela < 0) {
      errors.diasPrimeiraParcela = "Dias para primeira parcela não pode ser negativo";
    } else if (formData.diasPrimeiraParcela > 9999) {
      errors.diasPrimeiraParcela = "Dias para primeira parcela não pode ser maior que 9999";
    } else if (!Number.isInteger(formData.diasPrimeiraParcela)) {
      errors.diasPrimeiraParcela = "Dias para primeira parcela deve ser um número inteiro";
    }
    
    // Validação dos dias entre parcelas
    if (formData.diasEntreParcelas < 0) {
      errors.diasEntreParcelas = "Dias entre parcelas não pode ser negativo";
    } else if (formData.diasEntreParcelas > 9999) {
      errors.diasEntreParcelas = "Dias entre parcelas não pode ser maior que 9999";
    } else if (!Number.isInteger(formData.diasEntreParcelas)) {
      errors.diasEntreParcelas = "Dias entre parcelas deve ser um número inteiro";
    }
    
    // Validação do percentual de juros
    if (formData.percentualJuros < 0) {
      errors.percentualJuros = "Percentual de juros não pode ser negativo";
    } else if (formData.percentualJuros > 100) {
      errors.percentualJuros = "Percentual de juros não pode ser maior que 100%";
    }
    
    // Validação do percentual de multa
    if (formData.percentualMulta < 0) {
      errors.percentualMulta = "Percentual de multa não pode ser negativo";
    } else if (formData.percentualMulta > 100) {
      errors.percentualMulta = "Percentual de multa não pode ser maior que 100%";
    }
    
    // Validação do percentual de desconto
    if (formData.percentualDesconto < 0) {
      errors.percentualDesconto = "Percentual de desconto não pode ser negativo";
    } else if (formData.percentualDesconto > 100) {
      errors.percentualDesconto = "Percentual de desconto não pode ser maior que 100%";
    }
    
    // Validação das parcelas
    if (!formData.parcelas || formData.parcelas.length === 0) {
      errors.parcelas = "É necessário pelo menos uma parcela";
    } else {
      let totalPercent = 0;
      const numerosUtilizados = new Set<number>();
      
      formData.parcelas.forEach((parcela, index) => {
        // Validar número da parcela
        if (!parcela.numero || parcela.numero <= 0) {
          errors[`parcelas[${index}].numero`] = `Parcela ${index + 1}: Número deve ser maior que zero`;
        } else if (!Number.isInteger(parcela.numero)) {
          errors[`parcelas[${index}].numero`] = `Parcela ${index + 1}: Número deve ser um inteiro`;
        } else if (numerosUtilizados.has(parcela.numero)) {
          errors[`parcelas[${index}].numero`] = `Parcela ${index + 1}: Número ${parcela.numero} já está sendo usado`;
        } else {
          numerosUtilizados.add(parcela.numero);
        }
        
        // Validar dias da parcela
        if (parcela.dias < 0) {
          errors[`parcelas[${index}].dias`] = `Parcela ${index + 1}: Dias não pode ser negativo`;
        } else if (parcela.dias > 9999) {
          errors[`parcelas[${index}].dias`] = `Parcela ${index + 1}: Dias não pode ser maior que 9999`;
        } else if (!Number.isInteger(parcela.dias)) {
          errors[`parcelas[${index}].dias`] = `Parcela ${index + 1}: Dias deve ser um número inteiro`;
        }
        
        // Validar percentual da parcela
        if (parcela.percentual <= 0) {
          errors[`parcelas[${index}].percentual`] = `Parcela ${index + 1}: Percentual deve ser maior que zero`;
        } else if (parcela.percentual > 100) {
          errors[`parcelas[${index}].percentual`] = `Parcela ${index + 1}: Percentual não pode ser maior que 100%`;
        }
        
        // Validar forma de pagamento da parcela (obrigatório)
        if (!parcela.formaPagamentoId) {
          errors[`parcelas[${index}].formaPagamentoId`] = `Parcela ${index + 1}: Forma de pagamento é obrigatória`;
        }
        
        totalPercent += parcela.percentual || 0;
      });
      
      // Verificar se o total é exatamente 100%
      const totalPercentFormatted = Number(totalPercent.toFixed(2));
      if (Math.abs(totalPercentFormatted - 100) > 0.01) {
        errors.parcelas = `A soma dos percentuais das parcelas deve ser 100%. Atual: ${totalPercentFormatted}%`;
      }
      
      // Verificar se o número de parcelas configuradas bate com o número informado
      if (formData.parcelas.length !== formData.numeroParcelas) {
        errors.parcelas = `Número de parcelas configuradas (${formData.parcelas.length}) não confere com o número informado (${formData.numeroParcelas})`;
      }
    }
    
    // Validação lógica: se há mais de uma parcela, deve ter dias entre parcelas
    if (formData.numeroParcelas > 1 && formData.diasEntreParcelas === 0) {
      errors.diasEntreParcelas = "Para múltiplas parcelas, deve haver dias entre elas";
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Mostrar o primeiro erro encontrado
      const firstError = Object.values(validationErrors)[0];
      toast.error(`Erro de validação: ${firstError}`);
      
      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    setSaving(true);
    
    try {
      // Formatar os números com 2 casas decimais antes de enviar
      const formattedData = {
        ...formData,
        percentualJuros: Number(Number(formData.percentualJuros).toFixed(2)),
        percentualMulta: Number(Number(formData.percentualMulta).toFixed(2)),
        percentualDesconto: Number(Number(formData.percentualDesconto).toFixed(2)),
        parcelas: formData.parcelas.map(parcela => ({
          ...parcela,
          percentual: Number(Number(parcela.percentual).toFixed(2))
        }))
      };

      if (id && id !== 'novo') {
        // Atualizar condição existente
        await CondicaoPagamentoService.update(Number(id), formattedData);
        toast.success('Condição de pagamento atualizada com sucesso!');
      } else {
        // Criar nova condição
        await CondicaoPagamentoService.create(formattedData);
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
              {/* Primeira linha: Código, Condição de Pagamento, Número de Parcelas */}
              <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <FormField
                  name="id"
                  label="Código"
                  value={id && id !== 'novo' ? id : 'Novo'}
                  onChange={() => {}}
                  disabled={true}
                />
                
                <FormField
                  name="condicaoPagamento"
                  label="Condição de Pagamento"
                  placeholder="Digite a condição de pagamento"
                  value={formData.condicaoPagamento || ''}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  error={errors.condicaoPagamento}
                  disabled={isViewMode}
                />
              </div>
              
              {/* Segunda linha: Dias 1ª Parcela, Dias Entre Parcelas */}
              <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <FormField
                  name="numeroParcelas"
                  label="Número de Parcelas"
                  type="number"
                  value={formData.numeroParcelas || 1}
                  onChange={handleChange}
                  required
                  min={1}
                  max={60}
                  error={errors.numeroParcelas}
                  disabled={isViewMode}
                  step="1"
                />

                <FormField
                  name="diasPrimeiraParcela"
                  label="Dias para 1ª Parcela"
                  type="number"
                  value={formData.diasPrimeiraParcela || 0}
                  onChange={handleChange}
                  error={errors.diasPrimeiraParcela}
                  disabled={isViewMode}
                  step="1"
                  min={0}
                />

                <FormField
                  name="diasEntreParcelas"
                  label="Dias Entre Parcelas"
                  type="number"
                  value={formData.diasEntreParcelas || 0}
                  onChange={handleChange}
                  disabled={formData.numeroParcelas <= 1 || isViewMode}
                  error={errors.diasEntreParcelas}
                  step="1"
                  min={0}
                />
              </div>
              
              {/* Terceira linha: Percentuais */}
              <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <FormField
                  name="percentualJuros"
                  label="Percentual de Juros (%)"
                  type="text"
                  value={typeof formData.percentualJuros === 'string' ? formData.percentualJuros : String(formData.percentualJuros).replace('.', ',')}
                  onChange={handleChange}
                  error={errors.percentualJuros}
                  disabled={isViewMode}
                  min={0}
                  max={100}
                />

                <FormField
                  name="percentualMulta"
                  label="Percentual de Multa (%)"
                  type="text"
                  value={typeof formData.percentualMulta === 'string' ? formData.percentualMulta : String(formData.percentualMulta).replace('.', ',')}
                  onChange={handleChange}
                  error={errors.percentualMulta}
                  disabled={isViewMode}
                  min={0}
                  max={100}
                />

                <FormField
                  name="percentualDesconto"
                  label="Percentual de Desconto (%)"
                  type="text"
                  value={typeof formData.percentualDesconto === 'string' ? formData.percentualDesconto : String(formData.percentualDesconto).replace('.', ',')}
                  onChange={handleChange}
                  error={errors.percentualDesconto}
                  disabled={isViewMode}
                  min={0}
                  max={100}
                />
              </div>
              
              {/* Quarta linha: Forma de Pagamento Padrão */}
              <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento Padrão
                  </label>
                  {!isViewMode ? (
                    <div 
                      className="flex-1 border rounded-md p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
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
                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
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
                          Forma de Pagamento <span className="text-red-500">*</span>
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
                              type="text"
                              value={typeof parcela.percentual === 'string' ? parcela.percentual : String(parcela.percentual).replace('.', ',')}
                              onChange={(e) => handleParcelaChange(index, 'percentual', e.target.value)}
                              className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              {!isViewMode ? (
                                <div 
                                  className={`flex-1 border rounded-md p-2 bg-gray-50 max-w-xs truncate cursor-pointer hover:bg-gray-100 transition ${
                                    errors[`parcelas[${index}].formaPagamentoId`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                  }`}
                                  onClick={() => handleOpenParcelaFormaPagamentoModal(index)}
                                >
                                  {parcela.formaPagamentoId ? 
                                    (formasPagamento.find(f => f.id === parcela.formaPagamentoId)?.descricao || 'Forma não encontrada')
                                    : 
                                    <span className="text-gray-500">Clique para selecionar *</span>
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
                              {errors[`parcelas[${index}].formaPagamentoId`] && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors[`parcelas[${index}].formaPagamentoId`]}
                                </p>
                              )}
                            </div>
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
          
          {/* Rodapé do formulário com informações de registro e botões */}
          <div className="flex justify-between items-end pt-6 border-t mt-6">
            {/* Informações do Registro (sempre que existirem datas) */}
            {(entityData.dataCadastro || entityData.ultimaModificacao) && (
              <div className="text-sm text-gray-600">
                <h3 className="font-semibold text-gray-700 mb-1">Informações do Registro:</h3>
                {entityData.dataCadastro && (
                  <p>
                    Cadastrado em: {formatDate(entityData.dataCadastro)}
                  </p>
                )}
                {entityData.ultimaModificacao && (
                  <p>
                    Última modificação: {formatDate(entityData.ultimaModificacao)}
                  </p>
                )}
              </div>
            )}

            {/* Botões de Ação - Sempre à direita */}
            <div className="flex gap-3 ml-auto">
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