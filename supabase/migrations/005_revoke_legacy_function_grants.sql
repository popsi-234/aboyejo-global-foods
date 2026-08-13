-- Supabase created explicit anon/authenticated execute ACLs when the routines
-- were first created. Revoke those role-specific grants after moving callers
-- behind Edge Functions.
revoke execute on function public.create_public_order(text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.get_public_order_status(uuid, text) from public, anon, authenticated;
revoke execute on function public.claim_first_admin(uuid) from public, anon, authenticated;
revoke execute on function public.grant_admin_by_email(uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_public_order(text, text, text, text, text, jsonb) to service_role;
grant execute on function public.get_public_order_status(uuid, text) to service_role;
grant execute on function public.claim_first_admin(uuid) to service_role;
grant execute on function public.grant_admin_by_email(uuid, text, text) to service_role;
