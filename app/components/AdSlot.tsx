"use client";

import type { Ad } from "@/lib/types";
import AdHtml from "./AdHtml";
import AdBeacon from "./AdBeacon";

/**
 * Renders whichever ad is live in a slot. An empty slot renders nothing at all —
 * no placeholder, no reserved space — so the page looks the same as before an ad
 * was sold.
 */
export default function AdSlot({ ad, className = "" }: { ad?: Ad; className?: string }) {
  if (!ad) return null;

  return (
    <aside className={`ad-slot ad-${ad.placement} ${className}`.trim()} aria-label="Advertisement">
      <p className="ad-label">Advertisement</p>

      {ad.type === "html" ? (
        <AdHtml html={ad.html} />
      ) : ad.image ? (
        ad.href ? (
          // Clicks route through the API so they can be counted, then forwarded.
          <a href={`/api/ads/${ad.id}/click`} target="_blank" rel="noopener sponsored">
            <img src={ad.image} alt={ad.imageAlt} />
          </a>
        ) : (
          <img src={ad.image} alt={ad.imageAlt} />
        )
      ) : null}

      <AdBeacon id={ad.id} />
    </aside>
  );
}
