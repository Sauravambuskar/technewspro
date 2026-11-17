import Link from "next/link";
import DynamicForm from "./DynamicForm";
import { getFormById } from "@/lib/forms";
import type { PageBlock, PageBuilder } from "@/lib/types";

function safeHref(value: string) {
  const href = value.trim();
  if (href.startsWith("/") || href.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(href)) return href;
  return "";
}

function Action({ href: rawHref, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  const href = safeHref(rawHref);
  if (!href) return null;
  const className = secondary ? "pb-button pb-button-secondary" : "pb-button";
  return href.startsWith("/") || href.startsWith("#")
    ? <Link className={className} href={href}>{children}</Link>
    : <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function Actions({ block }: { block: PageBlock }) {
  if (!block.buttonLabel && !block.secondaryLabel) return null;
  return <div className="pb-actions"><Action href={block.buttonHref}>{block.buttonLabel}</Action><Action href={block.secondaryHref} secondary>{block.secondaryLabel}</Action></div>;
}

async function RenderBlock({ block }: { block: PageBlock }) {
  const align = { textAlign: block.align } as const;
  if (block.type === "hero") return <div className={`pb-hero pb-theme-${block.theme}`} style={align}><div className="pb-hero-copy">{block.eyebrow && <p className="pb-eyebrow">{block.eyebrow}</p>}<h1>{block.heading}</h1>{block.text && <p className="pb-lead">{block.text}</p>}<Actions block={block} /></div>{block.image && <div className="pb-hero-image"><img src={block.image} alt={block.imageAlt} /></div>}</div>;
  if (block.type === "heading") return block.level === "h3" ? <h3 className="pb-heading" style={align}>{block.heading}</h3> : <h2 className="pb-heading" style={align}>{block.heading}</h2>;
  if (block.type === "text") return <div className="pb-text" style={align}>{block.text.split(/\n{2,}/).filter(Boolean).map((text, index) => <p key={index}>{text}</p>)}</div>;
  if (block.type === "image") return <figure className="pb-image">{block.image && <img src={block.image} alt={block.imageAlt} />}{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  if (block.type === "points") return <div className="pb-points" style={align}>{block.heading && <h2>{block.heading}</h2>}<ul>{block.items.map((item, index) => <li key={index}><span>✓</span>{item}</li>)}</ul></div>;
  if (block.type === "cta") return <div className={`pb-cta pb-theme-${block.theme}`} style={align}><h2>{block.heading}</h2>{block.text && <p>{block.text}</p>}<Actions block={block} /></div>;
  if (block.type === "form") {
    const form = block.formId ? await getFormById(block.formId) : undefined;
    return <div className={`pb-form pb-theme-${block.theme}`} id={`form-${block.id}`}>{block.heading && <h2>{block.heading}</h2>}{block.text && <p className="pb-form-copy">{block.text}</p>}{form?.status === "published" ? <DynamicForm form={form} /> : <p className="pb-form-unavailable">This form is not available yet.</p>}</div>;
  }
  return <div className="pb-spacer" style={{ height: block.height }} aria-hidden="true" />;
}

export default async function PageBuilderRenderer({ builder }: { builder: PageBuilder }) {
  return <div className="page-builder-public">
    {builder.sections.map((section) => <section className={`pb-section pb-pad-${section.padding}`} style={{ background: section.background, color: section.textColor }} key={section.id}>
      <div className={`pb-section-inner pb-width-${section.width} pb-cols-${section.columns}`}>
        {([0, ...(section.columns === 2 ? [1] : [])] as Array<0 | 1>).map((column) => <div className="pb-column" key={column}>{section.blocks.filter((block) => block.column === column).map((block) => <RenderBlock block={block} key={block.id} />)}</div>)}
      </div>
    </section>)}
  </div>;
}
