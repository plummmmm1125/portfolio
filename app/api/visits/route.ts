import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';
const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const cookieName = 'xinyu_visitor';
function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
}
export async function GET() {
  try {
    if (!env.DB) return json({ error: 'unavailable' }, 503);
    const row = await env.DB.prepare('SELECT COUNT(*) AS total FROM site_visitors').first<{total: number}>();
    return json({ total: Number(row?.total ?? 0) });
  } catch { return json({ error: 'unavailable' }, 503); }
}
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return json({ error: 'forbidden' }, 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'invalid_content_type' }, 415);
  if (Number(request.headers.get('content-length') ?? 0) > 512) return json({ error: 'body_too_large' }, 413);
  let input: { visitorId?: string };
  try {
    const raw = await request.text();
    if (raw.length > 512) return json({ error: 'body_too_large' }, 413);
    input = JSON.parse(raw);
    if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ error: 'invalid_request' }, 400);
    if (input.visitorId !== undefined && (typeof input.visitorId !== 'string' || !tokenPattern.test(input.visitorId))) return json({ error: 'invalid_visitor' }, 400);
  } catch { return json({ error: 'invalid_request' }, 400); }
  // Authentication is injected by Sites dispatch. Anonymous visitors use a first-party browser token.
  const account = request.headers.get('oai-authenticated-user-id');
  const stored = (request.headers.get('cookie') ?? '').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  const token = stored && tokenPattern.test(stored) ? stored : input.visitorId ?? crypto.randomUUID();
  const key = account ? 'account:'+account : 'browser:'+token;
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))].map(x=>x.toString(16).padStart(2,'0')).join('');
  try {
    if (!env.DB) return json({ error: 'unavailable' }, 503);
    const results = await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO site_visitors (visitor_hash, first_seen_at) VALUES (?, ?)').bind(hash, Date.now()),
      env.DB.prepare('SELECT COUNT(*) AS total FROM site_visitors'),
    ]);
    const total = Number((results[1].results[0] as {total: number}).total);
    const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
    return json({ total }, 200, { 'Set-Cookie': `${cookieName}=${token}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}` });
  } catch { return json({ error: 'unavailable' }, 503); }
}
