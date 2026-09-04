"use client";

import { useState } from "react";

/**
 * A thumbnail that disappears instead of showing a broken-file icon.
 *
 * Article images are external URLs, and external URLs rot — a stock photo that
 * worked last year 404s today. Without this, a dead link leaves the browser's
 * broken-image glyph sitting in the middle of a listing. Hiding it leaves the
 * neutral placeholder block, which reads as "no picture" rather than "broken".
 */
export default function Thumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
