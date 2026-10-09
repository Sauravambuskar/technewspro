import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import NewsletterForm from "./components/NewsletterForm";
import AdSlot from "./components/AdSlot";
import JsonLd from "./components/JsonLd";
import { getFeaturedArticle, listArticles } from "@/lib/articles";
import { listResources } from "@/lib/resources";
import { getSiteChrome } from "@/lib/site";
import { listTicker } from "@/lib/ticker";
import { Article, formatDate } from "@/lib/types";
import { currentBrandText } from "@/lib/brand";
import { siteUrl } from "@/lib/seo";
import "./news-home.css";

export const dynamic = "force-dynamic";

function Heading({ title, href }: { title: string; href: string }) {
  return <div className="news-heading"><h2>{title}</h2><Link href={href}>View All <span aria-hidden="true">↗</span></Link></div>;
}
function Story({ article, variant = "", description = false }: { article: Article; variant?: string; description?: boolean }) {
  return <article className={`news-story ${variant}`}>
    {!variant.includes("text-only") && <Link className="news-image" href={`/articles/${article.slug}`} tabIndex={-1} aria-hidden="true">{article.image && <img src={article.image} alt="" loading={variant === "lead-story" ? "eager" : "lazy"} />}</Link>}
    <div className="news-story-copy"><div className="news-tags"><Link href={`/category/${article.section}`}>{article.tag || "Insights"}</Link></div>
      <h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3>
      {description && <p className="news-dek">{article.dek}</p>}
      <p className="news-meta">{formatDate(article.date)} <span> | {currentBrandText(article.author)}</span></p>
      <p className="news-time">◷ {article.minutes} min read</p>
    </div>
  </article>;
}
function Promotion({ wide = false }: { wide?: boolean }) {
  return <aside className={`news-promotion ${wide ? "promotion-wide" : ""}`}>
    <div><span className="promotion-brand">SalesInfo<b>Pro</b> / RESEARCH</span><h2>Make your next<br />move an informed one.</h2><p>Expert insights. Practical research.<br />A clearer view of what comes next.</p><Link href="/resources">Explore the research <span>↗</span></Link></div>
    <div className="report-art" aria-hidden="true"><span>THE INTELLIGENCE REPORT</span><strong>Ideas that<br />move business<br /><em>forward.</em></strong><div className="report-bars"><i /><i /><i /><i /><i /></div><small>SalesInfoPro / 2026</small></div>
  </aside>;
}
export default async function Home() {
  const [{ settings, nav, menu, footerPages, ads }, published, resources, ticker] = await Promise.all([getSiteChrome(), listArticles({ status: "published" }), listResources({ status: "published" }), listTicker(true)]);
  const lead = await getFeaturedArticle(settings.featuredSlug) || published[0];
  const rest = published.filter(article => article.id !== lead?.id);
  const picks = [...published].sort((a,b) => b.views-a.views).slice(0,3);
  const whitepapers = resources.filter(resource => resource.type === "whitepaper").slice(0,3);
  const events = published.filter(article => /^(webinar|event|summit|conference)s?$/i.test(article.tag.trim())).slice(0,3);
  const videos = published.filter(article => /^(video|watch|ted talk)s?$/i.test(article.tag.trim())).slice(0,3);
  const blogs = rest.slice(9,14);
  return <main className="news-home" id="top">
    <h1 className="news-sr-only">SalesInfoPro: Business and technology intelligence</h1>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: settings.siteName, url: siteUrl(), description: settings.metaDescription }} />
    <div className="news-top-ad">{ads.header ? <AdSlot ad={ads.header} /> : <Promotion wide />}</div>
    {settings.tickerEnabled && ticker.length > 0 && <section className="ticker news-ticker" aria-label="Latest updates"><span>LATEST</span><div className="ticker-track"><div className="ticker-viewport">{[...ticker,...ticker].map((item,index) => <span className="ticker-item" key={`${item.id}-${index}`} aria-hidden={index >= ticker.length || undefined}>{item.text}</span>)}</div></div></section>}
    <SiteHeader menu={menu} siteName={settings.siteName} />
    <div className="news-container">
      <section className="news-opening" aria-label="Top stories">
        <div className="news-opening-main"><div className="news-lead-grid">{lead && <Story article={lead} variant="lead-story" description />}<div className="news-headlines">{rest.slice(0,3).map(article => <Story article={article} variant="text-only" key={article.id} />)}</div></div><div className="news-three">{rest.slice(3,6).map(article => <Story article={article} key={article.id} />)}</div></div>
        <aside className="news-sidebar"><div className="news-picks"><h2>Top Picks</h2><ol>{picks.map(article => <li key={article.id}><Link href={`/articles/${article.slug}`}>{article.title}</Link></li>)}</ol></div><Promotion /></aside>
      </section>
      <section className="news-section"><Heading title="Latest News" href="/category" /><div className="news-with-sidebar"><div className="news-rows">{rest.slice(6,9).map(article => <Story article={article} variant="row-story" key={article.id} />)}</div><aside className="news-sidebar"><Promotion /><div className="news-follow"><span className="follow-symbol">↗</span><h3>Your daily dose<br />of intelligence.</h3><p>Stay ahead with SalesInfoPro.</p><Link href="#newsletter">Follow the briefing</Link></div></aside></div></section>
    </div>
    <section className="news-events"><div className="news-container"><Heading title="Events & Webinars" href="/search?q=webinar" />{events.length ? <div className="news-three">{events.map(article => <Story article={article} key={article.id} />)}</div> : <div className="news-event-empty"><div><span>CONNECT. LEARN. GROW.</span><h3>A front-row seat to what’s next.</h3><p>New events and expert conversations will appear here as they are announced.</p></div><Link href="#newsletter">Get event updates ↗</Link></div>}</div></section>
    <section className="news-papers"><div className="news-container"><Heading title="Whitepapers" href="/resources/whitepaper" /><div className="news-with-sidebar"><div className="news-rows">{whitepapers.map(resource => <article className="news-story row-story" key={resource.id}><Link className="news-image" href={`/resources/${resource.type}/${resource.slug}`}><img src={resource.image} alt={resource.imageAlt || resource.title} loading="lazy" /></Link><div className="news-story-copy"><div className="news-tags"><span>WHITEPAPER</span><span>{resource.gated ? "MEMBER RESEARCH" : "RESEARCH"}</span></div><h3><Link href={`/resources/${resource.type}/${resource.slug}`}>{resource.title}</Link></h3><p className="news-meta">{resource.pages} pages · {formatDate(resource.date)}</p><Link className="news-download" href={`/resources/${resource.type}/${resource.slug}`}>Read the report ↗</Link></div></article>)}</div><aside className="news-research-note"><span>THE INTELLIGENCE DESK</span><h3>Better questions.<br />Better decisions.</h3><p>Explore in-depth research for the people shaping business and technology.</p><Link href="/resources">Visit the resource center ↗</Link></aside></div></div></section>
    <div className="news-container"><section className="news-section"><Heading title="Latest Blogs" href="/category" /><div className="news-blog-grid">{blogs[0] && <Story article={blogs[0]} variant="lead-story" description />}<div className="news-blog-stack">{blogs.slice(1,3).map(article => <Story article={article} key={article.id} />)}</div><aside className="news-sidebar">{blogs.slice(3,5).map(article => <Story article={article} variant="text-only" key={article.id} />)}<Promotion /></aside></div></section>
      <section className="news-newsletter" id="newsletter"><div><span className="newsletter-kicker">THE SALESINFOPRO BRIEFING</span><h2>The Briefing That<br />Busy Tech Leaders Trust</h2><NewsletterForm blurb="Trusted by founders, analysts, and decision-makers across the industry." /></div><div className="newsletter-phone" aria-hidden="true"><i /><b>SalesInfo<span>Pro</span></b><small>YOUR DAILY INTELLIGENCE</small><h3>Good morning.<br />Get ahead of what’s next.</h3><div className="phone-chart"><span /><span /><span /><span /></div><strong>Ideas. Insights. Impact.</strong><p>The stories shaping tomorrow, in one essential briefing.</p></div></section>
      <section className="news-section news-videos"><Heading title="Videos" href="/search?q=video" />{videos.length ? <div className="news-three">{videos.map(article => <Story article={article} key={article.id} />)}</div> : <div className="news-video-empty"><span aria-hidden="true">▷</span><div><h3>A new perspective. Coming soon.</h3><p>Our latest video stories will appear here when published.</p></div><Link href="/category">Explore the latest stories ↗</Link></div>}</section>
      {!ads.footer && <div className="news-bottom-ad"><Promotion wide /></div>}
    </div>
    <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    <a className="news-back-top" href="#top" aria-label="Back to top">↑</a>
  </main>;
}
