import { read, update, write } from "./store";
import { seedSections } from "./seed";
import { slugify, type Section } from "./types";

const COLLECTION = "sections";
const seed = () => seedSections();

export async function listSections(): Promise<Section[]> {
  const sections = await read<Section[]>(COLLECTION, seed);
  return [...sections].sort((a, b) => a.order - b.order);
}

export async function getSection(id: string) {
  return (await listSections()).find((s) => s.id === id);
}

export async function sectionLabels(): Promise<Record<string, string>> {
  const sections = await listSections();
  return Object.fromEntries(sections.map((s) => [s.id, s.label]));
}

export async function navSections() {
  return (await listSections()).filter((s) => s.showInNav);
}

export async function createSection(input: Partial<Section> & { label: string }): Promise<Section> {
  const existing = await listSections();
  const id = slugify(input.id || input.label) || `section-${Date.now()}`;
  if (existing.some((s) => s.id === id)) throw new Error(`A section with the id "${id}" already exists.`);

  const section: Section = {
    id,
    label: input.label.trim(),
    eyebrow: (input.eyebrow || input.label).toUpperCase(),
    heading: input.heading?.trim() || `${input.label.trim()}.`,
    cta: input.cta?.trim() || "See all stories",
    order: input.order ?? existing.length + 1,
    showInNav: input.showInNav ?? true,
    showOnHome: input.showOnHome ?? true
  };

  await update<Section[]>(COLLECTION, seed, (current) => [...current, section]);
  return section;
}

export async function updateSection(id: string, input: Partial<Section>): Promise<Section | undefined> {
  let saved: Section | undefined;
  await update<Section[]>(COLLECTION, seed, (current) =>
    current.map((section) => {
      if (section.id !== id) return section;
      saved = {
        ...section,
        label: input.label?.trim() ?? section.label,
        eyebrow: input.eyebrow?.toUpperCase() ?? section.eyebrow,
        heading: input.heading?.trim() ?? section.heading,
        cta: input.cta?.trim() ?? section.cta,
        order: input.order ?? section.order,
        showInNav: input.showInNav ?? section.showInNav,
        showOnHome: input.showOnHome ?? section.showOnHome
      };
      return saved;
    })
  );
  return saved;
}

export async function replaceSections(sections: Section[]) {
  return write(COLLECTION, sections);
}

export async function deleteSection(id: string): Promise<boolean> {
  let removed = false;
  await update<Section[]>(COLLECTION, seed, (current) =>
    current.filter((section) => {
      if (section.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}
