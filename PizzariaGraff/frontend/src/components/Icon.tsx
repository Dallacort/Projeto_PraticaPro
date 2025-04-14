import React from 'react';
import { IconType } from 'react-icons';

interface IconProps {
  Icon: IconType;
  size?: number;
  spinning?: boolean;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ Icon, size = 16, spinning = false, className = '' }) => {
  const combinedClassName = `${spinning ? 'animate-spin' : ''} ${className}`.trim();
  
  return (
    <span className={combinedClassName}>
      <Icon size={size} />
    </span>
  );
};

export default Icon; 