import React from 'react';

export interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  options?: Array<{ id: number | string; nome?: string; descricao?: string }>;
  displayKey?: 'nome' | 'descricao';
  disabled?: boolean;
  step?: string;
  maxLength?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
  placeholder,
  options = [],
  displayKey = 'nome',
  disabled = false,
  step,
  maxLength
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
        >
          <option value="">Selecione...</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {displayKey === 'nome' ? option.nome : option.descricao}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
          rows={4}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
          step={step}
        />
      )}
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField; 