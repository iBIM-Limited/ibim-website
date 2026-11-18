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
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self' https://static.cloudflareinsights.com; " +
    "frame-src https://www.youtube-nocookie.com; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

const LIMITS = {
  kind: 20,
  first_name: 100,
  last_name: 100,
  company: 150,
  job_title: 100,
  email: 200,
  message: 5000,
  source_page: 200,
  referrer: 200,
  heard: 200,
  need: 100,
  project: 5000,
  reply: 200,
  when: 200,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // One redirect to the single HTTPS www address when on production domain.
    const onOurDomain = url.hostname === 'i-bim.co.uk' || url.hostname === CANONICAL_HOST;
    if (onOurDomain && (url.protocol === 'http:' || url.hostname === 'i-bim.co.uk')) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    // One address per page: no trailing slash and no .html.
    if (url.pathname !== '/' && /(\/|\.html)$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/(\/index)?\.html$/, '').replace(/\/+$/, '') || '/';
      return Response.redirect(url.toString(), 301);
    }
    const path = url.pathname;

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
  if (/\.(js|css|png|jpg|webp|woff2?)$/.test(url.pathname)) {
    res.headers.set('Cache-Control', url.pathname.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
  }
  return res;
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function isValidUKPhone(val) {
  const digits = val.replace(/\D/g, '');
  return digits.length >= 10;
}

function isValidReply(val) {
  return isValidEmail(val) || isValidUKPhone(val);
}

async function handleEnquiry(request, env, url) {
  if (request.method !== 'POST') return json({ error: 'Send this form with POST.' }, 405);

  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) {
    return json({ error: 'This form can only be sent from the iBIM website.' }, 403);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'The form could not be read. Please refresh the page and try again.' }, 400);
  }

  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const done = () => wantsJson ? json({ ok: true }) : Response.redirect(new URL('/thanks', url).toString(), 303);

  // Hidden honeypot field filled by automated bots
  if (form.get('website')) return done();

  const kind = form.get('kind') === 'waitlist' ? 'waitlist' : 'contact';
  const data = {};
  for (const [field, max] of Object.entries(LIMITS)) {
    data[field] = String(form.get(field) || '').trim().slice(0, max);
  }

  if (kind === 'contact') {
    if (!data.reply) {
      return json({ error: 'Please enter an email address or a phone number so we can reply.', missing: ['reply'] }, 422);
    }
    if (!isValidReply(data.reply)) {
      return json({ error: 'Please enter a valid email address or a UK phone number with at least 10 digits.', missing: ['reply'] }, 422);
    }

    data.email = data.reply;
    const parts = [];
    if (data.need) parts.push(`Need: ${data.need}`);
    if (data.when) parts.push(`When: ${data.when}`);
    if (data.project) parts.push(data.project);
    data.message = parts.join('\n\n') || '(No project description entered)';
  } else {
    const required = ['first_name', 'last_name', 'company', 'email', 'job_title'];
    const missing = required.filter((f) => !data[f]);
    if (missing.length) {
      return json({ error: 'Please fill in all required fields and try again.', missing }, 422);
    }
    if (!isValidEmail(data.email)) {
      return json({ error: 'Please enter a valid email address.', missing: ['email'] }, 422);
    }
  }

  if (!env.DB) {
    return json({ error: 'The form is not connected yet. Call +44 7825 885167 or email jack@i-bim.co.uk.' }, 503);
  }

  const ipHash = await sha256(request.headers.get('CF-Connecting-IP') || 'unknown');
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM enquiries WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')"
  ).bind(ipHash).first();

  if (recent && recent.n >= 5) {
    return json({ error: 'Too many messages from this connection. Please try again in an hour, or call +44 7825 885167.' }, 429);
  }

  const saved = await env.DB.prepare(
    'INSERT INTO enquiries (kind, first_name, last_name, company, job_title, email, message, ip_hash, source_page, referrer, heard) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    kind,
    data.first_name || null,
    data.last_name || null,
    data.company || null,
    data.job_title || null,
    data.email,
    data.message,
    ipHash,
    data.source_page || null,
    data.referrer || null,
    data.heard || null
  ).run();

  // Send notification email if configured
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
  if (kind === 'contact') {
    const isEmail = isValidEmail(d.email);
    const lines = [
      `Contact reply: ${d.email}`,
      d.need ? `Need: ${d.need}` : '',
      d.when ? `When: ${d.when}` : '',
      '',
      d.message,
      '',
      d.heard ? `Heard about us: ${d.heard}` : '',
      d.source_page ? `Sent from: ${d.source_page}` : '',
      d.referrer ? `Arrived from: ${d.referrer}` : '',
    ].filter(Boolean);

    const out = {
      subject: `Website enquiry (${d.need || 'General'}): ${d.email}`,
      text: lines.join('\n'),
    };
    if (isEmail) out.replyTo = d.email;
    return out;
  }

  const name = [d.first_name, d.last_name].filter(Boolean).join(' ') || 'Not given';
  const lines = [
    `Name: ${name}`,
    `Email: ${d.email}`,
    d.company ? `Company: ${d.company}` : '',
    d.job_title ? `Job title: ${d.job_title}` : '',
    d.heard ? `Heard about us: ${d.heard}` : '',
    d.source_page ? `Sent from: ${d.source_page}` : '',
    d.referrer ? `Arrived from: ${d.referrer}` : '',
  ].filter(Boolean);

  return {
    replyTo: d.email,
    subject: `Digital twin waiting list: ${name}`,
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
