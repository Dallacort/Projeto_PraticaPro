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
  categoriaId?: number;
  categoriaNome?: string;
  categoria?: Categoria;
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
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface UnidadeMedida {
  id: number;
  unidadeMedida: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface Categoria {
  id: number;
  categoria: string;
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
  transportadora: string;
  razaoSocial?: string;
  apelido: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  cnpj?: string;
  rgIe?: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  tipo: number;
  observacao?: string;
  cidade: Cidade | null;
  cidadeId?: number;
  condicaoPagamentoId?: number;
  ativo: boolean;
  nome?: string;
  veiculos?: any[];
  veiculoIds?: number[];
  itens?: any[];
  emailsAdicionais?: string[];
  telefonesAdicionais?: string[];
  dataCadastro?: string;
  ultimaModificacao?: string;
  dataCriacao?: string;
  dataAlteracao?: string;
}

export interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano?: string;
  capacidade?: number;
  transportadoraId: number;
  ativo?: boolean;
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
  tipo?: number;                   // Tipo do funcionário (1=Pessoa Física, 2=Pessoa Jurídica)
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
  dataCadastro?: string;
  ultimaModificacao?: string;
}

export interface ProdutoNota {
  produtoId: number;
  produtoNome?: string;
  produtoCodigo?: string;
  sequencia: number;
  quantidade: number;
  valorUnitario: number;
  valorDesconto?: number;
  percentualDesconto?: number;
  valorTotal: number;
  rateioFrete?: number;
  rateioSeguro?: number;
  rateioOutras?: number;
  custoPrecoFinal?: number;
}

export interface NotaEntrada {
  numero: string;
  modelo: string;
  serie: string;
  fornecedorId: number;
  fornecedorNome?: string;
  dataEmissao: string;
  dataChegada?: string;
  tipoFrete: string;
  valorProdutos: number;
  valorFrete?: number;
  valorSeguro?: number;
  outrasDespesas?: number;
  valorDesconto?: number;
  valorTotal: number;
  condicaoPagamentoId?: number;
  condicaoPagamentoNome?: string;
  transportadoraId?: number;
  transportadoraNome?: string;
  placaVeiculo?: string;
  observacoes?: string;
  situacao?: string;
  dataCriacao?: string;
  dataAlteracao?: string;
  produtos: ProdutoNota[];
}

export interface ProdutoNotaSaida {
  produtoId: number;
  produtoNome?: string;
  produtoCodigo?: string;
  sequencia: number;
  quantidade: number;
  valorUnitario: number;
  valorDesconto?: number;
  percentualDesconto?: number;
  valorTotal: number;
  rateioFrete?: number;
  rateioSeguro?: number;
  rateioOutras?: number;
  custoPrecoFinal?: number;
}

export interface NotaSaida {
  numero: string;
  modelo: string;
  serie: string;
  clienteId: number;
  clienteNome?: string;
  dataEmissao: string;
  dataSaida?: string;
  tipoFrete: string;
  valorProdutos: number;
  valorFrete?: number;
  valorSeguro?: number;
  outrasDespesas?: number;
  valorDesconto?: number;
  valorTotal: number;
  condicaoPagamentoId?: number;
  condicaoPagamentoNome?: string;
  transportadoraId?: number;
  transportadoraNome?: string;
  placaVeiculo?: string;
  observacoes?: string;
  situacao?: string;
  dataCriacao?: string;
  dataAlteracao?: string;
  produtos: ProdutoNotaSaida[];
}

export interface ContaPagar {
  id?: number;
  notaNumero: string;
  notaModelo: string;
  notaSerie: string;
  fornecedorId: number;
  fornecedorNome?: string;
  numeroParcela: number;
  totalParcelas: number;
  valorOriginal: number;
  valorPago?: number;
  valorDesconto?: number;
  valorJuros?: number;
  valorMulta?: number;
  valorTotal: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  formaPagamentoId?: number;
  formaPagamentoNome?: string;
  situacao?: string; // PENDENTE, PAGA, VENCIDA, CANCELADA, PARCIALMENTE_PAGA
  observacoes?: string;
  dataCriacao?: string;
  dataAlteracao?: string;
}

export interface ContaPagarAvulsa {
  id?: number;
  numeroNota?: string;
  modelo?: string;
  serie?: string;
  fornecedorId: number;
  fornecedorNome?: string;
  numParcela: number;
  valorParcela: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  valorPago?: number;
  juros?: number;
  multa?: number;
  desconto?: number;
  status?: string; // PENDENTE, PAGA, VENCIDA, CANCELADA
  formaPagamentoId?: number;
  formaPagamentoNome?: string;
  observacao?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ContaReceber {
  id?: number;
  notaNumero: string;
  notaModelo: string;
  notaSerie: string;
  clienteId: number;
  clienteNome?: string;
  numeroParcela: number;
  totalParcelas: number;
  valorOriginal: number;
  valorRecebido?: number;
  valorDesconto?: number;
  valorJuros?: number;
  valorMulta?: number;
  valorTotal: number;
  dataEmissao: string;
  dataVencimento: string;
  dataRecebimento?: string;
  formaPagamentoId?: number;
  formaPagamentoNome?: string;
  situacao?: string; // PENDENTE, RECEBIDA, VENCIDA, CANCELADA, PARCIALMENTE_RECEBIDA
  observacoes?: string;
  dataCriacao?: string;
  dataAlteracao?: string;
}

export interface FormaPagamento {
  id: number;
  formaPagamento: string;
  descricao?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAlteracao?: string;
} 