import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getVeiculo, createVeiculo, updateVeiculo } from '../../services/veiculoService';
import { Veiculo } from '../../types';
import { FaSpinner } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';

interface VeiculoFormData {
  placa: string;
  modelo: string;
  marca: string;
  ano: string;
  capacidade: number;
  ativo: boolean;
}

const VeiculoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/veiculos/novo' || !id;

  const [formData, setFormData] = useState<VeiculoFormData>({
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    capacidade: 0,
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isNew && id) {
          const veiculoData = await getVeiculo(Number(id));
          if (!veiculoData) {
            throw new Error('Veículo não encontrado');
          }
          
          setFormData({
            placa: veiculoData.placa || '',
            modelo: veiculoData.modelo || '',
            marca: veiculoData.marca || '',
            ano: String(veiculoData.ano || ''),
            capacidade: Number(veiculoData.capacidade) || 0,
            ativo: veiculoData.ativo !== undefined ? veiculoData.ativo : true,
          });
          
          setUltimaModificacao(veiculoData.ultimaModificacao);
          setDataCadastro(veiculoData.dataCadastro);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados necessários.');
        setTimeout(() => {
          navigate('/veiculos');
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
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.placa.trim()) {
      errors.push('Placa é obrigatória');
    }

    if (!formData.modelo.trim()) {
      errors.push('Modelo é obrigatório');
    }

    if (!formData.marca.trim()) {
      errors.push('Marca é obrigatória');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const veiculoData = {
        ...formData,
      };

      if (isNew) {
        await createVeiculo(veiculoData);
      } else {
        await updateVeiculo(Number(id), veiculoData);
      }

      navigate('/veiculos');
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err);
      setError(err.message || 'Erro ao salvar veículo');
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
          {isNew ? 'Novo Veículo' : 'Editar Veículo'}
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
            
            {/* Primeira linha: Código, Placa, Modelo */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 200px 2fr' }}>
              <FormField
                label="Código"
                name="id"
                value={id && !isNew ? id : 'Novo'}
                onChange={() => {}}
                disabled={true}
              />

              <FormField
                label="Placa"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                required
                maxLength={8}
                placeholder="Ex: ABC-1234"
              />

              <FormField
                label="Modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Ex: Caminhão Mercedes-Benz Atego"
              />
            </div>

            {/* Segunda linha: Marca, Ano, Capacidade */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '2fr 150px 200px' }}>
              <FormField
                label="Marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Ex: Mercedes-Benz"
              />

              <FormField
                label="Ano"
                name="ano"
                type="number"
                value={formData.ano}
                onChange={handleChange}
                placeholder="Ex: 2023"
              />

              <FormField
                label="Capacidade (kg)"
                name="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={handleChange}
                placeholder="Ex: 10000"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {(dataCadastro || ultimaModificacao) && (
            <div className="text-sm text-gray-600">
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
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/veiculos')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Salvando...
                </>
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

export default VeiculoForm; 