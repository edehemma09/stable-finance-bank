import { sendMyNotification } from "./mail.functions";

/** Fire-and-forget branded email to the signed-in customer. Never blocks the UI. */
export function notifyByEmail(payload: {
  template: string;
  subject: string;
  title: string;
  intro: string;
  rows: [string, string][];
  footnote?: string;
}) {
  void sendMyNotification({ data: payload }).catch(() => {
    /* email is best-effort; failures are recorded in the admin email log */
  });
}
