// Shared storefront shell extending the existing Quiet Harvest editorial visual language.
import { ArrowUpRight, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { brandMark } from "@/lib/commerce";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell inner-page-shell">
      <header className="site-nav inner-nav">
        <Link className="brand-lockup" href="/" aria-label="Aboyejo Global Foods home">
          <img src={brandMark} alt="Aboyejo grain mark" className="brand-mark" />
          <span className="brand-wordmark">Aboyejo <em>Global Foods</em></span>
        </Link>
        <nav className="desktop-nav" aria-label="Storefront navigation">
          <Link href="/products">Products</Link>
          <Link href="/souvenirs">Souvenirs</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <Link className="nav-cta" href="/contact"><MessageCircle size={15} /> Enquire</Link>
      </header>
      <main className="inner-page-main">{children}</main>
      <footer className="site-footer inner-footer">
        <div className="footer-top"><div><span className="eyebrow">Aboyejo Global Foods</span><h2>Made for the pantry.<br /><i>Remembered at the table.</i></h2></div><Link className="text-arrow" href="/contact">Start an enquiry <ArrowUpRight size={16} /></Link></div>
        <div className="footer-bottom"><span>© 2026 Aboyejo Global Foods</span><span>Premium Garri Ijebu and occasion packaging</span><Link href="/admin">Admin access</Link></div>
      </footer>
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children: ReactNode }) {
  return <section className="inner-hero forest-section"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><div className="inner-hero-copy">{children}</div></section>;
}
