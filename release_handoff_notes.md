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

## New-Netlify-project authorization status

The owner subsequently authorized creation of a new Netlify project named `aboyejoglobalfoods_1`, superseding use of the existing site. The configured Netlify connector currently returns `403 permission_denied` before it can disclose the project-creation or environment-variable operation contract. The sandbox browser was also opened to `https://app.netlify.com/`, but it did not render an authenticated workspace or interactive controls. No Netlify project, deployment, or external configuration has been created or modified while access is unavailable.

The user subsequently completed browser sign-in. The Netlify dashboard now identifies the `popsi` team and `ipinoluwafaith@gmail.com` session, confirming browser authentication. The authorized new-project route at `/start` is open but still displaying its loading state, so no repository selection, project creation, deployment, or environment-variable mutation has occurred.

The `/start` route subsequently loaded its “Import a Git repository” controls, including GitHub. The GitHub import choice was initiated to reach the repository picker; no repository has been selected and no Netlify project has been created yet.

The enabled GitHub import control did not open a repository picker after standard browser click, direct DOM click, and coordinate click attempts; browser-console inspection showed no emitted error. The issue is isolated to Netlify’s import interaction in this automated session. No GitHub repository was selected, and no new Netlify project, deployment, or environment variable was created.

After the user reported an authentication error, the `/start` route was reloaded in the same signed-in `popsi` session and the GitHub import control was retried. It again remained on the same route and did not display a picker or actionable authentication prompt. The current retry therefore has not changed any Netlify project, source connection, deployment, or environment variable.

The authenticated GitHub picker subsequently opened and exposed `popsi-234/aboyejo-global-foods`; that repository was selected with branch `main`. Netlify correctly prefilled the repository build settings from `netlify.toml`: `npm run build` and `dist/public`. The requested identifier `aboyejoglobalfoods_1` was sanitized by Netlify’s project-name field to the available hostname-safe identifier `aboyejoglobalfoods1` (`https://aboyejoglobalfoods1.netlify.app`); no project has yet been deployed or created.

The Netlify key/value environment-variable form is open for the selected repository. No value has yet been persisted and deployment has not started.

The required `VITE_SUPABASE_URL` value is staged in the first Netlify variable row, and a second blank row has been created for `VITE_SUPABASE_PUBLISHABLE_KEY`. The settings remain staged only until the project’s first deployment is confirmed.

Following the owner’s explicit confirmation, Netlify created the public project `aboyejoglobalfoods1` from `popsi-234/aboyejo-global-foods` branch `main`. The two Vite Supabase public variables were included in the initial deployment configuration. The canonical project URL is `https://aboyejoglobalfoods1.netlify.app`; its first production deploy (`main@HEAD`) is currently building and has not yet been validated.

Two Netlify dashboard status checks completed at 19:35–19:36 UTC. The production deployment remained in the `building` state with no failure message exposed. The project is public, connected to the intended GitHub repository, and no post-deployment browser validation has begun.

Netlify subsequently marked the first production deployment as `published`. The public URL is `https://aboyejoglobalfoods1.netlify.app`, and the published production revision is GitHub `main@6549a60`. The project retains build command `npm run build`, publish directory `dist/public`, and the two staged Vite Supabase public values.

Live production checks confirmed that the published homepage, catalogue, order, gallery, and souvenirs routes are publicly retrievable from `https://aboyejoglobalfoods1.netlify.app`. The public `/admin` route rendered the expected protected Supabase email/password sign-in interface in the deployed Netlify build. Authorized administrator credentials have been entered for the next authentication step; no credentials are recorded in these notes.

Following the owner’s explicit confirmation, the designated Supabase user completed the available first-admin claim on the published `/admin` route. The live deployment now renders the protected administrator workspace with Overview, Products, Media & souvenirs, Orders & messages, Content & settings, and Admin users. This resolves the production administrator-role mismatch without changing the Supabase schema or the public application design.

The published Products workspace exposes the direct file-selection product-image control and the expected canonical product fields. A small, clearly temporary WebP image has been staged for a production upload-and-cleanup test; the form has not yet created a persistent product record.

The temporary product form was completed with a clearly labeled validation record and submitted through the published administrator workflow. The post-submit state will be checked before attempting deletion, so no result is inferred from the button press alone.

The published workflow reported “Product saved” and displayed the temporary item with the canonical `image_url` under the production `product-images` bucket. Its Storage URL was `products/1786739403696-aboyejoglobalfoods1-2026-08-14-20-29-33-6032.webp`. The item’s Delete control opened the expected accessible in-page confirmation; the confirmed cleanup check remains in progress.

The production in-page confirmation completed successfully: the workspace reported “product deleted” and returned the catalogue to its empty state. The final Storage metadata check for the exact temporary object remains the only outstanding part of this upload-cleanup verification.

An authoritative read-only query of `storage.objects` for the exact temporary product image returned no rows. The confirmed production delete therefore removed both the product record and its associated `product-images` object.

## Published experience verification

The Netlify production homepage rendered successfully at `https://aboyejoglobalfoods1.netlify.app/` in a desktop browser, with working public navigation, the configured WhatsApp order action, and the expected Quiet Harvest editorial layout. Public retrieval checks passed for the primary storefront routes. The released source also passed a fresh responsive 375×812 verification for both the homepage and protected `/admin` entry route: the mobile navigation, primary order call-to-action, and credential fields remain visible and usable without horizontal overflow. Live Supabase sign-in, first-admin claiming, direct product WebP upload, canonical `image_url` persistence, accessible deletion, and authoritative Storage cleanup have all been verified in the published Netlify deployment.

Actual 375×812 screenshots of the published Netlify URL show that the layout, navigation, WhatsApp call-to-action, and `/admin` credential form remain responsive. However, the homepage brand-mark image is broken in the published build because its prior `/manus-storage/...` reference is not served by Netlify. This is a production asset-path defect; it must be corrected and redeployed before the mobile verification is closed.

The focused repair preserves the existing ten visual assets and changes only their storage-map URLs to persistent public CDN addresses. Automated regression checks pass (6 test files and 8 tests), as does the production build. GitHub `main` revision `057e7e6` (`Fix Netlify homepage asset URLs`) triggered Netlify production deploy `6a7f7cdc18bfa00008905ab0`, which was uploading at the time of observation; the prior published revision was `6549a60`.

Netlify subsequently published `main@057e7e6` as production successfully. Auto-publishing remains enabled, and the canonical production URL remains `https://aboyejoglobalfoods1.netlify.app`.

Fresh actual-production screenshots confirm the asset-path repair: at 1280×900 the desktop homepage now displays the Aboyejo brand mark and hero imagery, while at 375×812 the responsive header includes the brand mark, Order Enquiry action, and mobile navigation trigger. The mobile hero preserves the WhatsApp action and readable editorial layout. No broken `/manus-storage/...` image appears in either repaired homepage capture.

The actual 375×812 published `/admin` route presents a focused, responsive Supabase administrator sign-in form with readable labels, correctly sized fields, and accessible primary and account-creation actions. This completes the live responsive verification of both public and administrator entry experiences.
