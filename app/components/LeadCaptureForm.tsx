"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  intent: Lead["intent"];
  resourceId?: string;
  submitLabel?: string;
  /** Shown after a successful download capture. */
  fallbackHref?: string;
  showMessage?: boolean;
};

const EMPTY = { name: "", email: "", company: "", jobTitle: "", phone: "", message: "" };

export default function LeadCaptureForm({
  intent,
  resourceId,
  submitLabel = "Get the download",
  fallbackHref,
  showMessage = false
}: Props) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  function field(key: keyof typeof EMPTY) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
        if (status === "error") setStatus("idle");
      }
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setStatus("error");
      setMessage("Tell us your name.");
      return;
    }
    if (!EMAIL_RE.test(form.email)) {
      setStatus("error");
      setMessage("Enter a valid business email address.");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, intent, resourceId })
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.error || "We couldn't submit that. Try again.");
        return;
      }

      setStatus("success");
      setMessage(payload.data.message);
      setFileUrl(payload.data.fileUrl || "");
      setForm(EMPTY);
    } catch {
      setStatus("error");
      setMessage("Network error — check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="lead-success" role="status">
        <p className="lead-success-title">{message}</p>
        {fileUrl ? (
          <a className="lead-download" href={fileUrl} target="_blank" rel="noreferrer">
            Download now <span>&#8599;</span>
          </a>
        ) : fallbackHref ? (
          <a className="lead-download" href={fallbackHref}>
            Read it on this page <span>&rarr;</span>
          </a>
        ) : null}
        <p className="lead-success-note">A copy is on its way to your inbox.</p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit} noValidate>
      <div className="lead-grid">
        <label>
          <span>Full name *</span>
          <input type="text" required maxLength={120} autoComplete="name" {...field("name")} />
        </label>
        <label>
          <span>Business email *</span>
          <input type="email" required maxLength={200} autoComplete="email" {...field("email")} />
        </label>
        <label>
          <span>Company</span>
          <input type="text" maxLength={160} autoComplete="organization" {...field("company")} />
        </label>
        <label>
          <span>Job title</span>
          <input type="text" maxLength={160} autoComplete="organization-title" {...field("jobTitle")} />
        </label>
        <label>
          <span>Phone</span>
          <input type="tel" maxLength={40} autoComplete="tel" {...field("phone")} />
        </label>
      </div>

      {showMessage && (
        <label className="lead-message">
          <span>How can we help?</span>
          <textarea rows={4} maxLength={4000} {...field("message")} />
        </label>
      )}

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : submitLabel} <span>&rarr;</span>
      </button>

      {status === "error" && <p className="form-message form-error" role="alert">{message}</p>}
      <small>We use your details to send the resource and occasional related research. Unsubscribe anytime.</small>
    </form>
  );
}
