import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronRight,
  Leaf,
  Menu,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { CartButton } from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { formatProductPrice, loadProducts, loadPublicSetting } from "@/lib/commerce";
import "./home-mobile-hero.css";
import "./home-brief-refresh.css";

const visualAssets = {
  heroScene: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663524335109/XkKcjxdJwmQluifX.jpg",
  grain: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663524335109/lCSFsofiQyeWvPkq.jpg",
  mark: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663524335109/XHgAIZOHpmbJXiuW.png",
  occasion: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663524335109/UDnpQSJGKKtNpDil.jpg",
  wedding: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663524335109/VwRFcONlnduPfUOp.jpg",
};

type HomeProduct = {
  id: string;
  slug: string;
  imageUrl: string | null;
  name: string;
  size: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_status: string;
};

const collectionOrder = ["garri-ijebu-3kg", "garri-ijebu-2kg", "garri-ijebu-1kg"] as const;

function sizeLabel(product: HomeProduct) {
  return product.size || product.name.replace("Garri Ijebu", "").trim() || "Pack";
}

export default function Home() {
  const [, goTo] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    loadPublicSetting("whatsapp_number").then(setWhatsAppNumber).catch(() => undefined);
    loadProducts()
      .then((items) => {
        const collection = items
          .filter((product) => product.is_active && collectionOrder.includes(product.slug as typeof collectionOrder[number]))
          .sort((a, b) => collectionOrder.indexOf(a.slug as typeof collectionOrder[number]) - collectionOrder.indexOf(b.slug as typeof collectionOrder[number]))
          .map((product) => ({
            id: product.id,
            slug: product.slug,
            imageUrl: product.image_url,
            name: product.name,
            size: product.size,
            description: product.description,
            price: product.price,
            sale_price: product.sale_price,
            stock_status: product.stock_status,
          }));
        setProducts(collection);
      })
      .catch(() => setProducts([]))
      .finally(() => setCollectionLoading(false));
  }, []);

  const heroProduct = useMemo(() => products.find((product) => product.slug === "garri-ijebu-3kg") || products[0], [products]);
  const openWhatsApp = () => {
    const digits = whatsAppNumber.replace(/\D/g, "");
    if (digits) {
      window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
    } else {
      goTo("contact");
    }
  };
  const closeMenu = () => setMenuOpen(false);
  const addPackToCart = (product: HomeProduct) => {
    addItem({ id: product.id, slug: product.slug, name: product.name, size: product.size || "Pack", image_url: product.imageUrl, price: product.price, sale_price: product.sale_price, stock_status: product.stock_status });
    openCart();
  };

  useEffect(() => {
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousTitle = document.title;
    const previousDescription = description?.content;
    document.title = "Aboyejo Global Foods | Premium Garri Ijebu";
    if (description) description.content = "Shop official Aboyejo Global Foods Garri Ijebu packs for the pantry, table, and meaningful occasions.";
    return () => { document.title = previousTitle; if (description && previousDescription) description.content = previousDescription; };
  }, []);

  return (
    <div className="site-shell premium-home">
      <header className="premium-nav">
        <a className="premium-brand" href="#top" aria-label="Aboyejo Global Foods home">
          <img src={visualAssets.mark} alt="Aboyejo Global Foods" />
          <span><b>ABOYEJO</b><small>GLOBAL FOODS</small></span>
        </a>
        <nav className={menuOpen ? "premium-nav-links is-open" : "premium-nav-links"} aria-label="Primary navigation">
          <a href="#top" onClick={closeMenu}>Home</a>
          <a href="/products" onClick={closeMenu}>Products</a>
          <a href="/souvenirs" onClick={closeMenu}>Souvenirs</a>
          <a href="/about" onClick={closeMenu}>About</a>
          <a href="/gallery" onClick={closeMenu}>Gallery</a>
          <a href="/faq" onClick={closeMenu}>FAQ</a>
          <a href="/contact" onClick={closeMenu}>Contact</a>
        </nav>
        <div className="premium-nav-actions">
          <button className="premium-whatsapp small" onClick={openWhatsApp}><MessageCircle size={15} /> Order on WhatsApp</button><CartButton label="Cart" />
          <button className="premium-menu" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="premium-hero">
          <div className="premium-hero-scene" style={{ backgroundImage: `url(${visualAssets.heroScene})` }} />
          <div className="premium-hero-shade" />
          <div className="premium-hero-content brief-hero-content">
            <div className="premium-eyebrow"><span /> PREMIUM GARRI IJEBU</div>
            <h1>Pure Taste.<br /><em>Made the Nigerian Way.</em></h1>
            <p className="premium-hero-copy">Aboyejo Global Foods brings premium Garri Ijebu to homes, events, and gifting—hygienically packaged with care for every table.</p>
            <div className="premium-hero-actions">
              <a className="premium-primary-button" href="#collection"><ShoppingBag size={16} /> Shop Garri</a>
              <button className="premium-secondary-button" onClick={openWhatsApp}><MessageCircle size={16} /> Order on WhatsApp</button>
            </div>
            <div className="premium-trust-row" aria-label="Product features">
              <span><Leaf size={17} /> 100% Natural</span>
              <span><ShieldCheck size={17} /> Hygienically Packaged</span>
              <span><Sparkles size={17} /> Premium Quality</span>
              <span><Users size={17} /> Family-owned</span>
            </div>
          </div>
          <div className="premium-product-stage brief-product-stage" aria-label="Featured Garri Ijebu package">
            <div className="premium-stage-halo" />
            <div className="premium-stage-kicker">SIGNATURE PANTRY PACK</div>
            {heroProduct?.imageUrl ? (
              <img className="premium-stage-product" src={heroProduct.imageUrl} alt={`${heroProduct.name} official package`} />
            ) : (
              <img className="premium-stage-product premium-stage-fallback" src={visualAssets.heroScene} alt="Garri Ijebu" />
            )}
            <div className="premium-stage-size">{heroProduct ? sizeLabel(heroProduct) : "3 kg"}</div>
            <p className="brief-stage-caption">Officially branded<br />3 kg package</p>
          </div>
        </section>

        <section className="premium-collection" id="collection">
          <div className="premium-section-heading">
            <div><p className="premium-overline">CHOOSE YOUR PACK</p><h2>The right pack for<br /><i>every table.</i></h2></div>
            <p>Choose the official pack that fits your pantry, family table, event, or gifting plan. Availability and prices are supplied from the live catalogue.</p>
          </div>
          <div className="premium-pack-grid">
            {collectionLoading && <div className="premium-collection-status" role="status">Loading the current Garri Ijebu packs…</div>}
            {!collectionLoading && products.length === 0 && <div className="premium-collection-status"><p>The current packs are available in the live catalogue.</p><a href="/products">View products <ChevronRight size={16} /></a></div>}
            {products.map((product) => (
              <article className="premium-pack-card" key={product.id}>
                <span className="premium-size-chip">{sizeLabel(product)}</span>
                <a href={`/products/${product.slug}`} className="premium-pack-image" aria-label={`View ${product.name}`}>
                  {product.imageUrl && <img src={product.imageUrl} alt={`${product.name} package`} />}
                </a>
                <div className="premium-pack-body">
                  <h3>{sizeLabel(product)} Pack</h3>
                  <p>{product.description || "Premium Garri Ijebu in official branded packaging."}</p>
                  <div className="commerce-price-stack"><strong className="premium-price-note">{formatProductPrice(product)}</strong>{product.sale_price && product.price > product.sale_price ? <del>₦{Number(product.price).toLocaleString()}</del> : null}</div>
                  <span className="commerce-stock">{product.stock_status.replaceAll("_", " ")}</span>
                  <div className="commerce-card-actions"><button type="button" onClick={() => addPackToCart(product)}>Add to cart</button><a className="premium-card-order" href={`/order?product=${product.id}`}>Order pack</a></div>
                </div>
              </article>
            ))}
          </div>
          <a className="premium-catalogue-link" href="/products">View the full collection <ArrowUpRight size={16} /></a>
        </section>

        <section className="premium-story" id="story">
          <div className="premium-story-image"><img src={visualAssets.grain} alt="Garri grains in a wooden scoop" /><span>ABOYEJO / EST. 2020</span></div>
          <div className="premium-story-copy">
            <p className="premium-overline">OUR STORY</p>
            <h2>A family tradition<br />built on <i>care.</i></h2>
            <p>Aboyejo Global Foods is a family-owned Nigerian food business built around a simple belief: familiar food deserves thoughtful care in the grain, the pack, and the way it reaches the table.</p>
            <a className="premium-outline-button" href="/products">Learn about our packs <ArrowUpRight size={16} /></a>
          </div>
        </section>

        <section className="premium-value-band" aria-label="Why choose Aboyejo">
          <div><Leaf size={22} /><strong>Premium Garri Ijebu</strong><span>Presented for your pantry and table.</span></div>
          <div><Package size={22} /><strong>Carefully packaged</strong><span>Official branded zip-lock packs.</span></div>
          <div><Sparkles size={22} /><strong>Custom souvenir packs</strong><span>For special occasions and gifting.</span></div>
          <div><Users size={22} /><strong>Family-owned since 2020</strong><span>A personal approach to a familiar food.</span></div>
        </section>

        <section className="premium-occasion" id="souvenirs">
          <div className="premium-occasion-copy"><p className="premium-overline">SOUVENIR PACKS</p><h2>Make the occasion<br />feel <i>considered.</i></h2><p>For weddings, birthdays, naming ceremonies, church events, corporate events, schools, memorials, and the moments in between.</p><a className="premium-primary-button" href="/souvenirs">Explore souvenirs <ArrowUpRight size={16} /></a></div>
          <div className="premium-occasion-visual"><img className="premium-occasion-main" src={visualAssets.occasion} alt="Souvenir food packaging for a special occasion" /><img className="premium-occasion-inset" src={visualAssets.wedding} alt="Celebration table setting" /><span>MADE FOR MOMENTS<br />THAT MATTER</span></div>
        </section>

        <section className="premium-contact-band">
          <div><p className="premium-overline">READY TO ORDER?</p><h2>Bring a familiar taste<br />to your <i>next table.</i></h2></div>
          <div className="premium-contact-actions"><button className="premium-gold-button" onClick={openWhatsApp}><MessageCircle size={17} /> Order on WhatsApp</button><a href="/contact">Contact Aboyejo <ArrowUpRight size={16} /></a></div>
        </section>
      </main>

      <footer className="premium-footer">
        <div className="premium-footer-brand"><img src={visualAssets.mark} alt="Aboyejo Global Foods" /><p><b>ABOYEJO</b><span>GLOBAL FOODS</span></p><small>Premium Garri Ijebu, carefully presented for the pantry and the table.</small></div>
        <div className="premium-footer-links"><div><strong>Quick links</strong><a href="#top">Home</a><a href="#collection">Products</a><a href="/about">Our story</a><a href="/souvenirs">Souvenirs</a></div><div><strong>Customer care</strong><a href="/contact">Contact us</a><a href="/order">Place an order</a><a href="/faq">FAQ</a><a href="/admin/login">Admin</a></div></div>
        <div className="premium-footer-cta"><strong>Stay connected</strong><p>For updates and product enquiries.</p><button className="premium-whatsapp small" onClick={openWhatsApp}><MessageCircle size={15} /> WhatsApp</button></div>
        <div className="premium-footer-bottom"><span>© 2026 Aboyejo Global Foods. All rights reserved.</span><a href="#top">Back to top <ArrowDown size={14} /></a></div>
      </footer>
    </div>
  );
}
