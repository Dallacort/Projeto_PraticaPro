import React from 'react';
import { Link } from 'react-router-dom';

interface EntityLinkProps {
  id: string | number;
  label: string;
  entityName: string;
  toList?: boolean;
}

const EntityLink: React.FC<EntityLinkProps> = ({ id, label, entityName, toList = false }) => {
  const formattedName = entityName.toLowerCase().replace(/\s+/g, '-');
  
  const linkTo = toList ? `/${formattedName}` : `/${formattedName}/${id}`;
  
  return (
    <Link
      to={linkTo}
      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full"
    >
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      {label}
    </Link>
  );
};

export default EntityLink; 