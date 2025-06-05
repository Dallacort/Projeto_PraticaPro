import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import FormaPagamentoService, { FormaPagamentoInput } from '../../services/FormaPagamentoService';
import { FormaPagamento } from '../../types';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

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
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.nome?.trim()) errors.push("Nome é obrigatório");
    if (!formData.descricao?.trim()) errors.push("Descrição é obrigatória");
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
      
      const dataToSend: FormaPagamentoInput = {
        nome: formData.nome,
        descricao: formData.descricao,
        ativo: formData.ativo
      };
      
      console.log('Dados a serem enviados:', dataToSend);
      console.log('Modo de desenvolvimento:', process.env.REACT_APP_USE_MOCK_DATA);
      
      if (isNew) {
        console.log('Criando nova forma de pagamento...');
        await FormaPagamentoService.create(dataToSend);
        toast.success('Forma de pagamento cadastrada com sucesso!');
      } else if (id) {
        console.log('Atualizando forma de pagamento com ID:', id);
        await FormaPagamentoService.update(Number(id), dataToSend);
        toast.success('Forma de pagamento atualizada com sucesso!');
      }
      navigate('/formas-pagamento');
    } catch (err: any) {
      console.error('Erro ao salvar forma de pagamento:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar forma de pagamento. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-primary">
          <FaSpinner className="animate-spin text-blue-500" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Nova Forma de Pagamento' : 'Editar Forma de Pagamento'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Dados Básicos</h2>
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
                    />
                    <div className={`block w-14 h-8 rounded-full ${formData.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${formData.ativo ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Primeira linha: Código, Nome */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 2fr' }}>
              <FormField
                label="Código"
                name="id"
                value={id && !isNew ? id : 'Novo'}
                onChange={() => {}}
                disabled={true}
              />
              
              <FormField
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Ex: Dinheiro"
              />
            </div>

            {/* Segunda linha: Descrição */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr' }}>
              <FormField
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Ex: Pagamento em dinheiro"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {/* Informações do Registro */}
          {(dataCadastro || ultimaModificacao) && (
            <div className="text-sm text-gray-600">
              <h3 className="font-semibold text-gray-700 mb-1">Informações do Registro:</h3>
              {dataCadastro && (
                <p>
                  Cadastrado em: {formatDate(dataCadastro)}
                </p>
              )}
              {ultimaModificacao && (
                <p>
                  Última modificação: {formatDate(ultimaModificacao)}
                </p>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/formas-pagamento')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50`}
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormaPagamentoForm; 