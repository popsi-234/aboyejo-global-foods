# Catalogue Verification — 2026-08-14

The public production catalogue at `https://aboyejoglobalfoods1.netlify.app/products` was checked after the product update. It displayed three active cards in the required order: **Garri Ijebu 1kg**, **Garri Ijebu 2kg**, and **Garri Ijebu 3kg**. Each card exposed the intended Supabase Storage `image_url`, reported `in stock`, and showed **Price on request** because the owner did not provide commercial pricing. The corresponding records use the canonical `image_url` field and link to their expected order flows.

## Verified size-to-image mapping

Each original 1402 × 1122 owner-provided package image was reread at its native resolution. The front-label net-weight badge establishes the following mappings; no inferred size assignment was used.

| Product record | Supplied source file | Readable front-label net weight | Stored object path |
| --- | --- | --- | --- |
| Garri Ijebu 1kg | `file_0000000040b48243bf7551a5fca67121.png` | `1KG NET WEIGHT` | `product-images/products/20260814-garri-ijebu-1kg.png` |
| Garri Ijebu 2kg | `file_00000000bf448243a662490ef64b221d.png` | `2KG NET WEIGHT` | `product-images/products/20260814-garri-ijebu-2kg.png` |
| Garri Ijebu 3kg | `file_000000007b0c8243ab74e22ef9f3b719.png` | `3KG NET WEIGHT` | `product-images/products/20260814-garri-ijebu-3kg.png` |
