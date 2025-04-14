import React from 'react';

interface LoadingPageProps {
  title?: string;
  message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  title = 'Carregando', 
  message = 'Esta página está sendo carregada...' 
}) => (
  <div className="flex flex-col justify-center items-center h-full p-8">
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-3 text-gray-600">{message}</p>
    </div>
  </div>
);

export default LoadingPage; 