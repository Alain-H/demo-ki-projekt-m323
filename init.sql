-- Schema für den Notenrechner (M323 Demo)
-- In Supabase Studio SQL Editor ausführen, oder via psql

create table if not exists grades (
  id           bigserial primary key,
  student_name text not null,
  subject      text not null,
  grade        numeric(3, 1) not null check (grade >= 1.0 and grade <= 6.0),
  weight       numeric(3, 1) not null default 1.0 check (weight > 0),
  created_at   timestamptz not null default now()
);

-- RLS für Demo offen lassen (anon darf lesen/schreiben)
alter table grades enable row level security;

drop policy if exists "anon read"  on grades;
drop policy if exists "anon write" on grades;

create policy "anon read"  on grades for select using (true);
create policy "anon write" on grades for insert with check (true);

-- Beispieldaten
insert into grades (student_name, subject, grade, weight) values
  ('Anna',  'Mathematik',     5.5, 2.0),
  ('Anna',  'Deutsch',        4.5, 1.0),
  ('Ben',   'Mathematik',     3.5, 2.0),
  ('Ben',   'Deutsch',        5.0, 1.0),
  ('Clara', 'Mathematik',     4.0, 2.0),
  ('Clara', 'Deutsch',        4.0, 1.0);
