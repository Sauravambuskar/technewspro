import Link from "next/link";
import { redirect } from "next/navigation";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, getCurrentUser, usingDefaultPassword } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");

  // Only surface the fallback credentials while they still work — once the password
  // has been changed the hint disappears for good.
  const showHint = await usingDefaultPassword();

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div className="adm-logo">
          <img src="/logo.png" alt="Tech News Pro" />
          <span>
            <small>CONTROL PANEL</small>
          </span>
        </div>

        <h1>Sign in</h1>
        <p>Manage insights, resources, leads and everything else the site reads from.</p>

        <LoginForm defaultEmail={showHint ? DEFAULT_ADMIN_EMAIL : ""} />

        {showHint && (
          <div className="adm-login-hint">
            <strong>First run.</strong> Sign in with <code>{DEFAULT_ADMIN_EMAIL}</code> and{" "}
            <code>{DEFAULT_ADMIN_PASSWORD}</code>, then change the password under Team. Set{" "}
            <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in <code>.env.local</code> to seed
            different credentials.
          </div>
        )}

        <Link className="adm-login-back" href="/">← Back to the site</Link>
      </div>
    </div>
  );
}
