-- ============================================================
-- OSTRICH SOCIAL — Schema inicial completo
-- Rodar APÓS o 0000_drop_all.sql no SQL Editor do Supabase
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELAS RAIZ (sem org_id)
-- ============================================================

CREATE TABLE public.organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  nome        text NOT NULL,
  cnpj        text,
  plano       text NOT NULL DEFAULT 'free',
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.custom_domains (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain      text UNIQUE NOT NULL,
  verificado  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Perfis: ponte entre auth.users e organizations
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  email       text NOT NULL,
  telefone    text,
  role        text NOT NULL CHECK (role IN ('superadmin','admin','funcionario','professor','aluno','responsavel')),
  ativo       boolean NOT NULL DEFAULT true,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- DOMÍNIO — PESSOAS
-- ============================================================

CREATE TABLE public.alunos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome            text NOT NULL,
  cpf_encrypted   text,
  data_nascimento date,
  telefone        text,
  endereco        jsonb DEFAULT '{}',
  status          text NOT NULL DEFAULT 'ativo' CHECK (status IN ('aguardando','ativo','inativo','concluido')),
  data_admissao   date DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.responsaveis (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome        text NOT NULL,
  email       text,
  telefone    text,
  parentesco  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.responsavel_aluno (
  responsavel_id  uuid NOT NULL REFERENCES public.responsaveis(id) ON DELETE CASCADE,
  aluno_id        uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  PRIMARY KEY (responsavel_id, aluno_id)
);

-- ============================================================
-- DOMÍNIO — TURMAS E SISTEMA ACADÊMICO
-- ============================================================

CREATE TABLE public.turmas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  descricao   text,
  professor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  capacidade  integer,
  status      text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','encerrada','pausada')),
  horario     jsonb DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.matriculas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  turma_id        uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  aluno_id        uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','trancada','concluida')),
  data_matricula  date NOT NULL DEFAULT CURRENT_DATE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (turma_id, aluno_id)
);

CREATE TABLE public.encontros (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  turma_id    uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  data        date NOT NULL,
  hora_inicio time,
  hora_fim    time,
  conteudo    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.presencas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  encontro_id     uuid NOT NULL REFERENCES public.encontros(id) ON DELETE CASCADE,
  aluno_id        uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  presente        boolean NOT NULL DEFAULT false,
  justificativa   text,
  documento_url   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (encontro_id, aluno_id)
);

CREATE TABLE public.materiais (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  turma_id    uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  descricao   text,
  url         text,
  tipo        text DEFAULT 'arquivo',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.atividades (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  turma_id          uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  titulo            text NOT NULL,
  descricao         text,
  data_entrega      date,
  pontuacao_maxima  numeric(5,2),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.entregas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  atividade_id uuid NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id    uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  conteudo    text,
  arquivo_url text,
  nota        numeric(5,2),
  feedback    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (atividade_id, aluno_id)
);

CREATE TABLE public.avaliacoes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  aluno_id      uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  turma_id      uuid REFERENCES public.turmas(id) ON DELETE SET NULL,
  professor_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tipo          text NOT NULL DEFAULT 'geral',
  descricao     text,
  pontuacao     numeric(5,2),
  periodo       text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.comunicados (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  turma_id      uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  autor_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  titulo        text NOT NULL,
  conteudo      text NOT NULL,
  visivel_para  text[] NOT NULL DEFAULT ARRAY['professor','aluno','responsavel'],
  publicado     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- DOMÍNIO — VOLUNTARIADO
-- ============================================================

CREATE TABLE public.funcoes_voluntariado (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  descricao   text,
  requisitos  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.necessidades_voluntariado (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  funcao_id       uuid REFERENCES public.funcoes_voluntariado(id) ON DELETE SET NULL,
  titulo          text NOT NULL,
  descricao       text,
  vagas           integer DEFAULT 1,
  data_expiracao  date,
  status          text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','encerrada','pausada')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.candidaturas_voluntariado (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  necessidade_id  uuid REFERENCES public.necessidades_voluntariado(id) ON DELETE SET NULL,
  nome            text NOT NULL,
  email           text NOT NULL,
  telefone        text,
  mensagem        text,
  status          text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovada','recusada','cancelada')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.participantes_voluntariado (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  candidatura_id  uuid REFERENCES public.candidaturas_voluntariado(id) ON DELETE SET NULL,
  profile_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','desligado')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- DOMÍNIO — SITE PÚBLICO / CMS
-- ============================================================

CREATE TABLE public.site_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id     text NOT NULL DEFAULT 'comunitario'
                    CHECK (template_id IN ('minimalista','comunitario','institucional','colorido','galeria')),
  cor_primaria    text NOT NULL DEFAULT 'azul-oceano',
  cor_secundaria  text,
  logo_url        text,
  -- Seções fixas
  hero_titulo     text,
  hero_subtitulo  text,
  hero_cta_texto  text DEFAULT 'Saiba mais',
  hero_imagem_url text,
  sobre_titulo    text,
  sobre_texto     text,
  sobre_imagem_url text,
  missao          text,
  valores         text[] DEFAULT ARRAY[]::text[],
  -- Contato e redes sociais
  contato         jsonb DEFAULT '{}',
  redes_sociais   jsonb DEFAULT '{}',
  -- Controle de seções
  secoes_ativas   text[] DEFAULT ARRAY['hero','sobre','projetos','galeria','voluntariado','contato'],
  publicado       boolean NOT NULL DEFAULT false,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  conteudo    text,
  imagem_url  text,
  categoria   text DEFAULT 'projeto' CHECK (categoria IN ('projeto','noticia','galeria')),
  publicado   boolean NOT NULL DEFAULT false,
  ordem       integer DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_galeria (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  titulo      text,
  imagem_url  text NOT NULL,
  descricao   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.solicitacoes_admissao (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tipo        text NOT NULL DEFAULT 'aluno' CHECK (tipo IN ('aluno','voluntario')),
  nome        text NOT NULL,
  email       text,
  telefone    text,
  dados       jsonb DEFAULT '{}',
  status      text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovada','recusada','cancelada')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_profiles_org_id ON public.profiles(org_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_alunos_org_id ON public.alunos(org_id);
CREATE INDEX idx_turmas_org_id ON public.turmas(org_id);
CREATE INDEX idx_turmas_professor ON public.turmas(professor_id);
CREATE INDEX idx_matriculas_turma ON public.matriculas(turma_id);
CREATE INDEX idx_matriculas_aluno ON public.matriculas(aluno_id);
CREATE INDEX idx_encontros_turma ON public.encontros(turma_id);
CREATE INDEX idx_presencas_encontro ON public.presencas(encontro_id);
CREATE INDEX idx_presencas_aluno ON public.presencas(aluno_id);
CREATE INDEX idx_comunicados_org ON public.comunicados(org_id);
CREATE INDEX idx_site_posts_org ON public.site_posts(org_id, publicado);
CREATE INDEX idx_candidaturas_org ON public.candidaturas_voluntariado(org_id, status);

-- ============================================================
-- TRIGGER: updated_at em site_config
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER: criar profile automaticamente ao criar auth.user
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Só cria profile se org_id vier nos metadados
  IF NEW.raw_user_meta_data->>'org_id' IS NOT NULL THEN
    INSERT INTO public.profiles (id, org_id, nome, email, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'org_id')::uuid,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'role', 'aluno')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsavel_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encontros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcoes_voluntariado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.necessidades_voluntariado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidaturas_voluntariado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_voluntariado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_admissao ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna org_id do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Função auxiliar: retorna role do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---- Organizations ----
-- Leitura: qualquer autenticado vê sua própria org
CREATE POLICY "org_select" ON public.organizations
  FOR SELECT USING (
    id = public.get_my_org_id()
    OR public.get_my_role() = 'superadmin'
  );

-- ---- Profiles ----
-- Leitura: vê perfis da mesma org
CREATE POLICY "profile_select" ON public.profiles
  FOR SELECT USING (
    org_id = public.get_my_org_id()
    OR public.get_my_role() = 'superadmin'
  );
-- Inserção: admin/superadmin cria perfis na sua org
CREATE POLICY "profile_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    org_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin','superadmin')
    OR public.get_my_role() = 'superadmin'
  );
-- Atualização: admin/superadmin atualiza perfis da sua org; usuário atualiza o próprio
CREATE POLICY "profile_update" ON public.profiles
  FOR UPDATE USING (
    org_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin','superadmin')
    OR id = auth.uid()
  );

-- ---- Macro policy helper: tabelas de domínio com org_id ----
-- Para cada tabela abaixo, aplica a política: usuário vê/altera linhas da sua org
-- (admins podem escrever, outros só leem — ajuste por módulo conforme necessário)

-- alunos
CREATE POLICY "alunos_select" ON public.alunos FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "alunos_write" ON public.alunos FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','funcionario','superadmin'));

-- responsaveis
CREATE POLICY "responsaveis_select" ON public.responsaveis FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "responsaveis_write" ON public.responsaveis FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','funcionario','superadmin'));

-- responsavel_aluno
CREATE POLICY "responsavel_aluno_select" ON public.responsavel_aluno FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.responsaveis r WHERE r.id = responsavel_id AND r.org_id = public.get_my_org_id())
    OR public.get_my_role() = 'superadmin'
  );
CREATE POLICY "responsavel_aluno_write" ON public.responsavel_aluno FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.responsaveis r WHERE r.id = responsavel_id AND r.org_id = public.get_my_org_id())
    AND public.get_my_role() IN ('admin','funcionario','superadmin')
  );

-- turmas
CREATE POLICY "turmas_select" ON public.turmas FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "turmas_write" ON public.turmas FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

-- matriculas
CREATE POLICY "matriculas_select" ON public.matriculas FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "matriculas_write" ON public.matriculas FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','superadmin'));

-- encontros
CREATE POLICY "encontros_select" ON public.encontros FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "encontros_write" ON public.encontros FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','superadmin'));

-- presencas
CREATE POLICY "presencas_select" ON public.presencas FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "presencas_write" ON public.presencas FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','superadmin'));

-- materiais
CREATE POLICY "materiais_select" ON public.materiais FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "materiais_write" ON public.materiais FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','superadmin'));

-- atividades
CREATE POLICY "atividades_select" ON public.atividades FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "atividades_write" ON public.atividades FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','superadmin'));

-- entregas
CREATE POLICY "entregas_select" ON public.entregas FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "entregas_insert" ON public.entregas FOR INSERT
  WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "entregas_update" ON public.entregas FOR UPDATE
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','aluno','superadmin'));

-- avaliacoes
CREATE POLICY "avaliacoes_select" ON public.avaliacoes FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "avaliacoes_write" ON public.avaliacoes FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','superadmin'));

-- comunicados
CREATE POLICY "comunicados_select" ON public.comunicados FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "comunicados_write" ON public.comunicados FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','professor','superadmin'));

-- voluntariado
CREATE POLICY "funcoes_vol_select" ON public.funcoes_voluntariado FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "funcoes_vol_write" ON public.funcoes_voluntariado FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

CREATE POLICY "necessidades_vol_select" ON public.necessidades_voluntariado FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "necessidades_vol_write" ON public.necessidades_voluntariado FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

-- candidaturas: qualquer pessoa pode inserir via site público (anon)
CREATE POLICY "candidaturas_select" ON public.candidaturas_voluntariado FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "candidaturas_insert_public" ON public.candidaturas_voluntariado FOR INSERT
  WITH CHECK (true);
CREATE POLICY "candidaturas_update" ON public.candidaturas_voluntariado FOR UPDATE
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

CREATE POLICY "participantes_vol_select" ON public.participantes_voluntariado FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "participantes_vol_write" ON public.participantes_voluntariado FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

-- site CMS
CREATE POLICY "site_config_select" ON public.site_config FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "site_config_write" ON public.site_config FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

-- site_posts e site_galeria: leitura pública via anon (site público)
CREATE POLICY "site_posts_public_select" ON public.site_posts FOR SELECT
  USING (publicado = true OR org_id = public.get_my_org_id());
CREATE POLICY "site_posts_write" ON public.site_posts FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

CREATE POLICY "site_galeria_public_select" ON public.site_galeria FOR SELECT
  USING (true);
CREATE POLICY "site_galeria_write" ON public.site_galeria FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

-- solicitacoes_admissao: qualquer pessoa pode inserir (site público)
CREATE POLICY "solicitacoes_select" ON public.solicitacoes_admissao FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "solicitacoes_insert_public" ON public.solicitacoes_admissao FOR INSERT
  WITH CHECK (true);
CREATE POLICY "solicitacoes_update" ON public.solicitacoes_admissao FOR UPDATE
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','funcionario','superadmin'));

-- custom_domains: admin da org vê e edita o seu
CREATE POLICY "custom_domains_select" ON public.custom_domains FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');
CREATE POLICY "custom_domains_write" ON public.custom_domains FOR ALL
  USING (org_id = public.get_my_org_id() AND public.get_my_role() IN ('admin','superadmin'));

-- ============================================================
-- DADO INICIAL: organização de exemplo para desenvolvimento
-- (Comentar em produção)
-- ============================================================

-- INSERT INTO public.organizations (slug, nome, plano)
-- VALUES ('demo', 'Associação Demo', 'free');
