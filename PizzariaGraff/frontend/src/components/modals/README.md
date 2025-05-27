# Modais de Visualização

Este diretório contém os componentes de modal reutilizáveis para exibição de detalhes de várias entidades no sistema.

## Estrutura

1. **ViewModal.tsx**: Modal base genérico que todos os modais específicos devem usar.
2. **[Entidade]ViewModal.tsx**: Modais específicos para cada tipo de entidade.
3. **index.ts**: Arquivo para exportação centralizada de todos os modais.

## Criando um novo modal de visualização

Para criar um novo modal de visualização para uma entidade, siga os passos abaixo:

1. Crie um novo arquivo `[Entidade]ViewModal.tsx`
2. Use o `ViewModal` como componente base
3. Adicione a lógica específica para exibir os dados da entidade
4. Exporte o novo modal no arquivo `index.ts`

## Template para novos modais

```tsx
// [Entidade]ViewModal.tsx
import React from 'react';
import { [Entidade] } from '../../types';
import ViewModal from './ViewModal';

interface [Entidade]ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  [entidade]: [Entidade] | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para [Entidade]
 */
const [Entidade]ViewModal: React.FC<[Entidade]ViewModalProps> = ({
  isOpen,
  onClose,
  [entidade],
  loading = false
}) => {
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar [Entidade]"
      loading={loading}
    >
      {[entidade] ? (
        <div className="space-y-6">
          {/* Dados básicos */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              {/* Adicione status ou outras informações de destaque aqui */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo 1 */}
              <div>
                <p className="text-sm font-medium text-gray-500">Nome do Campo</p>
                <p className="font-semibold">{[entidade].campo1}</p>
              </div>
              
              {/* Campo 2 */}
              <div>
                <p className="text-sm font-medium text-gray-500">Nome do Campo</p>
                <p className="font-semibold">{[entidade].campo2}</p>
              </div>
              
              {/* Adicione mais campos conforme necessário */}
            </div>
          </div>
          
          {/* Seção de dados relacionados, como itens, se aplicável */}
          {[entidade].itensRelacionados && [entidade].itensRelacionados.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Itens Relacionados</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* Cabeçalhos da tabela */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome da Coluna 1
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome da Coluna 2
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[entidade].itensRelacionados.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.campo1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.campo2}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Nenhuma informação disponível</p>
      )}
    </ViewModal>
  );
};

export default [Entidade]ViewModal;
```

## Uso no componente de listagem

```tsx
// No arquivo de listagem da entidade
import { [Entidade]ViewModal } from '../../components/modals';

const [Entidade]List: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selected[Entidade], setSelected[Entidade]] = useState<[Entidade] | null>(null);

  const handleView = async (id: string | number) => {
    setModalLoading(true);
    setModalOpen(true);
    try {
      const data = await [Entidade]Service.getById(Number(id));
      setSelected[Entidade](data);
    } catch (error) {
      console.error(`Erro ao carregar [entidade]:`, error);
      toast.error(`Erro ao carregar detalhes da [entidade]`);
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected[Entidade](null);
  };

  // Resto do código da listagem...

  return (
    <>
      {/* Conteúdo da listagem... */}
      
      <[Entidade]ViewModal
        isOpen={modalOpen}
        onClose={closeModal}
        [entidade]={selected[Entidade]}
        loading={modalLoading}
      />
    </>
  );
};
```

Use o modal de Condição de Pagamento como referência para implementar novos modais no sistema. 