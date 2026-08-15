// Public product-order and phone-verified order-status workflows using Supabase RPCs.
import { ArrowUpRight, CheckCircle2, Search, ShoppingBag } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { createOrder, getOrderStatus, loadProducts, type Product } from "@/lib/commerce";
import { PageHero, PublicShell } from "@/components/PublicShell";

export default function Order() {
  const [location] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<{ status: string; total_amount: number; created_at: string } | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const query = useMemo(() => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search), [location]);
  const initialProduct = query.get("product") || "";
  const initialQuantity = Math.max(1, Math.min(100, Number(query.get("quantity") || 1)));
  const cartMode = query.get("cart") === "1";
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(initialQuantity);
  const selectedProductRecord = useMemo(() => products.find((product) => product.id === selectedProduct) ?? null, [products, selectedProduct]);
  const { items: cartItems, clearCart } = useCart();

  useEffect(() => {
    let active = true;
    loadProducts().then((items) => { if (active) setProducts(items); }).catch(() => { if (active) setFeedback("Products are unavailable right now. Please try again shortly."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!products.length) return;
    setSelectedProduct(products.some((product) => product.id === initialProduct) ? initialProduct : products[0].id);
  }, [initialProduct, products]);

  useEffect(() => { setQuantity(initialQuantity); }, [initialQuantity]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const values = new FormData(event.currentTarget);
    const orderItems = cartMode && cartItems.length
      ? cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity }))
      : [{ product_id: selectedProduct, quantity }];
    try {
      const created = await createOrder({ customerName: String(values.get("name") || ""), phone: String(values.get("phone") || ""), email: String(values.get("email") || ""), address: String(values.get("address") || ""), notes: String(values.get("notes") || ""), items: orderItems });
      setOrderId(created);
      setFeedback("Your order request has been recorded. Keep the reference below to check its progress.");
      if (cartMode && cartItems.length) clearCart();
      event.currentTarget.reset();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "We could not record your order. Please check the details and try again.");
    }
  }

  async function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const values = new FormData(event.currentTarget);
    try {
      const found = await getOrderStatus(String(values.get("order_id") || ""), String(values.get("phone") || ""));
      setStatus(found[0] || null);
      if (!found[0]) setFeedback("No order matched that reference and phone number.");
    } catch {
      setFeedback("The order status could not be checked right now.");
    }
  }

  return <PublicShell><PageHero eyebrow="Order with care" title={<>A clear next<br /><i>step.</i></>}>Place a product request online, then keep the reference for a phone-verified status check. For custom occasions, the team can also help through the enquiry page.</PageHero>
    <section className="order-grid paper-section"><form className="form-card" onSubmit={placeOrder}><div className="form-title"><ShoppingBag size={20} /><div><p className="eyebrow">Product order</p><h2>Place a request</h2></div></div>
      {cartMode && cartItems.length ? <div className="commerce-order-summary" aria-live="polite"><p className="eyebrow">Your bag</p><h3>{cartItems.length} selected pack{cartItems.length === 1 ? "" : "s"}</h3><ul>{cartItems.map((item) => <li key={item.id}><span>{item.name} · {item.size} × {item.quantity}</span><strong>{item.sale_price ?? item.price ? `₦${Number(item.sale_price ?? item.price).toLocaleString()}` : "On request"}</strong></li>)}</ul><Link href="/products">Add another pack <ArrowUpRight size={14} /></Link></div> : null}
      {!cartMode && selectedProductRecord ? <div className="selected-product-context" aria-live="polite"><span>Selected pack</span><strong>{selectedProductRecord.name} — {selectedProductRecord.size}</strong><Link href={`/products/${selectedProductRecord.slug}`}>View details <ArrowUpRight size={14} /></Link></div> : null}
      {!cartMode ? <><label>Product<select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} required disabled={loading || products.length === 0}><option value="">{loading ? "Loading products…" : "Select a product"}</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {product.size}</option>)}</select></label><div className="form-split"><label>Quantity<input name="quantity" type="number" min="1" max="100" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(100, Number(event.target.value) || 1)))} required /></label><label>Delivery area <span>(optional)</span><input name="address" placeholder="City or address" /></label></div></> : <label>Delivery area <span>(optional)</span><input name="address" placeholder="City or address" /></label>}
      <div className="form-split"><label>Your name<input name="name" required placeholder="Full name" /></label><label>Phone number<input name="phone" required placeholder="e.g. +234…" /></label></div><label>Email <span>(optional)</span><input name="email" type="email" placeholder="you@example.com" /></label><label>Notes <span>(optional)</span><textarea name="notes" rows={4} placeholder="Share delivery, packaging, or timing details." /></label><button className="forest-button" type="submit" disabled={(!cartMode && !selectedProduct) || (cartMode && cartItems.length === 0) || loading}>Submit order request</button>{cartMode && cartItems.length === 0 ? <p className="notice">Your bag is empty. Add a pack before placing an order request.</p> : null}{orderId ? <p className="success-note"><CheckCircle2 size={17} /> Reference: <strong>{orderId}</strong></p> : null}</form>
      <form className="form-card order-status-card" onSubmit={trackOrder}><div className="form-title"><Search size={20} /><div><p className="eyebrow">Order status</p><h2>Check your order</h2></div></div><p>For privacy, enter both the reference from your confirmation and the phone number used at checkout.</p><label>Order reference<input name="order_id" required placeholder="UUID order reference" /></label><label>Phone number<input name="phone" required placeholder="The number used when ordering" /></label><button className="outline-button" type="submit">Check status</button>{status ? <div className="status-result"><span>Status</span><strong>{status.status.replaceAll("_", " ")}</strong><span>Total</span><strong>₦{Number(status.total_amount).toLocaleString()}</strong></div> : null}<Link className="text-arrow dark-arrow" href="/contact">Need custom packaging instead?</Link></form>
      {feedback ? <p className="notice">{feedback}</p> : null}
    </section>
  </PublicShell>;
}
