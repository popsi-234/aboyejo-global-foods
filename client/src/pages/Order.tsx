// Public product-order and phone-verified order-status workflows using Supabase RPCs.
import { CheckCircle2, Search, ShoppingBag } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { createOrder, getOrderStatus, loadProducts, type Product } from "@/lib/commerce";
import { PageHero, PublicShell } from "@/components/PublicShell";

export default function Order() {
  const [location] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<{ status: string; total_amount: number; created_at: string } | null>(null);
  const [feedback, setFeedback] = useState("");
  const initialProduct = useMemo(() => new URLSearchParams(location.split("?")[1] || "").get("product") || "", [location]);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);

  useEffect(() => { loadProducts().then((items) => { setProducts(items); if (!selectedProduct && items[0]) setSelectedProduct(items[0].id); }).catch(() => setFeedback("Products are unavailable right now. Please try again shortly.")); }, [selectedProduct]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFeedback("");
    const values = new FormData(event.currentTarget); const quantity = Number(values.get("quantity") || 1);
    try {
      const created = await createOrder({ customerName: String(values.get("name") || ""), phone: String(values.get("phone") || ""), email: String(values.get("email") || ""), address: String(values.get("address") || ""), notes: String(values.get("notes") || ""), items: [{ product_id: selectedProduct, quantity }] });
      setOrderId(created); setFeedback("Your order request has been recorded. Keep the reference below to check its progress."); event.currentTarget.reset();
    } catch (error) { setFeedback(error instanceof Error ? error.message : "We could not record your order. Please check the details and try again."); }
  }
  async function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFeedback(""); const values = new FormData(event.currentTarget);
    try { const found = await getOrderStatus(String(values.get("order_id") || ""), String(values.get("phone") || "")); setStatus(found[0] || null); if (!found[0]) setFeedback("No order matched that reference and phone number."); } catch { setFeedback("The order status could not be checked right now."); }
  }

  return <PublicShell><PageHero eyebrow="Order with care" title={<>A clear next<br /><i>step.</i></>}>Place a product request online, then keep the reference for a phone-verified status check. For custom occasions, the team can also help through the enquiry page.</PageHero>
    <section className="order-grid paper-section"><form className="form-card" onSubmit={placeOrder}><div className="form-title"><ShoppingBag size={20} /><div><p className="eyebrow">Product order</p><h2>Place a request</h2></div></div>
      <label>Product<select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} required><option value="">Select a product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {product.size}</option>)}</select></label>
      <div className="form-split"><label>Your name<input name="name" required placeholder="Full name" /></label><label>Phone number<input name="phone" required placeholder="e.g. +234…" /></label></div><label>Email <span>(optional)</span><input name="email" type="email" placeholder="you@example.com" /></label><div className="form-split"><label>Quantity<input name="quantity" type="number" min="1" max="100" defaultValue="1" required /></label><label>Delivery area <span>(optional)</span><input name="address" placeholder="City or address" /></label></div><label>Notes <span>(optional)</span><textarea name="notes" rows={4} placeholder="Share delivery, packaging, or timing details." /></label><button className="forest-button" type="submit" disabled={!selectedProduct}>Submit order request</button>{orderId ? <p className="success-note"><CheckCircle2 size={17} /> Reference: <strong>{orderId}</strong></p> : null}</form>
      <form className="form-card order-status-card" onSubmit={trackOrder}><div className="form-title"><Search size={20} /><div><p className="eyebrow">Order status</p><h2>Check your order</h2></div></div><p>For privacy, enter both the reference from your confirmation and the phone number used at checkout.</p><label>Order reference<input name="order_id" required placeholder="UUID order reference" /></label><label>Phone number<input name="phone" required placeholder="The number used when ordering" /></label><button className="outline-button" type="submit">Check status</button>{status ? <div className="status-result"><span>Status</span><strong>{status.status.replaceAll("_", " ")}</strong><span>Total</span><strong>₦{Number(status.total_amount).toLocaleString()}</strong></div> : null}<Link className="text-arrow dark-arrow" href="/contact">Need custom packaging instead?</Link></form>
      {feedback ? <p className="notice">{feedback}</p> : null}
    </section>
  </PublicShell>;
}
