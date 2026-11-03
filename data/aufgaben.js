/* AUFGABEN — alles, was ansteht.
   bereich: "allgemein" (Scheinfirma insgesamt) | "chance2" (Projekt Schinkel Pavillon, Januar 2027)
   phase:   nur bei chance2 — "vorher" | "vor-ort" | "danach"
   figur:   id aus dem Roster oder null (= noch nicht zugeteilt) */
window.SF = window.SF || {};

SF.aufgaben = [
  // ── allgemein ──
  { id: "A-01", bereich: "allgemein", titel: "Character Sheets für Figur 02–11 erstellen (Gesicht, Ganzkörper, Full Sheet)", figur: null },
  { id: "A-02", bereich: "allgemein", titel: "Kaisha Goonin: Funktion, Vorgeschichte, Abzeichen festlegen", figur: "kaisha" },
  { id: "A-03", bereich: "allgemein", titel: "Abzeichen für jede Figur festlegen", figur: "halcyon_bo" },
  { id: "A-04", bereich: "allgemein", titel: "Manifest schreiben und unterzeichnen lassen", figur: "the_chair" },
  { id: "A-05", bereich: "allgemein", titel: "Weltbuch: Stadt, Konzerne, Technik, Sprache ausschreiben", figur: null },
  { id: "A-06", bereich: "allgemein", titel: "Testshot: Kaisha in vorhandenes Filmmaterial einsetzen (Workflow Schritt 4 durchspielen)", figur: "mother_solvent" },
  { id: "A-07", bereich: "allgemein", titel: "Werkzeug für digitale Figurenersetzung auswählen und Kosten klären", figur: "nix_farrow" },
  { id: "A-08", bereich: "allgemein", titel: "Stimme der Tagebücher und der Firmengeschichte festlegen (Mustertexte)", figur: null },
  { id: "A-09", bereich: "allgemein", titel: "Webseite: Impressum und Datenschutz ergänzen", figur: "marisol_vane" },

  // ── Chance² · Schinkel Pavillon · vorher ──
  { id: "C-01", bereich: "chance2", phase: "vorher", titel: "Vereinbarung mit dem Schinkel Pavillon: Räume, Zeiten, Strom, Zugang", figur: "the_chair" },
  { id: "C-02", bereich: "chance2", phase: "vorher", titel: "Mitwirkende über Arbeitsgelegenheiten gewinnen (Träger, Jobcenter)", figur: "vex_ortega" },
  { id: "C-03", bereich: "chance2", phase: "vorher", titel: "Einwilligungen für Film und Foto, Datenschutz der Mitwirkenden", figur: "marisol_vane" },
  { id: "C-04", bereich: "chance2", phase: "vorher", titel: "Drehplan für vier Tage, rückwärts vom fertigen Film", figur: "vex_ortega" },
  { id: "C-05", bereich: "chance2", phase: "vorher", titel: "Aufgabenpool für die vier Tage schreiben und Figuren zuordnen", figur: "salazar_prime" },
  { id: "C-06", bereich: "chance2", phase: "vorher", titel: "Abzeichen für alle Figuren beschaffen oder bauen", figur: "halcyon_bo" },
  { id: "C-07", bereich: "chance2", phase: "vorher", titel: "Puppe bauen: Rechner, Kamera, Bildschirm/Chat, Kartendrucker", figur: "nix_farrow" },
  { id: "C-08", bereich: "chance2", phase: "vorher", titel: "Kamera-, Ton- und Lichttechnik organisieren", figur: "frank_the_drifter" },
  { id: "C-09", bereich: "chance2", phase: "vorher", titel: "Fragen für Ankommen und Zurückmelden festlegen", figur: null },
  { id: "C-10", bereich: "chance2", phase: "vorher", titel: "Anwesenheitsliste auf Papier vorbereiten", figur: "marisol_vane" },
  { id: "C-11", bereich: "chance2", phase: "vorher", titel: "Schnittplatz und Speicher mit Backup einrichten", figur: "mother_solvent" },
  { id: "C-12", bereich: "chance2", phase: "vorher", titel: "Budget aufstellen", figur: "marisol_vane" },

  // ── Chance² · vor Ort (vier Tage) ──
  { id: "C-20", bereich: "chance2", phase: "vor-ort", titel: "Empfang halten", figur: "iris_kann" },
  { id: "C-21", bereich: "chance2", phase: "vor-ort", titel: "Material sammeln", figur: "frank_the_drifter" },
  { id: "C-22", bereich: "chance2", phase: "vor-ort", titel: "Dokumentiere einen sozialen Konflikt", figur: "frank_the_drifter" },
  { id: "C-23", bereich: "chance2", phase: "vor-ort", titel: "Material vom Vortag sichern", figur: "mother_solvent" },
  { id: "C-24", bereich: "chance2", phase: "vor-ort", titel: "Material sichten und sortieren", figur: "mother_solvent" },
  { id: "C-25", bereich: "chance2", phase: "vor-ort", titel: "Auswerten: Was fehlt im Bild?", figur: "dubois" },
  { id: "C-26", bereich: "chance2", phase: "vor-ort", titel: "Gemeldetes in neue Aufgaben umsetzen", figur: "salazar_prime" },
  { id: "C-27", bereich: "chance2", phase: "vor-ort", titel: "Fehlendes nachdrehen", figur: "frank_the_drifter" },
  { id: "C-28", bereich: "chance2", phase: "vor-ort", titel: "Ausstattung beschaffen und bauen", figur: "halcyon_bo" },
  { id: "C-29", bereich: "chance2", phase: "vor-ort", titel: "Licht, Strom, Geräte in Betrieb halten", figur: "nix_farrow" },
  { id: "C-30", bereich: "chance2", phase: "vor-ort", titel: "Tagebücher und Firmengeschichte täglich fortschreiben", figur: null },
  { id: "C-31", bereich: "chance2", phase: "vor-ort", titel: "Raum in Ordnung halten", figur: "marisol_vane" },
  { id: "C-32", bereich: "chance2", phase: "vor-ort", titel: "Schneiden und vertonen", figur: "mother_solvent" },
  { id: "C-33", bereich: "chance2", phase: "vor-ort", titel: "Fassung am vierten Tag zeigen", figur: "the_chair" },

  // ── Chance² · danach ──
  { id: "C-40", bereich: "chance2", phase: "danach", titel: "Tagebücher drucken, binden, aushändigen", figur: "halcyon_bo" },
  { id: "C-41", bereich: "chance2", phase: "danach", titel: "Endfassung des Films fertigstellen", figur: "mother_solvent" },
  { id: "C-42", bereich: "chance2", phase: "danach", titel: "Material archivieren", figur: "mother_solvent" },
  { id: "C-43", bereich: "chance2", phase: "danach", titel: "Werke-Verzeichnis und Firmengeschichte auf der Seite aktualisieren", figur: null }
];

SF.bereiche = { allgemein: "Allgemein · Scheinfirma", chance2: "Chance² · Schinkel Pavillon, Januar 2027" };
SF.phasen = { "vorher": "Vorbereitung", "vor-ort": "Vor Ort · vier Tage", "danach": "Danach" };
