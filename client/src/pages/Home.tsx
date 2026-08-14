// Quiet Harvest Editorial: warm paper surfaces, asymmetrical storytelling, restrained gold, and purposeful motion.
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  HeartHandshake,
  Leaf,
  Menu,
  MessageCircle,
  MoveRight,
  Package,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { loadPublicSetting } from "@/lib/commerce";

const storage = {
  hero: "/manus-storage/aboyejo-hero_5ad3dc77.jpg",
  grain: "/manus-storage/aboyejo-grain-detail_7b6e95ae.jpg",
  souvenirScene: "/manus-storage/aboyejo-souvenir-scene_339dd54c.jpg",
  texture: "/manus-storage/aboyejo-material-texture_842df54a.jpg",
  mark: "/manus-storage/aboyejo-mark_e7e0605e.png",
  suppliedSouvenir: "/manus-storage/souvenir-hero_c4f6c008.jpg",
  suppliedWedding: "/manus-storage/souvenir-wedding_5663835d.jpg",
  suppliedCelebration: "/manus-storage/souvenir-celebration_f484916e.jpg",
  suppliedCorporate: "/manus-storage/souvenir-corporate_587df3a4.jpg",
  suppliedDetail: "/manus-storage/souvenir-detail_0781c899.jpg",
};

const productSizes = [
  { size: "1kg", title: "The pantry pack", detail: "A considered starting point for everyday rituals." },
  { size: "2kg", title: "The family table", detail: "A generous format for the people gathered around you." },
  { size: "3kg", title: "The occasion pack", detail: "Made for hosting, gifting, and moments that call for more." },
];

const faqs = [
  { question: "What is Garri Ijebu?", answer: "Garri Ijebu is a finely processed cassava food with a distinctive crisp texture and bright, familiar character. Aboyejo presents it in premium zip-lock packaging." },
  { question: "What sizes are available?", answer: "The current collection is presented in 1kg, 2kg, and 3kg packs. Availability and pricing can be confirmed through the ordering channel." },
  { question: "Can I request custom souvenir packaging?", answer: "Yes. Custom souvenir packaging is available for weddings, birthdays, naming ceremonies, church events, corporate events, schools, memorials, and other special occasions." },
  { question: "How do I place an order?", answer: "Use the order enquiry button to begin a WhatsApp conversation. The final WhatsApp number is intentionally left editable so the business can connect its own live line." },
];

const gallery = [
  { src: storage.suppliedWedding, label: "Wedding moments", className: "gallery-tall" },
  { src: storage.suppliedDetail, label: "A closer look", className: "gallery-wide" },
  { src: storage.grain, label: "The grain", className: "gallery-square" },
  { src: storage.suppliedCelebration, label: "Celebration bundles", className: "gallery-tall" },
  { src: storage.suppliedCorporate, label: "Corporate gifting", className: "gallery-square" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ChapterLabel({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="chapter-label">
      <span>{number}</span>
      <i />
      <strong>{children}</strong>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  useEffect(() => {
    loadPublicSetting("whatsapp_number").then(setWhatsAppNumber).catch(() => undefined);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const goTo = (id: string) => {
    closeMenu();
    window.setTimeout(() => scrollToSection(id), 40);
  };
  const openWhatsApp = () => {
    const digits = whatsAppNumber.replace(/\D/g, "");
    if (!digits) {
      goTo("contact");
      return;
    }
    window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="site-shell">
      <header className="site-nav">
        <a className="brand-lockup" href="#top" onClick={() => goTo("top")} aria-label="Aboyejo Global Foods home">
          <img src={storage.mark} alt="Aboyejo grain mark" className="brand-mark" />
          <span className="brand-wordmark">Aboyejo <em>Global Foods</em></span>
        </a>
        <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <a href="#story" onClick={() => goTo("story")}>Our story</a>
          <a href="#products" onClick={() => goTo("products")}>Products</a>
          <a href="#souvenirs" onClick={() => goTo("souvenirs")}>Souvenirs</a>
          <a href="#gallery" onClick={() => goTo("gallery")}>Gallery</a>
        </nav>
        <div className="nav-actions">
          <button className="nav-link-button" onClick={() => goTo("faq")}>FAQ</button>
          <Button className="nav-cta" onClick={() => goTo("contact")}><MessageCircle size={15} /> Order enquiry</Button>
          <button className="menu-trigger" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <ChapterLabel number="01">A family pantry, made premium</ChapterLabel>
            <h1>Good food keeps<br /><i>good company.</i></h1>
            <p className="hero-lede">Premium Garri Ijebu and custom souvenir packaging from a Nigerian family-owned business, founded in 2020.</p>
            <div className="hero-actions">
              <Button className="forest-button" onClick={openWhatsApp}><MessageCircle size={16} /> Order on WhatsApp</Button>
              <button className="text-arrow" onClick={() => goTo("products")}>Explore the collection <MoveRight size={17} /></button>
            </div>
            <div className="hero-proof">
              <div><span className="proof-number">2020</span><span>Founded with family at the centre</span></div>
              <div><span className="proof-number">01</span><span>Signature product: Garri Ijebu</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <motion.div className="hero-image-frame" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}>
              <img src={storage.hero} alt="A bowl of golden Garri Ijebu beside a wooden scoop" />
              <div className="image-caption"><span>THE GRAIN</span><b>Simple ingredients.<br />Careful presentation.</b></div>
            </motion.div>
            <div className="floating-note"><Leaf size={16} /><span>Rooted in<br />West African taste</span></div>
          </div>
          <button className="scroll-cue" onClick={() => goTo("intro")} aria-label="Scroll to brand introduction"><span>Scroll to discover</span><ArrowDown size={17} /></button>
        </section>

        <section className="intro-section paper-section" id="intro">
          <Reveal className="intro-aside"><span>THE ABOYEJO APPROACH</span><i /></Reveal>
          <Reveal className="intro-copy" delay={0.08}>
            <p className="eyebrow">A familiar taste, given room to shine</p>
            <h2>From the pantry<br />to the <i>occasion.</i></h2>
            <p>Aboyejo Global Foods brings a beloved Nigerian staple into a more considered setting: carefully presented, ready for the family table, and thoughtful enough to become part of the celebration.</p>
            <button className="text-arrow dark-arrow" onClick={() => goTo("story")}>Read our story <ArrowUpRight size={17} /></button>
          </Reveal>
          <Reveal className="intro-stats" delay={0.16}>
            <div className="stat-line"><span>01</span><strong>Premium Garri Ijebu</strong><p>Available in 1kg, 2kg, and 3kg formats.</p></div>
            <div className="stat-line"><span>02</span><strong>Custom souvenirs</strong><p>Packaging designed for the moment you are marking.</p></div>
            <div className="stat-line"><span>03</span><strong>Family-owned</strong><p>A modern food brand with a personal point of view.</p></div>
          </Reveal>
        </section>

        <section className="story-section forest-section" id="story">
          <div className="story-image-wrap"><img src={storage.grain} alt="Golden Garri grains spilling from a wooden scoop" /><span className="vertical-caption">A SMALL GRAIN, A FULL TABLE</span></div>
          <Reveal className="story-copy" delay={0.12}>
            <ChapterLabel number="02">Our story</ChapterLabel>
            <h2>There is more to<br />a staple than <i>size.</i></h2>
            <p>Founded in 2020, Aboyejo is a family-owned Nigerian food business built around a simple belief: familiar food deserves thoughtful care. That care shows up in the grain, in the pack, and in how it arrives at the table.</p>
            <div className="story-signature"><span className="signature-mark">A</span><span>Made for the pantry.<br /><i>Remembered at the table.</i></span></div>
          </Reveal>
        </section>

        <section className="products-section paper-section" id="products">
          <div className="section-heading-row">
            <Reveal><ChapterLabel number="03">The collection</ChapterLabel><h2>The grain,<br /><i>your way.</i></h2></Reveal>
            <Reveal className="heading-note" delay={0.1}><p>Three pack sizes. One signature staple. Choose the format that suits your shelf, your people, or your next gathering.</p><button className="text-arrow dark-arrow" onClick={() => goTo("contact")}>Ask about availability <MoveRight size={17} /></button></Reveal>
          </div>
          <div className="size-shelf">
            {productSizes.map((product, index) => (
              <Reveal key={product.size} className={`size-card card-${index + 1}`} delay={index * 0.08}>
                <div className="size-card-top"><span>Garri Ijebu</span><span>0{index + 1}</span></div>
                <div className="size-badge"><strong>{product.size}</strong><span>PACK</span></div>
                <div className="size-card-bottom"><h3>{product.title}</h3><p>{product.detail}</p><button onClick={() => goTo("contact")} aria-label={`Enquire about the ${product.size} pack`}>Enquire <ArrowUpRight size={15} /></button></div>
              </Reveal>
            ))}
          </div>
          <div className="collection-note"><CircleCheck size={18} /><span>Premium branded zip-lock packaging</span><i /><span>Editable ordering details</span><i /><span>Made for everyday and special occasions</span></div>
        </section>

        <section className="why-section" id="why">
          <div className="why-intro"><ChapterLabel number="04">Why Aboyejo</ChapterLabel><h2>Quietly<br /><i>considered.</i></h2><p>Every touchpoint is designed to feel warm, clear, and ready to be shared.</p></div>
          <div className="why-grid">
            <Reveal className="why-card why-card-large"><span className="why-icon"><Leaf size={21} /></span><span className="card-index">01 / THE INGREDIENT</span><h3>Familiar,<br />never ordinary.</h3><p>We keep the focus on premium Garri Ijebu: a food people know, presented with the respect it deserves.</p></Reveal>
            <Reveal className="why-card" delay={0.08}><span className="why-icon"><Package size={20} /></span><span className="card-index">02 / THE PACK</span><h3>Ready to<br />give.</h3><p>Zip-lock packaging keeps the presentation clean from pantry to table.</p></Reveal>
            <Reveal className="why-card why-card-dark" delay={0.16}><span className="why-icon"><HeartHandshake size={20} /></span><span className="card-index">03 / THE FEELING</span><h3>Rooted in<br />care.</h3><p>Family-owned means the details stay personal, even when the occasion is big.</p></Reveal>
          </div>
        </section>

        <section className="souvenir-section paper-section" id="souvenirs">
          <div className="souvenir-grid">
            <Reveal className="souvenir-copy"><ChapterLabel number="05">The souvenir experience</ChapterLabel><h2>Pack the occasion<br />with something <i>people know.</i></h2><p>For weddings, birthdays, naming ceremonies, church events, corporate events, schools, memorials, and the special occasions that sit somewhere in between.</p><button className="forest-button" onClick={() => goTo("contact")}>Request a quote <ArrowUpRight size={16} /></button></Reveal>
            <Reveal className="souvenir-hero-card" delay={0.12}><img src={storage.souvenirScene} alt="Unbranded cream and beige food pouches styled for a celebration" /><div className="souvenir-card-note"><Sparkles size={16} /><span>Custom presentation<br />for meaningful moments</span></div></Reveal>
            <Reveal className="souvenir-reference" delay={0.18}><img src={storage.suppliedSouvenir} alt="Supplied reference image of souvenir food packaging at an event table" /><div><span>Visual archive</span><p>A few of the supplied celebration references, carried into the story with a lighter touch.</p></div></Reveal>
          </div>
          <div className="occasion-strip"><span>Weddings</span><span>Birthdays</span><span>Naming ceremonies</span><span>Church events</span><span>Corporate events</span><span>Schools</span><span>Memorials</span></div>
        </section>

        <section className="gallery-section paper-section" id="gallery">
          <div className="gallery-heading"><ChapterLabel number="06">A visual note</ChapterLabel><h2>The details<br /><i>stay with you.</i></h2><p>From a single scoop to a full table, the feeling is in the details. A small selection of supplied references and new material moments.</p></div>
          <div className="gallery-grid">
            {gallery.map((item, index) => <Reveal key={item.label} className={`gallery-item ${item.className}`} delay={index * 0.04}><img src={item.src} alt={item.label} loading="lazy" /><span>{item.label}</span></Reveal>)}
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="faq-intro"><ChapterLabel number="07">Questions, answered</ChapterLabel><h2>A clear next<br /><i>step.</i></h2><p>Everything here stays simple. If your question is more specific, the order enquiry is the quickest way to ask.</p><button className="text-arrow" onClick={() => goTo("contact")}>Start an enquiry <MoveRight size={17} /></button></div>
          <div className="faq-list">
            {faqs.map((faq, index) => <div className={`faq-item ${openFaq === index ? "is-open" : ""}`} key={faq.question}><button className="faq-question" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>0{index + 1}</span><strong>{faq.question}</strong><ChevronDown size={18} /></button><AnimatePresence initial={false}>{openFaq === index && <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}><p>{faq.answer}</p></motion.div>}</AnimatePresence></div>)}
          </div>
        </section>

        <section className="contact-section forest-section" id="contact">
          <div className="contact-text"><ChapterLabel number="08">Order enquiry</ChapterLabel><h2>Ready when<br /><i>you are.</i></h2><p>Tell us what you are planning, and we will help you find the right format for the moment. The live enquiry, newsletter, and WhatsApp settings now sit in the dedicated contact flow.</p><button className="gold-button" onClick={() => window.location.assign("/contact")}><MessageCircle size={17} /> Start an enquiry</button></div>
          <div className="contact-panel"><div className="contact-panel-top"><span>ABOYEJO / ENQUIRY</span><span>01</span></div><div className="contact-fields"><div><label>Your name</label><span>Type your name</span></div><div><label>What are you planning?</label><span>Wedding, gifting, pantry...</span></div><div><label>What would you like to ask?</label><span>Share a little about your order</span></div></div><div className="contact-panel-foot"><span>WhatsApp ordering</span><span className="editable-pill"><Check size={13} /> Number editable</span></div></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top"><a className="brand-lockup footer-brand" href="#top" onClick={() => goTo("top")}><img src={storage.mark} alt="Aboyejo grain mark" className="brand-mark" /><span className="brand-wordmark">Aboyejo <em>Global Foods</em></span></a><p>Premium Garri Ijebu.<br />Thoughtful packaging.<br />Family-owned since 2020.</p><button className="footer-back" onClick={() => goTo("top")}><ArrowDown size={16} /> Back to top</button></div>
        <div className="footer-bottom"><span>© 2026 Aboyejo Global Foods</span><span>Made with care for the table</span><span>Privacy · Terms</span></div>
      </footer>
    </div>
  );
}
