import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("public WhatsApp handoff", () => {
  it("reads the administrator-managed number and sends the homepage action to WhatsApp", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");
    const commerce = readProjectFile("client/src/lib/commerce.ts");

    expect(commerce).toContain("export const loadPublicSetting");
    expect(commerce).toContain('.from("site_settings")');
    expect(home).toContain('loadPublicSetting("whatsapp_number")');
    expect(home).toContain("https://wa.me/${digits}");
    expect(home).toContain('onClick={openWhatsApp}');
    expect(home).toContain('goTo("contact")');
  });
});
