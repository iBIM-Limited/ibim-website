import { sheets } from '../data/services';

export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = sheets
    .map((s) => `<url><loc>https://www.i-bim.co.uk${s.path}</loc><lastmod>${today}</lastmod></url>`)
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
}
