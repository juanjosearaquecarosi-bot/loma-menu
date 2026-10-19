-- Panel admin de NFC Menu. Independiente de las tablas de la V1 (no toca nada existente).
-- El menú publicado de cada negocio es UN documento JSON (misma forma que src/data/loma-linda.json).

create table if not exists menu_docs (
  slug       text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Quién puede editar qué negocio.
create table if not exists menu_admins (
  user_id uuid not null references auth.users(id) on delete cascade,
  slug    text not null,
  primary key (user_id, slug)
);

alter table menu_docs   enable row level security;
alter table menu_admins enable row level security;

-- El público (el menú que ve el cliente final) solo lee.
create policy "menu publico lee" on menu_docs for select using (true);

-- Solo el dueño asignado en menu_admins escribe su negocio.
create policy "admin inserta su menu" on menu_docs for insert to authenticated
  with check (exists (select 1 from menu_admins a where a.user_id = auth.uid() and a.slug = menu_docs.slug));
create policy "admin actualiza su menu" on menu_docs for update to authenticated
  using      (exists (select 1 from menu_admins a where a.user_id = auth.uid() and a.slug = menu_docs.slug))
  with check (exists (select 1 from menu_admins a where a.user_id = auth.uid() and a.slug = menu_docs.slug));

create policy "ver mis permisos" on menu_admins for select to authenticated using (user_id = auth.uid());

-- Después de crear el usuario del cliente en Authentication > Users, asígnale su negocio:
-- insert into menu_admins (user_id, slug) values ('<UUID-DEL-USUARIO>', 'loma-linda');
