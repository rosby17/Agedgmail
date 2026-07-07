-- Alter support_messages to add attachment columns
alter table public.support_messages 
add column if not exists attachment_url text,
add column if not exists attachment_type text;

-- Create a storage bucket for chat attachments
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do nothing;

-- Drop existing policies if any
drop policy if exists "Allow public read access on chat-attachments" on storage.objects;
drop policy if exists "Allow authenticated upload on chat-attachments" on storage.objects;

-- Set up security policies for the bucket
create policy "Allow public read access on chat-attachments"
  on storage.objects for select
  using ( bucket_id = 'chat-attachments' );

create policy "Allow authenticated upload on chat-attachments"
  on storage.objects for insert
  with check ( bucket_id = 'chat-attachments' );
