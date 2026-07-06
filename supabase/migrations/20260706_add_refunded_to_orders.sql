-- Migration: add is_refunded to public.orders table
alter table public.orders
  add column if not exists is_refunded boolean not null default false;
