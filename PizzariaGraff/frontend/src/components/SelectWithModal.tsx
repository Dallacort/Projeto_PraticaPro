import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface Option {
  id: string | number;
  nome?: string;
  descricao?: string;
  sigla?: string;
  [key: string]: any;
}

interface CreateFormFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

interface SelectWithModalProps {
  label: string;
  name: string;
  value: string | number;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onOptionCreate: (data: any) => Promise<Option>;
  displayKey?: 'nome' | 'descricao' | 'sigla';
  required?: boolean;
  error?: string;
  disabled?: boolean;
  createFormFields: React.ReactElement<CreateFormFieldsProps>;
  entityName: string;
}

const SelectWithModal: React.FC<SelectWithModalProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  onOptionCreate,
  displayKey = 'nome',
  required = false,
  error,
  disabled = false,
  createFormFields,
  entityName
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Função para abrir o modal de seleção
  const handleOpenSelectModal = () => {
    setIsModalOpen(true);
  };
  
  // Função para fechar o modal de seleção
  const handleCloseSelectModal = () => {
    setIsModalOpen(false);
  };
  
  // Função para abrir o modal de criação
  const handleOpenCreateModal = () => {
    setFormData({});
    setFormError(null);
    setIsCreateModalOpen(true);
  };
  
  // Função para fechar o modal de criação
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };
  
  // Função para atualizar os dados do formulário
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev: any) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Função para salvar o novo item
  const handleSaveNewOption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (Object.keys(formData).length === 0) {
      setFormError('Por favor, preencha os campos obrigatórios.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Chamar a função para criar o novo item
      const newOption = await onOptionCreate(formData);
      
      // Criar um evento sintético para simular a seleção do item recém-criado
      const syntheticEvent = {
        target: {
          name,
          value: newOption.id
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      
      // Chamar o manipulador de mudança passado como prop
      onChange(syntheticEvent);
      
      // Fechar os modais
      handleCloseCreateModal();
      handleCloseSelectModal();
    } catch (err: any) {
      console.error(`Erro ao criar ${entityName}:`, err);
      setFormError(err.message || `Erro ao criar ${entityName}. Por favor, tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para abrir o seletor quando clicar no campo
  const handleFieldClick = () => {
    if (!disabled) {
      handleOpenSelectModal();
    }
  };
  
  // Renderiza os botões do rodapé do modal de criação
  const createModalFooter = (
    <>
      <button
        type="button"
        onClick={handleCloseCreateModal}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="create-option-form"
        disabled={isSubmitting}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </>
  );
  
  // Encontrar a opção selecionada
  const selectedOption = options.find(opt => opt.id.toString() === value.toString());
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Campo de seleção estilizado como input para ser clicável */}
      <div 
        className={`w-full p-2 border rounded-md flex justify-between items-center cursor-pointer ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'}`}
        onClick={handleFieldClick}
      >
        <span className={`${!selectedOption ? 'text-gray-400' : 'text-gray-800'}`}>
          {selectedOption ? selectedOption[displayKey] : 'Selecione...'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Mensagem de erro */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      
      {/* Modal de seleção */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseSelectModal}
        title={
          <div className="flex justify-between items-center w-full">
            <span>{`Selecionar ${entityName}`}</span>
            <button
              type="button"
              onClick={() => {
                handleOpenCreateModal();
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Cadastrar Novo
            </button>
          </div>
        }
        footer={
          <button
            type="button"
            onClick={handleCloseSelectModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
        }
        maxWidth="2xl"
      >
        <div className="min-h-[300px]">
          <h4 className="font-medium text-lg mb-2">Itens Existentes</h4>
          {options.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-md">
              <ul className="divide-y divide-gray-200">
                {options.map(option => (
                  <li 
                    key={option.id} 
                    className={`p-3 cursor-pointer hover:bg-blue-50 ${
                      option.id.toString() === value.toString() ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => {
                      const syntheticEvent = {
                        target: {
                          name,
                          value: option.id
                        }
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(syntheticEvent);
                      handleCloseSelectModal();
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option[displayKey]}</span>
                      {option.id.toString() === value.toString() && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-md">
              Nenhum item encontrado.
            </div>
          )}
        </div>
      </Modal>
      
      {/* Modal de cadastro */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title={`Cadastrar Novo ${entityName}`}
        footer={createModalFooter}
        maxWidth="md"
      >
        {formError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{formError}</p>
          </div>
        )}
        
        <form id="create-option-form" onSubmit={handleSaveNewOption}>
          {/* Componente de formulário injetado como prop */}
          {React.cloneElement(createFormFields, {
            formData,
            onChange: handleFormChange
          })}
        </form>
      </Modal>
    </div>
  );
};

export default SelectWithModal; 