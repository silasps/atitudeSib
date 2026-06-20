-- ============================================================
-- OSTRICH SOCIAL — Limpeza completa do banco anterior
-- Rodar este script PRIMEIRO no SQL Editor do Supabase
-- ============================================================

DROP TABLE IF EXISTS public.avaliacoes_aluno CASCADE;
DROP TABLE IF EXISTS public.entregas_aluno CASCADE;
DROP TABLE IF EXISTS public.atividades_turma CASCADE;
DROP TABLE IF EXISTS public.turma_materiais CASCADE;
DROP TABLE IF EXISTS public.comunicados_turma CASCADE;
DROP TABLE IF EXISTS public.responsavel_aluno CASCADE;
DROP TABLE IF EXISTS public.responsaveis CASCADE;
DROP TABLE IF EXISTS public.presencas CASCADE;
DROP TABLE IF EXISTS public.encontros_turma CASCADE;
DROP TABLE IF EXISTS public.matriculas CASCADE;
DROP TABLE IF EXISTS public.alunos CASCADE;
DROP TABLE IF EXISTS public.turmas CASCADE;
DROP TABLE IF EXISTS public.participantes_voluntariado CASCADE;
DROP TABLE IF EXISTS public.candidaturas_voluntariado CASCADE;
DROP TABLE IF EXISTS public.necessidades_voluntariado CASCADE;
DROP TABLE IF EXISTS public.funcoes_voluntariado CASCADE;
DROP TABLE IF EXISTS public."site-images" CASCADE;
DROP TABLE IF EXISTS public.site_gallery CASCADE;
DROP TABLE IF EXISTS public.site_config CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Dropar funções e triggers antigos
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
