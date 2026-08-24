import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import NewsletterForm from "./components/NewsletterForm";
import { getFeaturedArticle, listArticles } from "@/lib/articles";
import { listSections } from "@/lib/sections";
import { getSiteChrome } from "@/lib/site";
import { listTicker } from "@/lib/ticker";
import type { Article, Section } from "@/lib/types";

export const dynamic = "force-dynamic";

function SectionBlock({ section, items }: { section: Section; items: Article[] }) {
  return (
    <section className="reviews" id={section.id}>
      <div className="section-heading">
        <p>{section.eyebrow}</p>
        <h2>{section.heading}</h2>
        <Link href="/articles">{section.cta} <span>→</span></Link>
      </div>
      <div className="review-grid">
        {items.map((article) => (
          <article className="review-card" key={article.slug}>
            <div className="review-image"><img src={article.image} alt="" /><span>{article.tag}</span></div>
            <h3>{article.title}</h3>
            <p>{article.dek}</p>
            <Link href={`/articles/${article.slug}`}>Read story <b>↗</b></Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [{ settings, nav, menu }, sections, published, ticker] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listArticles({ status: "published" }),
    listTicker(true)
  ]);

  const bySection = (id: string) => published.filter((article) => article.section === id);
  const latest = bySection("latest").slice(0, 4);
  const featureStory = await getFeaturedArticle(settings.featuredSlug);

  const mostRead = [...published]
    .filter((article) => article.slug !== featureStory?.slug)
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  const homeSections = sections.filter((section) => section.showOnHome && section.id !== "latest");
  const latestSection = sections.find((section) => section.id === "latest");
  const headlines = published.slice(0, 3);

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />

      {settings.tickerEnabled && ticker.length > 0 && (
        <section className="ticker" aria-label="Latest updates">
          <span>NOW</span>
          <div className="ticker-track">
            <div className="ticker-viewport">
              {ticker.map((item) => <span className="ticker-item" key={`a-${item.id}`}>{item.text}</span>)}
              {ticker.map((item) => <span className="ticker-item" key={`b-${item.id}`} aria-hidden="true">{item.text}</span>)}
            </div>
          </div>
        </section>
      )}

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{settings.heroEyebrow}</p>
          <h1>{settings.heroTitle}<br /><em>{settings.heroTitleAccent}</em></h1>
          <p className="hero-description">{settings.heroDescription}</p>
          <a href="#latest" className="read-link">{settings.heroCta} <span>→</span></a>
          <div className="hero-meta"><span>{settings.heroFootnote}</span><b>01 / 04</b></div>
        </div>
        <div className="hero-art" role="img" aria-label="Editorial illustration representing technology and connectivity">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="dot-grid" />
          <div className="hero-image" />
          <p className="art-label">Tomorrow<br />has a pulse.</p>
          <span className="orbital-type">SYSTEMS<br />THINKING</span>
        </div>
      </section>

      {latestSection && latest.length > 0 && (
        <section className="quick-reads" id="latest">
          <div className="section-heading">
            <p>{latestSection.eyebrow}</p>
            <h2>{latestSection.heading}</h2>
            <Link href="/articles">{latestSection.cta} <span>→</span></Link>
          </div>
          <div className="brief-grid">
            {latest.map((article, i) => (
              <article className="brief-card" key={article.slug}>
                <div className="brief-image"><img src={article.image} alt="" /></div>
                <span>0{i + 1}</span>
                <p>{article.tag}</p>
                <h3>{article.title}</h3>
                <Link href={`/articles/${article.slug}`}>Read story <b>↗</b></Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {featureStory && (
        <section className="feature-layout" id="ai-and-data">
          <article className="feature-story">
            <div className="feature-visual"><div className="feature-word">IDEAS<br />AT WORK</div></div>
            <p className="eyebrow">{featureStory.tag} / {featureStory.minutes} MIN READ</p>
            <h2>{featureStory.title}</h2>
            <p className="dek">{featureStory.dek}</p>
            <Link href={`/articles/${featureStory.slug}`} className="read-link dark-link">Read the field guide <span>→</span></Link>
          </article>
          <aside className="side-stories">
            <div className="section-label">MOST READ</div>
            {mostRead.map((article, i) => (
              <Link className="side-story" key={article.slug} href={`/articles/${article.slug}`}>
                <img src={article.image} alt="" />
                <div><span>0{i + 1} / {article.tag}</span><h3>{article.title}</h3><p>{article.dek}</p></div>
              </Link>
            ))}
          </aside>
        </section>
      )}

      <section className="manifesto">
        <p className="eyebrow">{settings.manifestoEyebrow}</p>
        <h2>{settings.manifestoTitle}<br /><em>{settings.manifestoTitleAccent}</em></h2>
        <p>{settings.manifestoBody}</p>
        <a href="#about">Why we exist <span>→</span></a>
        <div className="manifesto-news">
          <p className="manifesto-news-label">LATEST HEADLINES</p>
          {headlines.map((article) => (
            <Link className="manifesto-news-item" href={`/articles/${article.slug}`} key={article.slug}>
              <span>{article.tag}</span>
              <h4>{article.title}</h4>
            </Link>
          ))}
        </div>
        <div className="manifesto-number">02</div>
      </section>

      {homeSections.map((section) => {
        const items = bySection(section.id);
        if (items.length === 0) return null;
        return <SectionBlock key={section.id} section={section} items={items} />;
      })}

      <section className="newsletter" id="newsletter">
        <div>
          <p className="eyebrow">{settings.newsletterEyebrow}</p>
          <h2>{settings.newsletterTitle.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</h2>
        </div>
        <NewsletterForm blurb={settings.newsletterBlurb} />
      </section>

      <SiteFooter nav={nav} settings={settings} />
    </main>
  );
}
