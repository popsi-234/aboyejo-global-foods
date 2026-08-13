-- The private helper is referenced by RLS predicates for anonymous storefront
-- reads. It remains outside the exposed API schema and has no public endpoint.
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
