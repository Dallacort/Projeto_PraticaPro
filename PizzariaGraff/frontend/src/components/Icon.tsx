import React from 'react';
import { IconType } from 'react-icons';

interface IconProps {
  // Usando any para ignorar a verificação de tipo
  IconComponent: any;
  size?: number;
  spinning?: boolean;
  className?: string;
}

const Icon = ({ IconComponent, size = 16, spinning = false, className = '' }: IconProps) => {
  const combinedClassName = `${spinning ? 'animate-spin' : ''} ${className}`.trim();
  
  return (
    <span className={combinedClassName}>
      <IconComponent size={size} />
    </span>
  );
};

export default Icon; 