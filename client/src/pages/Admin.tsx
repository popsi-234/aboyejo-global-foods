// Supabase-authenticated admin workspace. All persisted product imagery uses image_url.
import { ArrowLeft, CheckCircle2, ImagePlus, LogOut, PackagePlus, Send, Settings, ShieldCheck, ShoppingBag, Tags, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { getAdminAccess, uploadBusinessImage } from "@/lib/commerce";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase.types";

type AdminTab = "overview" | "products" | "media" | "operations" | "content" | "team";
type Product = Tables<"products">;
type Category = Tables<"product_categories">;
type GalleryItem = Tables<"gallery">;
type Souvenir = Tables<"souvenir_packages">;
type Order = Tables<"orders">;
type Message = Tables<"contact_messages">;
type Subscriber = Tables<"newsletter_subscribers">;
type Faq = Tables<"faqs">;
type Testimonial = Tables<"testimonials">;
type AdminUser = Tables<"admin_users">;

const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
const text = (data: FormData, key: string) => String(data.get(key) || "").trim();
const nullableNumber = (value: string) => value ? Number(value) : null;

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({ whatsapp_number: "", business_email: "" });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editingSouvenir, setEditingSouvenir] = useState<Souvenir | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const dashboardNumbers = useMemo(() => [
    { label: "Products", value: products.length },
    { label: "Orders", value: orders.length },
    { label: "Unread messages", value: messages.filter((item) => item.status === "unread").length },
    { label: "Subscribers", value: subscribers.filter((item) => item.status === "subscribed").length },
  ], [products, orders, messages, subscribers]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSessionReady(Boolean(data.session));
      if (data.session) void checkAdmin();
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSessionReady(Boolean(next));
      if (next) void checkAdmin(); else setIsAdmin(false);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (isAdmin) void refresh(); }, [isAdmin]);

  async function checkAdmin() {
    try { const data = await getAdminAccess("status"); setIsAdmin(Boolean(data.admin)); }
    catch (error) { setNotice(errorText(error)); }
  }

  async function refresh() {
    try {
      const results = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("product_categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("gallery").select("*").order("created_at", { ascending: false }),
        supabase.from("souvenir_packages").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }),
        supabase.from("faqs").select("*").order("sort_order", { ascending: true }),
        supabase.from("testimonials").select("*").order("sort_order", { ascending: true }),
        supabase.from("admin_users").select("*").order("created_at", { ascending: true }),
        supabase.from("site_settings").select("key,value"),
      ]);
      const failed = results.find((result) => result.error)?.error;
      if (failed) throw failed;
      setProducts(results[0].data ?? []); setCategories(results[1].data ?? []); setGallery(results[2].data ?? []);
      setSouvenirs(results[3].data ?? []); setOrders(results[4].data ?? []); setMessages(results[5].data ?? []);
      setSubscribers(results[6].data ?? []); setFaqs(results[7].data ?? []); setTestimonials(results[8].data ?? []);
      setAdmins(results[9].data ?? []); setSettings(Object.fromEntries((results[10].data ?? []).map((item) => [item.key, item.value])));
    } catch (error) { setNotice(errorText(error)); }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice(""); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setNotice(error.message); }
  async function signUp() { setNotice(""); const { error } = await supabase.auth.signUp({ email, password }); setNotice(error ? error.message : "Account created. Confirm the email if required, then sign in and claim the first-admin role."); }
  async function claimFirstAdmin() { try { const data = await getAdminAccess("claim_first_admin"); setNotice(data.claimed ? "First administrator access is now active." : "An administrator has already been configured for this project."); if (data.claimed) await checkAdmin(); } catch (error) { setNotice(errorText(error)); } }
  async function signOut() { await supabase.auth.signOut(); setIsAdmin(false); setSessionReady(false); }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    try {
      let imageUrl = editingProduct?.image_url ?? null; const file = data.get("image_file");
      if (file instanceof File && file.size) imageUrl = await uploadBusinessImage(file, "product-images", "products");
      const categoryId = text(data, "category_id");
      const input = { name: text(data, "name"), slug: text(data, "slug"), size: text(data, "size"), description: text(data, "description"), price: Number(text(data, "price") || 0), sale_price: nullableNumber(text(data, "sale_price")), stock_status: text(data, "stock_status") || "in_stock", category_id: categoryId === "uncategorized" ? null : categoryId, image_url: imageUrl, is_active: true };
      const result = editingProduct ? await supabase.from("products").update(input).eq("id", editingProduct.id) : await supabase.from("products").insert(input);
      if (result.error) throw result.error; setEditingProduct(null); form.reset(); setNotice("Product saved."); await refresh();
    } catch (error) { setNotice(errorText(error)); }
  }

  async function saveGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    try {
      let imageUrl = editingGallery?.image_url ?? null; const file = data.get("image_file");
      if (file instanceof File && file.size) imageUrl = await uploadBusinessImage(file, "gallery-images", "gallery");
      if (!imageUrl) throw new Error("Choose an image file before publishing a gallery item.");
      const input = { title: text(data, "title"), caption: text(data, "caption") || null, category: text(data, "category") || "general", image_url: imageUrl, is_published: data.get("is_published") === "on" };
      const result = editingGallery ? await supabase.from("gallery").update(input).eq("id", editingGallery.id) : await supabase.from("gallery").insert(input);
      if (result.error) throw result.error; setEditingGallery(null); form.reset(); setNotice("Gallery item saved."); await refresh();
    } catch (error) { setNotice(errorText(error)); }
  }

  async function saveSouvenir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    try {
      let imageUrl = editingSouvenir?.image_url ?? null; const file = data.get("image_file");
      if (file instanceof File && file.size) imageUrl = await uploadBusinessImage(file, "souvenir-images", "souvenirs");
      const input = { name: text(data, "name"), description: text(data, "description"), event_types: text(data, "event_types").split(",").map((value) => value.trim()).filter(Boolean), minimum_quantity: nullableNumber(text(data, "minimum_quantity")), price_note: text(data, "price_note") || null, image_url: imageUrl, is_active: data.get("is_active") === "on" };
      const result = editingSouvenir ? await supabase.from("souvenir_packages").update(input).eq("id", editingSouvenir.id) : await supabase.from("souvenir_packages").insert(input);
      if (result.error) throw result.error; setEditingSouvenir(null); form.reset(); setNotice("Souvenir package saved."); await refresh();
    } catch (error) { setNotice(errorText(error)); }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const input = { name: text(data, "name"), slug: text(data, "slug"), description: text(data, "description") || null, sort_order: Number(text(data, "sort_order") || 0), is_active: data.get("is_active") === "on" }; const result = editingCategory ? await supabase.from("product_categories").update(input).eq("id", editingCategory.id) : await supabase.from("product_categories").insert(input); if (result.error) setNotice(result.error.message); else { setEditingCategory(null); form.reset(); setNotice("Category saved."); void refresh(); } }
  async function saveFaq(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const input = { question: text(data, "question"), answer: text(data, "answer"), sort_order: Number(text(data, "sort_order") || faqs.length + 1), is_published: data.get("is_published") === "on" }; const result = editingFaq ? await supabase.from("faqs").update(input).eq("id", editingFaq.id) : await supabase.from("faqs").insert(input); if (result.error) setNotice(result.error.message); else { setEditingFaq(null); form.reset(); setNotice("FAQ saved."); void refresh(); } }
  async function saveTestimonial(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const input = { quote: text(data, "quote"), customer_name: text(data, "customer_name") || null, context: text(data, "context") || null, sort_order: Number(text(data, "sort_order") || testimonials.length + 1), is_published: data.get("is_published") === "on" }; const result = editingTestimonial ? await supabase.from("testimonials").update(input).eq("id", editingTestimonial.id) : await supabase.from("testimonials").insert(input); if (result.error) setNotice(result.error.message); else { setEditingTestimonial(null); form.reset(); setNotice("Testimonial saved. Publish only real customer-approved feedback."); void refresh(); } }

  async function deleteRecord(table: "products" | "product_categories" | "gallery" | "souvenir_packages" | "faqs" | "testimonials" | "newsletter_subscribers", id: string, label: string) { if (!confirm(`Delete this ${label}?`)) return; const { error } = await supabase.from(table).delete().eq("id", id); if (error) setNotice(error.message); else { setNotice(`${label} deleted.`); void refresh(); } }
  async function updateOrder(id: string, status: string) { const { error } = await supabase.from("orders").update({ status }).eq("id", id); if (error) setNotice(error.message); else void refresh(); }
  async function markMessageRead(id: string) { const { error } = await supabase.from("contact_messages").update({ status: "read" }).eq("id", id); if (error) setNotice(error.message); else void refresh(); }
  async function updateSubscriber(id: string, status: "subscribed" | "unsubscribed") { const { error } = await supabase.from("newsletter_subscribers").update({ status }).eq("id", id); if (error) setNotice(error.message); else { setNotice("Subscriber status updated."); void refresh(); } }
  async function saveSettings(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const values = ["whatsapp_number", "business_email"].map((key) => ({ key, value: text(data, key), is_public: true })); const { error } = await supabase.from("site_settings").upsert(values, { onConflict: "key" }); if (error) setNotice(error.message); else { setNotice("Public contact settings updated."); void refresh(); } }
  async function grantAdmin(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { await getAdminAccess("grant_admin", { email: text(data, "email"), role: text(data, "role") || "admin" }); setNotice("Administrator access updated."); (event.currentTarget as HTMLFormElement).reset(); await refresh(); } catch (error) { setNotice(errorText(error)); } }

  if (!sessionReady) return <AdminAuth email={email} password={password} setEmail={setEmail} setPassword={setPassword} onSubmit={signIn} onSignUp={signUp} notice={notice} />;
  if (!isAdmin) return <main className="admin-auth"><div className="admin-auth-card"><ShieldCheck size={30} /><p className="eyebrow">Admin verification</p><h1>Access is protected.</h1><p>This account is authenticated with Supabase, but does not yet hold an Aboyejo admin role. In a new project, the first authenticated user may claim the initial admin role exactly once.</p><button className="forest-button" onClick={claimFirstAdmin}>Claim first-admin access</button><button className="text-button" onClick={signOut}>Sign out</button>{notice ? <p className="notice">{notice}</p> : null}</div></main>;

  const tabs: Array<[AdminTab, string]> = [["overview", "Overview"], ["products", "Products"], ["media", "Media & souvenirs"], ["operations", "Orders & messages"], ["content", "Content & settings"], ["team", "Admin users"]];
  return <main className="admin-shell"><aside className="admin-side"><Link className="brand-lockup" href="/"><ArrowLeft size={16} /><span className="brand-wordmark">Aboyejo <em>Admin workspace</em></span></Link><nav>{tabs.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</nav><button className="admin-signout" onClick={signOut}><LogOut size={16} /> Sign out</button></aside><section className="admin-content"><header className="admin-header"><div><p className="eyebrow">Supabase-backed operations</p><h1>{tabs.find(([id]) => id === tab)?.[1]}</h1></div><button className="outline-button" onClick={() => void refresh()}>Refresh data</button></header>{notice ? <p className="notice"><CheckCircle2 size={16} /> {notice}</p> : null}
    {tab === "overview" ? <div className="admin-overview"><div className="admin-stat-grid">{dashboardNumbers.map((item) => <div className="admin-stat" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div><div className="admin-guidance"><Settings size={22} /><div><h2>Production setup checklist</h2><p>Publish products, configure the WhatsApp number, and add real approved content before sharing the public site. All images are uploaded directly from an administrator’s device into separate Supabase Storage buckets.</p></div></div></div> : null}
    {tab === "products" ? <section className="admin-grid"><form className="admin-card" key={editingProduct?.id ?? "new-product"} onSubmit={saveProduct}><div className="admin-card-title"><PackagePlus size={19} /><h2>{editingProduct ? "Edit product" : "Add a product"}</h2></div><label>Name<input name="name" required defaultValue={editingProduct?.name} /></label><label>Slug<input name="slug" required defaultValue={editingProduct?.slug} placeholder="garri-ijebu-1kg" /></label><label>Category<select name="category_id" defaultValue={editingProduct?.category_id ?? "uncategorized"}><option value="uncategorized">Uncategorized</option>{categories.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="form-split"><label>Size<input name="size" required defaultValue={editingProduct?.size} placeholder="1kg" /></label><label>Price (₦)<input name="price" type="number" min="0" required defaultValue={editingProduct?.price ?? 0} /></label></div><div className="form-split"><label>Sale price <span>(optional)</span><input name="sale_price" type="number" min="0" defaultValue={editingProduct?.sale_price ?? ""} /></label><label>Stock<select name="stock_status" defaultValue={editingProduct?.stock_status ?? "in_stock"}><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label></div><label>Description<textarea name="description" rows={4} required defaultValue={editingProduct?.description} /></label><label>Product image <span>(file selection uploads to Storage)</span><input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" /></label>{editingProduct?.image_url ? <img className="admin-preview" src={editingProduct.image_url} alt="Current product" /> : null}<div className="admin-inline-actions"><button className="forest-button" type="submit">{editingProduct ? "Save product" : "Publish product"}</button>{editingProduct ? <button className="text-button" type="button" onClick={() => setEditingProduct(null)}>Cancel</button> : null}</div></form><div className="admin-card"><div className="admin-card-title"><ShoppingBag size={19} /><h2>Catalogue</h2></div><div className="admin-list">{products.map((item) => <article key={item.id}><div>{item.image_url ? <img src={item.image_url} alt="" /> : <span className="admin-thumb-placeholder" />}<div><strong>{item.name}</strong><span>{item.size} · {item.stock_status.replaceAll("_", " ")}</span></div></div><div><button className="text-button" onClick={() => setEditingProduct(item)}>Edit</button><button className="text-button destructive" onClick={() => void deleteRecord("products", item.id, "product")}>Delete</button></div></article>)}{!products.length ? <p className="muted-copy">No products yet. Use the form to publish the first product.</p> : null}</div></div></section> : null}
    {tab === "media" ? <section className="admin-grid"><form className="admin-card" key={editingGallery?.id ?? "new-gallery"} onSubmit={saveGallery}><div className="admin-card-title"><ImagePlus size={19} /><h2>{editingGallery ? "Edit gallery image" : "Publish gallery image"}</h2></div><label>Title<input name="title" required defaultValue={editingGallery?.title} /></label><label>Caption <span>(optional)</span><input name="caption" defaultValue={editingGallery?.caption ?? ""} /></label><label>Category<input name="category" defaultValue={editingGallery?.category ?? "general"} /></label><label className="checkbox-line"><input name="is_published" type="checkbox" defaultChecked={editingGallery?.is_published ?? true} /> Published</label><label>Image file <span>(leave blank to retain the current image)</span><input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" required={!editingGallery} /></label><div className="admin-inline-actions"><button className="forest-button" type="submit">Save gallery item</button>{editingGallery ? <button className="text-button" type="button" onClick={() => setEditingGallery(null)}>Cancel</button> : null}</div><div className="admin-media-list">{gallery.map((item) => <div key={item.id}><img src={item.image_url} alt={item.title} /><span><button className="text-button" type="button" onClick={() => setEditingGallery(item)}>Edit</button><button className="text-button destructive" type="button" onClick={() => void deleteRecord("gallery", item.id, "gallery item")}>Delete</button></span></div>)}</div></form><form className="admin-card" key={editingSouvenir?.id ?? "new-souvenir"} onSubmit={saveSouvenir}><div className="admin-card-title"><PackagePlus size={19} /><h2>{editingSouvenir ? "Edit souvenir package" : "Publish souvenir package"}</h2></div><label>Name<input name="name" required defaultValue={editingSouvenir?.name} /></label><label>Event types <span>(comma separated)</span><input name="event_types" defaultValue={editingSouvenir?.event_types.join(", ") ?? ""} placeholder="Wedding, Corporate" required /></label><label>Description<textarea name="description" required rows={3} defaultValue={editingSouvenir?.description} /></label><div className="form-split"><label>Minimum quantity<input name="minimum_quantity" type="number" min="1" defaultValue={editingSouvenir?.minimum_quantity ?? ""} /></label><label>Price note<input name="price_note" defaultValue={editingSouvenir?.price_note ?? ""} placeholder="Quote on request" /></label></div><label className="checkbox-line"><input name="is_active" type="checkbox" defaultChecked={editingSouvenir?.is_active ?? true} /> Active</label><label>Image file <span>(leave blank to retain the current image)</span><input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" required={!editingSouvenir} /></label><div className="admin-inline-actions"><button className="forest-button" type="submit">Save souvenir package</button>{editingSouvenir ? <button className="text-button" type="button" onClick={() => setEditingSouvenir(null)}>Cancel</button> : null}</div><div className="admin-media-list">{souvenirs.map((item) => <div key={item.id}>{item.image_url ? <img src={item.image_url} alt={item.name} /> : <span className="admin-thumb-placeholder" />}<span><button className="text-button" type="button" onClick={() => setEditingSouvenir(item)}>Edit</button><button className="text-button destructive" type="button" onClick={() => void deleteRecord("souvenir_packages", item.id, "souvenir package")}>Delete</button></span></div>)}</div></form></section> : null}
    {tab === "operations" ? <section className="admin-grid"><div className="admin-card"><div className="admin-card-title"><ShoppingBag size={19} /><h2>Orders</h2></div><div className="admin-list">{orders.map((item) => <article key={item.id}><div><strong>{item.id.slice(0, 8)}…</strong><span>₦{Number(item.total_amount).toLocaleString()} · {new Date(item.created_at).toLocaleDateString()}</span></div><select value={item.status} onChange={(event) => void updateOrder(item.id, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="ready">Ready</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></article>)}{!orders.length ? <p className="muted-copy">No customer orders yet.</p> : null}</div></div><div className="admin-card"><div className="admin-card-title"><Send size={19} /><h2>Contact messages</h2></div><div className="admin-list">{messages.map((item) => <article key={item.id}><div><strong>{item.name}</strong><span>{item.message}</span></div><button className="text-button" onClick={() => void markMessageRead(item.id)}>{item.status === "unread" ? "Mark read" : "Read"}</button></article>)}{!messages.length ? <p className="muted-copy">No contact messages yet.</p> : null}</div></div><div className="admin-card"><div className="admin-card-title"><Users size={19} /><h2>Newsletter subscribers</h2></div><div className="admin-list">{subscribers.map((item) => <article key={item.id}><div><strong>{item.email}</strong><span>{item.status} · {new Date(item.subscribed_at).toLocaleDateString()}</span></div><div><button className="text-button" onClick={() => void updateSubscriber(item.id, item.status === "subscribed" ? "unsubscribed" : "subscribed")}>{item.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}</button><button className="text-button destructive" onClick={() => void deleteRecord("newsletter_subscribers", item.id, "subscriber")}>Delete</button></div></article>)}{!subscribers.length ? <p className="muted-copy">No newsletter subscribers yet.</p> : null}</div></div></section> : null}
    {tab === "content" ? <section className="admin-grid"><form className="admin-card" key={editingCategory?.id ?? "new-category"} onSubmit={saveCategory}><div className="admin-card-title"><Tags size={19} /><h2>{editingCategory ? "Edit category" : "Product categories"}</h2></div><label>Name<input name="name" required defaultValue={editingCategory?.name} /></label><label>Slug<input name="slug" required defaultValue={editingCategory?.slug} /></label><label>Description<textarea name="description" rows={2} defaultValue={editingCategory?.description ?? ""} /></label><label>Display order<input name="sort_order" type="number" min="0" defaultValue={editingCategory?.sort_order ?? categories.length} /></label><label className="checkbox-line"><input name="is_active" type="checkbox" defaultChecked={editingCategory?.is_active ?? true} /> Active</label><div className="admin-inline-actions"><button className="forest-button" type="submit">Save category</button>{editingCategory ? <button className="text-button" type="button" onClick={() => setEditingCategory(null)}>Cancel</button> : null}</div><div className="compact-list">{categories.map((item) => <p key={item.id}><span><strong>{item.name}</strong><span>{item.slug}</span></span><span><button className="text-button" type="button" onClick={() => setEditingCategory(item)}>Edit</button><button className="text-button destructive" type="button" onClick={() => void deleteRecord("product_categories", item.id, "category")}>Delete</button></span></p>)}</div></form><form className="admin-card" key={editingFaq?.id ?? "new-faq"} onSubmit={saveFaq}><div className="admin-card-title"><Settings size={19} /><h2>{editingFaq ? "Edit FAQ" : "Publish an FAQ"}</h2></div><label>Question<input name="question" required defaultValue={editingFaq?.question} /></label><label>Answer<textarea name="answer" rows={4} required defaultValue={editingFaq?.answer} /></label><label>Display order<input name="sort_order" type="number" min="0" defaultValue={editingFaq?.sort_order ?? faqs.length + 1} /></label><label className="checkbox-line"><input name="is_published" type="checkbox" defaultChecked={editingFaq?.is_published ?? true} /> Published</label><div className="admin-inline-actions"><button className="forest-button" type="submit">Save FAQ</button>{editingFaq ? <button className="text-button" type="button" onClick={() => setEditingFaq(null)}>Cancel</button> : null}</div><div className="compact-list">{faqs.map((item) => <p key={item.id}><span><strong>{item.question}</strong><span>{item.answer}</span></span><span><button className="text-button" type="button" onClick={() => setEditingFaq(item)}>Edit</button><button className="text-button destructive" type="button" onClick={() => void deleteRecord("faqs", item.id, "FAQ")}>Delete</button></span></p>)}</div></form><form className="admin-card" key={editingTestimonial?.id ?? "new-testimonial"} onSubmit={saveTestimonial}><div className="admin-card-title"><CheckCircle2 size={19} /><h2>{editingTestimonial ? "Edit testimonial" : "Customer-approved testimonial"}</h2></div><p className="muted-copy">Only publish real feedback that the customer has approved for use. This project does not supply testimonial content.</p><label>Quote<textarea name="quote" rows={4} required defaultValue={editingTestimonial?.quote} /></label><label>Customer name <span>(optional)</span><input name="customer_name" defaultValue={editingTestimonial?.customer_name ?? ""} /></label><label>Context <span>(optional)</span><input name="context" defaultValue={editingTestimonial?.context ?? ""} placeholder="Product or occasion" /></label><label>Display order<input name="sort_order" type="number" min="0" defaultValue={editingTestimonial?.sort_order ?? testimonials.length + 1} /></label><label className="checkbox-line"><input name="is_published" type="checkbox" defaultChecked={editingTestimonial?.is_published ?? false} /> Published</label><div className="admin-inline-actions"><button className="forest-button" type="submit">Save testimonial</button>{editingTestimonial ? <button className="text-button" type="button" onClick={() => setEditingTestimonial(null)}>Cancel</button> : null}</div><div className="compact-list">{testimonials.map((item) => <p key={item.id}><span><strong>{item.customer_name || "Unattributed"}</strong><span>{item.quote}</span></span><span><button className="text-button" type="button" onClick={() => setEditingTestimonial(item)}>Edit</button><button className="text-button destructive" type="button" onClick={() => void deleteRecord("testimonials", item.id, "testimonial")}>Delete</button></span></p>)}</div></form><form className="admin-card" onSubmit={saveSettings}><div className="admin-card-title"><Send size={19} /><h2>Public contact settings</h2></div><label>WhatsApp number<input name="whatsapp_number" defaultValue={settings.whatsapp_number} placeholder="234…" /></label><label>Business email<input name="business_email" type="email" defaultValue={settings.business_email} placeholder="hello@example.com" /></label><button className="forest-button" type="submit">Save settings</button></form></section> : null}
    {tab === "team" ? <section className="admin-grid"><form className="admin-card" onSubmit={grantAdmin}><div className="admin-card-title"><Users size={19} /><h2>Grant admin access</h2></div><p className="muted-copy">The recipient must first create a Supabase Auth account with this email.</p><label>Email<input name="email" type="email" required /></label><label>Role<select name="role"><option value="admin">Admin</option><option value="editor">Editor</option></select></label><button className="forest-button" type="submit">Grant access</button></form><div className="admin-card"><div className="admin-card-title"><ShieldCheck size={19} /><h2>Authorized users</h2></div><div className="admin-list">{admins.map((item) => <article key={item.user_id}><div><strong>{item.role}</strong><span>{item.user_id}</span></div><span>{item.is_active ? "Active" : "Inactive"}</span></article>)}</div></div></section> : null}
  </section></main>;
}

function AdminAuth({ email, password, setEmail, setPassword, onSubmit, onSignUp, notice }: { email: string; password: string; setEmail: (value: string) => void; setPassword: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onSignUp: () => void; notice: string }) {
  return <main className="admin-auth"><form className="admin-auth-card" onSubmit={onSubmit}><ShieldCheck size={30} /><p className="eyebrow">Protected workspace</p><h1>Aboyejo admin</h1><p>Sign in with your Supabase administrator account to manage products, orders, content, and image uploads.</p><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></label><button className="forest-button" type="submit">Sign in</button><button className="outline-button" type="button" onClick={onSignUp}>Create first account</button><Link className="text-arrow dark-arrow" href="/">Return to site</Link>{notice ? <p className="notice">{notice}</p> : null}</form></main>;
}
