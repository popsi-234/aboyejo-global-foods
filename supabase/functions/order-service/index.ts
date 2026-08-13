import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  Vary: "Origin",
});

const send = (origin: string | null, body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: cors(origin) });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return send(origin, { error: "Method not allowed" }, 405);

  try {
    const input = await req.json();
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (input.action === "create") {
      const name = String(input.customerName || "").trim();
      const phone = String(input.phone || "").trim();
      const items = Array.isArray(input.items) ? input.items : [];
      if (!name || name.length > 160 || !phone || phone.length > 64 || !items.length || items.length > 10 || items.some((item) => !uuid.test(String(item?.product_id || "")) || !Number.isInteger(Number(item?.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 100)) {
        return send(origin, { error: "Please provide a valid name, phone number, and order selection." }, 400);
      }
      const { data, error } = await db.rpc("create_public_order", {
        p_customer_name: name,
        p_phone: phone,
        p_email: String(input.email || "").trim().slice(0, 320),
        p_delivery_address: String(input.address || "").trim().slice(0, 1000),
        p_notes: String(input.notes || "").trim().slice(0, 2000),
        p_items: items.map((item) => ({ product_id: String(item.product_id), quantity: Number(item.quantity) })),
      });
      if (error) return send(origin, { error: "This order could not be created. Please check the product selection and try again." }, 400);
      return send(origin, { order_id: data });
    }

    if (input.action === "status") {
      const orderId = String(input.orderId || "");
      const phone = String(input.phone || "").trim();
      if (!uuid.test(orderId) || !phone || phone.length > 64) return send(origin, { error: "Enter a valid order reference and phone number." }, 400);
      const { data, error } = await db.rpc("get_public_order_status", { p_order_id: orderId, p_phone: phone });
      if (error) return send(origin, { error: "The order status could not be checked." }, 400);
      return send(origin, { order: data?.[0] || null });
    }
    return send(origin, { error: "Unsupported order action." }, 400);
  } catch {
    return send(origin, { error: "The request could not be processed." }, 400);
  }
});
