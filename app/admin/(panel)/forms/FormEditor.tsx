"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, send } from "../../apiClient";
import {
  CHOICE_TYPES,
  FIELD_TYPES,
  FIELD_TYPE_LABELS,
  fieldName,
  type FieldType,
  type FormDefinition,
  type FormField
} from "@/lib/types";

type Draft = {
  name: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  status: "draft" | "published";
  fields: FormField[];
};

function blankField(index: number): FormField {
  return {
    // A temporary id; the server assigns the stored one on save.
    id: `new-${Date.now()}-${index}`,
    type: "text",
    label: "New field",
    name: `field_${index + 1}`,
    placeholder: "",
    help: "",
    required: false,
    options: [],
    width: "full"
  };
}

function toDraft(form: FormDefinition | undefined): Draft {
  if (!form) {
    return {
      name: "",
      description: "",
      submitLabel: "Submit",
      successMessage: "Thanks — we've got it.",
      status: "draft",
      fields: [
        { ...blankField(0), type: "text", label: "Full name", name: "full_name", required: true, width: "half" },
        { ...blankField(1), type: "email", label: "Email", name: "email", required: true, width: "half" },
        { ...blankField(2), type: "textarea", label: "Message", name: "message", required: true }
      ]
    };
  }
  return {
    name: form.name,
    description: form.description,
    submitLabel: form.submitLabel,
    successMessage: form.successMessage,
    status: form.status,
    fields: form.fields
  };
}

export default function FormEditor({ form }: { form?: FormDefinition }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(form));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [openField, setOpenField] = useState<string | null>(null);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved("");
  }

  function editField(id: string, patch: Partial<FormField>) {
    set(
      "fields",
      draft.fields.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );
  }

  function addField() {
    const field = blankField(draft.fields.length);
    set("fields", [...draft.fields, field]);
    setOpenField(field.id);
  }

  function removeField(id: string) {
    set("fields", draft.fields.filter((field) => field.id !== id));
  }

  function moveField(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= draft.fields.length) return;
    const next = [...draft.fields];
    [next[index], next[target]] = [next[target], next[index]];
    set("fields", next);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("Give the form a name before saving.");
      return;
    }
    if (draft.fields.length === 0) {
      setError("A form needs at least one field.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (form) {
        await send(`/api/forms/${form.id}`, "PATCH", draft);
        setSaved("Saved.");
        router.refresh();
      } else {
        const created = await api<FormDefinition>("/api/forms", { method: "POST", body: JSON.stringify(draft) });
        router.replace(`/admin/forms/${created.id}`);
        router.refresh();
      }
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!form) return;
    if (!window.confirm(`Delete “${form.name}” and every answer sent to it? This cannot be undone.`)) return;

    setBusy(true);
    try {
      await send(`/api/forms/${form.id}`, "DELETE");
      router.replace("/admin/forms");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}
      {saved && <p className="adm-note adm-note-ok" role="status">{saved}</p>}

      <div className="adm-card" data-tour="form-basics">
        <h2>The form</h2>
        <p className="adm-card-note">
          Its name is for you — readers never see it. Everything else here appears around the fields.
        </p>

        <div className="adm-grid-2">
          <label className="adm-field">
            <span>NAME</span>
            <input type="text" value={draft.name} onChange={(e) => set("name", e.target.value)} required />
            <small>e.g. “Advertise with us enquiry”.</small>
          </label>

          <label className="adm-field">
            <span>SUBMIT BUTTON TEXT</span>
            <input type="text" value={draft.submitLabel} onChange={(e) => set("submitLabel", e.target.value)} />
          </label>
        </div>

        <label className="adm-field">
          <span>INTRO (OPTIONAL)</span>
          <textarea
            rows={2}
            style={{ minHeight: 60 }}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <small>Shown above the first field.</small>
        </label>

        <label className="adm-field">
          <span>THANK-YOU MESSAGE</span>
          <input
            type="text"
            value={draft.successMessage}
            onChange={(e) => set("successMessage", e.target.value)}
          />
          <small>Replaces the form once it has been sent.</small>
        </label>
      </div>

      <div className="adm-card" data-tour="form-fields">
        <h2>Fields</h2>
        <p className="adm-card-note">
          Add what you need to collect, in the order you want it asked. Click a field to open its settings.
        </p>

        {draft.fields.length === 0 && <p className="adm-empty">No fields yet.</p>}

        {draft.fields.map((field, index) => {
          const open = openField === field.id;
          return (
            <div className={`adm-fb-field${open ? " adm-fb-open" : ""}`} key={field.id}>
              <div className="adm-fb-head">
                <span className="adm-handle">{String(index + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  className="adm-fb-summary"
                  onClick={() => setOpenField(open ? null : field.id)}
                  aria-expanded={open}
                >
                  <b>{field.label || "Untitled field"}</b>
                  <span>
                    {FIELD_TYPE_LABELS[field.type]}
                    {field.required && " · required"}
                    {field.width === "half" && " · half width"}
                  </span>
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => moveField(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => moveField(index, 1)}
                  disabled={index === draft.fields.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  onClick={() => removeField(field.id)}
                >
                  Remove
                </button>
              </div>

              {open && (
                <div className="adm-fb-body">
                  <div className="adm-grid-2">
                    <label className="adm-field">
                      <span>LABEL</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          editField(field.id, {
                            label: e.target.value,
                            name: fieldName(e.target.value, field.name)
                          })
                        }
                      />
                    </label>

                    <label className="adm-field">
                      <span>TYPE</span>
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const type = e.target.value as FieldType;
                          editField(field.id, {
                            type,
                            // Seed the list so a new dropdown isn't empty.
                            options: CHOICE_TYPES.includes(type) && field.options.length === 0
                              ? ["First option", "Second option"]
                              : field.options
                          });
                        }}
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>{FIELD_TYPE_LABELS[type]}</option>
                        ))}
                      </select>
                    </label>

                    {field.type !== "checkbox" && (
                      <label className="adm-field">
                        <span>PLACEHOLDER</span>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => editField(field.id, { placeholder: e.target.value })}
                        />
                      </label>
                    )}

                    <label className="adm-field">
                      <span>WIDTH</span>
                      <select
                        value={field.width}
                        onChange={(e) => editField(field.id, { width: e.target.value as FormField["width"] })}
                      >
                        <option value="full">Full width</option>
                        <option value="half">Half width</option>
                      </select>
                    </label>
                  </div>

                  {CHOICE_TYPES.includes(field.type) && (
                    <label className="adm-field">
                      <span>OPTIONS — ONE PER LINE</span>
                      <textarea
                        rows={4}
                        value={field.options.join("\n")}
                        onChange={(e) =>
                          editField(field.id, {
                            options: e.target.value.split(/\n/).map((o) => o.trim()).filter(Boolean)
                          })
                        }
                      />
                      <small>{field.options.length} option{field.options.length === 1 ? "" : "s"}</small>
                    </label>
                  )}

                  <label className="adm-field">
                    <span>HELP TEXT (OPTIONAL)</span>
                    <input
                      type="text"
                      value={field.help}
                      onChange={(e) => editField(field.id, { help: e.target.value })}
                    />
                  </label>

                  <label className="adm-check">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => editField(field.id, { required: e.target.checked })}
                    />
                    Required — the form can&rsquo;t be sent without it
                  </label>

                  <p className="adm-fb-key">
                    Stored as <code>{field.name}</code>
                  </p>
                </div>
              )}
            </div>
          );
        })}

        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={addField} style={{ marginTop: 12 }}>
          + Add field
        </button>
      </div>

      <div className="adm-card" data-tour="form-publishing">
        <h2>Publishing</h2>
        <p className="adm-card-note">
          A draft form stays hidden even on a published page. Attach a live form to a page under
          {" "}<Link href="/admin/pages">Pages</Link>.
        </p>

        <label className="adm-field" style={{ maxWidth: 260 }}>
          <span>STATUS</span>
          <select value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <div className="adm-form-actions">
          <button className="adm-btn adm-btn-accent" type="submit" disabled={busy}>
            {busy ? "Saving…" : form ? "Save changes" : "Create form"}
          </button>
          <Link className="adm-btn adm-btn-ghost" href="/admin/forms">Back to forms</Link>
          {form && (
            <Link className="adm-btn adm-btn-ghost" href={`/admin/forms/${form.id}/submissions`}>
              View responses
            </Link>
          )}
          {form && (
            <button className="adm-btn adm-btn-danger" type="button" onClick={remove} disabled={busy}>
              Delete form
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
