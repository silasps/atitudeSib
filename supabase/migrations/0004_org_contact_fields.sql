-- ============================================================
-- MIGRATION 0004 — Campos de contato na organização
-- ============================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS email_contato text,
  ADD COLUMN IF NOT EXISTS telefone      text;

-- Permite que admins da organização atualizem apenas os campos de contato
CREATE POLICY "org_update_contato" ON public.organizations
  FOR UPDATE USING (
    id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin', 'superadmin')
  )
  WITH CHECK (
    id = public.get_my_org_id()
    OR public.get_my_role() = 'superadmin'
  );
