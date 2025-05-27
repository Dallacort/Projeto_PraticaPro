// Interfaces para todas as entidades do sistema

export interface Pais {
  id: string;
  nome: string;
  codigo: string;
  sigla: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
  ativo?: boolean;
}

export interface Estado {
  id: number;
  nome: string;
  uf: string;
  paisId?: string;
  paisNome?: string;
  pais?: Pais;
  dataCadastro?: string;
  ultimaModificacao?: string;
  ativo?: boolean;
}

export interface Cidade {
  id: number;
  nome: string;
  estado: Estado;
  dataCadastro?: string;
  ultimaModificacao?: string;
  ativo?: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade: Cidade;
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface FormaPagamento {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataCadastro?: Date | string;
  ultimaModificacao?: Date | string;
}

export interface ParcelaCondicaoPagamento {
  id?: number;
  numero: number;
  dias: number;
  percentual: number;
  formaPagamentoId?: number | null;
  formaPagamentoDescricao?: string;
  formaPagamento?: FormaPagamento;
}

export interface CondicaoPagamento {
  id: number;
  condicaoPagamento: string;
  numeroParcelas: number;
  numeroTotalParcelas?: number;
  diasPrimeiraParcela: number;
  diasEntreParcelas: number;
  percentualJuros?: number;
  percentualMulta?: number;
  percentualDesconto?: number;
  formaPagamentoPadraoId?: number | null;
  formaPagamentoPadraoNome?: string;
  formaPagamentoPadrao?: FormaPagamento;
  parcelas?: ParcelaCondicaoPagamento[];
  parcelasCondicaoPagamento?: ParcelaCondicaoPagamento[];
  parcelasCondPagto?: ParcelaCondicaoPagamento[];
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade: Cidade;
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Produto {
  id: number;
  codigo?: string;
  nome: string;
  descricao?: string;
  precoVenda?: number;
  precoCusto?: number;
  unidade?: string;
  estoque?: number;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  quantidade?: number;
  valor?: number;
  ativo?: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface ProdutoFornecedor {
  id: number;
  produto: Produto;
  fornecedor: Fornecedor;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Transportadora {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade: Cidade;
  ativo: boolean;
  nome?: string;
  veiculos: any[];
  itens: any[];
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Veiculo {
  id: number;
  descricao: string;
  placa: string;
  anoModelo?: string;
  anoFabricacao?: string;
  capacidadeCarga?: number;
  observacoes?: string;
  ativo?: boolean;
  transportadora: Transportadora;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface TranspItem {
  id: number;
  itensTransportados: number;
  veiculo: Veiculo;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface StatusNfe {
  id: number;
  descricao: string;
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface ModalidadeNfe {
  id: number;
  codigo?: string;
  descricao: string;
  ativo?: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Nfe {
  id: number;
  numeroNf: string;
  dataEmissao: string;
  dataRecebimento: string;
  valorTotal: number;
  observacao?: string;
  cliente: Cliente;
  formaPagamento: FormaPagamento;
  condicaoPagamento: CondicaoPagamento;
  statusNfe: StatusNfe;
  modalidadeNfe: ModalidadeNfe;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface ItemNfe {
  id: number;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  nfe: Nfe;
  produto: Produto;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface MovimentacaoNfe {
  id: number;
  tipoMovimentacao: string;
  nfe: Nfe;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade: Cidade;
  cargo: string;
  salario: number;
  dataContratacao?: string;
  dataAdmissao?: string;
  dataDemissao?: string;
  ativo: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
} 