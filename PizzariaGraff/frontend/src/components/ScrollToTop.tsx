import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Componente para rolar para o topo quando a rota muda
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop; 