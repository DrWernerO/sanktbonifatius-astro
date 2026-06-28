// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
// Inhalts-Quelle: LIVE-Seite (www, gültiges Zertifikat). Früher Dev-Server (Handbuch 1).
const WP_LIVE = 'https://www.sanktbonifatius.de';

export default defineConfig({
  // Produktive Frontend-Domain (Handbuch 1b). Basis für sitemap + canonical-URLs.
  site: 'https://sanktbonifatius.de',
  // Seiten bleiben statisch; nur Routen mit `export const prerender = false`
  // (z. B. src/pages/api/taufe-anmeldung.ts) laufen server-seitig (auf Netlify als Function).
  // Lokal (`npm run dev`) funktioniert der Adapter ebenfalls; der Vite-Proxy unten greift nur im Dev.
  adapter: netlify(),
  integrations: [sitemap()],
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
