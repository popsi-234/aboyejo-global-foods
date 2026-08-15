// Shared public shell aligned with the premium product-led storefront while preserving route behavior.
import { ArrowUpRight, MessageCircle, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { brandMark } from "@/lib/commerce";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell premium-inner-shell">
      <header className="premium-inner-nav">
        <Link className="premium-inner-brand" href="/" aria-label="Aboyejo Global Foods home">
          <img src={brandMark} alt="Aboyejo Global Foods mark" />
          <span><b>ABOYEJO</b><small>GLOBAL FOODS</small></span>
        </Link>
        <nav className="premium-inner-links" aria-label="Storefront navigation">
          <Link href="/products">Products</Link>
          <Link href="/souvenirs">Souvenirs</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <Link className="premium-inner-cta" href="/order"><ShoppingBag size={15} /> Shop Garri</Link>
      </header>
      <main className="inner-page-main">{children}</main>
      <footer className="premium-inner-footer">
        <div className="premium-inner-footer-top"><div><span>ABOYEJO GLOBAL FOODS</span><h2>Made for the pantry.<br /><i>Remembered at the table.</i></h2></div><Link className="premium-inner-enquiry" href="/contact">Start an enquiry <ArrowUpRight size={16} /></Link></div>
        <div className="premium-inner-footer-bottom"><span>© 2026 Aboyejo Global Foods</span><span>Premium Garri Ijebu and occasion packaging</span><Link href="/admin"><MessageCircle size={13} /> Admin access</Link></div>
      </footer>
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children: ReactNode }) {
  return <section className="inner-hero forest-section"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><div className="inner-hero-copy">{children}</div></section>;
}
