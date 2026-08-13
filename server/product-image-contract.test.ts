import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("product image contract", () => {
  it("uses image_url as the only persisted product image field", () => {
    const migration = readProjectFile("supabase/migrations/001_initial_schema.sql");
    const admin = readProjectFile("client/src/pages/Admin.tsx");

    expect(migration).toMatch(/create table(?: if not exists)? public\.products[\s\S]*?image_url text/i);
    expect(admin).toContain("editingProduct?.image_url");
    expect(admin).toContain("image_url: imageUrl");
    expect(admin).not.toMatch(/\bimageUrl\s*:/);
    expect(admin).not.toMatch(/\bproduct_image\b|\bproductImage\b/);
  });
});
