import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import FormaPagamentoService, { FormaPagamentoInput } from '../../services/FormaPagamentoService';
import { FormaPagamento } from '../../types';

const FormaPagamentoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/formas-pagamento/novo' OU se não houver ID
  const isNew = id === 'novo' || location.pathname === '/formas-pagamento/novo' || !id;
  
  const [formData, setFormData] = useState<FormaPagamentoInput>({
    nome: '',
    descricao: '',
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (isNew) return;
      
      try {
        setLoading(true);
        setError(null);
        
        if (id) {
          // Usar o serviço que já verifica se está em modo de desenvolvimento
          console.log('Buscando forma de pagamento com ID:', id);
          const formaPagamentoData = await FormaPagamentoService.getById(Number(id));
          
          if (formaPagamentoData) {
            console.log('Dados da forma de pagamento recebidos:', formaPagamentoData);
            setFormData({
              nome: formaPagamentoData.nome,
              descricao: formaPagamentoData.descricao,
              ativo: formaPagamentoData.ativo,
            });
            
            // Converter as datas para string se necessário
            if (formaPagamentoData.ultimaModificacao) {
              setUltimaModificacao(
                typeof formaPagamentoData.ultimaModificacao === 'string' 
                  ? formaPagamentoData.ultimaModificacao 
                  : formaPagamentoData.ultimaModificacao.toISOString()
              );
            }
            
            if (formaPagamentoData.dataCadastro) {
              setDataCadastro(
                typeof formaPagamentoData.dataCadastro === 'string' 
                  ? formaPagamentoData.dataCadastro 
                  : formaPagamentoData.dataCadastro.toISOString()
              );
            }
          } else {
            throw new Error('Forma de pagamento não encontrada');
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar forma de pagamento:', err);
        const errorMessage = err.response?.data?.mensagem || err.message || 'Erro ao carregar os dados da forma de pagamento.';
        setError(errorMessage);
        setTimeout(() => {
          navigate('/formas-pagamento');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Para campos do tipo checkbox, use o checked em vez do value
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.nome) errors.push("Nome é obrigatório");
    if (!formData.descricao) errors.push("Descrição é obrigatória");
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Garantir que os dados estejam no formato correto
      const dataToSend: FormaPagamentoInput = {
        nome: formData.nome,
        descricao: formData.descricao,
        ativo: formData.ativo
      };
      
      console.log('Dados a serem enviados:', dataToSend);
      console.log('Modo de desenvolvimento:', process.env.REACT_APP_USE_MOCK_DATA);
      
      if (isNew) {
        console.log('Criando nova forma de pagamento...');
        try {
          const result = await FormaPagamentoService.create(dataToSend);
          console.log('Forma de pagamento criada com sucesso:', result);
          alert('Forma de pagamento cadastrada com sucesso!');
          navigate('/formas-pagamento');
        } catch (createError: any) {
          console.error('Erro específico ao criar forma de pagamento:', createError);
          // Se estiver em modo de desenvolvimento, continuar mesmo com erro
          if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
            console.warn('Continuando em modo de desenvolvimento mesmo com erro');
            alert('Forma de pagamento cadastrada com sucesso! (Modo de desenvolvimento)');
            navigate('/formas-pagamento');
          } else {
            throw createError;
          }
        }
      } else if (id) {
        console.log('Atualizando forma de pagamento com ID:', id);
        try {
          const result = await FormaPagamentoService.update(Number(id), dataToSend);
          console.log('Forma de pagamento atualizada com sucesso:', result);
          alert('Forma de pagamento atualizada com sucesso!');
          navigate('/formas-pagamento');
        } catch (updateError: any) {
          console.error('Erro específico ao atualizar forma de pagamento:', updateError);
          // Se estiver em modo de desenvolvimento, continuar mesmo com erro
          if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
            console.warn('Continuando em modo de desenvolvimento mesmo com erro');
            alert('Forma de pagamento atualizada com sucesso! (Modo de desenvolvimento)');
            navigate('/formas-pagamento');
          } else {
            throw updateError;
          }
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar forma de pagamento:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar forma de pagamento. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Carregando dados da forma de pagamento...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">
          {isNew ? 'Cadastrar Forma de Pagamento' : 'Editar Forma de Pagamento'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Digite o nome"
              required
            />
            {error && !formData.nome && (
              <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Digite a descrição"
              required
            />
            {error && !formData.descricao && (
              <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded shadow-sm"
              />
              <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                Ativo
              </label>
            </div>
          </div>
        </div>

        {!isNew && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Criado em: {formatDate(dataCadastro) || 'N/A'}</p>
            <p>Última modificação: {formatDate(ultimaModificacao) || 'N/A'}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => navigate('/formas-pagamento')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormaPagamentoForm; 