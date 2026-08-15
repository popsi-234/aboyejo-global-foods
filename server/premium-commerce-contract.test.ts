import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, projectRoot), "utf8");

describe("premium commerce contract", () => {
  it("keeps cart data client-side and retains the canonical image_url product contract", () => {
    const cartContext = readProjectFile("client/src/contexts/CartContext.tsx");
    const cartDrawer = readProjectFile("client/src/components/CartDrawer.tsx");

    expect(cartContext).toContain('const CART_STORAGE_KEY = "aboyejo-global-foods-cart-v1"');
    expect(cartContext).toContain('Pick<Product, "id" | "slug" | "name" | "size" | "image_url"');
    expect(cartContext).toContain("const addItem = useCallback((product: CartProduct, quantity = 1)");
    expect(cartContext).toContain("window.localStorage.setItem");
    expect(cartDrawer).toContain("createWhatsAppOrderUrl");
    expect(cartDrawer).toContain('href="/order?cart=1"');
  });

  it("keeps exact quantities, live prices, and the existing order service in the public purchase journey", () => {
    const productDetail = readProjectFile("client/src/pages/ProductDetail.tsx");
    const products = readProjectFile("client/src/pages/Products.tsx");
    const order = readProjectFile("client/src/pages/Order.tsx");
    const commerce = readProjectFile("client/src/lib/commerce.ts");

    expect(productDetail).toContain("setQuantity((current) => Math.max(1, current - 1))");
    expect(productDetail).toContain("addItem(product, quantity)");
    expect(productDetail).toContain("createWhatsAppOrderUrl");
    expect(products).toContain("formatProductPrice(product)");
    expect(products).toContain("addItem(product); openCart();");
    expect(order).toContain("const cartMode = query.get(\"cart\") === \"1\"");
    expect(order).toContain("cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity }))");
    expect(order).toContain("createOrder({");
    expect(commerce).toContain("export function formatProductPrice");
    expect(commerce).toContain("• ${item.name} (${item.size}) × ${item.quantity}");
  });
});
