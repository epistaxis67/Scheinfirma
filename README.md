# SCHEINFIRMA

Provisorische Seite der Scheinfirma: eine Filmproduktionsfirma (Chance²), geführt von ihrem Figurenstand.

## Inhalt

| Bereich | Datei | Was dort steht |
|---|---|---|
| Roster | `data/roster.js` | Figuren, Steckbriefe, Bilder. Kaisha Goonin ist Figur 01, Figur 02–11 sind Leerstellen. |
| Weltbuch | `data/weltbuch.js` | Schauplätze, Konzerne, Technik, Sprache |
| Firmengeschichte, Tagebücher | `data/chronik.js` | fortlaufend, vom Imaginator geschrieben |
| Aufgabenpool | `data/aufgaben.js` | wird im Backend vom Office-Master an Figuren verteilt |

Ein Feld mit `null` erscheint auf der Seite als **LEERSTELLE**.

## Lokal ansehen

```bash
python3 -m http.server 8765
```

Dann http://localhost:8765 öffnen.

## Backend

Das Backend (`#backend`) ist ein Prototyp ohne Server und ohne Zugangskontrolle.
Zuteilungen und Protokolleinträge bleiben im jeweiligen Browser und lassen sich als JSON exportieren.
Was dauerhaft gelten soll, wird in `data/*.js` eingetragen und committet.

## Neue Figur

1. Bilder nach `assets/figuren/<id>/`: `face-front.jpg`, `full-front.jpg`, `full-sheet.jpg`
2. Eintrag in `data/roster.js` anlegen oder Leerstelle ausfüllen, `status: "aktiv"`
3. In `data/chronik.js` unter `SF.tagebuecher` ein leeres Tagebuch `<id>: []` anlegen
4. Commit, Push. GitHub Pages aktualisiert nach ein bis zwei Minuten.
