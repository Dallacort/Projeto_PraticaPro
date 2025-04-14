import React from 'react';

const NotAuthorizedPage: React.FC = () => (
  <div className="py-10 text-center">
    <h2 className="text-2xl font-bold text-orange-600 mb-4">Acesso Negado</h2>
    <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
  </div>
);

export default NotAuthorizedPage; 