"use client";

import { useEffect } from "react";

/** Records one read per article visit, without blocking the server render. */
export default function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `tnip:viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true
    }).catch(() => {
      // A missed view count is not worth surfacing to the reader.
    });
  }, [slug]);

  return null;
}
