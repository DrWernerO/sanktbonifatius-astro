// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
// Inhalts-Quelle: LIVE-Seite (www, gültiges Zertifikat). Früher Dev-Server (Handbuch 1).
const WP_LIVE = 'https://cms.sanktbonifatius.de';

export default defineConfig({
  // Produktive Frontend-Domain (Handbuch 1b). Basis für sitemap + canonical-URLs.
  site: 'https://sanktbonifatius.de',
  // Seiten bleiben statisch; nur Routen mit `export const prerender = false`
  // (z. B. src/pages/api/taufe-anmeldung.ts) laufen server-seitig (auf Netlify als Function).
  // Lokal (`npm run dev`) funktioniert der Adapter ebenfalls; der Vite-Proxy unten greift nur im Dev.
  adapter: netlify(),
  integrations: [
    sitemap({
      // Passwortgeschützte Seiten (raumbuchung/, downloads/statistik) sind bereits per
      // noindex-Header vor Google geschützt — stünden aber ohne diesen Filter trotzdem
      // öffentlich lesbar in der sitemap.xml (URL damit auffindbar, auch wenn der Inhalt
      // selbst gesperrt bleibt).
      filter: (page) => !page.includes('/kontakt/raumbuchung') && !page.includes('/downloads/statistik'),
    }),
  ],
  vite: {
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
