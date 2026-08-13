-- RLS already limits these authenticated grants to rows authorized by admin policies.
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_images to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.gallery to authenticated;
grant select, insert, update, delete on public.souvenir_packages to authenticated;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;
grant select, insert, update, delete on public.faqs to authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;
