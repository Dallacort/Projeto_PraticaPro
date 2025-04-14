import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CondicaoPagamento, FormaPagamento, ParcelaCondicaoPagamento } from '../../types';
import CondicaoPagamentoService, { CondicaoPagamentoInput } from '../../services/condicaoPagamentoService';
import FormaPagamentoService from '../../services/FormaPagamentoService';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import Icon from '../../components/Icon';
import { FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';

const CondicaoPagamentoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const [formData, setFormData] = useState<CondicaoPagamentoInput>({
    codigo: '',
    nome: '',
    descricao: '',
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          
          // Garante que formaPagamentoPadraoId não seja undefined
          const formaPagamentoPadraoId = data.formaPagamentoPadraoId !== undefined ? 
            data.formaPagamentoPadraoId : 
            null;
            
          setFormData({
            codigo: data.codigo,
            nome: data.nome,
            descricao: data.descricao,
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
        if (prev.parcelas && prev.parcelas.length > 0) {
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
      const parcelas = [...(prev.parcelas || [])];
      
      // Se estiver mudando a forma de pagamento, também atualizar a descrição
      if (field === 'formaPagamentoId') {
        const formaPagamentoSelecionada = formasPagamento.find(fp => fp.id === parseInt(value, 10));
        parcelas[index] = {
          ...parcelas[index],
          [field]: value === '' ? null : parseInt(value, 10),
          formaPagamentoDescricao: formaPagamentoSelecionada ? formaPagamentoSelecionada.descricao : ''
        };
      } else {
        parcelas[index] = {
          ...parcelas[index],
          [field]: field === 'percentual' || field === 'dias' 
            ? parseFloat(value) || 0
            : value
        };
      }
      
      return { ...prev, parcelas };
    });
  };

  const addParcela = () => {
    setFormData(prev => {
      // Aumentar o número de parcelas
      const novoNumeroParcelas = prev.parcelas ? prev.parcelas.length + 1 : 1;
      
      // Criar um objeto temporário com o novo número de parcelas
      const tempCondicao: CondicaoPagamento = {
        ...prev,
        numeroParcelas: novoNumeroParcelas,
        id: parseInt(id || '0'),
        ativo: prev.ativo
      };
      
      // Usar o serviço para gerar as parcelas com base nos dados atuais
      const novasParcelas = CondicaoPagamentoService.generateParcelas(tempCondicao);
      
      // Preservar as formas de pagamento das parcelas existentes
      if (prev.parcelas && prev.parcelas.length > 0) {
        prev.parcelas.forEach((parcela, index) => {
          if (index < novasParcelas.length && parcela.formaPagamentoId) {
            novasParcelas[index].formaPagamentoId = parcela.formaPagamentoId;
          }
        });
      }
      
      return {
        ...prev,
        numeroParcelas: novoNumeroParcelas,
        parcelas: novasParcelas
      };
    });
  };

  const removeParcela = (index: number) => {
    setFormData(prev => {
      if (!prev.parcelas || prev.parcelas.length <= 1) {
        // Não permite remover a última parcela
        return prev;
      }
      
      // Diminuir o número de parcelas
      const novoNumeroParcelas = prev.parcelas.length - 1;
      
      // Criar um objeto temporário com o novo número de parcelas
      const tempCondicao: CondicaoPagamento = {
        ...prev,
        numeroParcelas: novoNumeroParcelas,
        id: parseInt(id || '0'),
        ativo: prev.ativo
      };
      
      // Usar o serviço para gerar as parcelas com base nos dados atuais
      const novasParcelas = CondicaoPagamentoService.generateParcelas(tempCondicao);
      
      // Mapear as formas de pagamento das parcelas existentes para as novas,
      // pulando a parcela a ser removida
      const parcelasExistentes = prev.parcelas.filter((_, i) => i !== index);
      if (parcelasExistentes && parcelasExistentes.length > 0) {
        parcelasExistentes.forEach((parcela, i) => {
          if (i < novasParcelas.length && parcela.formaPagamentoId) {
            novasParcelas[i].formaPagamentoId = parcela.formaPagamentoId;
          }
        });
      }
      
      return {
        ...prev,
        numeroParcelas: novoNumeroParcelas,
        parcelas: novasParcelas
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo?.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }

    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao?.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (formData.numeroParcelas < 1) {
      newErrors.numeroParcelas = 'O número de parcelas deve ser pelo menos 1';
    }

    // Dias não podem ser negativos
    if (formData.diasPrimeiraParcela < 0) {
      newErrors.diasPrimeiraParcela = 'O valor não pode ser negativo';
    }

    if (formData.diasEntreParcelas < 0) {
      newErrors.diasEntreParcelas = 'O valor não pode ser negativo';
    }

    // Validar percentuais
    if (formData.percentualJuros < 0) {
      newErrors.percentualJuros = 'O valor não pode ser negativo';
    }

    if (formData.percentualMulta < 0) {
      newErrors.percentualMulta = 'O valor não pode ser negativo';
    }

    if (formData.percentualDesconto < 0) {
      newErrors.percentualDesconto = 'O valor não pode ser negativo';
    }

    // Validar parcelas
    if (!formData.parcelas?.length) {
      newErrors.parcelas = 'É necessário pelo menos uma parcela';
    } else {
      // Verificar se a soma dos percentuais das parcelas é 100%
      const somaPercentuais = formData.parcelas.reduce((soma, parcela) => soma + parcela.percentual, 0);
      if (Math.abs(somaPercentuais - 100) > 0.01) {
        newErrors.parcelas = 'A soma dos percentuais deve ser 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Log dos dados antes de enviar
    console.log('Enviando dados para salvar:', {
      ...formData,
      parcelas: formData.parcelas?.map(p => ({
        numero: p.numero,
        dias: p.dias,
        percentual: p.percentual,
        formaPagamentoId: p.formaPagamentoId
      }))
    });

    setSaving(true);
    try {
      if (id && id !== 'novo') {
        await CondicaoPagamentoService.update(Number(id), formData);
        toast.success('Condição de pagamento atualizada com sucesso!');
      } else {
        await CondicaoPagamentoService.create(formData);
        toast.success('Condição de pagamento criada com sucesso!');
      }
      navigate('/condicoes-pagamento');
    } catch (error) {
      console.error('Erro ao salvar condição de pagamento:', error);
      toast.error('Erro ao salvar condição de pagamento');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-primary">
          <Icon Icon={FaSpinner} size={24} spinning />
        </div>
      </div>
    );
  }
  
  // Adicionar log para debug
  console.log('Estado atual de formasPagamento:', formasPagamento);

  return (
    <div className="flex flex-col h-full w-full">
      {formasPagamento.length === 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Atenção</p>
          <p>Nenhuma forma de pagamento foi carregada. Por favor, verifique se existem formas de pagamento cadastradas e ativas.</p>
        </div>
      )}
      {/* Debug para formaPagamentoPadraoId */}
      <div className="hidden">
        <pre>formaPagamentoPadraoId: {JSON.stringify(formData.formaPagamentoPadraoId)}</pre>
      </div>
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
        {id && id !== 'novo' ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}
      </h1>
      </div>

      <div className="p-4 flex-grow overflow-auto">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <FormField
              label="Código"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              error={errors.codigo}
              required
              placeholder="Ex: A_VISTA, PARCELADO_30_60_90"
            />

            <FormField
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              error={errors.nome}
              required
              placeholder="Ex: À Vista, Parcelado 30/60/90"
            />
          </div>

          <div className="mb-6">
        <FormField
          label="Descrição"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          error={errors.descricao}
          required
              placeholder="Ex: Pagamento à vista, Parcelamento em 3x de 30/60/90 dias"
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormField
              label="Número de Parcelas"
              name="numeroParcelas"
              type="number"
              value={formData.numeroParcelas.toString()}
              onChange={handleChange}
              error={errors.numeroParcelas}
              required
            />

          <FormField
            label="Dias Primeira Parcela"
            name="diasPrimeiraParcela"
            type="number"
            value={formData.diasPrimeiraParcela.toString()}
            onChange={handleChange}
            error={errors.diasPrimeiraParcela}
            required
          />

          <FormField
            label="Dias Entre Parcelas"
            name="diasEntreParcelas"
            type="number"
            value={formData.diasEntreParcelas.toString()}
            onChange={handleChange}
            error={errors.diasEntreParcelas}
            required
          />

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Forma de Pagamento Padrão
              </label>
              <select
                name="formaPagamentoPadraoId"
                value={formData.formaPagamentoPadraoId || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Selecione...</option>
                {formasPagamento.map(forma => (
                  <option 
                    key={forma.id} 
                    value={forma.id}
                  >
                    {forma.descricao}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-600 mt-1">
                ID selecionado: {formData.formaPagamentoPadraoId || 'Nenhum'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <FormField
              label="Percentual de Juros (%)"
              name="percentualJuros"
              type="number"
              step="0.01"
              value={formData.percentualJuros?.toString() || '0'}
              onChange={handleChange}
              error={errors.percentualJuros}
            />

            <FormField
              label="Percentual de Multa (%)"
              name="percentualMulta"
              type="number"
              step="0.01"
              value={formData.percentualMulta?.toString() || '0'}
              onChange={handleChange}
              error={errors.percentualMulta}
            />

            <FormField
              label="Percentual de Desconto (%)"
              name="percentualDesconto"
              type="number"
              step="0.01"
              value={formData.percentualDesconto?.toString() || '0'}
              onChange={handleChange}
              error={errors.percentualDesconto}
            />
        </div>

        <div className="mb-4">
            <label className="flex items-center mb-2">
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-primary"
            />
            <span className="ml-2">Ativo</span>
          </label>
        </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Parcelas</h3>
              <button
                type="button"
                onClick={addParcela}
                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center"
              >
                <Icon Icon={FaPlus} className="mr-1" size={12} />
                Adicionar Parcela
              </button>
            </div>
            
            {errors.parcelas && (
              <div className="text-red-500 text-sm mb-2">{errors.parcelas}</div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              {formData.parcelas && formData.parcelas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Parcela
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dias
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentual (%)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Forma de Pagamento
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.parcelas.map((parcela, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {parcela.numero}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={parcela.dias}
                              onChange={(e) => handleParcelaChange(index, 'dias', e.target.value)}
                              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={parcela.percentual}
                              onChange={(e) => handleParcelaChange(index, 'percentual', e.target.value)}
                              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={parcela.formaPagamentoId || ''}
                              onChange={(e) => handleParcelaChange(index, 'formaPagamentoId', e.target.value)}
                              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                              <option value="">Selecione...</option>
                              {formasPagamento.map(forma => (
                                <option 
                                  key={forma.id} 
                                  value={forma.id}
                                >
                                  {forma.descricao}
                                </option>
                              ))}
                            </select>
                            {parcela.formaPagamentoDescricao && !parcela.formaPagamentoId && (
                              <div className="text-xs text-red-600 mt-1">
                                {parcela.formaPagamentoDescricao} (forma de pagamento removida)
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeParcela(index)}
                              disabled={formData.parcelas?.length === 1}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <Icon Icon={FaTrash} size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  Nenhuma parcela adicionada. Clique em "Adicionar Parcela" para começar.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/condicoes-pagamento')}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            
          <button
            type="submit"
            disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {saving ? (
              <div className="inline mr-2">
                <Icon Icon={FaSpinner} size={16} spinning />
              </div>
            ) : null}
            Salvar
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default CondicaoPagamentoForm; 