# SCHEINFIRMA

Seite der Scheinfirma, Filmproduktion.

## Inhalt

Frontend (nur die Welt): Lobby, Manifest, Werke, Roster, Core Log, Ghost Logs.
Backend: Higgsfield-Workflow, Character Sheets, Worldbook, Aufgaben (mit der Puppe als Office-Master).

| Bereich | Datei | Was dort steht |
|---|---|---|
| Roster, Character Sheets | `data/roster.js` | Figuren, Text der Figur (`stimme`), Referenzbilder |
| Manifest, Werke | `data/werke.js` | Manifest (aus `../Manifest/scheinfirma-manifest.md`), Werkverzeichnis |
| Worldbook | `data/weltbuch.js` | Lore, mit Herkunft je Eintrag (Deck, Manifest, Sheet, Vorschlag) |
| Core Log, Ghost Logs | `data/chronik.js` | Prolog und Chronik der Firma, Ghost Log je Figur |
| Aufgaben | `data/aufgaben.js` | allgemein und für Chance², im Backend Figuren zuteilbar |

Ein Feld mit `null` erscheint auf der Seite als **DATEN AUSSTEHEND**.

## Lokal ansehen

```bash
python3 -m http.server 8765
```

Dann http://localhost:8765 öffnen.

## Backend

Zuteilungen und Häkchen bleiben im jeweiligen Browser (kein Server, keine Zugangskontrolle).
Was dauerhaft gelten soll, wird in `data/aufgaben.js` eingetragen und committet.

## Neue Figur

1. Referenzbilder als JPG nach `assets/figuren/<id>/` und in `referenzen` eintragen; mindestens `face-front`, `full-front`, `full-sheet`
2. Eintrag in `data/roster.js` anlegen oder Leerstelle ausfüllen, `status: "aktiv"`
3. In `data/chronik.js` unter `SF.tagebuecher` einen leeren Ghost Log `<id>: []` anlegen
4. In `index.html` die Versionsnummer `?v=` hochzählen, damit Browser die neuen Dateien laden.
5. Commit, Push. GitHub Pages aktualisiert nach ein bis zwei Minuten.
