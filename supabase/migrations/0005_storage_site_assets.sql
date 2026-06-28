-- ============================================================
-- MIGRATION 0005 — Bucket de assets do site público
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  5242880,  -- 5 MB
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Admins da org podem fazer upload em sua própria pasta (org_id/)
CREATE POLICY "site_assets_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets'
    AND (storage.foldername(name))[1] = public.get_my_org_id()::text
    AND public.get_my_role() IN ('admin', 'superadmin')
  );

-- Leitura pública para todos
CREATE POLICY "site_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

-- Admin pode deletar seus próprios arquivos
CREATE POLICY "site_assets_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND (storage.foldername(name))[1] = public.get_my_org_id()::text
    AND public.get_my_role() IN ('admin', 'superadmin')
  );
