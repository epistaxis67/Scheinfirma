/* FIRMENGESCHICHTE + TAGEBÜCHER — werden vom Imaginator fortgeschrieben.
   quelle: "imaginator" | "gruendung" | "muster" (Beispieltext aus dem Pitch-Deck)
   Einträge mit quelle "muster" erscheinen nur im Backend, nicht im Frontend.
   text: null = noch nicht geschrieben */
window.SF = window.SF || {};

SF.chronik = [
  { id: "PROLOG", datum: "vor der Gründung", titel: "Prolog", quelle: "prolog", text: null }, // folgt aus dem Worldbook, Text kommt als eigene Datei
  { id: "000", datum: "2026-11-03", titel: "Gründung", quelle: "gruendung",
    text: "Scheinfirma. Gegründet." },
  { id: "M-01", datum: "Muster", titel: "Am zweiten Tag", quelle: "muster",
    text: "Am zweiten Tag hat die Firma aufgehört, sich zu erklären, und angefangen zu liefern. Im Hinterhof wurde über Kisten gestritten, am Empfang stand, wer gerade da war. Zwei Abteilungen arbeiteten gegeneinander, ohne es zu bemerken. Was fehlte, wurde gebaut. Was gebaut wurde, kam ins Bild." },
  { id: "001", datum: "2027-01 · Tag 1", titel: null, quelle: "imaginator", text: null },
  { id: "002", datum: "2027-01 · Tag 2", titel: null, quelle: "imaginator", text: null },
  { id: "003", datum: "2027-01 · Tag 3", titel: null, quelle: "imaginator", text: null },
  { id: "004", datum: "2027-01 · Tag 4", titel: null, quelle: "imaginator", text: null }
];

SF.tagebuecher = {
  kaisha: [],
  shiny: []
};

// Frontend zeigt nur, was keine Muster sind
SF.oeffentlich = (liste) => (liste || []).filter((e) => e.quelle !== "muster");
