export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'funcionario'
  | 'professor'
  | 'aluno'
  | 'responsavel'

export type AlunoStatus = 'aguardando' | 'ativo' | 'inativo' | 'concluido'
export type TurmaStatus = 'ativa' | 'encerrada' | 'pausada'
export type MatriculaStatus = 'ativa' | 'trancada' | 'concluida'
export type CandidaturaStatus = 'pendente' | 'aprovada' | 'recusada' | 'cancelada'
export type SolicitacaoStatus = 'pendente' | 'aprovada' | 'recusada' | 'cancelada'
export type NecessidadeStatus = 'aberta' | 'encerrada' | 'pausada'
export type SitePostCategoria = 'projeto' | 'noticia' | 'galeria'
export type SiteTemplate =
  | 'minimalista'
  | 'comunitario'
  | 'institucional'
  | 'colorido'
  | 'galeria'

export type CorPrimaria =
  | 'azul-oceano'
  | 'verde-floresta'
  | 'laranja-energia'
  | 'roxo-criativo'
  | 'vermelho-forca'
  | 'rosa-acolhedor'
  | 'amarelo-alegria'
  | 'cinza-nobre'
  | 'indigo-confianca'
  | 'teal-equilibrio'

// ---- Database row types ----

export interface Organization {
  id: string
  slug: string
  nome: string
  cnpj: string | null
  plano: string
  ativo: boolean
  created_at: string
}

export interface Profile {
  id: string
  org_id: string
  nome: string
  email: string
  telefone: string | null
  role: UserRole
  ativo: boolean
  avatar_url: string | null
  created_at: string
}

export interface Aluno {
  id: string
  org_id: string
  profile_id: string | null
  nome: string
  cpf_encrypted: string | null
  data_nascimento: string | null
  telefone: string | null
  endereco: Record<string, string>
  status: AlunoStatus
  data_admissao: string | null
  observacoes: string | null
  created_at: string
}

export interface Responsavel {
  id: string
  org_id: string
  profile_id: string | null
  nome: string
  email: string | null
  telefone: string | null
  parentesco: string | null
  created_at: string
}

export interface Turma {
  id: string
  org_id: string
  nome: string
  descricao: string | null
  professor_id: string | null
  capacidade: number | null
  status: TurmaStatus
  horario: HorarioItem[]
  created_at: string
}

export interface HorarioItem {
  dia: string
  hora_inicio: string
  hora_fim: string
}

export interface Matricula {
  id: string
  org_id: string
  turma_id: string
  aluno_id: string
  status: MatriculaStatus
  data_matricula: string
  created_at: string
}

export interface Encontro {
  id: string
  org_id: string
  turma_id: string
  data: string
  hora_inicio: string | null
  hora_fim: string | null
  conteudo: string | null
  created_at: string
}

export interface Presenca {
  id: string
  org_id: string
  encontro_id: string
  aluno_id: string
  presente: boolean
  justificativa: string | null
  documento_url: string | null
  created_at: string
}

export interface Material {
  id: string
  org_id: string
  turma_id: string
  nome: string
  descricao: string | null
  url: string | null
  tipo: string
  created_at: string
}

export interface Atividade {
  id: string
  org_id: string
  turma_id: string
  professor_id: string | null
  titulo: string
  descricao: string | null
  data_entrega: string | null
  pontuacao_maxima: number | null
  created_at: string
}

export interface Entrega {
  id: string
  org_id: string
  atividade_id: string
  aluno_id: string
  conteudo: string | null
  arquivo_url: string | null
  nota: number | null
  feedback: string | null
  created_at: string
}

export interface Avaliacao {
  id: string
  org_id: string
  aluno_id: string
  turma_id: string | null
  professor_id: string | null
  tipo: string
  descricao: string | null
  pontuacao: number | null
  periodo: string | null
  created_at: string
}

export interface Comunicado {
  id: string
  org_id: string
  turma_id: string | null
  autor_id: string | null
  titulo: string
  conteudo: string
  visivel_para: UserRole[]
  publicado: boolean
  created_at: string
}

export interface FuncaoVoluntariado {
  id: string
  org_id: string
  nome: string
  descricao: string | null
  requisitos: string | null
  created_at: string
}

export interface NecessidadeVoluntariado {
  id: string
  org_id: string
  funcao_id: string | null
  titulo: string
  descricao: string | null
  vagas: number
  data_expiracao: string | null
  status: NecessidadeStatus
  created_at: string
}

export interface CandidaturaVoluntariado {
  id: string
  org_id: string
  necessidade_id: string | null
  nome: string
  email: string
  telefone: string | null
  mensagem: string | null
  status: CandidaturaStatus
  created_at: string
}

export interface ParticipanteVoluntariado {
  id: string
  org_id: string
  candidatura_id: string | null
  profile_id: string | null
  status: string
  created_at: string
}

export interface SiteConfig {
  id: string
  org_id: string
  template_id: SiteTemplate
  cor_primaria: CorPrimaria
  cor_secundaria: string | null
  logo_url: string | null
  hero_titulo: string | null
  hero_subtitulo: string | null
  hero_cta_texto: string | null
  hero_imagem_url: string | null
  sobre_titulo: string | null
  sobre_texto: string | null
  sobre_imagem_url: string | null
  missao: string | null
  valores: string[]
  contato: {
    email?: string
    telefone?: string
    endereco?: string
    whatsapp?: string
  }
  redes_sociais: {
    instagram?: string
    facebook?: string
    youtube?: string
    linkedin?: string
  }
  secoes_ativas: string[]
  publicado: boolean
  updated_at: string
}

export interface SitePost {
  id: string
  org_id: string
  titulo: string
  conteudo: string | null
  imagem_url: string | null
  categoria: SitePostCategoria
  publicado: boolean
  ordem: number
  created_at: string
}

export interface SiteGaleria {
  id: string
  org_id: string
  titulo: string | null
  imagem_url: string
  descricao: string | null
  created_at: string
}

export interface SolicitacaoAdmissao {
  id: string
  org_id: string
  tipo: 'aluno' | 'voluntario'
  nome: string
  email: string | null
  telefone: string | null
  dados: Record<string, unknown>
  status: SolicitacaoStatus
  created_at: string
}

export interface CustomDomain {
  id: string
  org_id: string
  domain: string
  verificado: boolean
  created_at: string
}

// ---- Paleta de cores ----

export const COLOR_PALETTE: Record<CorPrimaria, { label: string; primary: string; secondary: string }> = {
  'azul-oceano':      { label: 'Azul Oceano',      primary: '#1e40af', secondary: '#93c5fd' },
  'verde-floresta':   { label: 'Verde Floresta',    primary: '#15803d', secondary: '#86efac' },
  'laranja-energia':  { label: 'Laranja Energia',   primary: '#c2410c', secondary: '#fdba74' },
  'roxo-criativo':    { label: 'Roxo Criativo',     primary: '#7e22ce', secondary: '#d8b4fe' },
  'vermelho-forca':   { label: 'Vermelho Força',    primary: '#b91c1c', secondary: '#fca5a5' },
  'rosa-acolhedor':   { label: 'Rosa Acolhedor',    primary: '#be185d', secondary: '#f9a8d4' },
  'amarelo-alegria':  { label: 'Amarelo Alegria',   primary: '#a16207', secondary: '#fde68a' },
  'cinza-nobre':      { label: 'Cinza Nobre',       primary: '#374151', secondary: '#d1d5db' },
  'indigo-confianca': { label: 'Índigo Confiança',  primary: '#3730a3', secondary: '#a5b4fc' },
  'teal-equilibrio':  { label: 'Teal Equilíbrio',   primary: '#0f766e', secondary: '#99f6e4' },
}

// ---- Sidebar nav types ----

export interface NavItem {
  label: string
  href: string
  icon?: string
}
