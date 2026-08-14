import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("public product journey", () => {
  it("provides a dedicated detail route and keeps product identity when ordering", () => {
    const app = readProjectFile("client/src/App.tsx");
    const detail = readProjectFile("client/src/pages/ProductDetail.tsx");
    const order = readProjectFile("client/src/pages/Order.tsx");

    expect(app).toContain('path={"/products/:slug"}');
    expect(detail).toContain("loadProductBySlug(slug)");
    expect(detail).toContain("Product at a glance");
    expect(detail).toContain("product.image_url");
    expect(detail).toContain("/order?product=${product.id}");
    expect(order).toContain("initialProduct");
    expect(order).toContain("selectedProductRecord");
    expect(order).toContain("Selected pack");
  });
});
