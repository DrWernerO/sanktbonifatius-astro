// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
const WP_DEV = 'https://dev.sanktbonifatius.de.w021941a.kasserver.com';

export default defineConfig({
  // Produktive Frontend-Domain (Handbuch 1b). Basis für sitemap + canonical-URLs.
  site: 'https://sanktbonifatius.de',
  // Seiten bleiben statisch; nur Routen mit `export const prerender = false`
  // (z. B. src/pages/api/taufe-anmeldung.ts) laufen server-seitig.
  // Beim Netlify-Deploy später @astrojs/netlify statt node verwenden (Handbuch 13b).
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
  vite: {
    server: {
      proxy: {
        // Alle /wp-proxy/ Aufrufe werden serverseitig an den Dev-Server weitergeleitet
        // → Browser spricht nur localhost, kein SSL-Problem
        '/wp-proxy': {
          target: WP_DEV,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/wp-proxy/, ''),
          secure: false,
        }
      }
    }
  }
});
