// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import { existsSync, readdirSync } from 'node:fs';

// https://astro.build/config
// Inhalts-Quelle: LIVE-Seite (www, gültiges Zertifikat). Früher Dev-Server (Handbuch 1).
const WP_LIVE = 'https://cms.sanktbonifatius.de';

// „Pause für die Seele": Welche Wochen-/Gruppenleitungs-PDFs liegen schon im Repo? Die Seite
// läuft wegen Passwortschutz als Netlify-Function (prerender = false) — dort gibt es kein
// public/-Verzeichnis zum Nachsehen. Deshalb wird die Liste HIER beim Build (bzw. beim Start von
// `npm run dev`) einmal eingelesen und als Konstante __PFS_PDFS__ eingebaut. Neues PDF → Push
// (Netlify baut neu) bzw. lokal Dev-Server neu starten. Genutzt in PfsMaterial/PfsGruppenleitung.
const PFS_PDF_DIR = 'public/uploads/2027/02';
const PFS_PDFS = existsSync(PFS_PDF_DIR) ? readdirSync(PFS_PDF_DIR).filter((f) => f.endsWith('.pdf')) : [];

export default defineConfig({
  // Produktive Frontend-Domain (Handbuch 1b). Basis für sitemap + canonical-URLs.
  site: 'https://sanktbonifatius.de',
  // Seiten bleiben statisch; nur Routen mit `export const prerender = false`
  // (z. B. src/pages/api/taufe-anmeldung.ts) laufen server-seitig (auf Netlify als Function).
  // Lokal (`npm run dev`) funktioniert der Adapter ebenfalls; der Vite-Proxy unten greift nur im Dev.
  adapter: netlify(),
  integrations: [
    sitemap({
      // Passwortgeschützte Seiten (raumbuchung/, downloads/statistik, exerzitien2027/) sind bereits per
      // noindex-Header vor Google geschützt — stünden aber ohne diesen Filter trotzdem
      // öffentlich lesbar in der sitemap.xml (URL damit auffindbar, auch wenn der Inhalt
      // selbst gesperrt bleibt).
      filter: (page) => !page.includes('/kontakt/raumbuchung') && !page.includes('/downloads/statistik')
        && !page.includes('/exerzitien2027')
        && !page.includes('/100-jahre')
        // Versteckte QR-Landingpage (Brief zum Willkommens-Flyer), noindex — siehe src/pages/willkommen.astro
        && !page.includes('/willkommen/'),
    }),
  ],
  vite: {
    define: {
      __PFS_PDFS__: JSON.stringify(PFS_PDFS),
    },
    server: {
      proxy: {
        // Alle /wp-proxy/ Aufrufe werden serverseitig an die Live-Seite (www) weitergeleitet
        // → Browser spricht nur localhost. Live hat ein gültiges Zertifikat (kein secure:false nötig).
        '/wp-proxy': {
          target: WP_LIVE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/wp-proxy/, ''),
        }
      }
    }
  }
});
