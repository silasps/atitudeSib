-- ============================================================
-- MIGRATION 0007 — Políticas de leitura pública (anon)
-- Necessário para o site público funcionar sem autenticação
-- ============================================================

-- organizations: anon pode ler orgs ativas (resolução de tenant no middleware)
CREATE POLICY "org_public_select" ON public.organizations
  FOR SELECT USING (ativo = true);

-- site_config: anon pode ler configs de sites publicados
CREATE POLICY "site_config_public_select" ON public.site_config
  FOR SELECT USING (publicado = true);

-- custom_domains: anon pode ler domínios verificados (resolução de tenant customizado)
CREATE POLICY "custom_domains_public_select" ON public.custom_domains
  FOR SELECT USING (verificado = true);
