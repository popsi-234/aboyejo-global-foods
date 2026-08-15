import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("premium storefront hero", () => {
  it("keeps the official 3 kg package and both shopping actions in the mobile hero contract", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");
    const mobileHero = readProjectFile("client/src/pages/home-mobile-hero.css");
    const heroRefresh = readProjectFile("client/src/pages/home-brief-refresh.css");

    expect(home).toContain('import "./home-mobile-hero.css"');
    expect(home).toContain('import "./home-brief-refresh.css"');
    expect(home).toContain('product.slug === "garri-ijebu-3kg"');
    expect(home).toContain('className="premium-product-stage brief-product-stage reference-product-stage"');
    expect(home).toContain('alt={`${heroProduct.name} official package`}');
    expect(home).toContain("Pure Taste.");
    expect(home).toContain("Made the Nigerian Way.");
    expect(home).toContain("Shop Garri");
    expect(home).toContain("Order on WhatsApp");

    expect(mobileHero).toContain("@media (max-width: 620px)");
    expect(mobileHero).toContain(".premium-product-stage");
    expect(mobileHero).toContain("position: relative");
    expect(mobileHero).toContain("min-height: 255px");
    expect(mobileHero).toContain(".premium-stage-product");
    expect(heroRefresh).toContain(".reference-product-stage");
    expect(heroRefresh).toContain("min-height: 190px");
  });

  it("keeps the reference-matched lower section sequence backed by live content helpers", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");
    const heroRefresh = readProjectFile("client/src/pages/home-brief-refresh.css");

    expect(home).toContain("loadGallery");
    expect(home).toContain("loadSouvenirs");
    expect(home).toContain('className="reference-souvenirs"');
    expect(home).toContain('className="reference-gallery-band"');
    expect(home).toContain('className="reference-support"');
    expect(home).toContain('className="premium-footer reference-footer"');
    expect(home).toContain('href="/admin"');

    expect(heroRefresh).toContain(".reference-souvenirs");
    expect(heroRefresh).toContain(".reference-gallery-band");
    expect(heroRefresh).toContain(".reference-support");
    expect(heroRefresh).toContain(".reference-footer");
  });
});
