import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import NewsletterForm from "./components/NewsletterForm";
import LeadCaptureForm from "./components/LeadCaptureForm";
import ArticleCard from "./components/ArticleCard";
import ResourceCard from "./components/ResourceCard";
import CategoryBlock from "./components/CategoryBlock";
import JsonLd from "./components/JsonLd";
import { getFeaturedArticle, listArticles } from "@/lib/articles";
import { listResources } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import { getSiteChrome } from "@/lib/site";
import { listTicker } from "@/lib/ticker";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, formatDate } from "@/lib/types";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ settings, nav, menu }, sections, published, resources, ticker] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listArticles({ status: "published" }),
    listResources({ status: "published" }),
    listTicker(true)
  ]);

  const featureStory = await getFeaturedArticle(settings.featuredSlug);
  const latest = published.slice(0, 6);
  const homeSections = sections.filter((section) => section.showOnHome);
  const trending = [...published]
    .filter((article) => article.slug !== featureStory?.slug)
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);
  const featuredResources = resources.slice(0, 3);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: settings.siteName,
          url: siteUrl(),
          description: settings.metaDescription,
          email: settings.contactEmail,
          telephone: settings.contactPhone,
          address: { "@type": "PostalAddress", streetAddress: settings.contactAddress },
          sameAs: settings.socials.map((social) => social.href).filter((href) => href.startsWith("http"))
        }}
      />

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

      {/* 1 — Hero */}
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{settings.heroEyebrow}</p>
          <h1>{settings.heroTitle}<br /><em>{settings.heroTitleAccent}</em></h1>
          <p className="hero-description">{settings.heroDescription}</p>
          <div className="hero-actions">
            <Link href={settings.heroCtaHref || "/resources"} className="btn-primary">
              {settings.heroCta} <span>&rarr;</span>
            </Link>
            <Link href={settings.heroCtaSecondaryHref || "/contact"} className="btn-secondary">
              {settings.heroCtaSecondary}
            </Link>
          </div>
          <div className="hero-meta"><span>{settings.heroFootnote}</span><b>EST. 2026</b></div>
        </div>
        <div className="hero-art" role="img" aria-label="Abstract editorial illustration">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="dot-grid" />
          <div className="hero-image" />
          <p className="art-label">Evidence<br />over noise.</p>
          <span className="orbital-type">RESEARCH<br />DRIVEN</span>
        </div>
      </section>

      {/* 2 — Featured categories */}
      <section className="categories" id="categories">
        <div className="section-heading">
          <p>COVERAGE</p>
          <h2>Featured categories.</h2>
          <Link href="/insights">All insights <span>&rarr;</span></Link>
        </div>
        <div className="category-grid">
          {sections.map((section, i) => {
            const count = published.filter((a) => a.section === section.id).length;
            return (
              <Link className="category-card" href={`/insights/${section.id}`} key={section.id}>
                <span className="category-index">0{i + 1}</span>
                <h3>{section.label}</h3>
                <p>{section.eyebrow}</p>
                <b>{count} article{count === 1 ? "" : "s"} <i>&#8599;</i></b>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3 — Latest insights */}
      <section className="reviews" id="latest">
        <div className="section-heading">
          <p>LATEST INSIGHTS</p>
          <h2>Recent analysis.</h2>
          <Link href="/insights">View all <span>&rarr;</span></Link>
        </div>
        <div className="review-grid">
          {latest.map((article) => <ArticleCard key={article.id} article={article} showDate />)}
        </div>
      </section>

      {/* 3b — Every category, in full */}
      {homeSections.map((section, i) => (
        <CategoryBlock
          key={section.id}
          section={section}
          tone={i % 2 === 0 ? "light" : "tint"}
          articles={published.filter((article) => article.section === section.id).slice(0, 5)}
          resources={resources.filter((resource) => resource.category === section.id)}
        />
      ))}

      {/* 4 — Resource center */}
      <section className="resource-strip" id="resources">
        <div className="section-heading">
          <p>{settings.resourcesEyebrow}</p>
          <h2>{settings.resourcesTitle}</h2>
          <Link href="/resources">Resource center <span>&rarr;</span></Link>
        </div>
        <p className="strip-blurb">{settings.resourcesBlurb}</p>

        <div className="resource-type-row">
          {RESOURCE_TYPES.map((type) => {
            const count = resources.filter((r) => r.type === type).length;
            return (
              <Link className="resource-type-pill" href={`/resources/${type}`} key={type}>
                {RESOURCE_TYPE_LABELS[type].plural}
                <b>{count}</b>
              </Link>
            );
          })}
        </div>

        <div className="resource-grid">
          {featuredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      </section>

      {/* 5 — Trending topics / editor's picks */}
      {featureStory && (
        <section className="feature-layout" id="trending">
          <article className="feature-story">
            <div className="feature-visual"><div className="feature-word">EDITOR&rsquo;S<br />PICK</div></div>
            <p className="eyebrow">{featureStory.tag} / {featureStory.minutes} MIN READ</p>
            <h2>{featureStory.title}</h2>
            <p className="dek">{featureStory.dek}</p>
            <Link href={`/articles/${featureStory.slug}`} className="read-link dark-link">
              Read the analysis <span>&rarr;</span>
            </Link>
          </article>
          <aside className="side-stories">
            <div className="section-label">TRENDING TOPICS</div>
            {trending.map((article, i) => (
              <Link className="side-story" key={article.id} href={`/articles/${article.slug}`}>
                {article.image && <img src={article.image} alt="" loading="lazy" />}
                <div>
                  <span>0{i + 1} / {article.tag}</span>
                  <h3>{article.title}</h3>
                  <p>{formatDate(article.date)}</p>
                </div>
              </Link>
            ))}
          </aside>
        </section>
      )}

      {/* 6 — Why SalesInfoPro */}
      <section className="why" id="why">
        <div className="why-intro">
          <p className="eyebrow">{settings.whyEyebrow}</p>
          <h2>{settings.whyTitle.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</h2>
          <p>{settings.whyBlurb}</p>
          <Link href="/about" className="read-link">More about us <span>&rarr;</span></Link>
        </div>
        <div className="why-grid">
          {settings.whyPoints.map((point, i) => (
            <div className="why-card" key={point.id}>
              <span>0{i + 1}</span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 — Contact / lead generation */}
      <section className="lead-section" id="contact">
        <div className="lead-copy">
          <p className="eyebrow">{settings.contactEyebrow}</p>
          <h2>{settings.contactTitle}</h2>
          <p>{settings.contactBlurb}</p>
          <dl className="lead-details">
            <div><dt>Email</dt><dd><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></dd></div>
            <div><dt>Phone</dt><dd><a href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`}>{settings.contactPhone}</a></dd></div>
            <div><dt>Office</dt><dd>{settings.contactAddress}</dd></div>
          </dl>
        </div>
        <LeadCaptureForm intent="syndication" submitLabel="Send enquiry" showMessage />
      </section>

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
