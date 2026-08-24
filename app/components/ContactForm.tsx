"use client";

import { useState } from "react";

const EMPTY = { name: "", email: "", subject: "", body: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function field(key: keyof typeof EMPTY) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
        if (status !== "idle") setStatus("idle");
      }
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.error || "We couldn't send that. Try again.");
        return;
      }

      setStatus("success");
      setMessage(payload.data.message);
      setForm(EMPTY);
    } catch {
      setStatus("error");
      setMessage("Network error — check your connection and try again.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label>
        <span>Your name</span>
        <input type="text" required maxLength={120} {...field("name")} />
      </label>
      <label>
        <span>Email</span>
        <input type="email" required maxLength={200} {...field("email")} />
      </label>
      <label>
        <span>Subject</span>
        <input type="text" maxLength={160} placeholder="Story tip, correction, press…" {...field("subject")} />
      </label>
      <label>
        <span>Message</span>
        <textarea required rows={6} maxLength={5000} {...field("body")} />
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send message"} <span>→</span>
      </button>
      {status === "success" && <p className="form-message form-success" role="status">{message}</p>}
      {status === "error" && <p className="form-message form-error" role="alert">{message}</p>}
    </form>
  );
}
