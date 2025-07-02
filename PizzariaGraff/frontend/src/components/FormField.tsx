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
  max?: number;
  min?: number;
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
  maxLength,
  max,
  min
}) => {
  // Função para limitar o número de dígitos em campos numéricos
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Se o campo for numérico e tiver um valor
    if (type === 'number' && value !== '') {
      const numValue = Number(value);
      
      // Se o valor exceder o máximo permitido, ajusta para o valor máximo
      if (max && numValue > max) {
        e.target.value = String(max);
      }
      
      // Se o valor for menor que o mínimo permitido, ajusta para o valor mínimo
      if (min !== undefined && numValue < min) {
        e.target.value = String(min);
      }
      
      // Limita a 8 dígitos
      if (value.length > 8) {
        e.target.value = value.slice(0, 8);
      }
    }
    
    onChange(e);
  };

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
          className={`w-full px-3 py-2 h-10 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm ${
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
          onChange={type === 'number' ? handleNumberInput : onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          max={max}
          min={min}
          className={`w-full px-3 py-2 h-10 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
          step={step}
          onKeyPress={(e) => {
            if (type === 'number') {
              // Previne a entrada de 'e', '+', '-' em campos numéricos
              if (!/[\d.]/.test(e.key)) {
                e.preventDefault();
              }
              // Previne múltiplos pontos decimais
              if (e.key === '.' && (e.target as HTMLInputElement).value.includes('.')) {
                e.preventDefault();
              }
            }
          }}
        />
      )}
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField; 