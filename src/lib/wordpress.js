// Server-seitig: direkt zur LIVE-Seite (www, gültiges Zertifikat). Frühere Quelle war der
// Dev-Server; seit 2026-06-22 ist www die aktuelle Inhalts-Quelle (Handbuch Abschnitt 1).
const WP_API = 'https://www.sanktbonifatius.de/wp-json/wp/v2';

export async function getPage(slug) {
  const res = await fetch(
    `${WP_API}/pages?slug=${slug}&_fields=id,slug,title,content`,
    { headers: { Accept: 'application/json' } }
  );
  const data = await res.json();
  return data[0] ?? null;
}

export async function getPageById(id) {
  const res = await fetch(
    `${WP_API}/pages/${id}?_fields=id,slug,title,content`,
    { headers: { Accept: 'application/json' }, cache: 'no-store' }
  );
  const page = await res.json();
  if (page?.content?.rendered) {
    page.content.rendered = stripNavFromContent(page.content.rendered);
  }
  return page;
}

// Tauftermine aus einer einfachen WP-Seite ziehen (Default: Page 50101, /segen-sakramente/taufe/tauftermine/).
// Konvention der WP-Seite (im normalen Editor pflegbar, Handbuch 13c): pro Kirche eine
// Überschrift H3 (= Kirchenname), darunter EIN Absatz (= Adresse), dann eine Liste (= Termine,
// ein Datum pro Listenpunkt). Liefert [{ name, adresse, termine[] }]. Fällt WP aus → [] (der
// Aufrufer nutzt dann eine feste Fallback-Liste, der Build bricht nie ab).
export async function getTaufeTermine(id = 50101) {
  try {
    const res = await fetch(
      `${WP_API}/pages/${id}?_fields=content`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    const page = await res.json();
    const html = page?.content?.rendered ?? '';
    if (!html) return [];

    const strip = (s) => decodeEntities(s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    const kirchen = [];
    // An H3-Überschriften aufteilen; jeder Abschnitt: erster <p> = Adresse, alle <li> = Termine.
    const parts = html.split(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    for (let i = 1; i < parts.length; i += 2) {
      const name = strip(parts[i]);
      const rest = parts[i + 1] ?? '';
      const adrMatch = rest.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const adresse = adrMatch ? strip(adrMatch[1]) : '';
      const termine = [...rest.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((m) => strip(m[1]))
        .filter(Boolean);
      if (name) kirchen.push({ name, adresse, termine });
    }
    return kirchen;
  } catch {
    return [];
  }
}

// Minimaler HTML-Entity-Decoder (server-seitig, ohne DOM). Deckt die in WP-Content üblichen ab.
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&middot;/g, '·').replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—').replace(/&szlig;/g, 'ß').replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö').replace(/&auml;/g, 'ä').replace(/&Uuml;/g, 'Ü')
    .replace(/&Ouml;/g, 'Ö').replace(/&Auml;/g, 'Ä').replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&#038;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Entfernt bh3a-Nav (inkl. vorhergehendem Style-Block) aus dem WP-Content
function stripNavFromContent(html) {
  let result = html;

  // Nur den Nav-Div entfernen — Style-Block bleibt (enthält auch Marquee-CSS!)
  result = removeDiv(result, '<div class="bh3a-hdr">');

  // Editorial-Titel-Override ans Ende hängen — nach dem WP-CSS, damit er gewinnt
  result += `<style>
    .bh2-ed-main__title { font-size: clamp(28px, 3.8vw, 52px) !important; line-height: 1.1 !important; }
    .bh2-ed-small__title { font-size: 16px !important; line-height: 1.3 !important; }
  </style>`;

  // Suchoverlay entfernen
  result = removeDiv(result, '<div class="bh3a-srch-ov"');

  // WP-eigene Events- und News-Sektionen entfernen — durch Astro-Komponenten ersetzt.
  // Reihenfolge im WP-Content: … → bh2-vt (Events) → bh2-news (News) → bh3a-kirch
  // (Kirchorte) → Marquee → … Wir schneiden nur den mittleren Block (Events+News)
  // heraus und behalten alles davor UND danach. Die WP-HTML ist tief verschachtelt,
  // daher per Start-/End-Marker statt Div-Matching.
  result = removeRange(
    result,
    '<section class="bh2-vt"',   // Beginn Events
    '<div class="bh3a-kirch">'   // Beginn der nächsten Sektion (Kirchorte) = Ende News
  );

  // Relative API-URLs auf absoluten Dev-Server patchen
  // Scripts im WP-Content nutzen /wp-json/... — das würde auf localhost zeigen
  // Client-seitige Scripts: über Proxy leiten (kein SSL-Problem im Browser)
  result = result.replace(/(['"`])\/wp-json\//g, `$1/wp-proxy/wp-json/`);
  result = result.replace(/(['"`])\/wp-content\//g, `$1/wp-proxy/wp-content/`);

  // Nav-Script entfernen (Hamburger-Logik)
  const scriptMarker = '(function(){var hdr';
  const sStart = result.indexOf(scriptMarker);
  if (sStart !== -1) {
    const sOpen = result.lastIndexOf('<script>', sStart);
    const sClose = result.indexOf('</script>', sStart) + 9;
    if (sOpen !== -1) result = result.slice(0, sOpen) + result.slice(sClose);
  }

  return result;
}

function removeDiv(html, openTag) {
  return removeElement(html, openTag, '<div', '</div>');
}

function removeElement(html, openTag, openEl, closeEl) {
  const start = html.indexOf(openTag);
  if (start === -1) return html;
  let depth = 0, i = start;
  while (i < html.length) {
    if (html.slice(i, i + openEl.length) === openEl) depth++;
    if (html.slice(i, i + closeEl.length) === closeEl) {
      depth--;
      if (depth === 0) return html.slice(0, start) + html.slice(i + closeEl.length);
    }
    i++;
  }
  return html;
}

// Entfernt den Bereich von startMarker bis (ausschließlich) endMarker.
// <style>-Blöcke aus dem entfernten Bereich bleiben erhalten (CSS für andere Sektionen).
function removeRange(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return html;
  const end = html.indexOf(endMarker, start);
  if (end === -1) return html;
  const removed = html.slice(start, end);
  const styles = removed.match(/<style[\s\S]*?<\/style>/gi);
  let keptStyles = styles ? '\n' + styles.join('\n') + '\n' : '';
  // Platzhalter setzen, damit die Astro-Komponenten exakt hier eingefügt werden können
  return html.slice(0, start) + keptStyles + ASTRO_SLOT + html.slice(end);
}

// Marker, an dem in index.astro die Termin-/News-Komponenten eingesetzt werden
export const ASTRO_SLOT = '<!--ASTRO-EVENTS-NEWS-SLOT-->';

export async function getEvents(perPage = 30) {
  const res = await fetch(`${WP_API}/event?per_page=${perPage}&_embed`);
  if (!res.ok) return [];
  return res.json();
}

// Volltextsuche über den WP-Such-Endpoint (Seiten + Beiträge + Termine).
// Liefert normalisierte Treffer für die Astro-Suchseite (/suche/).
// Hinweis: Die Treffer verlinken auf die LIVE-Seite www (dort liegt der vollständige
// Inhalt); das Astro-Frontend ist nur eine Teilmigration. Beim WP-Umzug (Handbuch 1b)
// liefert der Endpoint automatisch die neuen URLs.
const SEARCH_TYPE_LABEL = { page: 'Seite', post: 'Beitrag', event: 'Termin' };

function cleanExcerpt(html) {
  if (!html) return '';
  let t = decodeEntities(String(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  // WP rendert bei Seiten ohne eigenen Auszug den Menütext mit → herausfiltern.
  if (/^Sankt Bonifatius Frankfurt am Main/i.test(t)) return '';
  if (t.length > 160) t = t.slice(0, 160).replace(/\s+\S*$/, '') + ' …';
  return t;
}

export async function searchSite(query, limit = 30) {
  const q = (query || '').trim();
  if (!q) return [];
  try {
    const res = await fetch(
      `${WP_API}/search?search=${encodeURIComponent(q)}&per_page=${limit}&_embed=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map((r) => ({
      id: r.id,
      title: decodeEntities(r.title || ''),
      url: r.url,
      typeLabel: SEARCH_TYPE_LABEL[r.subtype] || 'Seite',
      excerpt: cleanExcerpt(r._embedded?.self?.[0]?.excerpt?.rendered || ''),
    }));
  } catch {
    return []; // WP nicht erreichbar → leere Trefferliste, Seite bricht nie ab
  }
}

export async function getMenuItems() {
  // Hauptnavigation via WP-API-Menus (falls Plugin aktiv)
  const res = await fetch(`${WP_API.replace('/wp/v2', '')}/menus/v1/menus`);
  if (!res.ok) return [];
  return res.json();
}

// --- Headless SEO: fertigen SEOPress-Head aus WordPress übernehmen -----------------
// Die Seiten wurden im WP mit SEOPress für Suchmaschinen + KI optimiert (Titel,
// Description, OpenGraph, Twitter, JSON-LD WebSite/Organization/LocalBusiness).
// Statt das nachzubauen, holen wir den gerenderten <head> der Dev-Seite und übernehmen
// nur die SEO-Tags. So fließt die WP-SEO-Arbeit automatisch in die Astro-Seiten.

// Render-Host: LIVE-Seite (www) — liefert das aktuelle, SEO-optimierte HTML (gültiges Zertifikat).
// Frühere Quelle war der Dev-Server; seit 2026-06-22 ist www die Quelle (Handbuch Abschnitt 1).
const WP_RENDER_ORIGIN = 'https://www.sanktbonifatius.de';
// Produktive Frontend-Domain für canonical/og:url (Umzug: Handbuch Abschnitt 1b).
// Bild-/Datei-URLs (/wp-content/) werden NICHT umgeschrieben (bleiben auf dem WP-Host).
const PUBLIC_SITE = 'https://sanktbonifatius.de';

// Bild-IDs gebündelt auf source_url auflösen. WICHTIG: `_embedded`/`wp:featuredmedia` ist hier
// unzuverlässig (mal befüllt, mal nicht) — daher IMMER über die Media-IDs (`featured_media`
// bzw. event_meta.image) in EINEM /media-Call auflösen statt pro Eintrag.
async function resolveMediaUrls(ids) {
  const uniq = [...new Set(ids.filter(Boolean))];
  const map = {};
  for (let i = 0; i < uniq.length; i += 100) {
    const batch = uniq.slice(i, i + 100);
    try {
      const r = await fetch(`${WP_API}/media?include=${batch.join(',')}&per_page=100&_fields=id,source_url`);
      if (r.ok) (await r.json()).forEach((m) => { map[m.id] = m.source_url; });
    } catch { /* Bilder optional */ }
  }
  return map;
}

// Alle Termine mit aufgelöstem Bild für die Detailseiten (src/pages/termine/[slug].astro).
// Termine haben keinen Fließtext — alle Infos stehen in `event_meta`. Das Bild ist eine Media-ID.
export async function getEventsFull() {
  try {
    const res = await fetch(`${WP_API}/event?per_page=100&_fields=id,slug,link,title,event_meta`);
    if (!res.ok) return [];
    const events = await res.json();
    const imgMap = await resolveMediaUrls(events.map((e) => e.event_meta?.image));
    return events.map((e) => {
      const m = e.event_meta || {};
      return {
        id: e.id,
        slug: e.slug,
        title: e.title?.rendered ?? '',
        wpPath: (() => { try { return new URL(e.link).pathname; } catch { return '/'; } })(),
        meta: m,
        image: m.image ? (imgMap[m.image] || null) : null,
      };
    });
  } catch {
    return [];
  }
}

// --- "Aktuelles": Beiträge (posts) + News (pin) zusammenführen -----------------------
// "News" = WP-Custom-Post-Type `pin` (Menü "News" im WP-Admin): Bild, Video oder Fotogalerie.
// Der pin-REST-Endpunkt liefert KEIN Bild/Typ — diese Daten stehen nur im Theme-Datenblob
// `window.__BONI_PINS` (auf der Startseite, Page 45758). Das ist die einzige strukturierte
// Quelle für Bild/Typ/Excerpt; sie enthält aktuell alle News (X-WP-Total pin = 8).
export async function getNewsPins() {
  try {
    const res = await fetch(`${WP_API}/pages/45758?_fields=content`, { cache: 'no-store' });
    if (!res.ok) return [];
    const html = (await res.json())?.content?.rendered ?? '';
    const m = html.match(/window\.__BONI_PINS\s*=\s*(\{[\s\S]*?\});/);
    if (!m) return [];
    const pins = JSON.parse(m[1]);
    return Object.entries(pins).map(([id, v]) => ({
      id: Number(id),
      kind: 'news',
      type: v.ty || 'image',           // 'image' | 'gallery' | 'video'
      date: v.d || '',
      title: v.t || '',
      link: v.l || '#',
      excerpt: v.e || '',
      image: v.i || null,
      galleryCount: Array.isArray(v.g) ? v.g.length : 0,
      gallery: Array.isArray(v.g) ? v.g : [], // [{u: Bild-URL, a: Alt-Text}]
      video: v.v || '',                       // Video-URL (derzeit keine Video-Pins vorhanden)
    }));
  } catch {
    return [];
  }
}

async function getAllPosts() {
  try {
    const res = await fetch(
      `${WP_API}/posts?per_page=100&_fields=id,slug,date,title,link,excerpt,featured_media`
    );
    if (!res.ok) return [];
    const posts = await res.json();
    const imgMap = await resolveMediaUrls(posts.map((p) => p.featured_media));
    return posts.map((p) => ({
      id: p.id,
      kind: 'beitrag',
      type: 'post',
      date: p.date || '',
      title: p.title?.rendered ?? '',
      link: `/blog/${p.slug}/`, // interne Astro-Detailseite (statt WP-Permalink)
      slug: p.slug,
      excerpt: p.excerpt?.rendered ?? '',
      image: p.featured_media ? (imgMap[p.featured_media] || null) : null,
      galleryCount: 0,
    }));
  } catch {
    return [];
  }
}

// Volltext aller Beiträge für die Detailseiten (src/pages/blog/[slug].astro).
export async function getPosts() {
  try {
    const res = await fetch(
      `${WP_API}/posts?per_page=100&_fields=id,slug,date,title,content,excerpt,link,featured_media`
    );
    if (!res.ok) return [];
    const posts = await res.json();
    const imgMap = await resolveMediaUrls(posts.map((p) => p.featured_media));
    return posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      date: p.date || '',
      title: p.title?.rendered ?? '',
      content: p.content?.rendered ?? '',
      excerpt: p.excerpt?.rendered ?? '',
      image: p.featured_media ? (imgMap[p.featured_media] || null) : null,
      wpPath: (() => { try { return new URL(p.link).pathname; } catch { return '/'; } })(),
    }));
  } catch {
    return [];
  }
}

// Beiträge + News gemischt, nach Erscheinungsdatum absteigend. limit=0 → alle.
export async function getAktuelles(limit = 0) {
  const [beitraege, news] = await Promise.all([getAllPosts(), getNewsPins()]);
  const merged = [...beitraege, ...news]
    .filter((x) => x.date)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return limit > 0 ? merged.slice(0, limit) : merged;
}

// SEO-Tags aus dem gerenderten <head> ziehen (SEOPress): title, description, robots,
// canonical, OpenGraph, Twitter, JSON-LD. Render-Domain → Produktiv-Domain (außer /wp-content/).
function extractSeoTags(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  const tags = [];
  const push = (re) => { const m = head.match(re); if (m) tags.push(m[0]); };
  push(/<title[^>]*>[\s\S]*?<\/title>/i);
  push(/<meta\s+name=["']description["'][^>]*>/i);
  push(/<meta\s+name=["']robots["'][^>]*>/i);
  push(/<link\s+rel=["']canonical["'][^>]*>/i);
  for (const m of head.matchAll(/<meta\s+property=["'](?:og|article):[^"']*["'][^>]*>/gi)) tags.push(m[0]);
  for (const m of head.matchAll(/<meta\s+name=["']twitter:[^"']*["'][^>]*>/gi)) tags.push(m[0]);
  // JSON-LD im GANZEN Dokument suchen: SEOPress gibt die ld+json-Blöcke im <body> aus
  // (nach </head>), nicht im Head — daher hier `html` statt `head` (sonst geht das
  // strukturierte Daten-Markup auf allen Astro-Seiten verloren).
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)) tags.push(m[0]);
  return tags.join('\n').replace(
    /https:\/\/(?:dev|www)\.sanktbonifatius\.de(?:\.w021941a\.kasserver\.com)?(?!\/wp-content)/g,
    PUBLIC_SITE,
  );
}

// Termin-Beschreibung aus der gerenderten WP-Seite ziehen — sie steht NICHT im REST
// (`content` ist leer), sondern nur im Theme-Template `pbm-body-inner` (nach dem Meta-Block).
function extractEventBody(html) {
  const bi = html.indexOf('class="pbm-body-inner"');
  if (bi === -1) return '';
  const bounds = ['<script', '<footer', '</main', 'class="pbm-foot', 'class="pbm-related']
    .map((s) => html.indexOf(s, bi)).filter((i) => i > 0);
  let region = html.slice(bi, bounds.length ? Math.min(...bounds) : bi + 8000);
  region = region.replace(/<div class="pbm-meta"[\s\S]*?<\/a>\s*<\/div>/, ''); // Meta + „Alle Termine" raus
  const blocks = region.match(/<(p|h2|h3|h4|ul|ol|blockquote|figure)\b[^>]*>[\s\S]*?<\/\1>/gi) || [];
  // Fette Datums-Wiederholung entfernen (zeigen wir bereits in der kompakten Meta-Zeile).
  const filtered = blocks.filter((b) => {
    const text = b.replace(/<[^>]+>/g, '').trim();
    return !(/<strong>/i.test(b) && /\b20\d{2}\b/.test(text) && text.length < 120);
  });
  return filtered.join('\n');
}

export async function getSeoHead(path = '/', origin = WP_RENDER_ORIGIN) {
  try {
    const res = await fetch(origin + path, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    if (!res.ok) return '';
    return extractSeoTags(await res.text());
  } catch {
    return ''; // WP nicht erreichbar → Base.astro nutzt seine Standard-Tags
  }
}

// EIN Fetch der gerenderten Termin-Seite → SEO-Head UND Beschreibung (spart einen Abruf je Termin).
export async function getEventDetail(path) {
  try {
    const res = await fetch(WP_RENDER_ORIGIN + path, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    if (!res.ok) return { seo: '', description: '' };
    const html = await res.text();
    return { seo: extractSeoTags(html), description: extractEventBody(html) };
  } catch {
    return { seo: '', description: '' };
  }
}
