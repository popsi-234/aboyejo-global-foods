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
import { formatProductPrice, loadGallery, loadProducts, loadPublicSetting, loadSouvenirs, type GalleryItem, type SouvenirPackage } from "@/lib/commerce";
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
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [souvenirPackages, setSouvenirPackages] = useState<SouvenirPackage[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    loadPublicSetting("whatsapp_number").then(setWhatsAppNumber).catch(() => undefined);
    loadGallery().then((items) => setGalleryItems(items.filter((item) => item.is_published).slice(0, 4))).catch(() => setGalleryItems([]));
    loadSouvenirs().then((items) => setSouvenirPackages(items.filter((item) => item.is_active && item.image_url).slice(0, 4))).catch(() => setSouvenirPackages([]));
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
      <header className="premium-nav reference-nav">
        <a className="premium-brand" href="#top" aria-label="Aboyejo Global Foods home">
          <img src={visualAssets.mark} alt="Aboyejo Global Foods" />
          <span><b>ABOYEJO</b><small>GLOBAL FOODS</small></span>
        </a>
        <nav className={menuOpen ? "premium-nav-links is-open" : "premium-nav-links"} aria-label="Primary navigation">
          <a className="is-active" href="#top" onClick={closeMenu}>Home</a>
          <a href="/products" onClick={closeMenu}>Products</a>
          <a href="/about" onClick={closeMenu}>About</a>
          <a href="/souvenirs" onClick={closeMenu}>Souvenirs</a>
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
        <section className="premium-hero reference-hero">
          <div className="premium-hero-scene" style={{ backgroundImage: `url(${visualAssets.heroScene})` }} />
          <div className="premium-hero-shade" />
          <div className="premium-hero-content brief-hero-content">
            <div className="premium-eyebrow"><span /> PREMIUM GARRI IJEBU</div>
            <h1>Pure Taste.<br /><em>Made the Nigerian Way.</em></h1>
            <p className="premium-hero-copy">Aboyejo Global Foods provides premium Garri Ijebu, carefully processed and hygienically packaged for homes, events and gifting.</p>
            <div className="premium-hero-actions">
              <a className="premium-primary-button" href="#collection"><ShoppingBag size={16} /> Shop Garri</a>
              <button className="premium-secondary-button" onClick={openWhatsApp}><MessageCircle size={16} /> Order on WhatsApp</button>
            </div>
          </div>
          <div className="premium-product-stage brief-product-stage reference-product-stage" aria-label="Featured Garri Ijebu package">
            <div className="premium-stage-halo" />
            <div className="premium-stage-kicker">SIGNATURE PANTRY PACK</div>
            {heroProduct?.imageUrl ? (
              <img className="premium-stage-product" src={heroProduct.imageUrl} alt={`${heroProduct.name} official package`} />
            ) : (
              <img className="premium-stage-product premium-stage-fallback" src={visualAssets.heroScene} alt="Garri Ijebu" />
            )}
            <div className="premium-stage-size">{heroProduct ? sizeLabel(heroProduct) : "3 kg"}</div>
          </div>
        </section>

        <section className="reference-trust-row" aria-label="Product features">
          <div><Leaf size={28} /><span><strong>100% Natural</strong><small>No additives</small></span></div>
          <div><ShieldCheck size={28} /><span><strong>Hygienically Packaged</strong><small>For your safety</small></span></div>
          <div><Sparkles size={28} /><span><strong>Premium Quality</strong><small>Finest Garri Ijebu</small></span></div>
          <div><Users size={28} /><span><strong>Trusted Family Business</strong><small>Quality you can trust</small></span></div>
        </section>

        <section className="premium-collection reference-collection" id="collection">
          <div className="premium-section-heading reference-section-heading">
            <div><p className="premium-overline">CHOOSE YOUR PACK</p><h2>Quality in Every Size.</h2><p>Choose the pack that fits your home, family or occasion.</p></div>
          </div>
          <div className="premium-pack-grid reference-pack-grid">
            {collectionLoading && <div className="premium-collection-status" role="status">Loading the current Garri Ijebu packs…</div>}
            {!collectionLoading && products.length === 0 && <div className="premium-collection-status"><p>The current packs are available in the live catalogue.</p><a href="/products">View products <ChevronRight size={16} /></a></div>}
            {products.map((product) => (
              <article className="premium-pack-card reference-pack-card" key={product.id}>
                <span className="premium-size-chip">{sizeLabel(product)}</span>
                <a href={`/products/${product.slug}`} className="premium-pack-image" aria-label={`View ${product.name}`}>
                  {product.imageUrl && <img src={product.imageUrl} alt={`${product.name} package`} />}
                </a>
                <div className="premium-pack-body">
                  <h3>{sizeLabel(product)} Pack</h3>
                  <p>{product.description || "Premium Garri Ijebu in official branded packaging."}</p>
                  <div className="commerce-price-stack"><strong className="premium-price-note">{formatProductPrice(product)}</strong>{product.sale_price && product.price > product.sale_price ? <del>₦{Number(product.price).toLocaleString()}</del> : null}</div>
                  <span className="commerce-stock">{product.stock_status.replaceAll("_", " ")}</span>
                  <div className="commerce-card-actions"><button type="button" onClick={() => addPackToCart(product)}><ShoppingBag size={14} /> Add to Cart</button><a className="premium-card-order" href={`/order?product=${product.id}`}><MessageCircle size={14} /> Order on WhatsApp</a></div>
                </div>
              </article>
            ))}
          </div>
          <a className="premium-catalogue-link" href="/products">View the full collection <ArrowUpRight size={16} /></a>
        </section>

        <section className="premium-story reference-story" id="story">
          <div className="premium-story-image"><img src={visualAssets.grain} alt="Garri grains in a wooden scoop" /><span>ABOYEJO / EST. 2020</span></div>
          <div className="premium-story-copy">
            <p className="premium-overline">OUR STORY</p>
            <h2>A Family Tradition Built on<br />Quality &amp; Trust</h2>
            <p>Aboyejo Global Foods is a family-oriented Nigerian food business passionate about delivering quality Garri Ijebu to homes, businesses and events. We take pride in our heritage, our process and the care that goes into every pack.</p>
            <a className="premium-outline-button" href="/about">Learn More <ArrowUpRight size={16} /></a>
          </div>
        </section>

        <section className="reference-souvenirs" id="souvenirs">
          <div className="reference-souvenir-intro"><p className="premium-overline">SOUVENIRS &amp; EVENT PACKAGING</p><h2>Beautifully Packaged for<br />Your Special Occasions</h2><p>Explore available souvenir and event packaging for celebrations and gatherings.</p><a className="reference-green-link" href="/souvenirs"><MessageCircle size={15} /> Plan Your Souvenir Order <ArrowUpRight size={15} /></a></div>
          <div className="reference-souvenir-strip" aria-label="Available souvenir packages">
            {souvenirPackages.length > 0 ? souvenirPackages.map((item) => <a href="/souvenirs" className="reference-souvenir-card" key={item.id}><img src={item.image_url!} alt={item.name} /><span>{item.name}</span></a>) : <><a href="/souvenirs" className="reference-souvenir-card"><img src={visualAssets.occasion} alt="Souvenir packaging" /><span>Special occasions</span></a><a href="/souvenirs" className="reference-souvenir-card"><img src={visualAssets.wedding} alt="Event table setting" /><span>Event packaging</span></a></>}
          </div>
        </section>

        <section className="reference-gallery-band" aria-label="Aboyejo gallery">
          <div className="reference-gallery-intro"><p className="premium-overline">OUR GALLERY</p><h2>See our quality<br />in every pack</h2><a href="/gallery">View Gallery <ArrowUpRight size={14} /></a></div>
          <div className="reference-gallery-strip">
            {(galleryItems.length > 0 ? galleryItems : products.filter((product) => product.imageUrl).map((product) => ({ id: product.id, title: product.name, image_url: product.imageUrl!, category: "products", caption: null, created_at: "", updated_at: "", is_published: true, sort_order: 0 }))).slice(0, 4).map((item) => <a href="/gallery" className="reference-gallery-card" key={item.id}><img src={item.image_url} alt={item.title} /><span>{item.title}</span></a>)}
          </div>
        </section>

        <section className="reference-support" aria-label="Customer support options">
          <a href="/faq"><span className="reference-support-icon">?</span><span><strong>Frequently Asked Questions</strong><small>Get answers to common questions about our products and ordering process.</small><b>View FAQ <ArrowUpRight size={13} /></b></span></a>
          <a href="/contact"><span className="reference-support-icon">⌕</span><span><strong>Get in Touch</strong><small>Have a question or need assistance? We’re here to help.</small><b>Contact Us <ArrowUpRight size={13} /></b></span></a>
          <button type="button" onClick={openWhatsApp}><MessageCircle size={30} /><span><strong>Order on WhatsApp</strong><small>Quick and easy ordering for all our Garri packs.</small><b>Chat Now <ArrowUpRight size={13} /></b></span></button>
        </section>
      </main>

      <footer className="premium-footer reference-footer">
        <div className="premium-footer-brand"><img src={visualAssets.mark} alt="Aboyejo Global Foods" /><p><b>ABOYEJO</b><span>GLOBAL FOODS</span></p><small>Premium Garri Ijebu, carefully presented for the pantry and the table.</small></div>
        <div className="premium-footer-links"><div><strong>Quick links</strong><a href="#top">Home</a><a href="#collection">Products</a><a href="/about">About us</a><a href="/souvenirs">Souvenirs</a></div><div><strong>Customer care</strong><a href="/contact">Contact us</a><a href="/order">Place an order</a><a href="/faq">FAQ</a><a href="/gallery">Gallery</a></div></div>
        <div className="premium-footer-cta"><strong>Stay connected</strong><p>For updates and product enquiries.</p><button className="premium-whatsapp small" onClick={openWhatsApp}><MessageCircle size={15} /> WhatsApp</button><a className="reference-admin-link" href="/admin">Admin Portal</a></div>
        <div className="premium-footer-bottom"><span>© 2026 Aboyejo Global Foods. All rights reserved.</span><a href="#top">Back to top <ArrowDown size={14} /></a></div>
      </footer>
    </div>
  );
}
