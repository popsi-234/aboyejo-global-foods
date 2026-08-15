# Catalogue and ordering enhancement verification

The storefront enhancement pass addressed a confirmed public-route gap: catalogue cards linked to product slugs, while no `products/:slug` route was registered. A dedicated, data-backed product-detail page now uses the existing `loadProductBySlug` helper and the canonical `products.image_url` field. It presents the active pack, size, stock status, and price-on-request state without introducing a price or other unverified commercial information.

| Verification area | Result |
| --- | --- |
| Product detail | `/products/garri-ijebu-1kg` loads a product-specific editorial page with the supplied 1 kg package image, factual package information, and an order action. |
| Pack-label claims | The displayed claims have been read directly from each supplied package image rather than inferred from brand copy. The 1 kg and 2 kg package fronts each visibly carry `100% NATURAL`, `HYGIENICALLY PACKAGED`, and `PREMIUM QUALITY` badges, together with `1KG NET WEIGHT` and `2KG NET WEIGHT`, respectively. The final 3 kg source-image check is recorded below before release. |

## Package-label evidence mapping

| Live variant | Supplied source image | Directly readable front-label evidence | Public detail-page use |
| --- | --- | --- | --- |
| Garri Ijebu 1 kg | `file_0000000040b48243bf7551a5fca67121.png` | `1KG NET WEIGHT`; `100% NATURAL`; `HYGIENICALLY PACKAGED`; `PREMIUM QUALITY` | Pack-size fact and quality/packaging badge list |
| Garri Ijebu 2 kg | `file_00000000bf448243a662490ef64b221d.png` | `2KG NET WEIGHT`; `100% NATURAL`; `HYGIENICALLY PACKAGED`; `PREMIUM QUALITY` | Pack-size fact and quality/packaging badge list |
| Garri Ijebu 3 kg | `file_000000007b0c8243ab74e22ef9f3b719.png` | `3KG NET WEIGHT`; `100% NATURAL`; `HYGIENICALLY PACKAGED`; `PREMIUM QUALITY` | Pack-size fact and quality/packaging badge list |
| Order context | The order form retains a valid `product` query parameter and visibly names the selected pack before submission. Invalid or absent product selections fall back safely to the first available active product. |
| Loading and empty states | Product catalogue, product detail, and order-product loading states are explicit and non-blocking; unavailable items lead back to the catalogue rather than a dead-end route. |
| Metadata | Catalogue and detail routes set accurate document titles and descriptions while mounted, restoring the prior document metadata on navigation. |
| Regression checks | `pnpm check`, `pnpm test` (7 files, 9 tests), and `pnpm build` completed successfully. |
| Responsive review | Full-page desktop (1280 × 900) and mobile (375 × 812) screenshots confirmed readable pack facts, visible calls to action, and a single-column mobile layout without horizontal overflow. |

## Homepage collection visibility update

The homepage now makes the active collection visible rather than requiring visitors to discover it only through the standalone catalogue route. The hero **Explore the collection** action and primary Products navigation link go directly to `/products`. The existing Collection section loads only the approved active records with slugs `garri-ijebu-1kg`, `garri-ijebu-2kg`, and `garri-ijebu-3kg`; each card uses its canonical `image_url` and provides both a product-detail entry and a selected-pack ordering link.

If the live collection cannot be loaded, the homepage displays an explicit loading or catalogue-link state instead of static or invented product-card fallback content. Desktop and 375 × 812 mobile renders confirmed the three supplied packages, direct actions, readable hero collection link, and responsive card layout. The final local validation completed with `pnpm check`, `pnpm test` (8 files, 10 tests), and `pnpm build` passing.
