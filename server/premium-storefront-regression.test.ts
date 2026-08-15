import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("premium storefront hero", () => {
  it("keeps the official 3 kg package and both shopping actions in the mobile hero contract", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");
    const mobileHero = readProjectFile("client/src/pages/home-mobile-hero.css");

    expect(home).toContain('import "./home-mobile-hero.css"');
    expect(home).toContain('product.slug === "garri-ijebu-3kg"');
    expect(home).toContain('className="premium-product-stage"');
    expect(home).toContain('alt={`${heroProduct.name} official package`}');
    expect(home).toContain("Shop Garri Ijebu");
    expect(home).toContain("Order on WhatsApp");

    expect(mobileHero).toContain("@media (max-width: 620px)");
    expect(mobileHero).toContain(".premium-product-stage");
    expect(mobileHero).toContain("position: relative");
    expect(mobileHero).toContain("min-height: 255px");
    expect(mobileHero).toContain(".premium-stage-product");
  });
});
