-- Portal Professor/Familia/Aluno - schema & RLS scaffold
-- Execute in Supabase SQL editor or via CLI before deploying UI changes.

-- 1) Tabelas de responsáveis e vínculos
create table if not exists responsaveis (
  id bigserial primary key,
  user_id uuid unique,
  nome text not null,
  email text not null,
  cpf text,
  telefone text,
  status text default 'ativo',
  created_at timestamptz default now()
);

create table if not exists responsavel_aluno (
  responsavel_id bigint references responsaveis(id) on delete cascade,
  aluno_id bigint references alunos(id) on delete cascade,
  relacionamento text,
  is_principal boolean default false,
  criado_em timestamptz default now(),
  primary key (responsavel_id, aluno_id)
);

-- 2) Materiais e atividades
create table if not exists turma_materiais (
  id bigserial primary key,
  turma_id bigint references turmas(id) on delete cascade,
  titulo text not null,
  tipo text default 'documento',
  descricao text,
  file_url text,
  storage_path text,
  visibilidade text default 'todos', -- professor|aluno|responsavel|todos
  criado_por uuid,
  created_at timestamptz default now()
);

create table if not exists atividades_turma (
  id bigserial primary key,
  turma_id bigint references turmas(id) on delete cascade,
  titulo text not null,
  descricao text,
  data_entrega date,
  status text default 'ativa',
  anexos_json jsonb,
  criado_por uuid,
  created_at timestamptz default now()
);

create table if not exists entregas_aluno (
  id bigserial primary key,
  atividade_id bigint references atividades_turma(id) on delete cascade,
  aluno_id bigint references alunos(id) on delete cascade,
  enviado_por_user_id uuid,
  status text default 'entregue',
  nota numeric,
  feedback text,
  file_url text,
  storage_path text,
  entregue_em timestamptz,
  unique (atividade_id, aluno_id)
);

-- 3) Comunicados e avaliações
create table if not exists comunicados_turma (
  id bigserial primary key,
  turma_id bigint references turmas(id) on delete cascade,
  titulo text not null,
  corpo text not null,
  publico text default 'todos', -- pais|alunos|todos
  anexos_json jsonb,
  publicado_em timestamptz default now(),
  criado_por uuid
);

create table if not exists avaliacoes_aluno (
  id bigserial primary key,
  aluno_id bigint references alunos(id) on delete cascade,
  turma_id bigint references turmas(id) on delete cascade,
  tipo text default 'observacao',
  observacao text not null,
  criado_por uuid,
  criado_em timestamptz default now()
);

-- 4) Colunas extras em alunos
alter table if not exists alunos
  add column if not exists cpf text,
  add column if not exists email text,
  add column if not exists user_id uuid,
  add column if not exists permitir_portal boolean default true;

-- 5) Sugestão de policies (ajuste para sua instância antes de habilitar RLS)
-- Atenção: habilite RLS e rode as policies conforme necessidade.
-- Exemplo para turma_materiais:
-- alter table turma_materiais enable row level security;
-- create policy "read materiais professor" on turma_materiais for select using (
--   auth.uid() = (select professor_user_id from turmas where id = turma_materiais.turma_id)
-- );
-- create policy "read materiais responsavel" on turma_materiais for select using (
--   visibilidade in ('responsavel','todos') and exists (
--     select 1 from responsavel_aluno ra
--     join matriculas m on m.aluno_id = ra.aluno_id and m.turma_id = turma_materiais.turma_id and m.status = 'ativa'
--     where ra.responsavel_id = (select id from responsaveis where user_id = auth.uid())
--   )
-- );
-- create policy "read materiais aluno" on turma_materiais for select using (
--   visibilidade in ('aluno','todos') and exists (
--     select 1 from matriculas m
--     join alunos a on a.id = m.aluno_id and a.user_id = auth.uid()
--     where m.turma_id = turma_materiais.turma_id and m.status = 'ativa'
--   )
-- );
-- create policy "insert materiais professor" on turma_materiais for insert with check (
--   auth.uid() = (select professor_user_id from turmas where id = turma_id)
-- );

-- Replicar lógica análoga para atividades_turma, entregas_aluno, comunicados_turma e avaliacoes_aluno.

