"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "../../apiClient";
import { formatDate, type PublicUser } from "@/lib/types";

export default function TeamManager({ users, currentUser }: { users: PublicUser[]; currentUser: PublicUser }) {
  const router = useRouter();
  const [invite, setInvite] = useState({ name: "", email: "", password: "", role: "editor" });
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const isAdmin = currentUser.role === "admin";

  async function run(action: () => Promise<unknown>, message?: string) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      await action();
      if (message) setNote(message);
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function addMember(event: React.FormEvent) {
    event.preventDefault();
    run(async () => {
      await send("/api/users", "POST", invite);
      setInvite({ name: "", email: "", password: "", role: "editor" });
    }, "Account created.");
  }

  function updatePassword(user: PublicUser) {
    const password = passwords[user.id] ?? "";
    if (password.length < 8) {
      setError("Passwords must be at least 8 characters.");
      return;
    }
    run(async () => {
      await send(`/api/users/${user.id}`, "PATCH", { password });
      setPasswords((prev) => ({ ...prev, [user.id]: "" }));
    }, `Password updated for ${user.email}.`);
  }

  function remove(user: PublicUser) {
    if (!window.confirm(`Remove ${user.email} from the team?`)) return;
    run(() => send(`/api/users/${user.id}`, "DELETE"), "Account removed.");
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}
      {note && <p className="adm-note adm-note-ok" role="status">{note}</p>}

      <div className="adm-card">
        <h2>Accounts</h2>
        <p className="adm-card-note">
          Everyone here can sign in and edit the site. Admins can additionally add and remove accounts.
        </p>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Last sign-in</th>
                <th>Set a new password</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="adm-table-title">
                      {user.name}
                      {user.id === currentUser.id && " (you)"}
                    </span>
                    <span className="adm-table-sub">{user.email}</span>
                  </td>
                  <td><span className="adm-tag">{user.role}</span></td>
                  <td>{user.lastLoginAt ? formatDate(user.lastLoginAt.slice(0, 10)) : "never"}</td>
                  <td>
                    {(isAdmin || user.id === currentUser.id) ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="password"
                          value={passwords[user.id] ?? ""}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, [user.id]: e.target.value }))}
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          style={{ border: "1px solid #d5d5cd", borderRadius: 4, padding: "7px 10px", fontSize: 12.5, fontFamily: "inherit", minWidth: 170 }}
                        />
                        <button
                          className="adm-btn adm-btn-ghost adm-btn-sm"
                          onClick={() => updatePassword(user)}
                          disabled={busy}
                        >
                          Update
                        </button>
                      </div>
                    ) : (
                      <span className="adm-table-sub">—</span>
                    )}
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      {isAdmin && user.id !== currentUser.id && (
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(user)} disabled={busy}>
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <div className="adm-card">
          <h2>Add a team member</h2>
          <p className="adm-card-note">They can sign in immediately with the password you set here.</p>
          <form onSubmit={addMember}>
            <div className="adm-grid-2">
              <label className="adm-field">
                <span>NAME</span>
                <input
                  type="text"
                  value={invite.name}
                  onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                />
              </label>
              <label className="adm-field">
                <span>EMAIL</span>
                <input
                  type="email"
                  value={invite.email}
                  onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                  required
                />
              </label>
              <label className="adm-field">
                <span>PASSWORD</span>
                <input
                  type="password"
                  value={invite.password}
                  onChange={(e) => setInvite({ ...invite, password: e.target.value })}
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="adm-field">
                <span>ROLE</span>
                <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <div className="adm-form-actions">
              <button className="adm-btn adm-btn-accent" type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
