/**
 * Cloudflare Pages Function
 * Configure environment secrets in Pages > Settings > Variables and Secrets:
 * TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 * The lead form reports success only if Telegram confirms delivery.
 * TODO(deployment): verify both production Cloudflare Pages secrets
 * TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID, then send a synthetic lead.
 * Until these secrets exist the handler correctly responds HTTP 503.
 * TODO(CRM): only replace Telegram with the approved SKVOZNYAK Leads
 * ingest endpoint after that secure server and lead storage are deployed.
 * Do not report that leads are being stored in the CRM before cutover.
 */
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});
const clean = (value, max) => String(value ?? "").trim().slice(0, max);
export async function onRequestPost({ request, env }) {
  // Same-origin only. This is an abuse reduction measure, not an authentication system.
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return json({ ok: false }, 403);
    } catch { return json({ ok: false }, 403); }
  }
  if (!(request.headers.get("Content-Type") || "").startsWith("application/json")) return json({ ok: false }, 415);
  if (Number(request.headers.get("Content-Length") || 0) > 4096) return json({ ok: false }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ ok: false }, 400);
  if (body.website) return json({ ok: true }); // honeypot
  if (body.consent !== true) return json({ ok: false, error: "Consent is required" }, 400);
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 25);
  const company = clean(body.company, 120);
  const interest = clean(body.interest, 30);
  const locale = ["ru", "kk", "en"].includes(body.locale) ? body.locale : "ru";
  if (name.length < 2 || !/^\+?[\d\s()+-]{8,25}$/.test(phone)) return json({ ok: false, error: "Invalid contact details" }, 400);
  if (!["demo", "pilot", "consultation", "gptads"].includes(interest)) return json({ ok: false, error: "Invalid interest" }, 400);
  // No request data is stored by this function. Details are forwarded to Telegram only.
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ ok: false, error: "Form delivery is not configured" }, 503);
  const date = new Date().toISOString();
  const text = [
    "SKVOZNYAK — new lead",
    "Name: " + name,
    "Phone: " + phone,
    "Company: " + (company || "—"),
    "Interest: " + interest,
    "Locale: " + locale,
    "Date: " + date
  ].join("\n");
  try {
    const api = await fetch("https://api.telegram.org/bot" + env.TELEGRAM_BOT_TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true })
    });
    if (!api.ok) return json({ ok: false, error: "Delivery failed" }, 502);
    const result = await api.json();
    if (!result.ok) return json({ ok: false, error: "Delivery failed" }, 502);
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Delivery failed" }, 502);
  }
}
export async function onRequestGet() {
  return json({ ok: false, error: "Method not allowed" }, 405);
}
