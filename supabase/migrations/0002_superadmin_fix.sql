-- ============================================================
-- Superadmin fix: org_id opcional para perfis superadmin
-- ============================================================

-- Torna org_id opcional (superadmin não pertence a nenhuma org específica)
ALTER TABLE public.profiles ALTER COLUMN org_id DROP NOT NULL;

-- Atualiza função auxiliar para retornar null sem erro
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Superadmin vê tudo em organizations
DROP POLICY IF EXISTS "org_select" ON public.organizations;
CREATE POLICY "org_select" ON public.organizations
  FOR SELECT USING (
    id = public.get_my_org_id()
    OR public.get_my_role() = 'superadmin'
  );

-- Superadmin pode editar qualquer org
CREATE POLICY IF NOT EXISTS "org_write_superadmin" ON public.organizations
  FOR ALL USING (public.get_my_role() = 'superadmin');

-- ============================================================
-- Criação do superadmin (rodar manualmente no SQL Editor)
-- Substitua 'seu@email.com' e 'SuaSenha123' pelos dados reais
-- ============================================================
-- 1. Criar o usuário via painel Auth do Supabase (ou abaixo):
-- SELECT * FROM auth.users; -- confira se o usuário já existe

-- 2. Após criar o usuário auth, inserir o profile de superadmin:
-- INSERT INTO public.profiles (id, org_id, nome, email, role)
-- VALUES (
--   '<uuid-do-usuario-auth>',
--   NULL,   -- superadmin não tem org
--   'Super Admin',
--   'seu@email.com',
--   'superadmin'
-- );
