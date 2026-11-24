// Smoke tests for the Cloudflare Worker in worker/index.js.
// They call the worker's fetch handler directly with a fake ASSETS binding and no database,
// so nothing here touches the network, a real database or any secret.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const BASE = 'https://www.i-bim.co.uk';

function fakeEnv() {
  const seen: string[] = [];
  return {
    seen,
    ASSETS: {
      async fetch(req: Request) {
        seen.push(new URL(req.url).pathname);
        return new Response('<html>page</html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
      },
    },
  };
}

async function call(path: string, init?: RequestInit, base = BASE) {
  const env = fakeEnv();
  const res: Response = await worker.fetch(new Request(base + path, init), env);
  return { res, env };
}

test('bare domain redirects once to the https www address', async () => {
  const { res } = await call('/about', undefined, 'http://i-bim.co.uk');
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('Location'), 'https://www.i-bim.co.uk/about');
});

test('trailing slash and .html addresses redirect to the clean address', async () => {
  const slash = await call('/about/');
  assert.equal(slash.res.status, 301);
  assert.equal(slash.res.headers.get('Location'), `${BASE}/about`);

  const html = await call('/contact.html');
  assert.equal(html.res.status, 301);
  assert.equal(html.res.headers.get('Location'), `${BASE}/contact`);
});

test('normal pages are served from assets with security headers', async () => {
  const { res, env } = await call('/about');
  assert.equal(res.status, 200);
  assert.deepEqual(env.seen, ['/about']);
  assert.equal(res.headers.get('X-Frame-Options'), 'DENY');
  assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.match(res.headers.get('Content-Security-Policy') ?? '', /default-src 'self'/);
  assert.equal(res.headers.get('X-Robots-Tag'), null);
});

test('only the 3D scene page may run WebAssembly', async () => {
  const scene = await call('/3d-visuals-and-real-time-visualisation');
  assert.match(scene.res.headers.get('Content-Security-Policy') ?? '', /'wasm-unsafe-eval'/);

  const other = await call('/about');
  assert.doesNotMatch(other.res.headers.get('Content-Security-Policy') ?? '', /'wasm-unsafe-eval'/);
});

test('removed shop pages answer 410 Gone', async () => {
  const { res, env } = await call('/classic-cap-hpeszv');
  assert.equal(res.status, 410);
  assert.deepEqual(env.seen, ['/404']);
});

test('other hosts are marked noindex', async () => {
  const { res } = await call('/about', undefined, 'https://ibim-website-preview.example.workers.dev');
  assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow');
});

test('enquiry endpoint rejects GET', async () => {
  const { res } = await call('/api/enquiry');
  assert.equal(res.status, 405);
});

test('enquiry endpoint rejects a form sent from another site', async () => {
  const body = new FormData();
  body.set('reply', 'test@example.com');
  const { res } = await call('/api/enquiry', { method: 'POST', body, headers: { Origin: 'https://evil.example' } });
  assert.equal(res.status, 403);
});

test('contact form without a way to reply is refused', async () => {
  const body = new FormData();
  body.set('project', 'Synthetic test message');
  const { res } = await call('/api/enquiry', { method: 'POST', body, headers: { Accept: 'application/json' } });
  assert.equal(res.status, 422);
  assert.deepEqual((await res.json()).missing, ['reply']);
});

test('waiting list form needs every required field', async () => {
  const body = new FormData();
  body.set('kind', 'waitlist');
  body.set('first_name', 'Test');
  const { res } = await call('/api/enquiry', { method: 'POST', body, headers: { Accept: 'application/json' } });
  assert.equal(res.status, 422);
  assert.deepEqual((await res.json()).missing, ['last_name', 'company', 'email', 'job_title']);
});

test('honeypot submissions get a quiet success and are never stored', async () => {
  const body = new FormData();
  body.set('website', 'filled-by-a-bot');
  body.set('reply', 'test@example.com');
  // No DB in the env: if the honeypot did not stop it, this would answer 503.
  const { res } = await call('/api/enquiry', { method: 'POST', body, headers: { Accept: 'application/json' } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});
