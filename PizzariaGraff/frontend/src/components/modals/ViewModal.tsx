import React, { ReactNode } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  loading?: boolean;
  children?: ReactNode;
}

/**
 * Modal genérico para visualização de dados
 * Pode ser reutilizado por diferentes componentes da aplicação
 */
const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  title,
  loading = false,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          ) : (
            children
          )}
        </div>
        
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal; 