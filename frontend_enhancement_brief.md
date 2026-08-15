# Premium storefront enhancement brief

**Source:** User-provided attachment `/home/ubuntu/upload/pasted_content.txt`, received 15 August 2026. **Production site:** https://aboyejoglobalfoods1.netlify.app

The requested outcome is a professionally designed Nigerian food-commerce storefront for **Aboyejo Global Foods** that retains the current Supabase project, canonical `products.image_url` field, existing order workflow, approved WhatsApp number, and protected admin functionality. No new Supabase project, replacement backend, invented product data, generated replacement package art, exposed credentials, or removal of existing working features is permitted.

## Design and public experience requirements

The visual system must remain premium and restrained: dark green, warm cream, muted gold, natural food-brand imagery, modern editorial typography, spacious composition, and only sparing glass effects. It must avoid generic SaaS styling, neon, excessive rounded/glass cards, unnecessary gradients, heavy shadows, fabricated stock imagery, and distracting motion.

The official 3 kg, 2 kg, and 1 kg Garri Ijebu package photographs must remain the primary product images across the hero, collection, catalogue, detail pages, featured states, and order/cart presentation. Their aspect ratio must not be distorted. The homepage hero should pair editorial food-brand copy with the real 3 kg package and existing WhatsApp ordering. The public navigation should include clear product, story/about, souvenir, FAQ, contact, cart, and discreet admin access; the existing `/admin` authentication route remains the source of truth unless an alias can be added safely.

The requested product journey includes data-backed prices and sale prices where present, stock state, refined product cards, quantity selection, cart controls, and ordering actions. Cart and WhatsApp behavior must preserve selected product, pack size, and quantity while continuing to use the existing approved WhatsApp destination: https://wa.me/2348053880130. The website must not fabricate unavailable pricing, benefits, or inventory claims.

The plan must retain the live Supabase-backed souvenir, gallery, FAQ, contact, newsletter, order, and admin flows. It must provide responsive checks at 360 px, 390 px, and 414 px widths, suitable tap targets, no horizontal overflow, metadata for major public routes, focused regression tests, a passing production build, GitHub `main` synchronization, and Netlify compatibility verification.
