import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPlus, FaMinus, FaTimes } from 'react-icons/fa';

interface EmailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: string[];
  onSave: (emails: string[]) => void;
}

const EmailsModal: React.FC<EmailsModalProps> = ({ isOpen, onClose, emails, onSave }) => {
  const [emailsLocais, setEmailsLocais] = useState<string[]>(['']);

  useEffect(() => {
    if (isOpen) {
      // Inicializar com os emails existentes, ou um campo vazio se não houver nenhum
      setEmailsLocais(emails.length > 0 ? [...emails] : ['']);
    }
  }, [isOpen, emails]);

  const adicionarEmail = () => {
    setEmailsLocais(prev => [...prev, '']);
  };

  const removerEmail = (index: number) => {
    if (emailsLocais.length > 1) {
      setEmailsLocais(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    setEmailsLocais(prev => 
      prev.map((email, i) => i === index ? value : email)
    );
  };

  const validarEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleSave = () => {
    // Filtrar emails vazios
    const emailsValidos = emailsLocais.filter(email => email.trim() !== '');
    
    // Validar emails
    const emailsInvalidos = emailsValidos.filter(email => !validarEmail(email));
    if (emailsInvalidos.length > 0) {
      alert('Por favor, verifique se todos os emails têm formato válido.');
      return;
    }
    
    onSave(emailsValidos);
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
            Gerenciar Emails
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
                Emails do Fornecedor
              </label>
              <button
                type="button"
                onClick={adicionarEmail}
                className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                <FaPlus className="mr-1" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {emailsLocais.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        email && !validarEmail(email) 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="contato@fornecedor.com"
                      maxLength={50}
                    />
                    {email && !validarEmail(email) && (
                      <p className="text-xs text-red-500 mt-1">Email deve ter formato válido</p>
                    )}
                  </div>
                  {emailsLocais.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerEmail(index)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm"
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {emailsLocais.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum email cadastrado. Clique em "Adicionar" para incluir um email.
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
            Salvar Emails
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailsModal; 