import Link from "next/link";
import type { CSSProperties } from "react";
import DynamicForm from "./DynamicForm";
import { getFormById } from "@/lib/forms";
import type { PageBlock, PageBuilder } from "@/lib/types";

function safeHref(value: string) {
  const href = value.trim();
  return href.startsWith("/") || href.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(href) ? href : "";
}

function fontStack(font: PageBlock["fontFamily"]) {
  if (font === "sans") return '"DM Sans", Arial, sans-serif';
  if (font === "display") return "Arial, Helvetica, sans-serif";
  if (font === "serif") return 'Georgia, "Times New Roman", serif';
  if (font === "mono") return '"DM Mono", Consolas, monospace';
  return undefined;
}

function blockStyle(block: PageBlock): CSSProperties {
  return { background: block.backgroundColor || undefined, color: block.textColor || undefined, fontFamily: fontStack(block.fontFamily), fontSize: block.fontSize || undefined, fontWeight: block.fontWeight || undefined, lineHeight: block.lineHeight || undefined, padding: block.padding || undefined, marginTop: block.marginTop || undefined, marginBottom: block.marginBottom || undefined, borderColor: block.borderColor || undefined, borderWidth: block.borderWidth || undefined, borderStyle: block.borderWidth ? "solid" : undefined, borderRadius: block.borderRadius || undefined, maxWidth: block.maxWidth || undefined, boxShadow: block.shadow ? "0 18px 45px rgba(0,0,0,.16)" : undefined, textAlign: block.align, "--pb-accent": block.accentColor || undefined, "--pb-font-size": block.fontSize ? `${block.fontSize}px` : undefined } as CSSProperties;
}

function gridTemplate(columns: number, layout: string) {
  if (columns === 1) return "minmax(0,1fr)";
  if (columns > 2 || layout === "equal") return `repeat(${columns},minmax(0,1fr))`;
  if (layout === "sidebar-left") return "minmax(220px,.65fr) minmax(0,1.35fr)";
  if (layout === "sidebar-right") return "minmax(0,1.35fr) minmax(220px,.65fr)";
  if (layout === "feature-left") return "minmax(0,1.65fr) minmax(240px,.85fr)";
  return "minmax(240px,.85fr) minmax(0,1.65fr)";
}

function Action({ href: rawHref, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  const href = safeHref(rawHref); if (!href) return null;
  const className = secondary ? "pb-button pb-button-secondary" : "pb-button";
  return href.startsWith("/") || href.startsWith("#") ? <Link className={className} href={href}>{children}</Link> : <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}
function Actions({ block }: { block: PageBlock }) { return block.buttonLabel || block.secondaryLabel ? <div className="pb-actions"><Action href={block.buttonHref}>{block.buttonLabel}</Action><Action href={block.secondaryHref} secondary>{block.secondaryLabel}</Action></div> : null; }

async function RenderBlock({ block }: { block: PageBlock }) {
  const style = blockStyle(block);
  if (block.type === "hero") return <div className={`pb-hero pb-theme-${block.theme}`} style={style}><div className="pb-hero-copy">{block.eyebrow && <p className="pb-eyebrow">{block.eyebrow}</p>}<h1>{block.heading}</h1>{block.text && <p className="pb-lead">{block.text}</p>}<Actions block={block} /></div>{block.image && <div className="pb-hero-image"><img src={block.image} alt={block.imageAlt} /></div>}</div>;
  if (block.type === "heading") return block.level === "h3" ? <h3 className="pb-heading" style={style}>{block.heading}</h3> : <h2 className="pb-heading" style={style}>{block.heading}</h2>;
  if (block.type === "text") return <div className="pb-text" style={style}>{block.text.split(/\n{2,}/).filter(Boolean).map((text, index) => <p key={index}>{text}</p>)}</div>;
  if (block.type === "image") return <figure className="pb-image" style={style}>{block.image && <img src={block.image} alt={block.imageAlt} />}{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  if (block.type === "points") return <div className="pb-points" style={style}>{block.heading && <h2>{block.heading}</h2>}<ul>{block.items.map((item, index) => <li key={index}><span>✓</span>{item}</li>)}</ul></div>;
  if (block.type === "cta") return <div className={`pb-cta pb-theme-${block.theme}`} style={style}><h2>{block.heading}</h2>{block.text && <p>{block.text}</p>}<Actions block={block} /></div>;
  if (block.type === "form") { const form = block.formId ? await getFormById(block.formId) : undefined; return <div className={`pb-form pb-theme-${block.theme}`} id={`form-${block.id}`} style={style}>{block.heading && <h2>{block.heading}</h2>}{block.text && <p className="pb-form-copy">{block.text}</p>}{form?.status === "published" ? <DynamicForm form={form} /> : <p className="pb-form-unavailable">This form is not available yet.</p>}</div>; }
  return <div className="pb-spacer" style={{ ...style, height: block.height }} aria-hidden="true" />;
}

export default async function PageBuilderRendererStudio({ builder }: { builder: PageBuilder }) {
  return <div className="page-builder-public">{builder.sections.map((section) => {
    const customPadding = section.paddingTop || section.paddingBottom || section.paddingInline ? { paddingTop: section.paddingTop, paddingBottom: section.paddingBottom, paddingInline: section.paddingInline } : {};
    return <section className={`pb-section pb-pad-${section.padding}`} style={{ background: section.background, color: section.textColor, ...customPadding }} key={section.id}><div className={`pb-section-inner pb-width-${section.width}`} style={{ gridTemplateColumns: gridTemplate(section.columns, section.columnLayout), gap: section.columnGap }}>{Array.from({ length: section.columns }, (_, column) => column as 0 | 1 | 2 | 3).map((column) => <div className="pb-column" key={column}>{section.blocks.filter((block) => block.column === column).map((block) => <RenderBlock block={block} key={block.id} />)}</div>)}</div></section>;
  })}</div>;
}
