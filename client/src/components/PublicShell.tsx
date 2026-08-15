// Shared public shell aligned with the premium product-led storefront while preserving route behavior.
import { ArrowUpRight, Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { CartButton } from "@/components/CartDrawer";
import { brandMark } from "@/lib/commerce";

export function PublicShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="site-shell premium-inner-shell">
      <header className="premium-inner-nav">
        <Link className="premium-inner-brand" href="/" aria-label="Aboyejo Global Foods home" onClick={closeMenu}>
          <img src={brandMark} alt="Aboyejo Global Foods mark" />
          <span><b>ABOYEJO</b><small>GLOBAL FOODS</small></span>
        </Link>
        <nav className={`premium-inner-links${menuOpen ? " is-open" : ""}`} aria-label="Storefront navigation">
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/products" onClick={closeMenu}>Products</Link>
          <Link href="/about" onClick={closeMenu}>About</Link>
          <Link href="/souvenirs" onClick={closeMenu}>Souvenirs</Link>
          <Link href="/faq" onClick={closeMenu}>FAQ</Link>
          <Link href="/contact" onClick={closeMenu}>Contact</Link>
        </nav>
        <div className="premium-inner-actions"><CartButton label="Cart" /><Link className="premium-inner-cta" href="/order"><ShoppingBag size={15} /> Shop Garri</Link><button className="premium-inner-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>
      <main className="inner-page-main">{children}</main>
      <footer className="premium-inner-footer">
        <div className="premium-inner-footer-top"><div><span>ABOYEJO GLOBAL FOODS</span><h2>Made for the pantry.<br /><i>Remembered at the table.</i></h2></div><Link className="premium-inner-enquiry" href="/contact">Start an enquiry <ArrowUpRight size={16} /></Link></div>
        <div className="premium-inner-footer-bottom"><span>© 2026 Aboyejo Global Foods</span><span>Premium Garri Ijebu and occasion packaging</span><Link href="/admin/login"><MessageCircle size={13} /> Admin</Link></div>
      </footer>
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children: ReactNode }) {
  return <section className="inner-hero forest-section"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><div className="inner-hero-copy">{children}</div></section>;
}
