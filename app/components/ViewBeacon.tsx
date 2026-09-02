"use client";

import { useEffect } from "react";

/** Records one read per visit, without blocking the server render. */
export default function ViewBeacon({
  slug,
  kind = "article"
}: {
  slug: string;
  kind?: "article" | "resource" | "page";
}) {
  useEffect(() => {
    const key = `sip:viewed:${kind}:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode or blocked storage — counting the view again is harmless.
    }

    fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, kind }),
      keepalive: true
    }).catch(() => {
      // A missed view count is not worth surfacing to the reader.
    });
  }, [slug, kind]);

  return null;
}
