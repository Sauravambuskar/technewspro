"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm({ blurb }: { blurb: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" })
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.error || "We couldn't sign you up just now. Try again.");
        return;
      }

      setStatus("success");
      setMessage(payload.data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error — check your connection and try again.");
    }
  }

  return (
    <div className="newsletter-form">
      <p>{blurb}</p>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          placeholder="Your email address"
          aria-label="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          disabled={status === "loading"}
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Joining…" : "Join free"} <span>→</span>
        </button>
      </form>
      {status === "success" && <p className="form-message form-success" role="status">{message}</p>}
      {status === "error" && <p className="form-message form-error" role="alert">{message}</p>}
      <small>By subscribing, you agree to our privacy policy.</small>
    </div>
  );
}
