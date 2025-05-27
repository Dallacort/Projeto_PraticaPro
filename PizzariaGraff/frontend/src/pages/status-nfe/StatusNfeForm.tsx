import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { StatusNfe } from '../../types';
import StatusNfeService from '../../services/statusNfeService';
import FormField from '../../components/FormField';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Icon from '../../components/Icon';

const StatusNfeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();

  const [formData, setFormData] = useState<Partial<StatusNfe>>({
    descricao: '',
    ativo: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await StatusNfeService.getById(Number(id));
          setFormData(data);
        } catch (error) {
          console.error('Erro ao carregar status:', error);
          toast.error('Erro ao carregar status de NFe');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao?.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (id) {
        await StatusNfeService.update(Number(id), formData as Omit<StatusNfe, 'id'>);
        toast.success('Status de NFe atualizado com sucesso!');
      } else {
        await StatusNfeService.create(formData as Omit<StatusNfe, 'id'>);
        toast.success('Status de NFe criado com sucesso!');
      }
      navigate('/status-nfe');
    } catch (error) {
      console.error('Erro ao salvar status:', error);
      toast.error('Erro ao salvar status de NFe');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Editar Status de NFe' : 'Novo Status de NFe'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <FormField
          label="Descrição"
          name="descricao"
          value={formData.descricao || ''}
          onChange={handleChange}
          error={errors.descricao}
          required
        />

        <div className="mb-4">
          <label className="flex items-center">
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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <div className="inline mr-2">
                <Icon IconComponent={FaSpinner} size={16} spinning />
              </div>
            ) : null}
            Salvar
          </button>

          <button
            type="button"
            onClick={() => navigate('/status-nfe')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusNfeForm; 