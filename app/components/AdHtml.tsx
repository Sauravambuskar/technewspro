"use client";

import { useEffect, useRef } from "react";

/**
 * Renders an ad snippet pasted into the admin panel — an AdSense or ad-manager
 * tag, usually.
 *
 * React's dangerouslySetInnerHTML does not execute <script> tags, which is
 * exactly what these snippets rely on, so the scripts are re-created as real
 * elements after the markup is in place. The HTML is admin-authored, entering
 * the system only through an authenticated editor, and is treated with the same
 * trust as any other template a site owner controls.
 */
export default function AdHtml({ html }: { html: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    node.innerHTML = html;

    // Swap each inert <script> for a live one so the network tag actually runs.
    const scripts = Array.from(node.querySelectorAll("script"));
    for (const original of scripts) {
      const script = document.createElement("script");
      for (const { name, value } of Array.from(original.attributes)) {
        script.setAttribute(name, value);
      }
      script.text = original.text;
      original.replaceWith(script);
    }

    return () => {
      node.innerHTML = "";
    };
  }, [html]);

  return <div ref={host} />;
}
