// Typed data access for the Aboyejo storefront and Supabase-backed admin workspace.
import type { Tables } from "./supabase.types";
import { supabase } from "./supabase";

export type Product = Tables<"products">;
export type GalleryItem = Tables<"gallery">;
export type SouvenirPackage = Tables<"souvenir_packages">;
export type Faq = Tables<"faqs">;

export const brandMark = "/manus-storage/aboyejo-mark_e7e0605e.png";

export const loadProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const loadProductBySlug = async (slug: string) => {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
};

export const loadGallery = async () => {
  const { data, error } = await supabase.from("gallery").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const loadSouvenirs = async () => {
  const { data, error } = await supabase.from("souvenir_packages").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const loadFaqs = async () => {
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const loadPublicSetting = async (key: string) => {
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.value ?? "";
};

export async function submitContact(input: { name: string; email?: string; phone?: string; message: string }) {
  const { error } = await supabase.from("contact_messages").insert({ name: input.name.trim(), email: input.email?.trim() || null, phone: input.phone?.trim() || null, message: input.message.trim() });
  if (error) throw error;
}

export async function subscribeToNewsletter(email: string) {
  const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
  if (error && error.code !== "23505") throw error;
}

export async function createOrder(input: { customerName: string; phone: string; email?: string; address?: string; notes?: string; items: Array<{ product_id: string; quantity: number }> }) {
  const { data, error } = await supabase.functions.invoke("order-service", { body: { action: "create", ...input } });
  if (error || data?.error) throw new Error(data?.error || error.message);
  return data.order_id as string;
}

export async function getOrderStatus(orderId: string, phone: string) {
  const { data, error } = await supabase.functions.invoke("order-service", { body: { action: "status", orderId, phone } });
  if (error || data?.error) throw new Error(data?.error || error.message);
  return data.order ? [data.order] : [];
}

export async function getAdminAccess(action: "status" | "claim_first_admin" | "grant_admin", input: Record<string, string> = {}) {
  const { data, error } = await supabase.functions.invoke("admin-access", { body: { action, ...input } });
  if (error || data?.error) throw new Error(data?.error || error.message);
  return data as { admin?: boolean; role?: string | null; claimed?: boolean; success?: boolean };
}

export type ImageBucket = "product-images" | "gallery-images" | "souvenir-images";

export async function uploadBusinessImage(file: File, bucket: ImageBucket, folder: string) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeStem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  const objectPath = `${folder}/${Date.now()}-${safeStem || "image"}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(objectPath, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}
