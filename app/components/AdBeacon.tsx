"use client";

import { useEffect } from "react";

/**
 * Counts one impression per ad per visit. Deliberately not per page view: the
 * whole store is a single JSON row, and a write on every render of every page
 * would put every reader behind the same row lock.
 */
export default function AdBeacon({ id }: { id: string }) {
  useEffect(() => {
    const key = `tnp:ad:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode or blocked storage — counting it again is harmless.
    }

    fetch(`/api/ads/${id}/impression`, { method: "POST", keepalive: true }).catch(() => {
      // A missed impression is not worth surfacing to the reader.
    });
  }, [id]);

  return null;
}
