"use client";

import { useState } from "react";
import { CHOICE_TYPES, type FormDefinition, type FormField } from "@/lib/types";

/** Renders a form built in the admin panel, and posts it back. */
export default function DynamicForm({ form }: { form: FormDefinition }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function set(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values)
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Something went wrong.");
      setDone(payload.data.message as string);
      setValues({});
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="dyn-form">
        <p className="dyn-form-done" role="status">{done}</p>
      </div>
    );
  }

  return (
    <form className="dyn-form" onSubmit={submit}>
      {form.description && <p className="dyn-form-intro">{form.description}</p>}
      {error && <p className="dyn-form-error" role="alert">{error}</p>}

      <div className="dyn-form-grid">
        {form.fields.map((field) => (
          <Field key={field.id} field={field} value={values[field.name] ?? ""} onChange={set} />
        ))}
      </div>

      <button type="submit" disabled={busy}>
        {busy ? "Sending…" : form.submitLabel}
      </button>
    </form>
  );
}

function Field({
  field,
  value,
  onChange
}: {
  field: FormField;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  const label = (
    <span>
      {field.label}
      {field.required && <b aria-hidden="true"> *</b>}
    </span>
  );

  if (field.type === "checkbox") {
    return (
      <label className={`dyn-field dyn-${field.width} dyn-field-check`}>
        <input
          type="checkbox"
          checked={value === "Yes"}
          required={field.required}
          onChange={(e) => onChange(field.name, e.target.checked ? "Yes" : "")}
        />
        {label}
        {field.help && <small>{field.help}</small>}
      </label>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset className={`dyn-field dyn-${field.width}`}>
        <legend>{label}</legend>
        {field.options.map((option) => (
          <label className="dyn-radio" key={option}>
            <input
              type="radio"
              name={field.name}
              value={option}
              checked={value === option}
              required={field.required}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
            {option}
          </label>
        ))}
        {field.help && <small>{field.help}</small>}
      </fieldset>
    );
  }

  return (
    <label className={`dyn-field dyn-${field.width}`}>
      {label}
      {field.type === "textarea" ? (
        <textarea
          rows={5}
          value={value}
          placeholder={field.placeholder}
          required={field.required}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      ) : CHOICE_TYPES.includes(field.type) ? (
        <select value={value} required={field.required} onChange={(e) => onChange(field.name, e.target.value)}>
          <option value="">{field.placeholder || "Choose one…"}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          required={field.required}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}
      {field.help && <small>{field.help}</small>}
    </label>
  );
}
