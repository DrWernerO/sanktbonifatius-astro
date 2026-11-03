#!/usr/bin/env bash
# Fotos für public/uploads auf Web-Größe bringen (Handbuch 1j), nur macOS-Bordmittel (sips).
#
#   scripts/bilder-verkleinern.sh foto.jpg [weitere ...]        normal: max. 1600 px, Ziel < 300 KB
#   scripts/bilder-verkleinern.sh --leiste foto.jpg [...]       Bildleiste/Vorschau: max. 600 px, Ziel < 100 KB
#   scripts/bilder-verkleinern.sh --pruefen                     listet alle Dateien > 1 MB in public/uploads
#
# Die Datei wird an Ort und Stelle ersetzt; das Original wandert vorher nach
# bilder-originale.nosync/<datum>/ (nicht im Repo, nicht in iCloud).
# PNG bleibt PNG (Transparenz/Logos); JPG wird mit abnehmender Qualität gespeichert, bis das Ziel passt.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" = "--pruefen" ]; then
  find public/uploads -type f -size +1M -exec ls -lh {} \; | awk '{print $5"\t"$9}' | sort -h
  exit 0
fi

kante=1600; ziel_kb=300
if [ "${1:-}" = "--leiste" ]; then kante=600; ziel_kb=100; shift; fi
[ $# -gt 0 ] || { sed -n '2,12p' "$0"; exit 1; }

sicherung="bilder-originale.nosync/$(date +%Y-%m-%d)"
mkdir -p "$sicherung"

for datei in "$@"; do
  [ -f "$datei" ] || { echo "fehlt: $datei"; continue; }
  ziel_pfad="$sicherung/${datei//\//__}"
  [ -e "$ziel_pfad" ] || cp -p "$datei" "$ziel_pfad"
  vorher=$(( $(stat -f %z "$ziel_pfad") / 1024 ))   # immer vom gesicherten Original aus

  breite=$(sips -g pixelWidth "$ziel_pfad" | awk '/pixelWidth/{print $2}')
  hoehe=$(sips -g pixelHeight "$ziel_pfad" | awk '/pixelHeight/{print $2}')
  lang=$(( breite > hoehe ? breite : hoehe ))
  tmp="$(mktemp -d)/$(basename "$datei")"

  case "$(echo "${datei##*.}" | tr '[:upper:]' '[:lower:]')" in
    jpg|jpeg)
      for q in 82 75 70; do
        if [ "$lang" -gt "$kante" ]; then
          sips -Z "$kante" -s format jpeg -s formatOptions "$q" "$ziel_pfad" --out "$tmp" >/dev/null
        else
          sips -s format jpeg -s formatOptions "$q" "$ziel_pfad" --out "$tmp" >/dev/null
        fi
        [ $(( $(stat -f %z "$tmp") / 1024 )) -le "$ziel_kb" ] && break
      done ;;
    png)
      if [ "$lang" -gt "$kante" ]; then sips -Z "$kante" "$ziel_pfad" --out "$tmp" >/dev/null
      else cp "$ziel_pfad" "$tmp"; fi ;;
    *) echo "übersprungen (kein JPG/PNG): $datei"; continue ;;
  esac

  nachher=$(( $(stat -f %z "$tmp") / 1024 ))
  if [ "$nachher" -ge "$vorher" ]; then
    echo "unverändert (schon klein genug): $datei  ${vorher} KB"
    continue
  fi
  mv "$tmp" "$datei"
  hinweis=""
  if [ "$nachher" -gt "$ziel_kb" ]; then
    case "$datei" in *.png|*.PNG) hinweis="  (über ${ziel_kb} KB – Foto? Dann besser als JPG speichern)" ;;
                     *) hinweis="  (über ${ziel_kb} KB – sehr detailreiches Foto, so lassen)" ;; esac
  fi
  echo "${vorher} KB -> ${nachher} KB  $datei$hinweis"
done
