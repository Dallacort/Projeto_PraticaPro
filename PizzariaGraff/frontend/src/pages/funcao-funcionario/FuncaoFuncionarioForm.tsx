import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getFuncaoFuncionario, createFuncaoFuncionario, updateFuncaoFuncionario } from '../../services/funcaoFuncionarioService';
import { FuncaoFuncionario } from '../../types';
import { FaSpinner } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';

interface FuncaoFuncionarioFormData {
  funcaoFuncionario: string;      // Nome principal da função
  requerCNH: boolean;             // Se requer CNH
  cargaHoraria: string;           // Carga horária (string para input)
  descricao: string;              // Descrição detalhada
  observacao: string;             // Observações
  salarioBase: string;            // Salário base (legado)
  ativo: boolean;                 // Status ativo
}

const FuncaoFuncionarioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/funcoes-funcionario/novo' || !id;
  
  const [formData, setFormData] = useState<FuncaoFuncionarioFormData>({
    funcaoFuncionario: '',
    requerCNH: false,
    cargaHoraria: '',
    descricao: '',
    observacao: '',
    salarioBase: '',
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataCriacao, setDataCriacao] = useState<string | undefined>(undefined);
  const [dataAlteracao, setDataAlteracao] = useState<string | undefined>(undefined);

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
          
          console.log('Dados recebidos da API:', funcaoData);
          
          setFormData({
            funcaoFuncionario: funcaoData.funcaoFuncionario || '',
            requerCNH: funcaoData.requerCNH !== undefined ? funcaoData.requerCNH : false,
            cargaHoraria: funcaoData.cargaHoraria ? String(funcaoData.cargaHoraria) : '',
            descricao: funcaoData.descricao || '',
            observacao: funcaoData.observacao || '',
            salarioBase: funcaoData.salarioBase ? String(funcaoData.salarioBase) : '',
            ativo: funcaoData.ativo !== undefined ? funcaoData.ativo : true,
          });
          
          setDataCriacao(funcaoData.dataCriacao);
          setDataAlteracao(funcaoData.dataAlteracao);
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
    
    const newValue = type === 'checkbox' ? checked : value;
    console.log(`Campo ${name} alterado para:`, newValue);
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Apenas função e carga horária são obrigatórios
    if (!formData.funcaoFuncionario?.trim()) {
      errors.push("Nome da função é obrigatório");
    }
    
    if (!formData.cargaHoraria?.trim()) {
      errors.push("Carga horária é obrigatória");
    }
    
    // Validações de formato (se preenchidos)
    if (formData.salarioBase && isNaN(Number(formData.salarioBase))) {
      errors.push("Salário base deve ser um número válido");
    }
    
    if (formData.cargaHoraria && isNaN(Number(formData.cargaHoraria))) {
      errors.push("Carga horária deve ser um número válido");
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
        funcaoFuncionario: formData.funcaoFuncionario.trim() || null,
        requerCNH: formData.requerCNH,
        cargaHoraria: formData.cargaHoraria.trim() ? Number(formData.cargaHoraria) : null,
        descricao: formData.descricao.trim() || null,
        observacao: formData.observacao.trim() || null,
        salarioBase: formData.salarioBase.trim() ? Number(formData.salarioBase) : null,
        ativo: formData.ativo,
      };
      
      console.log('Dados do formulário antes do envio:', formData);
      console.log('Payload sendo enviado para API:', funcaoPayload);
      
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
              <h2 className="text-lg font-semibold">Dados Básicos</h2>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm font-medium text-gray-700">Habilitado</span>
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
                  name="funcaoFuncionario"
                  value={formData.funcaoFuncionario}
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

            {/* Linha 2: Requer CNH, Carga Horária */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carga Horária (horas/semana) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cargaHoraria"
                  value={formData.cargaHoraria}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="80"
                  placeholder="40.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Requer CNH</label>
                <div className="flex items-center h-10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="requerCNH"
                      checked={formData.requerCNH}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Linha 3: Descrição Detalhada */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descreva as responsabilidades e atividades da função..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Linha 4: Observações */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Observações adicionais sobre a função..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Rodapé do formulário com informações de registro e botões */}
            <div className="flex justify-between items-end pt-6 border-t mt-6">
              {/* Informações do Registro (sempre que existirem datas) */}
              {(dataCriacao || dataAlteracao) && (
                <div className="text-sm text-gray-600">
                  <h3 className="font-semibold text-gray-700 mb-1">Informações do Registro:</h3>
                  {dataCriacao && (
                    <p>
                      Cadastrado em: {formatDate(dataCriacao)}
                    </p>
                  )}
                  {dataAlteracao && (
                    <p>
                      Última modificação: {formatDate(dataAlteracao)}
                    </p>
                  )}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 ml-auto">
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