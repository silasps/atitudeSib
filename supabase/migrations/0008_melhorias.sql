-- ============================================================
-- MIGRATION 0008 — Sugestões de Melhoria
-- ============================================================

CREATE TABLE public.sugestoes_melhoria (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pagina      text        NOT NULL,
  descricao   text        NOT NULL,
  status      text        NOT NULL DEFAULT 'pendente'
                          CHECK (status IN ('pendente','em_andamento','resolvido')),
  solucao     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_melhorias_status ON public.sugestoes_melhoria(status);
CREATE INDEX idx_melhorias_user   ON public.sugestoes_melhoria(user_id);
CREATE INDEX idx_melhorias_data   ON public.sugestoes_melhoria(created_at DESC);

ALTER TABLE public.sugestoes_melhoria ENABLE ROW LEVEL SECURITY;

-- Inserção: qualquer usuário autenticado, apenas o próprio user_id
CREATE POLICY "mel_insert" ON public.sugestoes_melhoria FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Leitura: superadmin vê tudo, usuário vê apenas as próprias
CREATE POLICY "mel_select" ON public.sugestoes_melhoria FOR SELECT
  USING (user_id = auth.uid() OR public.get_my_role() = 'superadmin');

-- Atualização: somente superadmin
CREATE POLICY "mel_update" ON public.sugestoes_melhoria FOR UPDATE
  USING (public.get_my_role() = 'superadmin');

-- Exclusão: somente superadmin
CREATE POLICY "mel_delete" ON public.sugestoes_melhoria FOR DELETE
  USING (public.get_my_role() = 'superadmin');
