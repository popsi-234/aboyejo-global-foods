import { describe, expect, it } from "vitest";

describe("Supabase environment", () => {
  it("accepts the configured publishable key at the project health endpoint", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    expect(url, "VITE_SUPABASE_URL must be set").toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(key, "VITE_SUPABASE_PUBLISHABLE_KEY must be set").toBeTruthy();

    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key! },
    });

    expect(response.ok, `Supabase health endpoint returned ${response.status}`).toBe(true);
  });
});
