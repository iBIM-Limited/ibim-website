// Checks on the site's page data in src/data/services.ts, which drives the service pages and sitemap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allServices, sheets } from '../src/data/services.ts';

test('every service has a unique, URL-safe slug', () => {
  const slugs = allServices.map((s) => s.slug);
  assert.ok(slugs.length > 0);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug');
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, slug);
});

test('every service has the copy its page needs', () => {
  for (const s of allServices) {
    for (const field of ['name', 'title', 'description', 'card', 'what', 'honestly'] as const) {
      assert.ok(s[field].trim(), `${s.slug} is missing ${field}`);
    }
    assert.ok(s.receive.length > 0, `${s.slug} has nothing under receive`);
    assert.ok(s.steps.length > 0, `${s.slug} has no steps`);
  }
});

test('sitemap pages are unique and include home and every service', () => {
  const paths = sheets.map((p) => p.path);
  assert.equal(new Set(paths).size, paths.length, 'duplicate sitemap path');
  assert.ok(paths.includes('/'));
  for (const s of allServices) assert.ok(paths.includes(`/${s.slug}`), `${s.slug} missing from sitemap`);
  for (const p of paths) assert.match(p, /^\/[a-z0-9-]*$/, p);
});
