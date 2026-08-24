"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../apiClient";

export default function LoginForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await send("/api/auth/login", "POST", { email, password });
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <label className="adm-field">
        <span>EMAIL</span>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="adm-field">
        <span>PASSWORD</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button className="adm-btn" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in to the newsroom"}
      </button>
    </form>
  );
}
