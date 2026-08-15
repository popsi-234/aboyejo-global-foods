// Live product catalogue backed by the canonical products.image_url field.
import { ArrowUpRight, PackageOpen, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { formatProductPrice, loadProducts, type Product } from "@/lib/commerce";
import { PageHero, PublicShell } from "@/components/PublicShell";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    let active = true;
    loadProducts().then((items) => { if (active) setProducts(items); }).catch(() => { if (active) setError("The collection could not be loaded just now."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousTitle = document.title;
    const previousDescription = description?.content;
    document.title = "Products | Aboyejo Global Foods";
    if (description) description.content = "Browse currently available Aboyejo Global Foods Garri Ijebu packs and order with the product selection retained.";
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return <PublicShell><PageHero eyebrow="The collection" title={<>The grain,<br /><i>your way.</i></>}>Choose the format that suits your shelf, your people, or your next gathering. Availability, price, and stock status are kept current by the Aboyejo team.</PageHero>
    <section className="catalogue-section paper-section">
      {error ? <p className="notice error">{error}</p> : null}
      {loading ? <div className="empty-state" aria-live="polite"><PackageOpen size={34} /><h2>Preparing the collection.</h2><p>The available packs are being loaded now.</p></div> : null}
      {products.length === 0 && !error && !loading ? <div className="empty-state"><PackageOpen size={34} /><h2>The collection is being prepared.</h2><p>Product availability will appear here as soon as the Aboyejo team publishes it.</p><Link className="forest-button" href="/contact">Ask about availability <ArrowUpRight size={16} /></Link></div> : null}
      {!loading && products.length > 0 ? <div className="catalogue-grid">{products.map((product) => <article className="catalogue-card" key={product.id}>
        <div className="catalogue-image">{product.image_url ? <img src={product.image_url} alt={`${product.name} ${product.size} package`} loading="lazy" decoding="async" /> : <span>{product.size}</span>}</div>
        <div className="catalogue-card-copy"><p className="eyebrow">{product.stock_status.replaceAll("_", " ")}</p><h2>{product.name}</h2><p>{product.description}</p><div className="catalogue-meta"><span>{product.size}</span><div className="commerce-price-stack"><strong>{formatProductPrice(product)}</strong>{product.sale_price && product.price > product.sale_price ? <del>₦{Number(product.price).toLocaleString()}</del> : null}</div></div><span className="commerce-stock">{product.stock_status.replaceAll("_", " ")}</span><div className="catalogue-actions"><Link href={`/products/${product.slug}`}>View details <ArrowUpRight size={15} /></Link><button type="button" onClick={() => { addItem(product); openCart(); }}><ShoppingBag size={14} /> Add to cart</button></div></div>
      </article>)}</div> : null}
    </section>
  </PublicShell>;
}
