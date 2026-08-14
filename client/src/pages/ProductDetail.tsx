// Product detail route: public presentation only, backed by canonical products.image_url data.
import { ArrowLeft, ArrowUpRight, CheckCircle2, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { loadProductBySlug, type Product } from "@/lib/commerce";
import { PageHero, PublicShell } from "@/components/PublicShell";

const defaultTitle = "Aboyejo Global Foods | Premium Garri Ijebu & Custom Souvenir Packaging";

function displayPrice(product: Product) {
  const value = product.sale_price ?? product.price;
  return Number(value) > 0 ? `₦${Number(value).toLocaleString()}` : "Price on request";
}

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const slug = params?.slug ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loadProductBySlug(slug)
      .then((item) => {
        if (!active) return;
        setProduct(item);
        if (!item) setError("This product is not available right now.");
      })
      .catch(() => { if (active) setError("The product details could not be loaded just now."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousTitle = document.title;
    const previousDescription = description?.content;
    document.title = `${product.name} | Aboyejo Global Foods`;
    if (description) description.content = `${product.name} (${product.size}) by Aboyejo Global Foods. ${product.description}`;
    return () => {
      document.title = previousTitle || defaultTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, [product]);

  const hasVerifiedPackageFacts = product?.slug.startsWith("garri-ijebu-") ?? false;
  const heroTitle = product ? <>{product.name}<br /><i>{product.size}</i></> : <>A closer<br /><i>look.</i></>;
  const heroCopy = product?.description ?? "See the pack, its current availability, and the clearest next step for ordering.";

  return <PublicShell><PageHero eyebrow="Selected pantry pack" title={heroTitle}>{heroCopy}</PageHero>
    <section className="product-detail-section paper-section">
      {loading ? <div className="empty-state" aria-live="polite"><PackageCheck size={34} /><h2>Opening the product details.</h2><p>Please wait while the selected pack is prepared.</p></div> : null}
      {!loading && error ? <div className="empty-state"><PackageCheck size={34} /><h2>Product details are unavailable.</h2><p>{error}</p><Link className="forest-button" href="/products">Back to products <ArrowLeft size={16} /></Link></div> : null}
      {!loading && product ? <div className="product-detail-grid">
        <div className="product-detail-media">{product.image_url ? <img src={product.image_url} alt={`${product.name} ${product.size} package`} /> : <span>{product.size}</span>}</div>
        <article className="product-detail-copy">
          <p className="eyebrow">{product.stock_status.replaceAll("_", " ")}</p>
          <h2>{product.name}</h2>
          <p className="product-detail-description">{product.description}</p>
          <dl className="product-fact-grid" aria-label="Product at a glance">
            <div><dt>Product at a glance</dt><dd>{product.size} pack</dd></div>
            <div><dt>Availability</dt><dd>{product.stock_status.replaceAll("_", " ")}</dd></div>
            <div><dt>Current price</dt><dd>{displayPrice(product)}</dd></div>
          </dl>
          {hasVerifiedPackageFacts ? <div className="package-facts"><p className="eyebrow">Shown on this package</p><ul><li><CheckCircle2 size={16} /> 100% natural</li><li><CheckCircle2 size={16} /> Hygienically packaged</li><li><CheckCircle2 size={16} /> Premium quality</li></ul></div> : null}
          <div className="product-detail-actions"><Link className="forest-button" href={`/order?product=${product.id}`}>Order this pack <ArrowUpRight size={16} /></Link><Link className="outline-button" href="/products">All products</Link></div>
        </article>
      </div> : null}
    </section>
  </PublicShell>;
}
