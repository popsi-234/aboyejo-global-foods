import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("homepage collection discovery", () => {
  it("surfaces verified live products with detail and cart entry points", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");

    expect(home).toContain("loadProducts()");
    expect(home).toContain('"garri-ijebu-3kg", "garri-ijebu-2kg", "garri-ijebu-1kg"');
    expect(home).toContain("collectionOrder.includes(product.slug");
    expect(home).toContain("imageUrl: product.image_url");
    expect(home).toContain('href="/products"');
    expect(home).toContain("/products/${product.slug}");
    expect(home).toContain("addPackToCart(product)");
    expect(home).toContain("premium-pack-card");
    expect(home).toContain("Loading the current Garri Ijebu packs");
    expect(home).toContain("View the full collection");
  });
});
