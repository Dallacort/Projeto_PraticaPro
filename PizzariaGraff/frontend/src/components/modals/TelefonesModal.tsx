import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPlus, FaMinus, FaTimes } from 'react-icons/fa';

interface TelefonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  telefones: string[];
  onSave: (telefones: string[]) => void;
}

const TelefonesModal: React.FC<TelefonesModalProps> = ({ isOpen, onClose, telefones, onSave }) => {
  const [telefonesLocais, setTelefonesLocais] = useState<string[]>(['']);

  useEffect(() => {
    if (isOpen) {
      // Inicializar com os telefones existentes, ou um campo vazio se não houver nenhum
      setTelefonesLocais(telefones.length > 0 ? [...telefones] : ['']);
    }
  }, [isOpen, telefones]);

  const adicionarTelefone = () => {
    setTelefonesLocais(prev => [...prev, '']);
  };

  const removerTelefone = (index: number) => {
    if (telefonesLocais.length > 1) {
      setTelefonesLocais(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleTelefoneChange = (index: number, value: string) => {
    setTelefonesLocais(prev => 
      prev.map((telefone, i) => i === index ? value : telefone)
    );
  };

  const handleSave = () => {
    // Filtrar telefones vazios
    const telefonesValidos = telefonesLocais.filter(tel => tel.trim() !== '');
    onSave(telefonesValidos);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            Gerenciar Telefones
          </h2>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Telefones do Fornecedor
              </label>
              <button
                type="button"
                onClick={adicionarTelefone}
                className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                <FaPlus className="mr-1" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {telefonesLocais.map((telefone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => handleTelefoneChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="(41) 99999-9999"
                      maxLength={15}
                    />
                  </div>
                  {telefonesLocais.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerTelefone(index)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm"
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {telefonesLocais.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum telefone cadastrado. Clique em "Adicionar" para incluir um telefone.
              </p>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Salvar Telefones
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelefonesModal; 