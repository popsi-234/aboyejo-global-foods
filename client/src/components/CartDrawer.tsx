import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { createWhatsAppOrderUrl, formatProductPrice, loadPublicSetting } from "@/lib/commerce";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CartButton({ className = "", label = "Cart" }: { className?: string; label?: string }) {
  const { cartCount, openCart } = useCart();
  return <button type="button" className={`commerce-cart-button ${className}`.trim()} onClick={openCart} aria-label={`${label}, ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
    <ShoppingBag size={16} /><span>{label}</span><b>{cartCount}</b>
  </button>;
}

export function CartDrawer() {
  const { items, cartTotal, isCartOpen, closeCart, updateQuantity, removeItem, clearCart } = useCart();
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  useEffect(() => {
    loadPublicSetting("whatsapp_number").then(setWhatsAppNumber).catch(() => undefined);
  }, []);

  const hasPricedItems = items.some((item) => (item.sale_price ?? item.price) > 0);
  const whatsappHref = createWhatsAppOrderUrl(whatsAppNumber, items);

  return <Sheet open={isCartOpen} onOpenChange={(open) => open ? undefined : closeCart()}>
    <SheetContent className="commerce-cart-sheet" side="right">
      <SheetHeader className="commerce-cart-header">
        <p className="premium-overline">YOUR SELECTION</p>
        <SheetTitle>Shopping bag</SheetTitle>
        <SheetDescription>Review pack sizes and quantities before sending your request.</SheetDescription>
      </SheetHeader>
      <div className="commerce-cart-body">
        {!items.length ? <div className="commerce-cart-empty"><ShoppingBag size={28} /><h3>Your bag is ready when you are.</h3><p>Add a Garri Ijebu pack to begin a product request.</p><Link href="/products" onClick={closeCart}>Browse packs</Link></div> : items.map((item) => <article className="commerce-cart-line" key={item.id}>
          <div className="commerce-cart-image">{item.image_url ? <img src={item.image_url} alt={`${item.name} ${item.size} package`} /> : <span>{item.size}</span>}</div>
          <div className="commerce-cart-line-copy"><div><p>{item.size}</p><h3>{item.name}</h3><strong>{formatProductPrice(item)}</strong></div><div className="commerce-cart-line-actions"><div className="commerce-quantity-control" aria-label={`Quantity for ${item.name}`}><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Reduce ${item.name} quantity`}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={13} /></button></div><button className="commerce-remove-button" type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={15} /></button></div></div>
        </article>)}
      </div>
      {items.length ? <SheetFooter className="commerce-cart-footer"><div className="commerce-cart-total"><span>{hasPricedItems ? "Current total" : "Pricing"}</span><strong>{hasPricedItems ? `₦${cartTotal.toLocaleString()}` : "On request"}</strong></div><Link className="commerce-checkout-button" href="/order?cart=1" onClick={closeCart}>Continue to order</Link>{whatsappHref ? <a className="commerce-whatsapp-link" href={whatsappHref} target="_blank" rel="noreferrer">Send this cart on WhatsApp</a> : null}<button className="commerce-clear-button" type="button" onClick={clearCart}>Clear bag</button></SheetFooter> : null}
    </SheetContent>
  </Sheet>;
}
