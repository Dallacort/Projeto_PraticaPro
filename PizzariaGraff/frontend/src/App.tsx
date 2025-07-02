import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// Páginas principais
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import NotAuthorizedPage from './pages/NotAuthorizedPage';
import LoadingPage from './pages/LoadingPage';

// Páginas de país
import PaisList from './pages/pais/PaisList';
import PaisForm from './pages/pais/PaisForm';

// Páginas de estado
import EstadoList from './pages/estado/EstadoList';
import EstadoForm from './pages/estado/EstadoForm';

// Páginas de cidade
import CidadeList from './pages/cidade/CidadeList';
import CidadeForm from './pages/cidade/CidadeForm';

// Páginas de cliente
import ClienteList from './pages/cliente/ClienteList';
import ClienteForm from './pages/cliente/ClienteForm';

// Páginas de funcionário
import FuncionarioList from './pages/funcionario/FuncionarioList';
import FuncionarioForm from './pages/funcionario/FuncionarioForm';

// Páginas de função de funcionário
import FuncaoFuncionarioList from './pages/funcao-funcionario/FuncaoFuncionarioList';
import FuncaoFuncionarioForm from './pages/funcao-funcionario/FuncaoFuncionarioForm';

// Páginas de fornecedor
import FornecedorList from './pages/fornecedor/FornecedorList';
import FornecedorForm from './pages/fornecedor/FornecedorForm';

// Páginas de transportadora
import TransportadoraList from './pages/transportadora/TransportadoraList';
import TransportadoraForm from './pages/transportadora/TransportadoraForm';

// Páginas de produto
import ProdutoList from './pages/produto/ProdutoList';
import ProdutoForm from './pages/produto/ProdutoForm';

// Páginas de marca
import MarcaList from './pages/marca/MarcaList';
import MarcaForm from './pages/marca/MarcaForm';

// Páginas de unidade de medida
import UnidadeMedidaList from './pages/unidade-medida/UnidadeMedidaList';
import UnidadeMedidaForm from './pages/unidade-medida/UnidadeMedidaForm';

// Páginas de categoria
import CategoriaList from './pages/categoria/CategoriaList';
import CategoriaForm from './pages/categoria/CategoriaForm';

// Páginas de veículo
import VeiculoList from './pages/veiculo/VeiculoList';
import VeiculoForm from './pages/veiculo/VeiculoForm';

// Páginas de forma de pagamento
import FormaPagamentoList from './pages/forma-pagamento/FormaPagamentoList';
import FormaPagamentoForm from './pages/forma-pagamento/FormaPagamentoForm';

// Páginas de condição de pagamento
import CondicaoPagamentoList from './pages/condicao-pagamento/CondicaoPagamentoList';
import CondicaoPagamentoForm from './pages/condicao-pagamento/CondicaoPagamentoForm';

// Páginas de modalidade de NFe
import ModalidadeNfeList from './pages/modalidade-nfe/ModalidadeNfeList';
import ModalidadeNfeForm from './pages/modalidade-nfe/ModalidadeNfeForm';

// Páginas de nota fiscal
import NfeList from './pages/nota-fiscal/NfeList';
import NfeForm from './pages/nota-fiscal/NfeForm';

// Página de login temporária
const LoginPage: React.FC = () => (
  <div className="flex justify-center items-center h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <div className="text-center text-gray-600">
        <p>Página de login em desenvolvimento.</p>
        <button 
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={() => window.location.href = '/'}
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  </div>
);

// Contexto de usuário simplificado
const UserContext = React.createContext<any>(null);
const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserContext.Provider value={{ user: { nome: 'Usuário' } }}>
      {children}
    </UserContext.Provider>
  );
};

const App: React.FC = () => {
  // Estado para controlar quando a aplicação está totalmente carregada
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular inicialização da aplicação
    const initApp = async () => {
      try {
        // Aqui podemos fazer inicializações necessárias
        // Por exemplo: carregar configurações, verificar autenticação, etc.
        
        // Simular um tempo de carregamento para demonstração
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Erro durante a inicialização da aplicação:', error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3">Carregando aplicação...</span>
      </div>
    );
  }

  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Rota pública para login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas em Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            
            {/* Rotas para Países */}
            <Route path="paises/novo" element={<PaisForm />} />
            <Route path="paises/:id" element={<PaisForm />} />
            <Route path="paises" element={<PaisList />} />
            
            {/* Rotas para Estados */}
            <Route path="estados/novo" element={<EstadoForm />} />
            <Route path="estados/:id" element={<EstadoForm />} />
            <Route path="estados" element={<EstadoList />} />
            
            {/* Rotas para Cidades */}
            <Route path="cidades/novo" element={<CidadeForm />} />
            <Route path="cidades/:id" element={<CidadeForm />} />
            <Route path="cidades" element={<CidadeList />} />
            
            {/* Rotas para Clientes */}
            <Route path="clientes/novo" element={<ClienteForm />} />
            <Route path="clientes/:id" element={<ClienteForm />} />
            <Route path="clientes" element={<ClienteList />} />
            
            {/* Rotas para Fornecedores */}
            <Route path="fornecedores/novo" element={<FornecedorForm />} />
            <Route path="fornecedores/:id" element={<FornecedorForm />} />
            <Route path="fornecedores" element={<FornecedorList />} />
            
            {/* Rotas para Funcionários */}
            <Route path="funcionarios/novo" element={<FuncionarioForm />} />
            <Route path="funcionarios/:id" element={<FuncionarioForm />} />
            <Route path="funcionarios" element={<FuncionarioList />} />
            
            {/* Rotas para Funções de Funcionário */}
            <Route path="funcoes-funcionario/novo" element={<FuncaoFuncionarioForm />} />
            <Route path="funcoes-funcionario/:id" element={<FuncaoFuncionarioForm />} />
            <Route path="funcoes-funcionario" element={<FuncaoFuncionarioList />} />
            
            {/* Rotas para Transportadoras */}
            <Route path="transportadoras/novo" element={<TransportadoraForm />} />
            <Route path="transportadoras/:id" element={<TransportadoraForm />} />
            <Route path="transportadoras" element={<TransportadoraList />} />
            
            {/* Rotas para Produtos */}
            <Route path="produtos/novo" element={<ProdutoForm />} />
            <Route path="produtos/:id" element={<ProdutoForm />} />
            <Route path="produtos" element={<ProdutoList />} />
            
            {/* Rotas para Veículos */}
            <Route path="veiculos/novo" element={<VeiculoForm />} />
            <Route path="veiculos/:id" element={<VeiculoForm />} />
            <Route path="veiculos" element={<VeiculoList />} />
            
            {/* Rotas para Formas de Pagamento */}
            <Route path="formas-pagamento/novo" element={<FormaPagamentoForm />} />
            <Route path="formas-pagamento/:id" element={<FormaPagamentoForm />} />
            <Route path="formas-pagamento" element={<FormaPagamentoList />} />
            
            {/* Rotas para Condições de Pagamento */}
            <Route path="/condicoes-pagamento" element={<CondicaoPagamentoList />} />
            <Route path="/condicoes-pagamento/novo" element={<CondicaoPagamentoForm />} />
            <Route path="/condicoes-pagamento/:id" element={<CondicaoPagamentoForm />} />
            
            {/* Rotas para Modalidades de NFe */}
            <Route path="modalidades-nfe/novo" element={<ModalidadeNfeForm />} />
            <Route path="modalidades-nfe/:id" element={<ModalidadeNfeForm />} />
            <Route path="modalidades-nfe" element={<ModalidadeNfeList />} />
            
            {/* Notas Fiscais */}
            <Route path="notas-fiscais/novo" element={<NfeForm />} />
            <Route path="notas-fiscais/:id" element={<NfeForm />} />
            <Route path="notas-fiscais" element={<NfeList />} />
            
            {/* Rotas para Marcas */}
            <Route path="marcas/novo" element={<MarcaForm />} />
            <Route path="marcas/:id/visualizar" element={<MarcaForm />} />
            <Route path="marcas/:id" element={<MarcaForm />} />
            <Route path="marcas" element={<MarcaList />} />
            
            {/* Rotas para Unidades de Medida */}
            <Route path="unidades-medida/novo" element={<UnidadeMedidaForm />} />
            <Route path="unidades-medida/:id/visualizar" element={<UnidadeMedidaForm />} />
            <Route path="unidades-medida/:id" element={<UnidadeMedidaForm />} />
            <Route path="unidades-medida" element={<UnidadeMedidaList />} />
            
            {/* Rotas para Categorias */}
            <Route path="categorias/novo" element={<CategoriaForm />} />
            <Route path="categorias/:id/editar" element={<CategoriaForm />} />
            <Route path="categorias/:id" element={<CategoriaForm />} />
            <Route path="categorias" element={<CategoriaList />} />
            
            {/* Rota para página não encontrada (deve ficar por último) */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          
          {/* Rota para não autorizado */}
          <Route path="/unauthorized" element={<NotAuthorizedPage />} />
          
          {/* Redirecionar para a Dashboard se a URL for / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
