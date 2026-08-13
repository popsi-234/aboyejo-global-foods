import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  Vary: "Origin",
});
const response = (origin: string | null, body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: cors(origin) });

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return response(origin, { error: "Method not allowed" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization) return response(origin, { error: "Authentication is required." }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
  const { data: authData, error: authError } = await auth.auth.getUser();
  if (authError || !authData.user) return response(origin, { error: "Authentication is required." }, 401);

  const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: membership } = await db.from("admin_users").select("role,is_active").eq("user_id", authData.user.id).eq("is_active", true).maybeSingle();
  const input = await req.json().catch(() => ({}));
  if (input.action === "status") return response(origin, { admin: Boolean(membership), role: membership?.role || null });

  if (input.action === "claim_first_admin") {
    const { data, error } = await db.rpc("claim_first_admin", { p_user_id: authData.user.id });
    if (error) return response(origin, { error: "Administrator setup could not be completed." }, 400);
    return response(origin, { claimed: Boolean(data) });
  }

  if (!membership) return response(origin, { error: "Administrator access is required." }, 403);
  if (input.action === "grant_admin") {
    const email = String(input.email || "").trim();
    const role = input.role === "editor" ? "editor" : "admin";
    if (!email || email.length > 320) return response(origin, { error: "Enter a valid administrator email address." }, 400);
    const { error } = await db.rpc("grant_admin_by_email", { p_actor_id: authData.user.id, p_email: email, p_role: role });
    if (error) return response(origin, { error: "That account could not be granted administrator access. Ensure it has signed up first." }, 400);
    return response(origin, { success: true });
  }
  return response(origin, { error: "Unsupported administrator action." }, 400);
});
