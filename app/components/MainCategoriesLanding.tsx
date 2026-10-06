import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import CategorySlider from "./CategorySlider";
import { listArticles } from "@/lib/articles";
import { listSections } from "@/lib/sections";
import { getSiteChrome } from "@/lib/site";

export default async function MainCategoriesLanding() {
  const [{ settings, nav, footerPages, ads }, sections, published] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listArticles({ status: "published" })
  ]);

  const mainCategoryMenu = sections.map((section) => ({
    id: section.id,
    label: section.label,
    href: `/category/${section.id}`,
    links: []
  }));

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={mainCategoryMenu} siteName={settings.siteName} ad={ads.header} />

      <section className="categories main-categories-version">
        <div className="section-heading">
          <p>MAIN CATEGORIES</p>
          <h1>Choose a desk.<br />Start reading.</h1>
          <a href="https://salesinfopro.vercel.app/">Full homepage <span>&rarr;</span></a>
        </div>

        <CategorySlider>
          {sections.map((section, index) => {
            const articles = published.filter((article) => article.section === section.id);
            const cover = articles[0];
            return (
              <Link className="category-card" href={`/category/${section.id}`} key={section.id}>
                <div className="category-card-image">
                  {cover?.image && <img src={cover.image} alt={cover.imageAlt} loading="lazy" />}
                  <span className="category-index">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{section.label}</h3>
                <p>{section.eyebrow}</p>
                <b>{articles.length} article{articles.length === 1 ? "" : "s"} <i>&#8599;</i></b>
              </Link>
            );
          })}
        </CategorySlider>
      </section>

      <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    </main>
  );
}
