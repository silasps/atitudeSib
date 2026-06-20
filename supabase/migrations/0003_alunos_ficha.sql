-- ============================================================
-- MIGRATION 0003 — Ficha completa de aluno + Termos digitais
-- ============================================================

-- ---- Colunas adicionais na tabela alunos ----
ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS email               text,
  ADD COLUMN IF NOT EXISTS sexo                text CHECK (sexo IN ('feminino','masculino','outro','nao_informado')),
  ADD COLUMN IF NOT EXISTS documento_tipo      text DEFAULT 'rg' CHECK (documento_tipo IN ('rg','certidao_nascimento')),
  ADD COLUMN IF NOT EXISTS documento_numero    text,
  ADD COLUMN IF NOT EXISTS autorizacao_imagem  boolean,
  -- JSONB com dados complementares estruturados:
  -- { socioeconomico, escolar, saude, projeto }
  ADD COLUMN IF NOT EXISTS dados_complementares jsonb DEFAULT '{}';

-- ============================================================
-- TABELA: termos_ficha
-- Controla o ciclo de vida de assinaturas digitais legais
-- para alunos (ficha_aluno) e voluntários (ficha_voluntario)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.termos_ficha (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  aluno_id        uuid REFERENCES public.alunos(id) ON DELETE SET NULL,
  voluntario_id   uuid REFERENCES public.participantes_voluntariado(id) ON DELETE SET NULL,
  tipo            text NOT NULL CHECK (tipo IN ('ficha_aluno','ficha_voluntario')),
  token           text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status          text NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente','assinado','expirado')),
  -- Campos preenchidos após a assinatura
  signed_at       timestamptz,
  signed_by_name  text,
  signed_by_email text,
  ip_address      text,
  user_agent      text,
  geolocation     jsonb,
  -- JSON de evidência completa para validade jurídica (Lei 14.063/2020)
  evidence_json   jsonb,
  -- OTP temporário para verificação de identidade
  otp_hash        text,
  otp_expires_at  timestamptz,
  -- Link expira em 30 dias por padrão
  expires_at      timestamptz NOT NULL DEFAULT now() + interval '30 days',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_termos_ficha_token    ON public.termos_ficha(token);
CREATE INDEX IF NOT EXISTS idx_termos_ficha_aluno    ON public.termos_ficha(aluno_id);
CREATE INDEX IF NOT EXISTS idx_termos_ficha_org      ON public.termos_ficha(org_id, status);

-- ---- RLS ----
ALTER TABLE public.termos_ficha ENABLE ROW LEVEL SECURITY;

-- Admins e funcionários da org veem/criam termos
CREATE POLICY "termos_select" ON public.termos_ficha FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');

CREATE POLICY "termos_insert" ON public.termos_ficha FOR INSERT
  WITH CHECK (
    org_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin','funcionario','superadmin')
  );

-- Update via admin (ex: marcar expirado)
CREATE POLICY "termos_update_admin" ON public.termos_ficha FOR UPDATE
  USING (
    org_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin','funcionario','superadmin')
  );
