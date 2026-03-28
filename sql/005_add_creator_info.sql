-- Add creator tracking to shared_babies
alter table shared_babies
add column if not exists creator_id uuid references auth.users(id),
add column if not exists creator_email text;

-- Index for faster admin lookups by creator
create index if not exists idx_shared_babies_creator on shared_babies(creator_id, creator_email);
