create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  perform pg_advisory_xact_lock(18006001);

  if exists (select 1 from public.admin_users where is_active = true) then
    return false;
  end if;

  insert into public.admin_users (user_id, role, is_active)
  values (auth.uid(), 'admin', true)
  on conflict (user_id) do update set role = 'admin', is_active = true;

  return true;
end;
$$;

create or replace function public.grant_admin_by_email(p_email text, p_role text default 'admin')
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  if p_role not in ('admin', 'editor') then
    raise exception 'Invalid admin role';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    raise exception 'No Supabase auth user exists for that email';
  end if;

  insert into public.admin_users (user_id, role, is_active)
  values (v_user_id, p_role, true)
  on conflict (user_id) do update set role = excluded.role, is_active = true;

  return v_user_id;
end;
$$;

revoke all on function public.claim_first_admin() from public;
grant execute on function public.claim_first_admin() to authenticated;
revoke all on function public.grant_admin_by_email(text, text) from public;
grant execute on function public.grant_admin_by_email(text, text) to authenticated;
