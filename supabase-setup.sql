-- Configuración reproducible del backend de Ronda Final.
create table if not exists public.league_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.league_state enable row level security;
grant select on public.league_state to anon, authenticated;
grant insert, update on public.league_state to authenticated;

create policy "Public can read league" on public.league_state for select using (true);
create policy "Only league admin can insert" on public.league_state for insert to authenticated
with check ((select auth.jwt() ->> 'email') = 'rfbjoker@gmail.com');
create policy "Only league admin can update" on public.league_state for update to authenticated
using ((select auth.jwt() ->> 'email') = 'rfbjoker@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'rfbjoker@gmail.com');

insert into public.league_state (id, data) values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('league-assets', 'league-assets', true)
on conflict (id) do update set public = true;

create policy "Public can view league assets" on storage.objects
for select using (bucket_id = 'league-assets');
create policy "Admin can upload league assets" on storage.objects for insert to authenticated
with check (bucket_id = 'league-assets' and (select auth.jwt() ->> 'email') = 'rfbjoker@gmail.com');
create policy "Admin can update league assets" on storage.objects for update to authenticated
using (bucket_id = 'league-assets' and (select auth.jwt() ->> 'email') = 'rfbjoker@gmail.com')
with check (bucket_id = 'league-assets' and (select auth.jwt() ->> 'email') = 'rfbjoker@gmail.com');
create policy "Admin can delete league assets" on storage.objects for delete to authenticated
using (bucket_id = 'league-assets' and (select auth.jwt() ->> 'email') = 'rfbjoker@gmail.com');
