"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "../apiClient";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await send("/api/auth/logout", "POST");
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button className="adm-signout" onClick={signOut} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
