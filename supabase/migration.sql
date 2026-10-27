-- Tabela principal de cards do CRM
create table if not exists public.cards (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  "column"            text not null check ("column" in ('contact', 'contacted', 'proposal', 'done')),
  position            integer not null default 0,
  name                text not null,
  phone               text,
  plate               text,
  vehicle_type        text check (vehicle_type in ('moto', 'carro', 'caminhao')),
  vehicle_model       text,
  referral            boolean not null default false,
  referral_name       text,
  insurance_activation numeric(10,2),
  insurance_monthly   numeric(10,2),
  tracker             boolean not null default false,
  tracker_value       numeric(10,2),
  notes               text,
  created_at          timestamptz not null default now()
);

-- Índices
create index if not exists cards_user_id_idx on public.cards(user_id);
create index if not exists cards_column_idx on public.cards("column");

-- RLS
alter table public.cards enable row level security;

create policy "Users can select own cards"
  on public.cards for select
  using (user_id = auth.uid());

create policy "Users can insert own cards"
  on public.cards for insert
  with check (user_id = auth.uid());

create policy "Users can update own cards"
  on public.cards for update
  using (user_id = auth.uid());

create policy "Users can delete own cards"
  on public.cards for delete
  using (user_id = auth.uid());
