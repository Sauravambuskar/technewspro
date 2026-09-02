import { newId, now, read, update } from "./store";
import {
  CHOICE_TYPES,
  fieldName,
  isFieldType,
  type ArticleStatus,
  type FormDefinition,
  type FormField,
  type FormSubmission
} from "./types";

const FORMS = "forms";
const SUBMISSIONS = "formSubmissions";

// Forms are authored, never seeded.
const seedForms = (): FormDefinition[] => [];
const seedSubmissions = (): FormSubmission[] => [];

/* ------------------------------------------------------------ definitions */

/** Fills in anything a hand-written or older payload left out. */
function normaliseField(input: unknown, index: number): FormField {
  const raw = (input ?? {}) as Partial<FormField>;
  const type = isFieldType(raw.type) ? raw.type : "text";
  const label = typeof raw.label === "string" && raw.label.trim() ? raw.label.trim() : `Field ${index + 1}`;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    type,
    label,
    name: fieldName(typeof raw.name === "string" && raw.name ? raw.name : label, `field_${index + 1}`),
    placeholder: typeof raw.placeholder === "string" ? raw.placeholder : "",
    help: typeof raw.help === "string" ? raw.help : "",
    required: Boolean(raw.required),
    // Only the choice types carry options; everything else stores an empty list.
    options: CHOICE_TYPES.includes(type) && Array.isArray(raw.options)
      ? raw.options.map((o) => String(o).trim()).filter(Boolean)
      : [],
    width: raw.width === "half" ? "half" : "full"
  };
}

function normaliseFields(input: unknown): FormField[] {
  const list = Array.isArray(input) ? input : [];
  const fields = list.map(normaliseField);

  // Two fields storing under the same key would overwrite each other.
  const seen = new Set<string>();
  return fields.map((field, i) => {
    let name = field.name;
    let suffix = 2;
    while (seen.has(name)) name = `${field.name}_${suffix++}`;
    seen.add(name);
    return { ...field, name };
  });
}

export async function allForms(): Promise<FormDefinition[]> {
  const forms = await read<FormDefinition[]>(FORMS, seedForms);
  return forms
    .map((f) => ({ ...f, fields: normaliseFields(f.fields) }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listForms(status: ArticleStatus | "all" = "published") {
  const forms = await allForms();
  return status === "all" ? forms : forms.filter((f) => f.status === status);
}

export async function getFormById(id: string) {
  return (await allForms()).find((f) => f.id === id);
}

export type FormInput = Partial<Omit<FormDefinition, "id" | "createdAt" | "updatedAt" | "fields">> & {
  fields?: unknown;
};

export async function createForm(input: FormInput & { name: string }): Promise<FormDefinition> {
  const stamp = now();
  const form: FormDefinition = {
    id: newId(),
    name: input.name.trim(),
    description: input.description?.trim() || "",
    fields: normaliseFields(input.fields),
    submitLabel: input.submitLabel?.trim() || "Submit",
    successMessage: input.successMessage?.trim() || "Thanks — we've got it.",
    status: input.status === "published" ? "published" : "draft",
    createdAt: stamp,
    updatedAt: stamp
  };

  await update<FormDefinition[]>(FORMS, seedForms, (current) => [form, ...current]);
  return form;
}

export async function updateForm(id: string, input: FormInput): Promise<FormDefinition | undefined> {
  let saved: FormDefinition | undefined;

  await update<FormDefinition[]>(FORMS, seedForms, (current) =>
    current.map((form) => {
      if (form.id !== id) return form;
      saved = {
        ...form,
        name: input.name?.trim() ?? form.name,
        description: input.description?.trim() ?? form.description,
        fields: input.fields !== undefined ? normaliseFields(input.fields) : normaliseFields(form.fields),
        submitLabel: input.submitLabel?.trim() || form.submitLabel,
        successMessage: input.successMessage?.trim() || form.successMessage,
        status: input.status ?? form.status,
        updatedAt: now()
      };
      return saved;
    })
  );

  return saved;
}

export async function deleteForm(id: string): Promise<boolean> {
  let removed = false;
  await update<FormDefinition[]>(FORMS, seedForms, (current) =>
    current.filter((form) => {
      if (form.id !== id) return true;
      removed = true;
      return false;
    })
  );
  // Answers to a deleted form have nothing to belong to.
  if (removed) {
    await update<FormSubmission[]>(SUBMISSIONS, seedSubmissions, (current) =>
      current.filter((s) => s.formId !== id)
    );
  }
  return removed;
}

/* ------------------------------------------------------------ submissions */

export async function allSubmissions(): Promise<FormSubmission[]> {
  const rows = await read<FormSubmission[]>(SUBMISSIONS, seedSubmissions);
  return [...rows].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listSubmissions(formId?: string) {
  const rows = await allSubmissions();
  return formId ? rows.filter((s) => s.formId === formId) : rows;
}

export async function countSubmissions(): Promise<Record<string, number>> {
  return (await allSubmissions()).reduce<Record<string, number>>((counts, s) => {
    counts[s.formId] = (counts[s.formId] ?? 0) + 1;
    return counts;
  }, {});
}

/**
 * Validates an answer set against the form and stores it. Only fields the form
 * actually declares are kept, so a tampered payload can't add its own keys.
 */
export async function recordSubmission(
  form: FormDefinition,
  input: Record<string, unknown>
): Promise<{ submission?: FormSubmission; errors: string[] }> {
  const values: Record<string, string> = {};
  const errors: string[] = [];

  for (const field of form.fields) {
    const raw = input[field.name];
    const value = typeof raw === "string" ? raw.trim() : raw === true ? "Yes" : "";

    if (field.required && !value) {
      errors.push(`${field.label} is required.`);
      continue;
    }
    if (!value) continue;

    if (value.length > 5000) {
      errors.push(`${field.label} is too long.`);
      continue;
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      errors.push(`${field.label} must be a valid email address.`);
      continue;
    }
    // A tampered dropdown shouldn't be able to store an answer you never offered.
    if (CHOICE_TYPES.includes(field.type) && field.options.length > 0 && !field.options.includes(value)) {
      errors.push(`${field.label} must be one of the listed options.`);
      continue;
    }

    values[field.name] = value;
  }

  if (errors.length > 0) return { errors };

  const submission: FormSubmission = {
    id: newId(),
    formId: form.id,
    values,
    createdAt: now()
  };

  await update<FormSubmission[]>(SUBMISSIONS, seedSubmissions, (current) => [submission, ...current]);
  return { submission, errors: [] };
}

export async function deleteSubmission(id: string): Promise<boolean> {
  let removed = false;
  await update<FormSubmission[]>(SUBMISSIONS, seedSubmissions, (current) =>
    current.filter((s) => {
      if (s.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

/** CSV of one form's answers, columns in the form's own field order. */
export function submissionsToCsv(form: FormDefinition, rows: FormSubmission[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = ["Submitted", ...form.fields.map((f) => f.label)];
  const lines = rows.map((row) => [row.createdAt, ...form.fields.map((f) => row.values[f.name] ?? "")]);
  return [header, ...lines].map((cells) => cells.map((c) => escape(String(c))).join(",")).join("\n");
}
