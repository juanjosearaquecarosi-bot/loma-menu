-- PROPUESTA — NO aplicada. Nunca vi el esquema real de la V1, así que todo es aditivo
-- (if not exists). Revísala contra tus tablas negocios/categorias/productos antes de correrla.

-- 1) Enlace permanente de chip NFC / QR -> negocio. El chip apunta al CÓDIGO, no al slug.
create table if not exists enlaces (
  codigo      text primary key,
  negocio_id  uuid not null references negocios(id) on delete cascade,
  activo      boolean not null default true,
  lote        text,
  creado_en   timestamptz not null default now()
);

-- 2) Suscripción: si vence, el menú muestra aviso en vez de caerse.
create table if not exists suscripciones (
  negocio_id uuid primary key references negocios(id) on delete cascade,
  plan       text not null default 'software-6m',
  inicio     date not null default current_date,
  vence      date,
  estado     text not null default 'activa' check (estado in ('activa','vencida'))
);

-- 3) Escaneos sin datos personales.
create table if not exists escaneos (
  id         bigint generated always as identity primary key,
  negocio_id uuid not null references negocios(id) on delete cascade,
  codigo     text,
  origen     text check (origen in ('nfc','qr','link')),
  creado_en  timestamptz not null default now()
);

-- 4) Extensiones mínimas al modelo de la V1 (solo si faltan).
alter table negocios   add column if not exists tema jsonb;
alter table negocios   add column if not exists moneda text default '$';
alter table negocios   add column if not exists zona_horaria text default 'America/Caracas';
alter table categorias add column if not exists columnas jsonb;        -- [{id,label}] para tamaños
alter table categorias add column if not exists nota text;
alter table productos  add column if not exists precios jsonb;         -- {"pequeno":2,"mediano":3}
alter table productos  add column if not exists disponible boolean not null default true;

-- 5) Almuerzo por día (el contenido cambia a diario; se guarda como documento).
create table if not exists almuerzo (
  negocio_id uuid primary key references negocios(id) on delete cascade,
  contenido  jsonb not null   -- misma forma que src/data/loma-linda.json -> "almuerzo"
);

-- 6) RLS: el público solo lee; escribe el dueño (ajusta a tu tabla perfiles).
alter table enlaces       enable row level security;
alter table suscripciones enable row level security;
alter table escaneos      enable row level security;
alter table almuerzo      enable row level security;

create policy "publico lee enlaces activos" on enlaces for select using (activo);
create policy "publico lee almuerzo"        on almuerzo for select using (true);
create policy "publico registra escaneos"   on escaneos for insert with check (true);
-- Policies de escritura para el dueño: replica las que ya tienes en productos
-- (perfiles.negocio_id = negocio_id).
