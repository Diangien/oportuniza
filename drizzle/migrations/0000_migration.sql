create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text, created_at timestamptz not null default now());
grant select, insert, update on public.profiles to authenticated; grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')); 
insert into public.user_roles(user_id, role) values (new.id,'user'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.scholarships (
 id uuid primary key default gen_random_uuid(),
 title text not null, provider text not null, country text not null,
 scope text not null check (scope in ('interna','externa')),
 level text not null default 'Licenciatura', field text,
 description text not null default '', requirements text not null default '',
 benefits text not null default '', deadline date, link text,
 published boolean not null default true, created_at timestamptz not null default now());
grant select on public.scholarships to anon, authenticated; grant insert, update, delete on public.scholarships to authenticated; grant all on public.scholarships to service_role;
alter table public.scholarships enable row level security;
create policy "public read published" on public.scholarships for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.scholarships for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.mentorships (
 id uuid primary key default gen_random_uuid(),
 title text not null, description text not null default '', price_kz integer not null check (price_kz >= 0),
 duration text not null default '1 sessão', active boolean not null default true, created_at timestamptz not null default now());
grant select on public.mentorships to anon, authenticated; grant insert, update, delete on public.mentorships to authenticated; grant all on public.mentorships to service_role;
alter table public.mentorships enable row level security;
create policy "public read active" on public.mentorships for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin write m" on public.mentorships for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.applications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null, scholarship_id uuid not null references public.scholarships(id) on delete cascade,
 status text not null default 'interessado' check (status in ('interessado','candidatado','aceite','rejeitado')),
 notes text, created_at timestamptz not null default now(), unique(user_id, scholarship_id));
grant select, insert, update, delete on public.applications to authenticated; grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "own apps" on public.applications for all to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin')) with check (user_id = auth.uid());

create table public.bookings (
 id uuid primary key default gen_random_uuid(), user_id uuid not null, mentorship_id uuid not null references public.mentorships(id) on delete restrict,
 scholarship_id uuid references public.scholarships(id) on delete set null,
 amount_kz integer not null, payment_method text not null check (payment_method in ('multicaixa','transferencia')),
 payment_reference text, proof_path text,
 status text not null default 'pendente' check (status in ('pendente','confirmado','rejeitado','concluido')),
 message text, created_at timestamptz not null default now());
grant select, insert, update on public.bookings to authenticated; grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "own bookings read" on public.bookings for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own bookings insert" on public.bookings for insert to authenticated with check (user_id = auth.uid() and status = 'pendente');
create policy "admin bookings update" on public.bookings for update to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "upload own proof" on storage.objects for insert to authenticated with check (bucket_id='comprovativos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own proof" on storage.objects for select to authenticated using (bucket_id='comprovativos' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));

insert into public.scholarships (title, provider, country, scope, level, field, description, requirements, benefits, deadline, link) values
('Bolsa INAGBE Mestrado no Exterior','INAGBE','Portugal','externa','Mestrado','Todas as áreas','Bolsa do Estado angolano para mestrado em universidades portuguesas.','Licenciatura com média ≥ 14; nacionalidade angolana; carta de aceitação.','Propinas, subsídio mensal e passagem aérea.','2026-12-15','https://inagbe.gov.ao'),
('Bolsa Interna de Licenciatura INAGBE','INAGBE','Angola','interna','Licenciatura','Engenharias e Saúde','Apoio a estudantes em instituições públicas e privadas angolanas.','Média do ensino médio ≥ 14; matrícula numa IES angolana.','Subsídio mensal e apoio a propinas.','2026-11-30','https://inagbe.gov.ao'),
('Chevening Scholarship','Governo do Reino Unido','Reino Unido','externa','Mestrado','Todas as áreas','Mestrado de um ano totalmente financiado no Reino Unido.','2 anos de experiência profissional; licenciatura; inglês.','Propinas, alojamento, viagens e subsídio.','2026-11-05','https://www.chevening.org'),
('Bolsa Sonangol de Excelência','Sonangol','Angola','interna','Licenciatura','Petróleo e Geociências','Programa de excelência para jovens talentos nas áreas de energia.','Média ≥ 16; idade até 25 anos.','Propinas, estágio e possibilidade de emprego.','2027-01-20',null),
('MasterCard Foundation Scholars','MasterCard Foundation','Vários','externa','Licenciatura','Todas as áreas','Bolsas integrais para jovens africanos com potencial de liderança.','Mérito académico; necessidade financeira; liderança comunitária.','Bolsa integral, mentoria e rede de alumni.','2027-02-01','https://mastercardfdn.org'),
('Bolsas CAPES/PEC-PG','Governo do Brasil','Brasil','externa','Doutoramento','Todas as áreas','Pós-graduação para cidadãos de países em desenvolvimento.','Mestrado concluído; aceitação num programa brasileiro.','Subsídio mensal e isenção de propinas.','2026-12-01',null);
insert into public.mentorships (title, description, price_kz, duration) values
('Revisão de Carta de Motivação','Revemos e melhoramos a sua carta de motivação com feedback detalhado.',15000,'Entrega em 3 dias'),
('Mentoria Completa de Candidatura','Acompanhamento do início ao fim: escolha da bolsa, documentos, cartas e entrevista.',60000,'4 sessões de 1h'),
('Preparação para Entrevista','Simulação de entrevista com perguntas reais e plano de melhoria.',25000,'1 sessão de 1h30');