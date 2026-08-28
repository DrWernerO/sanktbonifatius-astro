// Eigene, live generierte Sitemap nur für die Stelleninserate. @astrojs/sitemap (astro.config.mjs)
// kennt nur zur Build-Zeit bekannte, statische Routen — die Job-Detailseiten
// (kitas/stellenboerse/[slug].astro, prerender=false) sind dynamisch und würden dort NIE
// auftauchen, egal wie oft neu gebaut wird. Diese Route füllt genau diese Lücke: bei jedem
// Aufruf frisch aus WordPress erzeugt, damit neue Stellen sofort auffindbar sind. Referenziert
// in public/robots.txt als zweite Sitemap neben sitemap-index.xml.
import type { APIRoute } from 'astro';
import { getJobs, PUBLIC_SITE } from '../lib/wordpress.js';

export const prerender = false;

export const GET: APIRoute = async () => {
  const jobs = await getJobs();
  const urls = jobs
    .map((j) => `  <url><loc>${PUBLIC_SITE}/kitas/stellenboerse/${j.slug}/</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
