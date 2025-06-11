// Interfaces para todas as entidades do sistema

export interface Pais {
  id: number;
  nome: string;
  codigo: string;
  sigla: string;
  nacionalidade?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
  ativo?: boolean;
}

export interface Estado {
  id: number;
  nome: string;
  uf: string;
  paisId?: number;
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

export interface FuncaoFuncionario {
  id: number;
  funcaoFuncionario?: string;        // Nome principal da função
  requerCNH?: boolean;               // Se requer CNH
  cargaHoraria?: number;             // Carga horária semanal
  descricao?: string;                // Descrição detalhada
  observacao?: string;               // Observações
  situacao?: string;                 // Data da situação
  dataCriacao?: string;              // Data de criação
  dataAlteracao?: string;            // Data de alteração
  
  // Campos legados (compatibilidade)
  salarioBase?: number;
  ativo?: boolean;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Cliente {
  id: number;
  cliente: string;
  nome?: string;
  apelido?: string;
  cpfCpnj?: string;
  cpfCnpj?: string;
  rgInscricaoEstadual?: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade: Cidade;
  cidadeId?: number;
  nacionalidadeId?: number;
  dataNascimento?: string;
  estadoCivil?: string;
  tipo?: number;
  sexo?: string;
  limiteCredito?: number;
  observacao?: string;
  ativo?: boolean;
  condicaoPagamentoId?: number;
  condicaoPagamentoNome?: string;
  dataCriacao?: string;
  dataAlteracao?: string;
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
  fornecedor: string;
  razaoSocial?: string;
  apelido: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  cnpj?: string;
  rgInscricaoEstadual?: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade: Cidade | null;
  cidadeId?: number;
  tipo?: number;
  observacoes?: string;
  condicaoPagamentoId?: number;
  limiteCredito?: number;
  situacao?: string;
  ativo: boolean;
  nacionalidadeId?: number;
  transportadoraId?: number;
  dataCriacao?: string;
  dataAlteracao?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
  emailsAdicionais?: string[];
  telefonesAdicionais?: string[];
}

export interface Produto {
  id: number;
  produto?: string;
  nome?: string;
  codigoBarras?: string;
  referencia?: string;
  descricao?: string;
  observacoes?: string;
  valorCompra?: number;
  valorVenda?: number;
  percentualLucro?: number;
  quantidade?: number;
  quantidadeMinima?: number;
  marcaId?: number;
  marcaNome?: string;
  marca?: Marca;
  unidadeMedidaId?: number;
  unidadeMedidaNome?: string;
  unidadeMedida?: UnidadeMedida;
  situacao?: string;
  codigo?: string;
  precoVenda?: number;
  precoCusto?: number;
  unidade?: string;
  estoque?: number;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  valor?: number;
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Marca {
  id: number;
  marca: string;
  situacao?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface UnidadeMedida {
  id: number;
  unidadeMedida: string;
  situacao?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
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
  funcionario?: string;
  nome?: string;
  apelido?: string;
  cpfCpnj?: string;
  rgInscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cnh?: string;
  dataValidadeCnh?: string;
  sexo?: number;
  observacao?: string;
  estadoCivil?: number;
  salario?: number;
  nacionalidadeId?: number;        // FK para Pais (renomeado de nacionalidade)
  nacionalidadeNome?: string;      // Nome da nacionalidade
  dataNascimento?: string;
  dataAdmissao?: string;
  dataDemissao?: string;
  cidade?: Cidade;
  cidadeId?: number;
  funcaoFuncionario?: FuncaoFuncionario;
  funcaoFuncionarioId?: number;
  cargo?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
} 