"use client";

import { useState } from "react";

const EMPTY = { name: "", email: "", topic: "", portfolio: "", pitch: "" };

export default function WriteForUsForm() {
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
      const response = await fetch("/api/write-for-us", {
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
        <span>Pitch topic</span>
        <input type="text" required maxLength={160} placeholder="What would you like to write about?" {...field("topic")} />
      </label>
      <label>
        <span>Portfolio or writing sample (optional)</span>
        <input type="text" maxLength={300} placeholder="Link to past work" {...field("portfolio")} />
      </label>
      <label>
        <span>Pitch</span>
        <textarea required rows={6} maxLength={5000} placeholder="Tell us about the story and why it fits us." {...field("pitch")} />
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send pitch"} <span>→</span>
      </button>
      {status === "success" && <p className="form-message form-success" role="status">{message}</p>}
      {status === "error" && <p className="form-message form-error" role="alert">{message}</p>}
    </form>
  );
}
