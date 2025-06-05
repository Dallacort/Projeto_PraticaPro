import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getFuncaoFuncionario, createFuncaoFuncionario, updateFuncaoFuncionario } from '../../services/funcaoFuncionarioService';
import { FuncaoFuncionario } from '../../types';
import { FaSpinner } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';

interface FuncaoFuncionarioFormData {
  descricao: string;
  salarioBase: string;
  ativo: boolean;
}

const FuncaoFuncionarioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/funcoes-funcionario/novo' || !id;
  
  const [formData, setFormData] = useState<FuncaoFuncionarioFormData>({
    descricao: '',
    salarioBase: '',
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isNew && id) {
          const funcaoData = await getFuncaoFuncionario(Number(id));
          if (!funcaoData) {
            throw new Error('Função não encontrada');
          }
          
          setFormData({
            descricao: funcaoData.descricao || '',
            salarioBase: funcaoData.salarioBase ? String(funcaoData.salarioBase) : '',
            ativo: funcaoData.ativo !== undefined ? funcaoData.ativo : true,
          });
          
          setDataCadastro(funcaoData.dataCadastro);
          setUltimaModificacao(funcaoData.ultimaModificacao);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados da função.');
        setTimeout(() => {
          navigate('/funcoes-funcionario');
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
    if (!formData.descricao?.trim()) errors.push("Descrição é obrigatória");
    
    if (formData.salarioBase && isNaN(Number(formData.salarioBase))) {
      errors.push("Salário base deve ser um número válido");
    }
    
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
      
      const funcaoPayload = {
        descricao: formData.descricao,
        salarioBase: formData.salarioBase ? Number(formData.salarioBase) : 0,
        ativo: formData.ativo,
      };
      
      if (isNew) {
        await createFuncaoFuncionario(funcaoPayload);
        alert('Função cadastrada com sucesso!');
      } else if (id) {
        await updateFuncaoFuncionario(Number(id), funcaoPayload);
        alert('Função atualizada com sucesso!');
      }
      navigate('/funcoes-funcionario');
    } catch (err: any) {
      console.error('Erro ao salvar função:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao salvar função. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/funcoes-funcionario');
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? 'Nova Função de Funcionário' : 'Editar Função de Funcionário'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
          {/* Dados Básicos */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Dados Básicos</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Habilitado</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
            
            {/* Linha 1: Código, Descrição, Salário Base */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={isNew ? "Novo" : id || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="col-span-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Ex: Gerente, Vendedor, Cozinheiro..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base</label>
                <input
                  type="number"
                  name="salarioBase"
                  value={formData.salarioBase}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

             {/* Rodapé do formulário com informações de registro e botões */}
        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {/* Informações do Registro (sempre que existirem datas) */}
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

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 inline" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuncaoFuncionarioForm; 