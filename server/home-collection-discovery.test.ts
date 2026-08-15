import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("homepage collection discovery", () => {
  it("surfaces verified live products with detail and selected-pack order entry points", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");

    expect(home).toContain("loadProducts()");
    expect(home).toContain('"garri-ijebu-1kg", "garri-ijebu-2kg", "garri-ijebu-3kg"');
    expect(home).toContain("approvedCollectionSlugs.includes(product.slug");
    expect(home).toContain("product.image_url");
    expect(home).toContain('href="/products"');
    expect(home).toContain("/products/${product.slug}");
    expect(home).toContain("/order?product=${product.id}");
    expect(home).toContain("product-pack-preview");
    expect(home).toContain("Loading the current Garri Ijebu packs");
    expect(home).toContain("View the current collection");
  });
});
