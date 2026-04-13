create extension if not exists "pgcrypto";

create table if not exists public.inscritos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,
  email text not null,
  status_pagamento text not null default 'pendente',
  metodo_pagamento text,
  check_in boolean not null default false,
  created_at timestamptz not null default now()
);
