-- ============================================================
-- MIGRATION 0006 — Módulo Financeiro
-- ============================================================

CREATE TABLE public.financeiro_lancamentos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tipo              text        NOT NULL CHECK (tipo IN ('receita','despesa')),
  categoria         text        NOT NULL CHECK (categoria IN (
    'doacao','mensalidade','patrocinio','subvencao','prestacao_servico','evento_receita',
    'honorario_professor','folha_pagamento','infraestrutura','material','evento_despesa','administrativo','outros'
  )),
  descricao         text        NOT NULL,
  valor             integer     NOT NULL CHECK (valor > 0),
  data_lancamento   date        NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento   date,
  data_pagamento    date,
  status            text        NOT NULL DEFAULT 'pendente'
                                CHECK (status IN ('pendente','pago','cancelado','atrasado')),
  referencia_tipo   text        CHECK (referencia_tipo IN ('professor','aluno','voluntario')),
  referencia_id     uuid,
  observacoes       text,
  created_by        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_financeiro_org_id ON public.financeiro_lancamentos(org_id);
CREATE INDEX idx_financeiro_tipo   ON public.financeiro_lancamentos(org_id, tipo);
CREATE INDEX idx_financeiro_status ON public.financeiro_lancamentos(org_id, status);
CREATE INDEX idx_financeiro_data   ON public.financeiro_lancamentos(org_id, data_lancamento);
CREATE INDEX idx_financeiro_ref    ON public.financeiro_lancamentos(referencia_id) WHERE referencia_tipo = 'professor';

ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer membro da org (professor filtra via WHERE na query da aplicação)
CREATE POLICY "fin_select" ON public.financeiro_lancamentos FOR SELECT
  USING (org_id = public.get_my_org_id() OR public.get_my_role() = 'superadmin');

-- Inserção: admin, funcionario, superadmin
CREATE POLICY "fin_insert" ON public.financeiro_lancamentos FOR INSERT
  WITH CHECK (
    org_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin','funcionario','superadmin')
  );

-- Atualização: admin, funcionario, superadmin
CREATE POLICY "fin_update" ON public.financeiro_lancamentos FOR UPDATE
  USING (
    org_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin','funcionario','superadmin')
  );

-- Exclusão: somente admin e superadmin
CREATE POLICY "fin_delete" ON public.financeiro_lancamentos FOR DELETE
  USING (
    org_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin','superadmin')
  );
