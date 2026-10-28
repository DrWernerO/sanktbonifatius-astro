#!/usr/bin/env python3
"""Zerlegt die 360°-Panoramen des Rundgangs in Kacheln für Pannellum (Multires).

Aufruf (im Projektordner):
    python3 scripts/rundgang-kacheln.py <Ordner mit den Panoramen> [station-id ...] [--voll]

Ohne Stations-IDs werden alle Stationen aus src/data/rundgang.json verarbeitet.
Standard ist die HALBE Auflösung (Würfelfläche max. 2468 px, ca. 5 MB pro Station), weil die
Kacheln im Website-Projekt liegen (Entscheidung 28.10.2026). Mit --voll entsteht die volle Auflösung
der Insta360 X6 (4936 px, ca. 19 MB pro Station) — erst sinnvoll mit eigenem Kachel-Speicher.
Pro Station entsteht:
  public/rundgang/kacheln/<id>/<stufe>/<fläche><zeile>_<spalte>.jpg   (Kacheln)
  public/rundgang/vorschau/<id>.jpg                                          (Vorschaubild)
und die Kachel-Kennwerte landen in src/data/rundgang-kacheln.json.

Was das Skript tut (entspricht Pannellums utils/multires/generate.py, aber ohne Hugin/nona):
  1. Farbraum Display P3 -> sRGB (die Insta360 X6 exportiert in P3)
  2. Rundumbild (equirektangulär) -> sechs Würfelflächen f, b, u, d, l, r
  3. Bodenfläche d: Kreis mit Pfarrei-Logo über das Stativ legen ("Nadir-Patch")
  4. Jede Fläche in Stufen halbieren und in 512er-Kacheln schneiden
Benötigt: Python 3 mit Pillow und numpy.
"""
import io
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageCms, ImageDraw

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATEN = os.path.join(ROOT, 'src', 'data', 'rundgang.json')
KENNWERTE = os.path.join(ROOT, 'src', 'data', 'rundgang-kacheln.json')
KACHEL_ZIEL = os.path.join(ROOT, 'public', 'rundgang', 'kacheln')
VORSCHAU_ZIEL = os.path.join(ROOT, 'public', 'rundgang', 'vorschau')
LOGO = os.path.join(ROOT, 'public', 'uploads', '2025', '09', 'sanktbonifatius-logo.png')

KACHEL = 512
MAX_WUERFEL_HALB = 2468
QUALITAET = 80
NADIR_WINKEL = 13        # Grad um den Fußpunkt, die der Bodenkreis abdeckt
CREME = (245, 243, 239)
ROT = (226, 0, 26)
FLAECHEN = ['f', 'b', 'u', 'd', 'l', 'r']


def nach_srgb(bild):
    icc = bild.info.get('icc_profile')
    if not icc:
        return bild.convert('RGB')
    quelle = ImageCms.ImageCmsProfile(io.BytesIO(icc))
    ziel = ImageCms.createProfile('sRGB')
    return ImageCms.profileToProfile(bild, quelle, ziel, outputMode='RGB')


def richtungen(flaeche, u, v):
    """Blickrichtung (x rechts, y oben, z vorne) für Flächenkoordinaten u, v in [-1, 1]."""
    eins = np.ones_like(u)
    if flaeche == 'f':
        return u, -v, eins
    if flaeche == 'b':
        return -u, -v, -eins
    if flaeche == 'r':
        return eins, -v, -u
    if flaeche == 'l':
        return -eins, -v, u
    if flaeche == 'u':
        return u, eins, v
    return u, -eins, -v  # 'd'


def wuerfelflaeche(quelle, flaeche, n):
    hoehe, breite, _ = quelle.shape
    ergebnis = np.empty((n, n, 3), dtype=np.uint8)
    spalten = (2 * (np.arange(n, dtype=np.float32) + 0.5) / n - 1)[None, :]
    for start in range(0, n, 256):
        ende = min(start + 256, n)
        zeilen = (2 * (np.arange(start, ende, dtype=np.float32) + 0.5) / n - 1)[:, None]
        u = np.broadcast_to(spalten, (ende - start, n))
        v = np.broadcast_to(zeilen, (ende - start, n))
        x, y, z = richtungen(flaeche, u, v)
        laenge = np.arctan2(x, z)
        breite_w = np.arctan2(y, np.hypot(x, z))
        px = (laenge / (2 * np.pi) + 0.5) * breite - 0.5
        py = (0.5 - breite_w / np.pi) * hoehe - 0.5
        x0 = np.floor(px).astype(np.int64)
        y0 = np.floor(py).astype(np.int64)
        fx = (px - x0)[..., None]
        fy = (py - y0)[..., None]
        x0 %= breite
        x1 = (x0 + 1) % breite
        y0c = np.clip(y0, 0, hoehe - 1)
        y1c = np.clip(y0 + 1, 0, hoehe - 1)
        a = quelle[y0c, x0].astype(np.float32)
        b = quelle[y0c, x1].astype(np.float32)
        c = quelle[y1c, x0].astype(np.float32)
        d = quelle[y1c, x1].astype(np.float32)
        wert = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
        ergebnis[start:ende] = np.clip(wert + 0.5, 0, 255).astype(np.uint8)
    return Image.fromarray(ergebnis)


def nadir_patch(flaeche):
    n = flaeche.size[0]
    r = math.tan(math.radians(NADIR_WINKEL)) * n / 2
    gross = 4
    seite = int(2 * r * gross) + 8
    patch = Image.new('RGBA', (seite, seite), (0, 0, 0, 0))
    zeichnung = ImageDraw.Draw(patch)
    mitte = seite / 2
    radius = r * gross
    zeichnung.ellipse([mitte - radius, mitte - radius, mitte + radius, mitte + radius], fill=CREME + (255,))
    ring = radius * 0.035
    zeichnung.ellipse([mitte - radius + ring, mitte - radius + ring, mitte + radius - ring, mitte + radius - ring],
                      outline=ROT + (255,), width=max(2, int(ring)))
    if os.path.exists(LOGO):
        logo = Image.open(LOGO).convert('RGBA')
        # Das Logo ist für die dunkle Navigation gemacht (weiße Schrift) -> Schrift dunkel einfärben,
        # der bunte Ring bleibt unverändert.
        pixel = np.array(logo)
        weiss = (pixel[..., 0] > 200) & (pixel[..., 1] > 200) & (pixel[..., 2] > 200)
        pixel[weiss, :3] = (26, 26, 26)
        logo = Image.fromarray(pixel)
        max_seite = radius * 1.55
        faktor = min(max_seite / logo.width, max_seite / logo.height)
        logo = logo.resize((int(logo.width * faktor), int(logo.height * faktor)), Image.LANCZOS)
        patch.alpha_composite(logo, (int(mitte - logo.width / 2), int(mitte - logo.height / 2)))
    klein = int(2 * r) + 2
    patch = patch.resize((klein, klein), Image.LANCZOS)
    flaeche = flaeche.convert('RGBA')
    flaeche.alpha_composite(patch, (int(n / 2 - klein / 2), int(n / 2 - klein / 2)))
    return flaeche.convert('RGB')


def verarbeite(station, ordner, voll=False):
    pfad = os.path.join(ordner, station['datei'])
    print(f"Station {station['nr']}: {station['datei']}", flush=True)
    bild = nach_srgb(Image.open(pfad))
    quelle = np.asarray(bild)
    breite = quelle.shape[1]
    wuerfel = 8 * int(breite / math.pi / 8)
    while not voll and wuerfel > MAX_WUERFEL_HALB:
        wuerfel = int(wuerfel / 2)
    stufen = int(math.ceil(math.log(float(wuerfel) / KACHEL, 2))) + 1
    ziel = os.path.join(KACHEL_ZIEL, station['id'])
    for stufe in range(1, stufen + 1):
        os.makedirs(os.path.join(ziel, str(stufe)), exist_ok=True)
    for buchstabe in FLAECHEN:
        flaeche = wuerfelflaeche(quelle, buchstabe, wuerfel)
        if buchstabe == 'd':
            flaeche = nadir_patch(flaeche)
        if buchstabe == station.get('vorschauFlaeche', 'f'):
            os.makedirs(VORSCHAU_ZIEL, exist_ok=True)
            vorschau = flaeche.resize((960, 960), Image.LANCZOS).crop((0, 180, 960, 780))
            vorschau.save(os.path.join(VORSCHAU_ZIEL, station['id'] + '.jpg'), quality=82)
        groesse = wuerfel
        for stufe in range(stufen, 0, -1):
            if stufe < stufen:
                flaeche = flaeche.resize((groesse, groesse), Image.LANCZOS)
            anzahl = int(math.ceil(float(groesse) / KACHEL))
            for i in range(anzahl):
                for j in range(anzahl):
                    kachel = flaeche.crop((j * KACHEL, i * KACHEL, min((j + 1) * KACHEL, groesse), min((i + 1) * KACHEL, groesse)))
                    kachel.save(os.path.join(ziel, str(stufe), f'{buchstabe}{i}_{j}.jpg'), quality=QUALITAET)
            groesse = int(groesse / 2)
        print(f"  Fläche {buchstabe} fertig", flush=True)
    return {'cubeResolution': wuerfel, 'maxLevel': stufen, 'tileResolution': KACHEL}


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    ordner = sys.argv[1]
    voll = '--voll' in sys.argv[2:]
    auswahl = set(a for a in sys.argv[2:] if not a.startswith('--'))
    with open(DATEN, encoding='utf-8') as f:
        daten = json.load(f)
    kennwerte = {}
    if os.path.exists(KENNWERTE):
        with open(KENNWERTE, encoding='utf-8') as f:
            kennwerte = json.load(f)
    for station in daten['stationen']:
        if auswahl and station['id'] not in auswahl:
            continue
        kennwerte[station['id']] = verarbeite(station, ordner, voll)
        with open(KENNWERTE, 'w', encoding='utf-8') as f:
            json.dump(kennwerte, f, indent=2, ensure_ascii=False)
            f.write('\n')
    print('Fertig.')


if __name__ == '__main__':
    main()
