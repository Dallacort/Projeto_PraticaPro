import React, { useState, useEffect, useCallback } from 'react';
import { Categoria } from '../../types';
import { getCategorias, createCategoria } from '../../services/categoriaService';
import FormField from '../FormField';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoria: Categoria) => void;
}

const CategoriaModal: React.FC<CategoriaModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCategoria, setNewCategoria] = useState({ categoria: '', ativo: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
      setFilteredCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCategorias();
      setSearchTerm('');
      setShowNewForm(false);
      setNewCategoria({ categoria: '', ativo: true });
      setErrors({});
    }
  }, [isOpen, loadCategorias]);

  useEffect(() => {
    const filtered = categorias.filter(categoria =>
      categoria.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategorias(filtered);
  }, [searchTerm, categorias]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const validateNewCategoria = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newCategoria.categoria || newCategoria.categoria.trim() === '') {
      newErrors.categoria = 'Nome da categoria é obrigatório';
    } else if (newCategoria.categoria.length > 60) {
      newErrors.categoria = 'Nome da categoria deve ter no máximo 60 caracteres';
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategoria = categorias.find(
      categoria => categoria.categoria.toLowerCase() === newCategoria.categoria.toLowerCase()
    );
    if (existingCategoria) {
      newErrors.categoria = 'Já existe uma categoria com este nome';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategoria = async () => {
    if (!validateNewCategoria()) {
      return;
    }

    try {
      setLoading(true);
      const createdCategoria = await createCategoria(newCategoria);
      toast.success('Categoria criada com sucesso!');
      await loadCategorias();
      setShowNewForm(false);
      setNewCategoria({ categoria: '', ativo: true });
      setErrors({});
      onSelect(createdCategoria);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (categoria: Categoria) => {
    onSelect(categoria);
    onClose();
  };

  const handleClose = () => {
    setShowNewForm(false);
    setNewCategoria({ categoria: '', ativo: true });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Selecionar Categoria</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {!showNewForm ? (
          <>
            <div className="mb-4 flex gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowNewForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <FaPlus /> Nova
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCategorias.map((categoria) => (
                    <div
                      key={categoria.id}
                      onClick={() => handleSelect(categoria)}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{categoria.categoria}</div>
                        <div className="text-sm text-gray-500">
                          Status: {categoria.ativo ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                      <div className="text-gray-400">#{categoria.id}</div>
                    </div>
                  ))}
                  {filteredCategorias.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Nenhuma categoria encontrada para a busca.' : 'Nenhuma categoria cadastrada.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-4">Nova Categoria</h3>
            <div className="space-y-4">
              <FormField
                label="Nome da Categoria"
                name="categoria"
                type="text"
                value={newCategoria.categoria}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setNewCategoria(prev => ({ ...prev, categoria: event.target.value }));
                  if (errors.categoria) {
                    setErrors(prev => ({ ...prev, categoria: '' }));
                  }
                }}
                error={errors.categoria}
                required
                maxLength={60}
                placeholder="Digite o nome da categoria"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="novaCategoria-ativo"
                  checked={newCategoria.ativo}
                  onChange={(e) => setNewCategoria(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="novaCategoria-ativo" className="ml-2 block text-sm text-gray-900">
                  Categoria ativa
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setNewCategoria({ categoria: '', ativo: true });
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCategoria}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <FaSpinner className="animate-spin" />}
                  Criar Categoria
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriaModal; 