# SCHEINFIRMA

Provisorische Seite der Scheinfirma: eine Filmproduktionsfirma (Chance²), geführt von ihrem Figurenstand.

## Inhalt

| Bereich | Datei | Was dort steht |
|---|---|---|
| Roster | `data/roster.js` | Figuren, Steckbriefe, Bilder. Kaisha Goonin ist Figur 01, Figur 02–11 sind Leerstellen. |
| Manifest, Werke | `data/werke.js` | Thesen (noch leer), Werkverzeichnis |
| Weltbuch | `data/weltbuch.js` | Schauplätze, Konzerne, Technik, Sprache |
| Firmengeschichte, Tagebücher | `data/chronik.js` | fortlaufend, vom Imaginator geschrieben |
| Aufgaben | `data/aufgaben.js` | allgemein und für Chance², im Backend Figuren zuteilbar |

Ein Feld mit `null` erscheint auf der Seite als **LEERSTELLE**.

## Lokal ansehen

```bash
python3 -m http.server 8765
```

Dann http://localhost:8765 öffnen.

## Backend

Das Backend (`#backend`) hat zwei Teile:

1. **Workflow: Figuren** — vom Steckbrief über das Character Sheet bis zum Einsetzen der Figur in Filmmaterial.
2. **Aufgaben** — alles, was ansteht: allgemein und für Chance² am Schinkel Pavillon (Vorbereitung, vor Ort, danach). Jede Aufgabe lässt sich einer Figur zuteilen.

Zuteilungen und Häkchen bleiben im jeweiligen Browser (kein Server, keine Zugangskontrolle).
Was dauerhaft gelten soll, wird in `data/aufgaben.js` eingetragen und committet.

## Neue Figur

1. Bilder nach `assets/figuren/<id>/`: `face-front.jpg`, `full-front.jpg`, `full-sheet.jpg`
2. Eintrag in `data/roster.js` anlegen oder Leerstelle ausfüllen, `status: "aktiv"`
3. In `data/chronik.js` unter `SF.tagebuecher` ein leeres Tagebuch `<id>: []` anlegen
4. In `index.html` die Versionsnummer `?v=` hochzählen, damit Browser die neuen Dateien laden.
5. Commit, Push. GitHub Pages aktualisiert nach ein bis zwei Minuten.
