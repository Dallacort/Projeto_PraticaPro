import React, { ReactNode } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

interface ViewModalField {
  label: string;
  value: string | number | ReactNode;
}

interface ViewModalSection {
  sectionTitle: string;
  fields: ViewModalField[];
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  loading?: boolean;
  children?: ReactNode;
  data?: ViewModalSection[];
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
  children,
  data
}) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-blue-600 text-2xl" />
        </div>
      );
    }

    if (data) {
      return (
        <div className="space-y-6">
          {data.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="text-sm font-medium text-gray-700">{section.sectionTitle}</h3>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                      <dd className="text-sm text-gray-900">{field.value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return children;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
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

        <div className="overflow-y-auto p-6 flex-grow">
          {renderContent()}
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