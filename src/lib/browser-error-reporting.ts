let installed = false;

function send(message: string, kind: string, action?: string) {
  const body = JSON.stringify({
    message: message.slice(0, 1_200),
    kind,
    action,
    route: window.location.pathname,
  });
  fetch("/api/public/error-report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function installBrowserErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => send(event.message || "Browser runtime error", "window_error"));
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "Unhandled rejection");
    send(reason, "unhandled_rejection");
  });
}

export function reportActionError(error: unknown, action: string) {
  if (typeof window === "undefined") return;
  send(error instanceof Error ? error.message : String(error), "action", action);
}