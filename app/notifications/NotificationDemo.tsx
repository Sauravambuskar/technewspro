"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NotificationKind = "success" | "warning" | "error" | "info";

type DemoNotification = {
  id: string;
  kind: NotificationKind;
  icon: string;
  title: string;
  message: string;
  time: string;
  href: string;
  linkLabel: string;
};

const notificationCopy: Record<NotificationKind, Omit<DemoNotification, "id" | "kind" | "time">> = {
  success: {
    icon: "✓",
    title: "Article published",
    message: "Your article is now live for readers.",
    href: "/category",
    linkLabel: "View latest stories"
  },
  warning: {
    icon: "!",
    title: "Scheduled post delayed",
    message: "Review the publish time and try again.",
    href: "/admin/articles",
    linkLabel: "Review schedule"
  },
  error: {
    icon: "×",
    title: "Publishing failed",
    message: "We could not publish the article. Please retry.",
    href: "/admin/articles",
    linkLabel: "Open drafts"
  },
  info: {
    icon: "i",
    title: "New update available",
    message: "Performance and stability improvements are ready.",
    href: "/about",
    linkLabel: "See what’s new"
  }
};

const initialNotifications: DemoNotification[] = [
  {
    id: "published",
    kind: "success",
    icon: "✓",
    title: "Article published",
    message: "“Design systems in 2026” is now live for readers.",
    time: "Just now",
    href: "/category",
    linkLabel: "View article"
  },
  {
    id: "delayed",
    kind: "warning",
    icon: "!",
    title: "Scheduled post delayed",
    message: "“Weekly roundup” missed its scheduled publish time.",
    time: "28 min ago",
    href: "/admin/articles",
    linkLabel: "Review schedule"
  },
  {
    id: "failed",
    kind: "error",
    icon: "×",
    title: "Publishing failed",
    message: "The server could not publish “Market trends Q2”.",
    time: "1 hr ago",
    href: "/admin/articles",
    linkLabel: "Open draft"
  },
  {
    id: "update",
    kind: "info",
    icon: "i",
    title: "New update available",
    message: "The CMS update includes performance and stability improvements.",
    time: "3 hrs ago",
    href: "/about",
    linkLabel: "See what’s new"
  }
];

const triggerLabels: Array<{ kind: NotificationKind; title: string; helper: string }> = [
  { kind: "success", title: "Success notification", helper: "Confirm an article was published" },
  { kind: "warning", title: "Warning notification", helper: "Flag a scheduling delay" },
  { kind: "error", title: "Error notification", helper: "Report a publishing failure" },
  { kind: "info", title: "Info notification", helper: "Share a product update" }
];

const frontendUseCases = [
  {
    kind: "info" as const,
    icon: "B",
    eyebrow: "BREAKING NEWS",
    title: "A major story is developing",
    message: "Alert readers without interrupting the article they are currently reading.",
    helper: "Best for urgent editorial updates",
    href: "/category",
    linkLabel: "Read latest news"
  },
  {
    kind: "success" as const,
    icon: "N",
    eyebrow: "NEWSLETTER",
    title: "Subscription confirmed",
    message: "Give a clear confirmation after a reader joins the daily briefing.",
    helper: "Best after newsletter signup",
    href: "/#newsletter",
    linkLabel: "Manage subscription"
  },
  {
    kind: "success" as const,
    icon: "S",
    eyebrow: "SAVED STORY",
    title: "Article saved for later",
    message: "Confirm that a story was added to the reader's saved list.",
    helper: "Best after bookmark actions",
    href: "/category",
    linkLabel: "View saved stories"
  },
  {
    kind: "warning" as const,
    icon: "W",
    eyebrow: "ACCOUNT",
    title: "Your session will expire soon",
    message: "Warn signed-in readers before their session ends so work is not lost.",
    helper: "Best for account and session alerts",
    href: "/admin/login",
    linkLabel: "Continue session"
  },
  {
    kind: "error" as const,
    icon: "F",
    eyebrow: "FORM FEEDBACK",
    title: "Message could not be sent",
    message: "Explain the failed action and give the reader a clear way to retry.",
    helper: "Best for contact and lead forms",
    href: "/contact",
    linkLabel: "Try again"
  },
  {
    kind: "info" as const,
    icon: "U",
    eyebrow: "FOLLOWED TOPIC",
    title: "New AI & Automation story",
    message: "Let readers know when fresh coverage appears in a topic they follow.",
    helper: "Best for personalised updates",
    href: "/category",
    linkLabel: "Open new story"
  }
];

export default function NotificationDemo() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [toast, setToast] = useState<(typeof notificationCopy)[NotificationKind] & { kind: NotificationKind; key: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function showToast(kind: NotificationKind, override?: Partial<(typeof notificationCopy)[NotificationKind]>) {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...notificationCopy[kind], ...override, kind, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 5200);
  }

  function closeToast() {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }

  return (
    <>
      <section className="notification-hero" aria-labelledby="notification-title">
        <p className="notification-kicker">Interactive component demo</p>
        <h1 id="notification-title">Notification styles</h1>
        <p className="notification-lede">
          A consistent system for publishing updates, scheduled-post warnings, errors and product information.
          Use the controls to see each state live.
        </p>
        <div className="notification-hero-actions">
          <button type="button" className="notification-primary" onClick={() => showToast("success")}>
            Publish an article
          </button>
          <a className="notification-secondary" href="#live-notification-demo">View all states ↓</a>
        </div>
      </section>

      <section className="notification-demo-grid" id="live-notification-demo" aria-label="Live notification demonstration">
        <div className="notification-panel notification-centre">
          <div className="notification-panel-head">
            <div>
              <h2>Notification centre</h2>
              <p>Recent newsroom activity</p>
            </div>
            <span className="notification-count" aria-label={`${notifications.length} notifications`}>
              {notifications.length}
            </span>
          </div>

          <div className="notification-list">
            {notifications.length ? notifications.map((item) => (
              <article className={`notification-item is-${item.kind}`} key={item.id}>
                <span className="notification-item-icon" aria-hidden="true">{item.icon}</span>
                <div className="notification-item-copy">
                  <div className="notification-item-top">
                    <h3>{item.title}</h3>
                    <time>{item.time}</time>
                  </div>
                  <p>{item.message}</p>
                  <Link href={item.href}>{item.linkLabel} <span aria-hidden="true">→</span></Link>
                </div>
                <button
                  type="button"
                  className="notification-dismiss"
                  aria-label={`Dismiss ${item.title} notification`}
                  onClick={() => setNotifications((current) => current.filter((notification) => notification.id !== item.id))}
                >
                  ×
                </button>
              </article>
            )) : (
              <div className="notification-empty">
                <span aria-hidden="true">✓</span>
                <h3>You’re all caught up</h3>
                <p>New publishing activity will appear here.</p>
                <button type="button" onClick={() => setNotifications(initialNotifications)}>Restore demo notifications</button>
              </div>
            )}
          </div>
        </div>

        <aside className="notification-panel notification-triggers" aria-labelledby="notification-trigger-title">
          <div className="notification-panel-head">
            <div>
              <h2 id="notification-trigger-title">Try it live</h2>
              <p>Trigger a toast notification</p>
            </div>
          </div>
          <div className="notification-trigger-list">
            {triggerLabels.map((trigger) => (
              <button
                type="button"
                className={`notification-trigger is-${trigger.kind}`}
                key={trigger.kind}
                onClick={() => showToast(trigger.kind)}
              >
                <span className="notification-trigger-dot" aria-hidden="true" />
                <span><strong>{trigger.title}</strong><small>{trigger.helper}</small></span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="notification-use-cases" aria-labelledby="frontend-use-cases-title">
        <div className="notification-section-head">
          <div>
            <p className="notification-kicker">Frontend applications</p>
            <h2 id="frontend-use-cases-title">Where visitors will see them</h2>
          </div>
          <p>These examples turn the same four status colours into useful feedback across the public website.</p>
        </div>

        <div className="notification-use-case-grid">
          {frontendUseCases.map((item) => (
            <article className={`notification-use-case is-${item.kind}`} key={item.eyebrow}>
              <span className="notification-use-case-icon" aria-hidden="true">{item.icon}</span>
              <p className="notification-use-case-eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p className="notification-use-case-message">{item.message}</p>
              <small>{item.helper}</small>
              <div className="notification-use-case-actions">
                <button type="button" onClick={() => showToast(item.kind, item)}>Try notification</button>
                <Link href={item.href}>{item.linkLabel} <span aria-hidden="true">-&gt;</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="notification-tokens" aria-label="Notification colour tokens">
        <div><span className="token-swatch token-success" /><strong>Success</strong><code>#22C55E</code></div>
        <div><span className="token-swatch token-warning" /><strong>Warning</strong><code>#F59E0B</code></div>
        <div><span className="token-swatch token-error" /><strong>Error</strong><code>#EF4444</code></div>
        <div><span className="token-swatch token-info" /><strong>Info</strong><code>#3B82F6</code></div>
      </section>

      {toast && (
        <div className={`notification-toast is-${toast.kind}`} key={toast.key} role={toast.kind === "error" ? "alert" : "status"} aria-live="polite">
          <span className="notification-toast-bar" />
          <span className="notification-toast-icon" aria-hidden="true">{toast.icon}</span>
          <span className="notification-toast-copy"><strong>{toast.title}</strong><small>{toast.message}</small></span>
          <button type="button" onClick={closeToast} aria-label={`Dismiss ${toast.title} notification`}>×</button>
        </div>
      )}
    </>
  );
}
