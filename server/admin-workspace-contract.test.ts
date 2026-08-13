import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("../", import.meta.url);
const adminWorkspace = readFileSync(new URL("client/src/pages/Admin.tsx", projectRoot), "utf8");

describe("admin workspace contract", () => {
  it("includes protected newsletter management and content record controls", () => {
    expect(adminWorkspace).toContain('supabase.from("newsletter_subscribers").select("*")');
    expect(adminWorkspace).toContain('updateSubscriber(item.id');
    expect(adminWorkspace).toContain('deleteRecord("newsletter_subscribers", item.id, "subscriber")');
    expect(adminWorkspace).toContain('deleteRecord("gallery", item.id, "gallery item")');
    expect(adminWorkspace).toContain('deleteRecord("souvenir_packages", item.id, "souvenir package")');
    expect(adminWorkspace).toContain('deleteRecord("faqs", item.id, "FAQ")');
    expect(adminWorkspace).toContain('deleteRecord("testimonials", item.id, "testimonial")');
    expect(adminWorkspace).toContain("Customer-approved testimonial");
  });
});
