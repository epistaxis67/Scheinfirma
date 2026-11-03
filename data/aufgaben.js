/* AUFGABENPOOL — liest der Office-Master.
   typ: "produktion" (rückwärts vom Film) | "aufbau" (die Firma einrichten) | "welt" (Weltbuch/Figuren schreiben)
   figur: id aus dem Roster oder null (= noch nicht zugeteilt) */
window.SF = window.SF || {};

SF.aufgaben = [
  // ── Produktion: rückwärts vom Film bis zum ersten Auftrag (Pitch-Deck S. 14) ──
  { id: "P-01", typ: "produktion", titel: "Material sammeln", figur: "frank_the_drifter" },
  { id: "P-02", typ: "produktion", titel: "Dokumentiere einen sozialen Konflikt", figur: "frank_the_drifter" },
  { id: "P-03", typ: "produktion", titel: "Sichere das Material vom Vortag", figur: "mother_solvent" },
  { id: "P-04", typ: "produktion", titel: "Material sichten und sortieren", figur: "mother_solvent" },
  { id: "P-05", typ: "produktion", titel: "Auswerten: Was fehlt im Bild?", figur: null },
  { id: "P-06", typ: "produktion", titel: "Fehlendes nachdrehen", figur: "frank_the_drifter" },
  { id: "P-07", typ: "produktion", titel: "Schneiden", figur: "mother_solvent" },
  { id: "P-08", typ: "produktion", titel: "Vertonen", figur: null },
  { id: "P-09", typ: "produktion", titel: "Fassung zeigen", figur: "the_chair" },
  { id: "P-10", typ: "produktion", titel: "Halte den Empfang bis mittag", figur: "iris_kann" },

  // ── Aufbau: was vor Januar 2027 stehen muss ──
  { id: "A-01", typ: "aufbau", titel: "Insignien für alle Figuren festlegen und beschaffen", figur: "halcyon_bo" },
  { id: "A-02", typ: "aufbau", titel: "Puppe einrichten: Rechner, Kamera, Chat, Kartendrucker", figur: "nix_farrow" },
  { id: "A-03", typ: "aufbau", titel: "Anwesenheitsliste (Papier, außerhalb der Werkzeuge) vorbereiten", figur: "marisol_vane" },
  { id: "A-04", typ: "aufbau", titel: "Fragen für Antritt und Rückgabe festlegen (eine Frage bis Interview)", figur: null },
  { id: "A-05", typ: "aufbau", titel: "Imaginator-Prompt schreiben: Protokoll → Tagebuch → Firmengeschichte", figur: null },
  { id: "A-06", typ: "aufbau", titel: "Echtes Backend wählen: wo liegen Pool und Protokoll während der vier Tage?", figur: null },

  // ── Welt: Figuren und Weltbuch schreiben ──
  { id: "W-01", typ: "welt", titel: "Kaisha Goonin: Funktion, Vorgeschichte, Insignie klären", figur: "kaisha" },
  { id: "W-02", typ: "welt", titel: "Character Sheets (Bild + Steckbrief) für Figur 02–11", figur: null },
  { id: "W-03", typ: "welt", titel: "Weltbuch: Stadt, Brücke, Arizona ausschreiben", figur: null },
  { id: "W-04", typ: "welt", titel: "Weltbuch: weitere Konzerne neben Kestrel Rentals", figur: null },
  { id: "W-05", typ: "welt", titel: "Sprache: Slang, Grußformeln, Tonlage der Erzählung", figur: null }
];

SF.aufgabenTypen = {
  produktion: "Produktion",
  aufbau: "Aufbau",
  welt: "Welt"
};
