import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  // Efeito para manipular o redimensionamento da janela
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Definir estado inicial da barra lateral com base no tamanho da tela
  useEffect(() => {
    setIsSidebarOpen(windowWidth >= 1024);
  }, [windowWidth]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    {
      title: 'Cadastros',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      items: [
        { name: 'Clientes', path: '/clientes', icon: '👤' },
        { name: 'Fornecedores', path: '/fornecedores', icon: '🏭' },
        { name: 'Produtos', path: '/produtos', icon: '📦' },
        { name: 'Marcas', path: '/marcas', icon: '🏷️' },
        { name: 'Unidades de Medida', path: '/unidades-medida', icon: '📏' },
        { name: 'Categorias', path: '/categorias', icon: '📂' },
        { name: 'Funcionários', path: '/funcionarios', icon: '👨‍💼' },
        { name: 'Funções de Funcionário', path: '/funcoes-funcionario', icon: '🎯' },
        { name: 'Transportadoras', path: '/transportadoras', icon: '🚚' },
        { name: 'Veículos', path: '/veiculos', icon: '🚗' },
        { name: 'Países', path: '/paises', icon: '🌎' },
        { name: 'Estados', path: '/estados', icon: '🗺️' },
        { name: 'Cidades', path: '/cidades', icon: '🏙️' },
      ],
    },
    {
      title: 'Financeiro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      items: [
        { name: 'Formas de Pagamento', path: '/formas-pagamento', icon: '💳' },
        { name: 'Condições de Pagamento', path: '/condicoes-pagamento', icon: '⏱️' },
      ],
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar para telas maiores */}
      <aside
        className={`bg-gray-800 text-white fixed lg:static h-full z-20 transition-all duration-300 shadow-xl ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
        }`}
      >
        {/* Sidebar content - only visible when open */}
        <div className={`h-full flex flex-col ${!isSidebarOpen && 'lg:block'}`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            {(isSidebarOpen || (!isSidebarOpen && windowWidth >= 1024)) && (
              <Link to="/" className={`text-xl font-bold ${!isSidebarOpen ? 'lg:text-xs lg:text-center w-full' : ''}`}>
                {isSidebarOpen ? 'Administração' : 'Admin'}
              </Link>
            )}
            {isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="focus:outline-none text-gray-400 hover:text-white"
                aria-label="Recolher menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-4 space-y-2">
            <div className="px-3">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-lg ${
                  isActive('/') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } transition-all`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isSidebarOpen && <span>Dashboard</span>}
              </Link>
            </div>

            {menuItems.map((section, index) => (
              <div key={index} className="px-3 py-2">
                <h2 className={`font-medium text-xs text-gray-400 uppercase tracking-wider mb-2 px-3 ${!isSidebarOpen ? 'lg:text-center' : ''}`}>
                  {isSidebarOpen ? section.title : ''}
                  {!isSidebarOpen && (
                    <div className="flex justify-center mt-1">
                      {section.icon}
                    </div>
                  )}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg ${
                        isActive(item.path) 
                          ? 'bg-indigo-700 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } transition-all ${!isSidebarOpen ? 'lg:justify-center' : ''}`}
                      title={!isSidebarOpen ? item.name : ''}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {isSidebarOpen && <span>{item.name}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Botão para expandir a sidebar em telas grandes quando está fechada */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex fixed z-20 left-20 top-4 bg-gray-700 text-white p-1 rounded focus:outline-none hover:bg-gray-600"
          title="Expandir menu"
          aria-label="Expandir menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Overlay para fechar a sidebar em mobile */}
      {isSidebarOpen && windowWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="bg-white text-gray-800 shadow-sm z-10">
          <div className="container mx-auto p-4 flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="mr-3 text-gray-600 focus:outline-none hover:text-gray-800 lg:hidden"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Sistema Administrativo</h1>
            </div>

            <div className="flex items-center">
              <div className="mr-4 hidden md:block">
                <span className="text-gray-600">Bem-vindo(a), Administrador</span>
              </div>
              <div className="relative">
                <button className="flex items-center text-gray-700 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="font-medium">A</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:hidden">
              <button 
                onClick={toggleMobileMenu} 
                className="text-gray-600 focus:outline-none hover:text-gray-800"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {isMobileMenuOpen && (
            <div className="bg-white border-t border-gray-200 py-2 shadow-md lg:hidden">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              {menuItems.map((section, index) => (
                <div key={index} className="py-1">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    {section.title}
                  </h3>
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-inner py-3 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} Sistema Administrativo - Todos os direitos reservados</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 