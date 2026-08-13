import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const adminFunction = readFileSync(resolve(import.meta.dirname, "../supabase/functions/admin-access/index.ts"), "utf8");

describe("admin Edge Function transport contract", () => {
  it("accepts browser preflight requests and returns origin-aware CORS headers", () => {
    expect(adminFunction).toContain('"Access-Control-Allow-Methods": "POST, OPTIONS"');
    expect(adminFunction).toContain('if (req.method === "OPTIONS")');
    expect(adminFunction).toContain('const origin = req.headers.get("Origin")');
  });

  it("keeps administrator RPCs behind the authenticated service-role boundary", () => {
    expect(adminFunction).toContain('Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")');
    expect(adminFunction).toContain('auth.auth.getUser()');
    expect(adminFunction).toContain('db.rpc("claim_first_admin"');
  });
});
