// Minimal Mailpit reader for the local-Supabase email-click test. Mailpit is
// the inbox bundled with `supabase start` (web/API on E2E_MAILPIT_URL). No new
// deps: plain fetch against its HTTP API.
export const MAILPIT_URL = process.env.E2E_MAILPIT_URL;

type MailpitSummary = { ID: string; To: { Address: string }[] };
type MailpitMessage = { Text: string; HTML: string };

// Poll the inbox for the newest message addressed to `email`, then pull the
// reset link (Supabase's ConfirmationURL) out of it. Following that link in the
// browser drives the real PKCE recovery flow end to end.
export async function waitForResetLink(
  email: string,
  timeoutMs = 15_000,
): Promise<string> {
  if (!MAILPIT_URL) throw new Error('E2E_MAILPIT_URL is not set');
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=50`);
    if (res.ok) {
      const { messages } = (await res.json()) as { messages: MailpitSummary[] };
      const hit = messages.find((m) =>
        m.To.some((t) => t.Address.toLowerCase() === email.toLowerCase()),
      );
      if (hit) {
        const detail = (await (
          await fetch(`${MAILPIT_URL}/api/v1/message/${hit.ID}`)
        ).json()) as MailpitMessage;
        const link = extractLink(detail.HTML) ?? extractLink(detail.Text);
        if (link) return link;
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No reset email for ${email} within ${timeoutMs}ms`);
}

// Grab the first Supabase auth URL (the recovery confirmation link).
function extractLink(body: string | undefined): string | null {
  if (!body) return null;
  const match = body.match(/https?:\/\/[^\s"'<>]*(?:verify|reset)[^\s"'<>]*/i);
  return match ? match[0].replace(/&amp;/g, '&') : null;
}

// Delete everything in the inbox so a test only sees its own message.
export async function clearMailpit(): Promise<void> {
  if (!MAILPIT_URL) return;
  await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: 'DELETE' });
}
