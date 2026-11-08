// Serves the static site, redirects old addresses and receives form submissions.

const CANONICAL_HOST = 'www.i-bim.co.uk';

// Template shop pages from the old site. 410 tells search engines they are gone for good.
const GONE = new Set([
  '/classic-cap-hpeszv', '/face-serum-gxrcld', '/handmade-vase-slowpy', '/hand-soap-giguos',
  '/set-of-plates-cxlzwx', '/sunglasses-iubjnq', '/wooden-chair-mopukh', '/wool-sweater-lortoo',
]);

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; " +
    "frame-src https://www.youtube-nocookie.com; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

const LIMITS = { first_name: 100, last_name: 100, company: 150, job_title: 100, email: 200, message: 5000 };
const REQUIRED = {
  contact: ['email', 'message'],
  waitlist: ['first_name', 'last_name', 'company', 'email', 'job_title'],
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'i-bim.co.uk') {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path === '/httpswwwi-bimcoukcontact') {
      return Response.redirect(new URL('/contact', url).toString(), 301);
    }
    if (path === '/api/enquiry') {
      return secure(await handleEnquiry(request, env, url), url);
    }
    if (GONE.has(path)) {
      const page = await env.ASSETS.fetch(new Request(new URL('/404', url)));
      return secure(new Response(page.body, { status: 410, headers: page.headers }), url);
    }
    return secure(await env.ASSETS.fetch(request), url);
  },
};

function secure(response, url) {
  const res = new Response(response.body, response);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  if (url.hostname !== CANONICAL_HOST) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  if (/\.(js|css|png|jpg|woff2?)$/.test(url.pathname)) {
    res.headers.set('Cache-Control', url.pathname.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400');
  }
  return res;
}

async function handleEnquiry(request, env, url) {
  if (request.method !== 'POST') return json({ error: 'Send this form with POST.' }, 405);

  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) return json({ error: 'This form can only be sent from the iBIM website.' }, 403);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'The form could not be read. Refresh the page and send it again.' }, 400);
  }

  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const done = () => wantsJson ? json({ ok: true }) : Response.redirect(new URL('/thanks', url).toString(), 303);

  // Hidden from people, filled in by bots. Report success so bots do not retry.
  if (form.get('website')) return done();

  const kind = form.get('kind') === 'waitlist' ? 'waitlist' : 'contact';
  const data = {};
  for (const [field, max] of Object.entries(LIMITS)) {
    data[field] = String(form.get(field) || '').trim().slice(0, max);
  }
  const missing = REQUIRED[kind].filter((f) => !data[f]);
  if (missing.length) return json({ error: 'Fill in the required fields and send the form again.', missing }, 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json({ error: 'Enter a valid email address.', missing: ['email'] }, 422);

  if (!env.DB) {
    return json({ error: 'The form is not connected yet. Call +44 7825 885167 or email jack@i-bim.co.uk.' }, 503);
  }

  const ipHash = await sha256(request.headers.get('CF-Connecting-IP') || 'unknown');
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM enquiries WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')"
  ).bind(ipHash).first();
  if (recent.n >= 5) return json({ error: 'Too many messages from this connection. Try again in an hour, or call +44 7825 885167.' }, 429);

  const saved = await env.DB.prepare(
    'INSERT INTO enquiries (kind, first_name, last_name, company, job_title, email, message, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(kind, data.first_name, data.last_name, data.company, data.job_title, data.email, data.message, ipHash).run();

  // The enquiry is already saved, so a mail failure must not lose it or fail the visitor's request.
  if (env.NOTIFY_URL && env.NOTIFY_KEY) {
    try {
      const res = await fetch(env.NOTIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: env.NOTIFY_KEY, ...notification(kind, data) }),
      });
      const result = await res.json();
      if (!result.ok) throw new Error('Notification script rejected the request');
      await env.DB.prepare('UPDATE enquiries SET emailed = 1 WHERE id = ?').bind(saved.meta.last_row_id).run();
    } catch (err) {
      console.error('Notification email failed', err);
    }
  }
  return done();
}

function notification(kind, d) {
  const name = [d.first_name, d.last_name].filter(Boolean).join(' ') || 'Not given';
  const lines = [`Name: ${name}`, `Email: ${d.email}`];
  if (d.company) lines.push(`Company: ${d.company}`);
  if (d.job_title) lines.push(`Job title: ${d.job_title}`);
  if (d.message) lines.push('', d.message);
  return {
    replyTo: d.email,
    subject: kind === 'waitlist' ? `Digital twin waiting list: ${name}` : `Website enquiry: ${name}`,
    text: lines.join('\n'),
  };
}

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
