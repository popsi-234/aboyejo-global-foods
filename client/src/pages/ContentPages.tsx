// Public gallery, souvenir, FAQ, and contact routes backed by the production Supabase schema.
import { CheckCircle2, MessageCircle, Package, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { loadFaqs, loadGallery, loadPublicSetting, loadSouvenirs, submitContact, subscribeToNewsletter, type Faq, type GalleryItem, type SouvenirPackage } from "@/lib/commerce";
import { PageHero, PublicShell } from "@/components/PublicShell";

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  useEffect(() => { loadGallery().then(setItems).catch(() => undefined); }, []);
  return <PublicShell><PageHero eyebrow="Visual archive" title={<>The details<br /><i>stay with you.</i></>}>A collection of packaging, gatherings, and grain details shared by Aboyejo Global Foods.</PageHero><section className="gallery-page-grid paper-section">{items.length ? items.map((item) => <figure key={item.id}><img src={item.image_url} alt={item.title} /><figcaption><strong>{item.title}</strong>{item.caption ? <span>{item.caption}</span> : null}</figcaption></figure>) : <EmptyNotice title="The gallery is being curated." text="New product and occasion imagery will appear here as it is published by the team." />}</section></PublicShell>;
}

export function SouvenirsPage() {
  const [items, setItems] = useState<SouvenirPackage[]>([]);
  useEffect(() => { loadSouvenirs().then(setItems).catch(() => undefined); }, []);
  return <PublicShell><PageHero eyebrow="The souvenir experience" title={<>Pack the occasion<br />with something <i>people know.</i></>}>Custom Aboyejo presentation for weddings, birthdays, naming ceremonies, churches, schools, corporate moments, and more.</PageHero><section className="souvenir-page-grid paper-section">{items.length ? items.map((item) => <article className="souvenir-page-card" key={item.id}>{item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="image-placeholder"><Package size={28} /></div>}<div><p className="eyebrow">{item.event_types.join(" · ")}</p><h2>{item.name}</h2><p>{item.description}</p>{item.minimum_quantity ? <p className="card-detail">Minimum quantity: {item.minimum_quantity}</p> : null}{item.price_note ? <p className="card-detail">{item.price_note}</p> : null}<Link className="forest-button" href="/contact">Request a quote</Link></div></article>) : <EmptyNotice title="Souvenir packages are being prepared." text="Start an enquiry to discuss custom packaging for your event." />}</section></PublicShell>;
}

export function FaqPage() {
  const [items, setItems] = useState<Faq[]>([]);
  useEffect(() => { loadFaqs().then(setItems).catch(() => undefined); }, []);
  return <PublicShell><PageHero eyebrow="Questions, answered" title={<>A clear next<br /><i>step.</i></>}>Everything here stays simple. If your question is more specific, the enquiry page is the quickest way to ask.</PageHero><section className="faq-page-list paper-section">{items.length ? items.map((item, index) => <details key={item.id} open={index === 0}><summary><span>0{index + 1}</span><strong>{item.question}</strong></summary><p>{item.answer}</p></details>) : <EmptyNotice title="FAQs are being prepared." text="For a quick answer now, send a direct enquiry to the Aboyejo team." />}</section></PublicShell>;
}

export function ContactPage() {
  const [notice, setNotice] = useState(""); const [whatsApp, setWhatsApp] = useState("");
  useEffect(() => { loadPublicSetting("whatsapp_number").then(setWhatsApp).catch(() => undefined); }, []);
  async function onContact(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); try { await submitContact({ name: String(data.get("name") || ""), email: String(data.get("email") || ""), phone: String(data.get("phone") || ""), message: String(data.get("message") || "") }); setNotice("Thank you — your message has been received."); form.reset(); } catch { setNotice("Your message could not be sent right now. Please try again shortly."); } }
  async function onNewsletter(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const email = String(new FormData(form).get("email") || ""); try { await subscribeToNewsletter(email); setNotice("You are on the Aboyejo newsletter list."); form.reset(); } catch { setNotice("We could not add that email just now."); } }
  const whatsappHref = whatsApp.replace(/\D/g, "") ? `https://wa.me/${whatsApp.replace(/\D/g, "")}` : "";
  return <PublicShell><PageHero eyebrow="Order enquiry" title={<>Ready when<br /><i>you are.</i></>}>Tell the team what you are planning. Use the form for an enquiry, or WhatsApp when the live line has been configured.</PageHero><section className="contact-page-grid paper-section"><form className="form-card" onSubmit={onContact}><div className="form-title"><MessageCircle size={20} /><div><p className="eyebrow">Direct enquiry</p><h2>Start a conversation</h2></div></div><div className="form-split"><label>Your name<input name="name" required placeholder="Full name" /></label><label>Phone number<input name="phone" placeholder="e.g. +234…" /></label></div><label>Email <span>(optional)</span><input type="email" name="email" placeholder="you@example.com" /></label><label>What are you planning?<textarea name="message" required rows={6} placeholder="Wedding, pantry order, corporate gifting, or something else…" /></label><button className="forest-button" type="submit"><Send size={16} /> Send enquiry</button></form><aside className="contact-aside"><p className="eyebrow">Ordering channel</p><h2>WhatsApp, when you need it.</h2><p>For quick follow-up on products and occasions, the business can keep its live WhatsApp number in the site settings.</p>{whatsappHref ? <a className="gold-button" href={whatsappHref} target="_blank" rel="noreferrer">Open WhatsApp</a> : <p className="notice">The WhatsApp line has not yet been published. Use the enquiry form instead.</p>}<form className="newsletter-form" onSubmit={onNewsletter}><p className="eyebrow">Newsletter</p><label>Email updates<input name="email" required type="email" placeholder="you@example.com" /></label><button className="outline-button" type="submit">Subscribe</button></form>{notice ? <p className="success-note"><CheckCircle2 size={17} /> {notice}</p> : null}</aside></section></PublicShell>;
}

function EmptyNotice({ title, text }: { title: string; text: string }) { return <div className="empty-state"><h2>{title}</h2><p>{text}</p><Link className="forest-button" href="/contact">Start an enquiry</Link></div>; }
