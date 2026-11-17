// Legacy builder retained for migration reference.
// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { uploadFile } from "../../apiClient";
import type { FormDefinition, PageBlock, PageBlockType, PageBuilder, PageBuilderSection } from "@/lib/types";

type Props = { value: PageBuilder; onChange: (value: PageBuilder) => void; forms: FormDefinition[]; onError: (message: string) => void };
const LIBRARY: Array<{ type: PageBlockType; label: string; icon: string }> = [
  { type: "hero", label: "Hero", icon: "H" }, { type: "heading", label: "Heading", icon: "T" },
  { type: "text", label: "Text", icon: "¶" }, { type: "image", label: "Image", icon: "▧" },
  { type: "points", label: "Feature points", icon: "✓" }, { type: "cta", label: "Call to action", icon: "→" },
  { type: "form", label: "Form", icon: "▤" }, { type: "spacer", label: "Spacer", icon: "↕" }
];

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export function newBlock(type: PageBlockType): PageBlock {
  const block: PageBlock = { id: uid("block"), type, column: 0, eyebrow: "", heading: "", text: "", level: "h2", align: "left", image: "", imageAlt: "", caption: "", items: [], buttonLabel: "", buttonHref: "", secondaryLabel: "", secondaryHref: "", formId: "", theme: "light", height: 64 };
  if (type === "hero") return { ...block, eyebrow: "SalesInfoPro", heading: "A clear headline for your campaign", text: "Explain the value in one concise paragraph.", buttonLabel: "Get started", buttonHref: "#form", theme: "dark" };
  if (type === "heading") return { ...block, heading: "Section heading" };
  if (type === "text") return { ...block, text: "Write your content here. Add a blank line to start a new paragraph." };
  if (type === "points") return { ...block, heading: "What you will learn", items: ["Add your first point", "Add another useful point"] };
  if (type === "cta") return { ...block, heading: "Ready to continue?", text: "Give readers a clear next step.", buttonLabel: "Contact us", buttonHref: "/contact", theme: "accent" };
  if (type === "form") return { ...block, heading: "Get the resource", text: "Complete the form and our team will follow up.", theme: "dark" };
  return block;
}
export function newSection(index = 0): PageBuilderSection {
  return { id: uid("section"), name: `Section ${index + 1}`, columns: 1, width: "contained", padding: "medium", background: "#ffffff", textColor: "#17181d", blocks: [] };
}

export default function VisualPageBuilder({ value, onChange, forms, onError }: Props) {
  const [sectionId, setSectionId] = useState(value.sections[0]?.id ?? "");
  const [blockId, setBlockId] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const selectedSection = value.sections.find((section) => section.id === sectionId);
  const selectedBlock = selectedSection?.blocks.find((block) => block.id === blockId);
  const commit = (sections: PageBuilderSection[]) => onChange({ version: 1, sections });
  const patchSection = (id: string, patch: Partial<PageBuilderSection>) => commit(value.sections.map((section) => section.id === id ? { ...section, ...patch } : section));

  useEffect(() => {
    if (sectionId && !value.sections.some((section) => section.id === sectionId)) { setSectionId(value.sections[0]?.id ?? ""); setBlockId(""); }
  }, [value.sections, sectionId]);

  function addSection() { const section = newSection(value.sections.length); commit([...value.sections, section]); setSectionId(section.id); setBlockId(""); }
  function addBlock(type: PageBlockType) {
    const block = newBlock(type);
    if (!selectedSection) { const section = newSection(value.sections.length); section.blocks = [block]; commit([...value.sections, section]); setSectionId(section.id); }
    else patchSection(selectedSection.id, { blocks: [...selectedSection.blocks, block] });
    setBlockId(block.id);
  }
  function whitepaperTemplate() {
    if (value.sections.length && !window.confirm("Replace the current visual sections with the whitepaper template?")) return;
    const hero = newSection(0); hero.name = "Whitepaper hero"; hero.width = "full"; hero.padding = "none"; hero.blocks = [{ ...newBlock("hero"), eyebrow: "SalesInfoPro research", heading: "A practical guide for modern decision-makers", text: "Summarise the whitepaper’s strongest outcome and give readers a reason to continue.", buttonLabel: "Get the whitepaper", buttonHref: "#form-primary-form" }];
    const overview = newSection(1); overview.name = "Research overview"; overview.columns = 2; overview.background = "#f4f4f1"; overview.blocks = [{ ...newBlock("points"), heading: "Inside the whitepaper", items: ["The problem and why it matters now", "Evidence, analysis and practical recommendations", "A clear next-step framework"] }, { ...newBlock("form"), id: "primary-form", column: 1, heading: "Download the whitepaper", text: "Share your details to receive the complete report.", formId: forms[0]?.id ?? "" }];
    const contact = newSection(2); contact.name = "Speak with the team"; contact.columns = 2; contact.background = "#11131a"; contact.textColor = "#ffffff"; contact.blocks = [{ ...newBlock("heading"), heading: "Have a specific question?", text: "", column: 0 }, { ...newBlock("text"), text: "Use the second form for sales, partnership or expert follow-up enquiries.", column: 0 }, { ...newBlock("form"), heading: "Contact our research team", text: "Tell us what you need and the right person will respond.", formId: forms[1]?.id ?? forms[0]?.id ?? "", column: 1, theme: "dark" }];
    const close = newSection(3); close.name = "Closing action"; close.blocks = [{ ...newBlock("cta"), heading: "Turn the research into action", text: "Explore more SalesInfoPro intelligence or speak with the team.", buttonLabel: "Explore research", buttonHref: "/resources" }];
    commit([hero, overview, contact, close]); setSectionId(hero.id); setBlockId(hero.blocks[0].id);
  }
  function patchBlock(patch: Partial<PageBlock>) {
    if (!selectedSection || !selectedBlock) return;
    patchSection(selectedSection.id, { blocks: selectedSection.blocks.map((block) => block.id === selectedBlock.id ? { ...block, ...patch } : block) });
  }
  function copySection(section: PageBuilderSection) {
    const copy = { ...section, id: uid("section"), name: `${section.name} copy`, blocks: section.blocks.map((block) => ({ ...block, id: uid("block"), items: [...block.items] })) };
    const next = [...value.sections]; next.splice(value.sections.indexOf(section) + 1, 0, copy); commit(next); setSectionId(copy.id); setBlockId("");
  }
  function removeSection(section: PageBuilderSection) { if (window.confirm(`Remove “${section.name}” and all its blocks?`)) commit(value.sections.filter((item) => item.id !== section.id)); }
  function copyBlock(section: PageBuilderSection, block: PageBlock) {
    const copy = { ...block, id: uid("block"), items: [...block.items] }; const next = [...section.blocks]; next.splice(section.blocks.indexOf(block) + 1, 0, copy); patchSection(section.id, { blocks: next }); setBlockId(copy.id);
  }
  function removeBlock(section: PageBuilderSection, block: PageBlock) { patchSection(section.id, { blocks: section.blocks.filter((item) => item.id !== block.id) }); setBlockId(""); }
  function moveSections(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const blockSection = value.sections.find((section) => section.blocks.some((block) => block.id === event.active.id));
    if (blockSection) {
      const from = blockSection.blocks.findIndex((block) => block.id === event.active.id), to = blockSection.blocks.findIndex((block) => block.id === event.over!.id);
      if (from >= 0 && to >= 0) patchSection(blockSection.id, { blocks: arrayMove(blockSection.blocks, from, to) });
      return;
    }
    const from = value.sections.findIndex((item) => item.id === event.active.id), to = value.sections.findIndex((item) => item.id === event.over!.id);
    if (from >= 0 && to >= 0) commit(arrayMove(value.sections, from, to));
  }

  return <div className="vpb-shell">
    <header className="vpb-top"><div><b>Visual page builder</b><span>{value.sections.length} sections · {value.sections.reduce((n, s) => n + s.blocks.length, 0)} blocks</span></div><div>{(["desktop", "tablet", "mobile"] as const).map((size) => <button type="button" className={viewport === size ? "active" : ""} onClick={() => setViewport(size)} key={size}>{size}</button>)}</div></header>
    <div className="vpb-workspace">
      <aside className="vpb-library"><h3>Add a block</h3><p>Select a section, then add content.</p><div>{LIBRARY.map((item) => <button type="button" onClick={() => addBlock(item.type)} key={item.type}><i>{item.icon}</i><span>{item.label}</span></button>)}</div><button type="button" className="vpb-add-section" onClick={addSection}>+ Add section</button><button type="button" className="vpb-template" onClick={whitepaperTemplate}>Use whitepaper template</button><small><b>Two whitepaper forms?</b> The template includes both; choose a different reusable form in each block.</small></aside>
      <main className={`vpb-stage vpb-${viewport}`}><div className="vpb-page">
        {value.sections.length === 0 ? <div className="vpb-empty"><b>Build your first section</b><p>Start with a hero or an empty section.</p><button type="button" onClick={() => addBlock("hero")}>Add a hero</button></div> :
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={moveSections}><SortableContext items={value.sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>{value.sections.map((section, index) => <SortableSection key={section.id} section={section} index={index} selectedSectionId={sectionId} selectedBlockId={blockId} onSelectSection={() => { setSectionId(section.id); setBlockId(""); }} onSelectBlock={(id) => { setSectionId(section.id); setBlockId(id); }} onCopy={() => copySection(section)} onRemove={() => removeSection(section)} onCopyBlock={(block) => copyBlock(section, block)} onRemoveBlock={(block) => removeBlock(section, block)} />)}</SortableContext></DndContext>}
      </div></main>
      <aside className="vpb-inspector">{selectedBlock && selectedSection ? <BlockInspector block={selectedBlock} section={selectedSection} forms={forms} onChange={patchBlock} onError={onError} /> : selectedSection ? <SectionInspector section={selectedSection} onChange={(patch) => patchSection(selectedSection.id, patch)} /> : <div className="vpb-no-selection"><b>Nothing selected</b><span>Select a section or block on the canvas.</span></div>}</aside>
    </div>
  </div>;
}

function SortableSection({ section, index, selectedSectionId, selectedBlockId, onSelectSection, onSelectBlock, onCopy, onRemove, onCopyBlock, onRemoveBlock }: {
  section: PageBuilderSection; index: number; selectedSectionId: string; selectedBlockId: string; onSelectSection: () => void;
  onSelectBlock: (id: string) => void; onCopy: () => void; onRemove: () => void; onCopyBlock: (block: PageBlock) => void; onRemoveBlock: (block: PageBlock) => void;
}) {
  const sortable = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition, zIndex: sortable.isDragging ? 3 : undefined, background: section.background, color: section.textColor };
  const columns = section.columns === 2 ? [0, 1] as const : [0] as const;
  return <section ref={sortable.setNodeRef} style={style} className={`vpb-section vpb-pad-${section.padding}${selectedSectionId === section.id && !selectedBlockId ? " selected" : ""}`} onClick={onSelectSection}>
    <div className="vpb-section-bar"><button type="button" {...sortable.attributes} {...sortable.listeners} aria-label={`Move ${section.name}`}>⠿</button><b>{index + 1}. {section.name}</b><span>{section.width} · {section.columns} column{section.columns === 2 ? "s" : ""}</span><button type="button" onClick={(e) => { e.stopPropagation(); onCopy(); }}>Copy</button><button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}>Remove</button></div>
    <div className={`vpb-section-content vpb-width-${section.width} vpb-cols-${section.columns}`}>
      {columns.map((column) => { const columnBlocks = section.blocks.filter((block) => block.column === column); return <div className="vpb-column" key={column}><SortableContext items={columnBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>{columnBlocks.map((block) => <SortableBlock block={block} selected={selectedBlockId === block.id} onSelect={() => onSelectBlock(block.id)} onCopy={() => onCopyBlock(block)} onRemove={() => onRemoveBlock(block)} key={block.id} />)}</SortableContext>{columnBlocks.length === 0 && <div className="vpb-column-empty">Add a block here</div>}</div>; })}
    </div>
  </section>;
}

function SortableBlock({ block, selected, onSelect, onCopy, onRemove }: { block: PageBlock; selected: boolean; onSelect: () => void; onCopy: () => void; onRemove: () => void }) {
  const sortable = useSortable({ id: block.id });
  return <div ref={sortable.setNodeRef} style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition, opacity: sortable.isDragging ? .55 : 1 }} className={`vpb-block${selected ? " selected" : ""}`} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
    <div className="vpb-block-bar"><button type="button" {...sortable.attributes} {...sortable.listeners} aria-label={`Move ${block.type}`}>⠿</button><span>{block.type}</span><button type="button" onClick={(e) => { e.stopPropagation(); onCopy(); }}>Copy</button><button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button></div><BlockPreview block={block} />
  </div>;
}

function BlockPreview({ block }: { block: PageBlock }) {
  const align = { textAlign: block.align } as const;
  if (block.type === "hero") return <div className={`vpb-preview-hero theme-${block.theme}`} style={align}>{block.eyebrow && <small>{block.eyebrow}</small>}<h1>{block.heading || "Hero headline"}</h1>{block.text && <p>{block.text}</p>}<PreviewButtons block={block} />{block.image && <img src={block.image} alt={block.imageAlt} />}</div>;
  if (block.type === "heading") return block.level === "h3" ? <h3 style={align}>{block.heading || "Heading"}</h3> : <h2 style={align}>{block.heading || "Heading"}</h2>;
  if (block.type === "text") return <div className="vpb-preview-text" style={align}>{(block.text || "Text block").split(/\n{2,}/).map((text, index) => <p key={index}>{text}</p>)}</div>;
  if (block.type === "image") return <figure className="vpb-preview-image">{block.image ? <img src={block.image} alt={block.imageAlt} /> : <div>Image</div>}{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  if (block.type === "points") return <div className="vpb-preview-points" style={align}>{block.heading && <h2>{block.heading}</h2>}<ul>{block.items.map((item, index) => <li key={index}><i>✓</i>{item}</li>)}</ul></div>;
  if (block.type === "cta") return <div className={`vpb-preview-cta theme-${block.theme}`} style={align}><h2>{block.heading || "Call to action"}</h2>{block.text && <p>{block.text}</p>}<PreviewButtons block={block} /></div>;
  if (block.type === "form") return <div className={`vpb-preview-form theme-${block.theme}`}><small>FORM</small><h2>{block.heading || "Lead form"}</h2><p>{block.text}</p><div><i /><i /><i /></div><button type="button">Submit</button></div>;
  return <div style={{ height: block.height }} className="vpb-preview-spacer"><span>{block.height}px space</span></div>;
}

function PreviewButtons({ block }: { block: PageBlock }) {
  return <div className="vpb-preview-buttons">{block.buttonLabel && <span>{block.buttonLabel}</span>}{block.secondaryLabel && <span>{block.secondaryLabel}</span>}</div>;
}

function SectionInspector({ section, onChange }: { section: PageBuilderSection; onChange: (patch: Partial<PageBuilderSection>) => void }) {
  return <div className="vpb-fields"><InspectorTitle type="Section" title={section.name} /><Field label="Section name"><input value={section.name} onChange={(e) => onChange({ name: e.target.value })} /></Field><div className="vpb-field-grid"><Field label="Columns"><select value={section.columns} onChange={(e) => onChange({ columns: Number(e.target.value) as 1 | 2 })}><option value="1">One</option><option value="2">Two</option></select></Field><Field label="Content width"><select value={section.width} onChange={(e) => onChange({ width: e.target.value as PageBuilderSection["width"] })}><option value="contained">Contained</option><option value="wide">Wide</option><option value="full">Full width</option></select></Field></div><Field label="Vertical spacing"><select value={section.padding} onChange={(e) => onChange({ padding: e.target.value as PageBuilderSection["padding"] })}><option value="none">None</option><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></Field><div className="vpb-field-grid"><Field label="Background"><input type="color" value={section.background} onChange={(e) => onChange({ background: e.target.value })} /></Field><Field label="Text colour"><input type="color" value={section.textColor} onChange={(e) => onChange({ textColor: e.target.value })} /></Field></div>{section.columns === 2 && <p className="vpb-help">Select a block to place it in the left or right column.</p>}</div>;
}

function BlockInspector({ block, section, forms, onChange, onError }: { block: PageBlock; section: PageBuilderSection; forms: FormDefinition[]; onChange: (patch: Partial<PageBlock>) => void; onError: (message: string) => void }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) {
    if (!file) return; setUploading(true);
    try { const result = await uploadFile(file); onChange({ image: result.url }); } catch (error) { onError((error as Error).message); } finally { setUploading(false); }
  }
  return <div className="vpb-fields"><InspectorTitle type="Block" title={LIBRARY.find((item) => item.type === block.type)?.label || block.type} />
    {section.columns === 2 && <Field label="Column"><select value={block.column} onChange={(e) => onChange({ column: Number(e.target.value) as 0 | 1 })}><option value="0">Left</option><option value="1">Right</option></select></Field>}
    {block.type === "hero" && <><Field label="Eyebrow"><input value={block.eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} /></Field><Heading block={block} onChange={onChange} /><Text block={block} onChange={onChange} /><Buttons block={block} onChange={onChange} /><Image block={block} uploading={uploading} upload={upload} onChange={onChange} /><Theme block={block} onChange={onChange} /><Align block={block} onChange={onChange} /></>}
    {block.type === "heading" && <><Heading block={block} onChange={onChange} /><div className="vpb-field-grid"><Field label="Heading level"><select value={block.level} onChange={(e) => onChange({ level: e.target.value as PageBlock["level"] })}><option value="h2">H2 — main content</option><option value="h3">H3 — subsection/sidebar</option></select></Field><Align block={block} onChange={onChange} /></div></>}
    {block.type === "text" && <><Text block={block} onChange={onChange} rows={10} /><Align block={block} onChange={onChange} /></>}
    {block.type === "image" && <Image block={block} uploading={uploading} upload={upload} onChange={onChange} />}
    {block.type === "points" && <><Heading block={block} onChange={onChange} /><Field label="Points">{block.items.map((item, index) => <div className="vpb-point" key={index}><input value={item} onChange={(e) => onChange({ items: block.items.map((value, i) => i === index ? e.target.value : value) })} /><button type="button" onClick={() => onChange({ items: block.items.filter((_, i) => i !== index) })}>×</button></div>)}<button type="button" className="vpb-mini" onClick={() => onChange({ items: [...block.items, "New point"] })}>+ Add point</button></Field><Align block={block} onChange={onChange} /></>}
    {block.type === "cta" && <><Heading block={block} onChange={onChange} /><Text block={block} onChange={onChange} /><Buttons block={block} onChange={onChange} /><Theme block={block} onChange={onChange} /><Align block={block} onChange={onChange} /></>}
    {block.type === "form" && <><Heading block={block} onChange={onChange} /><Text block={block} onChange={onChange} /><Field label="Reusable form"><select value={block.formId} onChange={(e) => onChange({ formId: e.target.value })}><option value="">Select a form</option>{forms.map((form) => <option value={form.id} key={form.id}>{form.name}{form.status === "draft" ? " (draft)" : ""}</option>)}</select></Field><Theme block={block} onChange={onChange} /><p className="vpb-help">For two whitepaper forms, add a second Form block and select another form.</p></>}
    {block.type === "spacer" && <Field label={`Height — ${block.height}px`}><input type="range" min="16" max="400" step="8" value={block.height} onChange={(e) => onChange({ height: Number(e.target.value) })} /></Field>}
  </div>;
}

function InspectorTitle({ type, title }: { type: string; title: string }) { return <div className="vpb-inspector-title"><span>{type}</span><h3>{title}</h3></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="vpb-field"><span>{label}</span>{children}</label>; }
function Heading({ block, onChange }: { block: PageBlock; onChange: (patch: Partial<PageBlock>) => void }) { return <Field label="Heading"><textarea rows={3} value={block.heading} onChange={(e) => onChange({ heading: e.target.value })} /></Field>; }
function Text({ block, onChange, rows = 5 }: { block: PageBlock; onChange: (patch: Partial<PageBlock>) => void; rows?: number }) { return <Field label="Text"><textarea rows={rows} value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Use a blank line between paragraphs." /></Field>; }
function Align({ block, onChange }: { block: PageBlock; onChange: (patch: Partial<PageBlock>) => void }) { return <Field label="Alignment"><select value={block.align} onChange={(e) => onChange({ align: e.target.value as PageBlock["align"] })}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></Field>; }
function Theme({ block, onChange }: { block: PageBlock; onChange: (patch: Partial<PageBlock>) => void }) { return <Field label="Theme"><select value={block.theme} onChange={(e) => onChange({ theme: e.target.value as PageBlock["theme"] })}><option value="light">Light</option><option value="dark">Dark</option><option value="accent">Brand red</option></select></Field>; }
function Buttons({ block, onChange }: { block: PageBlock; onChange: (patch: Partial<PageBlock>) => void }) { return <><div className="vpb-field-grid"><Field label="Primary button"><input value={block.buttonLabel} onChange={(e) => onChange({ buttonLabel: e.target.value })} /></Field><Field label="Primary link"><input value={block.buttonHref} onChange={(e) => onChange({ buttonHref: e.target.value })} placeholder="/contact or #form" /></Field></div><div className="vpb-field-grid"><Field label="Secondary button"><input value={block.secondaryLabel} onChange={(e) => onChange({ secondaryLabel: e.target.value })} /></Field><Field label="Secondary link"><input value={block.secondaryHref} onChange={(e) => onChange({ secondaryHref: e.target.value })} /></Field></div></>; }
function Image({ block, uploading, upload, onChange }: { block: PageBlock; uploading: boolean; upload: (file?: File) => void; onChange: (patch: Partial<PageBlock>) => void }) { return <><Field label="Image URL"><input value={block.image} onChange={(e) => onChange({ image: e.target.value })} placeholder="https://…" /></Field><Field label={uploading ? "Uploading…" : "Upload image"}><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} /></Field><Field label="Alternative text"><input value={block.imageAlt} onChange={(e) => onChange({ imageAlt: e.target.value })} /></Field>{block.type === "image" && <Field label="Caption"><input value={block.caption} onChange={(e) => onChange({ caption: e.target.value })} /></Field>}</>; }
