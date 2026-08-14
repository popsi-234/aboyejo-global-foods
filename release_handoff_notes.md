# Release handoff notes

- Connected Netlify account inspection found an existing site named `aboyejoglobalfoods` with ID `59d029a4-ed3e-408d-8799-88b1a14d777a`. This is the only candidate selected for detail verification; no new Netlify site has been created.
- The approved Supabase backend remains `aboyejoglobalfoods3` with reference `ljgwxgtizkguhbutrnxi`. No other Supabase project is in scope.
- The connected GitHub account is `popsi-234`; its existing candidate repository is `popsi-234/aboyejo-global-foods`. The project’s current `origin` is a managed project remote, so no GitHub remote has been changed.
- GitHub repository inspection confirms `popsi-234/aboyejo-global-foods` is public and has no default branch yet, so it is an empty repository rather than an unrelated codebase.

The Supabase project listing confirms that `aboyejoglobalfoods3` (`ljgwxgtizkguhbutrnxi`) is `ACTIVE_HEALTHY` in `eu-north-1`; the three older Aboyejo projects remain inactive and were not changed. All six expected production migrations are present. The public schema contains the intended 14 tables, every listed public table has row-level security enabled, and the `products.image_url` field remains the canonical product image field. The `product-images`, `gallery-images`, and `souvenir-images` buckets are present, public, limited to 10 MB, and accept JPEG, PNG, and WebP uploads.

The `order-service` Edge Function is active at version 1 and intentionally allows public order traffic; the `admin-access` Edge Function is active at version 2 and requires JWT authentication.

Desktop release-candidate screenshots render successfully for the home, products, gallery, souvenirs, and order routes. The administrator route correctly presents the protected Supabase sign-in screen when no session is available in the preview.

Authenticated administrator validation was repeated in the active preview: a clearly temporary product was created with a locally selected WebP image, persisted with a public `product-images` URL, and removed through the in-page confirmation. The database record disappeared and an authoritative `storage.objects` query returned no matching object afterward, confirming Storage cleanup. A direct public-object request briefly continued to return the cached asset, which is consistent with CDN cache behavior rather than residual Storage metadata.

The authenticated Media & souvenirs workspace exposes separate direct device-upload fields for gallery items and souvenir packages. Temporary WebP test files were accepted by both controls in preparation for the final save-and-cleanup verification.

The temporary gallery item saved successfully and rendered from the dedicated `gallery-images` bucket at its canonical public URL. It remains a clearly labelled validation record pending the paired souvenir save and final cleanup test.

The paired temporary souvenir package also saved successfully and rendered from the dedicated `souvenir-images` bucket at its canonical public URL. Both temporary media records are now ready for protected deletion and object-cleanup verification.

The gallery validation record was removed through the protected in-page confirmation and disappeared from the administrator list. The final check will query the canonical object metadata for both media buckets after the matching souvenir record is removed.

The temporary souvenir record was likewise removed through the protected confirmation. The final authoritative Storage query returned no matching `gallery-images` or `souvenir-images` objects, confirming both media upload workflows and their associated cleanup paths without retaining test data.

The public product-order route and its deployed `order-service` workflow are present. The optional `site_settings.whatsapp_number` contact handoff is intentionally not configured in the production database; no number can be safely invented. The administrator can set this value in Content & settings when the approved business number is available.

Mobile release-candidate screenshots at 375×812 render successfully for the home, products, gallery, souvenirs, and order routes. The protected `/admin` route retains its focused Supabase email/password sign-in interface at the same viewport.

## User-led Netlify publication and live verification

Use the existing Netlify site `aboyejoglobalfoods` (`59d029a4-ed3e-408d-8799-88b1a14d777a`); do not create another site. Connect its production branch to `popsi-234/aboyejo-global-foods`, branch `main`, where the verified source is now committed. Keep the repository build configuration from `netlify.toml`: `npm run build` and `dist/public`, including its SPA redirect.

In **Site configuration → Environment variables**, set `VITE_SUPABASE_URL` to `https://ljgwxgtizkguhbutrnxi.supabase.co` and set `VITE_SUPABASE_PUBLISHABLE_KEY` from this project’s existing secret value. Apply both to production and deploy-preview contexts. Do not add a Supabase service-role key anywhere in Netlify or the frontend. Then initiate the deployment through the user-facing Publish control.

After Netlify confirms the deployment is live, open the production URL on desktop and at a 375×812 mobile viewport. Check `/`, `/products`, `/gallery`, `/souvenirs`, `/order`, `/faq`, and `/contact`; confirm the `/order` form loads its catalogue and provides the order-status tracker. Then sign in at `/admin` with the authorized Supabase account and verify that an uploaded temporary WebP product appears with its `image_url`, then remove that temporary item through the in-page confirmation and verify its associated Storage object has been removed. Finally, create and remove temporary gallery and souvenir entries through the same workflow. No customer test order or unapproved WhatsApp number should be used.

## Approved WhatsApp configuration

The owner-approved `whatsapp_number` was saved as the public `site_settings` value `2348053880130`. The homepage “Order on WhatsApp” action now reads this same administrator-managed setting instead of only scrolling to the contact section. A non-navigating browser verification captured the target `https://wa.me/2348053880130`; the existing contact route uses the same public setting. The integration is protected by the `server/whatsapp-handoff.test.ts` regression contract, and the full test suite and production build pass.
