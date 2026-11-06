# SCHEINFIRMA

Seite der Scheinfirma, Filmproduktion.

## Inhalt

Frontend (nur die Welt): Lobby, Manifest, Werke, Roster, Core Log, Ghost Logs.
Backend: Higgsfield-Workflow, Character Sheets, Worldbook, Aufgaben (mit der Puppe als Office-Master).

| Bereich | Datei | Was dort steht |
|---|---|---|
| Roster, Character Sheets | `data/roster.json` | Figuren, Text der Figur (`stimme`), Referenzbilder |
| Manifest, Werke | `data/werke.js` | Manifest (aus `../Manifest/scheinfirma-manifest.md`), Werkverzeichnis |
| Worldbook | `data/weltbuch.json` | Lore, mit Herkunft je Eintrag (Deck, Manifest, Sheet, Vorschlag, Eingereicht) |
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
2. Eintrag in `data/roster.json` anlegen oder Leerstelle ausfüllen, `status: "aktiv"`
3. In `data/chronik.js` unter `SF.tagebuecher` einen leeren Ghost Log `<id>: []` anlegen
4. In `index.html` die Versionsnummer `?v=` hochzählen, damit Browser die neuen Dateien laden.
5. Commit, Push. GitHub Pages aktualisiert nach ein bis zwei Minuten.

## Sound

`sound.js` erzeugt den Soundtrack live im Browser (Web Audio): Drone, Bass-Puls, Arpeggio in A phrygisch, Datenrauschen. Schalter oben rechts, standardmäßig aus. Die Puppe löst beim Auftragziehen einen Glitch aus, Seitenwechsel einen kurzen Ton. Tempo, Tonleiter und Lautstärken stehen oben in der Datei.

## Baukasten und Eingang (Backend)

- **Baukasten** (Backend, Tab 07): Figur als Character Sheet (Bildplätze wie auf dem Sheet: Gesicht frontal/¾/Profil, Ganzkörper frontal/¾/Profil/Rücken/Profil 2, Full Sheet; dazu Kopf, Körper, Details, Palette) und ein Dossier (Stimme, Hintergrund, Wissen). Rolle (Funktion, Sorte, Abzeichen) ist bewusst nicht Teil der Figur. Dazu das Welt-Formular. Alles freiwillig; Beiträge kommen in ein Paket (JSON-Datei oder Text). Bilder werden im Browser auf max. 720 px verkleinert und ins Paket gelegt. „Prompt für deine KI kopieren“ erzeugt einen Prompt mit Worldbook und Figuren; liegt `data/weltbibel.md` vor, wird sie mitgegeben. `#einreichen` leitet hierher um.
- **Eingang** (Tab 08): Pakete laden, Feld für Feld annehmen oder verwerfen. Angenommenes landet in einer Arbeitskopie (nur dieser Browser). `roster.json` / `weltbuch.json` herunterladen und in `data/` ersetzen; Bilder einzeln speichern und nach `assets/figuren/<id>/` legen.
- Code: `einreichen.js`. Format: `{ format: "scheinfirma.einreichung", version: 1, von, erstellt, figuren: [{ ziel, felder, bilder, anmerkung }], welt: [{ art, ziel, kapitel, titel, text, verweise, anmerkung }] }`.

## Schriften

JetBrains Mono, Space Grotesk und Spectral liegen in `assets/fonts/` (SIL Open Font License) und werden nicht mehr von Google geladen.
