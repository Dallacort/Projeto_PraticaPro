import React, { useState, useEffect, useCallback } from 'react';
import { Veiculo } from '../../types';
import { getVeiculos, createVeiculo } from '../../services/veiculoService';
import FormField from '../FormField';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface VeiculoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (veiculo: Veiculo) => void;
  transportadoraId?: number | null;
}

const VeiculoModal: React.FC<VeiculoModalProps> = ({ isOpen, onClose, onSelect, transportadoraId }) => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    capacidade: 0,
    ativo: true,
  });

  const fetchVeiculos = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (transportadoraId) {
        // Buscar veículos da transportadora específica
        const response = await fetch(`/api/veiculos/transportadora/${transportadoraId}`);
        if (response.ok) {
          data = await response.json();
        } else {
          data = [];
        }
      } else {
        // Buscar todos os veículos
        data = await getVeiculos();
      }
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos.');
      setVeiculos([]);
    } finally {
      setLoading(false);
    }
  }, [transportadoraId]);

  useEffect(() => {
    if (isOpen) {
      fetchVeiculos();
      setSelectedVeiculo(null);
      setShowForm(false);
      setSearchTerm('');
      resetForm();
    }
  }, [isOpen, fetchVeiculos]);

  const resetForm = () => {
    setFormData({
      placa: '',
      modelo: '',
      marca: '',
      ano: '',
      capacidade: 0,
      ativo: true,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectVeiculoRow = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
  };

  const handleConfirmSelection = () => {
    if (selectedVeiculo) {
      onSelect(selectedVeiculo);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };

  const validateForm = () => {
    if (!formData.placa.trim()) {
      toast.error('Placa é obrigatória.');
      return false;
    }
    if (!formData.modelo.trim()) {
      toast.error('Modelo é obrigatório.');
      return false;
    }
    if (!formData.marca.trim()) {
      toast.error('Marca é obrigatória.');
      return false;
    }
    return true;
  };

  const handleSaveNovoVeiculo = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
      };

      const veiculoCriado = await createVeiculo(payload);
      toast.success('Veículo criado com sucesso!');
      onSelect(veiculoCriado);
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar veículo:', error);
      toast.error(error?.response?.data?.message || 'Erro ao criar veículo.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            {showForm ? 'Novo Veículo' : 'Selecionar Veículo'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full sm:w-2/3">
                  <input
                    type="text"
                    placeholder="Buscar por placa, modelo ou marca..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
                >
                  <FaPlus />
                  <span>Novo Veículo</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                </div>
              ) : (
                <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                  {filteredVeiculos.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ano</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capacidade</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVeiculos.map((veiculo) => (
                          <tr
                            key={veiculo.id}
                            onClick={() => handleSelectVeiculoRow(veiculo)}
                            className={`cursor-pointer hover:bg-gray-100 ${selectedVeiculo?.id === veiculo.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">{veiculo.placa}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{veiculo.modelo}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{veiculo.marca}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{veiculo.ano}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{veiculo.capacidade} kg</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${veiculo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {veiculo.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      {transportadoraId 
                        ? 'Nenhum veículo cadastrado para esta transportadora.' 
                        : 'Nenhum veículo encontrado.'}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Toggle Ativo */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cadastrar Novo Veículo</h3>
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

              {/* Primeira linha */}
              <div className="grid gap-4" style={{ gridTemplateColumns: '200px 2fr' }}>
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

              {/* Segunda linha */}
              <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 150px 200px' }}>
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
          )}
        </div>

        {/* Rodapé */}
        <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50">
          {showForm ? (
            <>
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Voltar
              </button>
              <button
                onClick={handleSaveNovoVeiculo}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar Veículo'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedVeiculo}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Selecionar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeiculoModal;

