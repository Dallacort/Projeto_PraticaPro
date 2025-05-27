import React from 'react';
import FormField from './FormField';

interface PaisFormFieldsProps {
  formData: {
    nome?: string;
    sigla?: string;
    codigo?: string;
    [key: string]: any;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const PaisFormFields: React.FC<PaisFormFieldsProps> = ({ formData, onChange }) => {
  // Função que lida com a mudança da sigla, convertendo para maiúsculas
  const handleSiglaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    
    // Criar um evento sintético que mantém a estrutura original do evento
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'sigla',
        value: upperValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-2">
        <FormField
          label="Nome"
          name="nome"
          value={formData.nome || ''}
          onChange={onChange}
          required
          placeholder="Digite o nome do país"
          error={!formData.nome ? 'Campo obrigatório' : undefined}
        />
      </div>
      
      <div className="col-span-1">
        <FormField
          label="Sigla"
          name="sigla"
          value={formData.sigla || ''}
          onChange={handleSiglaChange}
          required
          placeholder="BR"
          error={!formData.sigla ? 'Campo obrigatório' : undefined}
        />
      </div>
      
      <div className="col-span-1">
        <FormField
          label="Código"
          name="codigo"
          value={formData.codigo || ''}
          onChange={onChange}
          placeholder="55"
          error={undefined}
        />
      </div>
    </div>
  );
};

export default PaisFormFields; 