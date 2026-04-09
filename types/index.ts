export type MenuItem = {
  title: string;
  href: string;
};

export type StatCardItem = {
  title: string;
  value: string;
  description: string;
};

export type Professor = {
  id: number;
  nome_completo: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  area_atuacao: string | null;
  status: string;
  termo_aceito: boolean;
  termo_aceito_em: string | null;
  termo_versao: string | null;
  created_at: string;
  updated_at: string;
};

export type Turma = {
  id: number;
  nome: string;
  descricao: string | null;
  professor_id: number | null;
  vagas_total: number;
  vagas_preenchidas: number;
  inscricao_abertura_em: string | null;
  inscricao_encerra_em: string | null;
  status: string;
  exibir_publicamente: boolean;
  created_at: string;
  updated_at: string;
};

export type FuncaoVoluntariado = {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type NecessidadeVoluntariado = {
  id: number;
  funcao_id: number;
  titulo_publico: string;
  descricao: string | null;
  quantidade_total: number;
  quantidade_aprovada: number;
  data_limite_inscricao: string | null;
  data_limite_inscricao_em?: string | null;
  status: string;
  exibir_publicamente: boolean;
  created_at: string;
  updated_at: string;
};

export type CandidaturaVoluntariado = {
  id: number;
  necessidade_id: number;
  nome_completo: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  disponibilidade: string | null;
  observacoes: string | null;
  status: string;
  termo_aceito: boolean;
  termo_aceito_em: string | null;
  termo_versao: string | null;
  created_at: string;
  updated_at: string;
};
