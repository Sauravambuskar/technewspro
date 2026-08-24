"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavEntry } from "@/lib/site";

type SearchHit = { href: string; title: string; tag: string };

export default function SiteHeader({ menu, siteName }: { menu: NavEntry[]; siteName: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function closeAll() {
    setSearchOpen(false);
    setDrawerOpen(false);
    setOpenMenu(null);
  }

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const payload = await response.json();
        setResults(payload.ok ? payload.data : []);
      } catch {
        // Aborted by the next keystroke, or the request failed — keep the last results.
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const brand = (
    <>
      <span className="brand-mark">S.</span>
      <span>sales<b>info</b>pro</span>
    </>
  );

  return (
    <header className="site-header">
      <div className="header-top">
        <button
          className="menu-toggle"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
          onClick={() => {
            setDrawerOpen((open) => !open);
            setSearchOpen(false);
            setOpenMenu(null);
          }}
        >
          <span /><span /><span />
        </button>

        <Link className="brand" href="/" aria-label={`${siteName} home`} onClick={closeAll}>
          {brand}
        </Link>

        <div className="header-actions">
          <button
            className="search"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((open) => !open);
              setDrawerOpen(false);
              setOpenMenu(null);
            }}
          >
            {searchOpen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.4" fill="none" stroke="currentColor" strokeWidth="2.1" /><path d="M15.8 15.8L21 21" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" /></svg>
            )}
          </button>
          <Link href="/#newsletter" className="subscribe" onClick={closeAll}>Subscribe</Link>
        </div>
      </div>

      <nav className="main-nav" aria-label="Sections">
        <ul>
          {menu.map((section) => {
            const hasDropdown = section.links.length > 0;
            const open = openMenu === section.id;

            return (
              <li
                className={`nav-item${open ? " nav-open" : ""}`}
                key={section.id}
                onMouseEnter={() => hasDropdown && setOpenMenu(section.id)}
                onMouseLeave={() => hasDropdown && setOpenMenu(null)}
              >
                {hasDropdown ? (
                  <button
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(open ? null : section.id)}
                  >
                    {section.label}
                    <i className="nav-caret" aria-hidden="true" />
                  </button>
                ) : (
                  <Link href={section.href}>{section.label}</Link>
                )}

                {hasDropdown && open && (
                  <div className="nav-dropdown">
                    {section.links.map((link) => (
                      <Link href={link.href} key={link.href} onClick={closeAll}>
                        {link.label}
                      </Link>
                    ))}
                    <Link className="nav-dropdown-all" href={section.href} onClick={closeAll}>
                      All {section.label} <span>→</span>
                    </Link>
                  </div>
                )}
              </li>
            );
          })}

        </ul>
      </nav>

      {drawerOpen && (
        <div className="nav-drawer">
          <div className="drawer-grid">
            {menu.map((section) => (
              <div className="drawer-col" key={section.id}>
                <h4>
                  <Link href={section.href} onClick={closeAll}>{section.label}</Link>
                </h4>
                {section.links.length > 0 ? (
                  section.links.map((link) => (
                    <Link href={link.href} key={link.href} onClick={closeAll}>
                      {link.label}
                    </Link>
                  ))
                ) : (
                  <p className="drawer-empty">Visit the section →</p>
                )}
              </div>
            ))}
          </div>

          <div className="drawer-links">
            <Link href="/insights" onClick={closeAll}>All insights</Link>
            <Link href="/resources" onClick={closeAll}>Resource center</Link>
            <Link href="/about" onClick={closeAll}>About us</Link>
            <Link href="/contact" onClick={closeAll}>Contact us</Link>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="search-panel" role="search">
          <div className="search-panel-inner">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search insights, research and resources…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search the site"
            />
            {query.trim() && (
              <div className="search-results">
                {results.length > 0 ? (
                  results.map((hit) => (
                    <Link href={hit.href} key={hit.href} onClick={closeAll}>
                      <span>{hit.tag}</span>
                      {hit.title}
                    </Link>
                  ))
                ) : (
                  <p className="search-empty">
                    {searching ? "Searching…" : `Nothing matches “${query}”.`}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
