import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found | SalesInfoPro",
  robots: { index: false, follow: true }
};

// Deliberately static: the global not-found is prerendered at build time, before
// DATABASE_URL exists, so it must not read from the database.
export default function NotFound() {
  return (
    <main>
      <div className="topline" />

      <section className="notfound">
        <p className="eyebrow">ERROR 404</p>
        <h1>That page has<br /><em>moved on.</em></h1>
        <p className="notfound-lede">
          The link may be out of date, or the piece may have been unpublished. Everything else is
          still where you left it.
        </p>

        <div className="notfound-links">
          <Link className="btn-primary" href="/">Back to the homepage <span>&rarr;</span></Link>
          <Link className="btn-secondary" href="/insights">Browse insights</Link>
          <Link className="btn-secondary" href="/resources">Resource center</Link>
        </div>

        <div className="notfound-help">
          <p>Looking for something specific?</p>
          <ul>
            <li><Link href="/insights">All insights, by category</Link></li>
            <li><Link href="/resources">Whitepapers, ebooks, case studies and press releases</Link></li>
            <li><Link href="/about">About SalesInfoPro</Link></li>
            <li><Link href="/contact">Contact the team</Link></li>
          </ul>
        </div>
      </section>
    </main>
  );
}
