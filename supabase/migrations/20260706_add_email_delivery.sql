-- Migration: add send_email_on_delivery to profiles
alter table profiles
  add column if not exists send_email_on_delivery boolean not null default false;
