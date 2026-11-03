/* FIRMENGESCHICHTE + TAGEBÜCHER — werden vom Imaginator fortgeschrieben.
   quelle: "imaginator" | "gruendung" | "muster" (Beispieltext aus dem Pitch-Deck)
   Einträge mit quelle "muster" erscheinen nur im Backend, nicht im Frontend.
   text: null = noch nicht geschrieben */
window.SF = window.SF || {};

SF.chronik = [
  { id: "000", datum: "2026-11-03", titel: "Gründung", quelle: "gruendung",
    text: "Die Firma meldet sich an. Name: Scheinfirma. Gewerbe: Filmproduktion. Als Erste unterschreibt Kaisha Goonin, ohne die Maske abzunehmen. Die übrigen Akten sind angelegt. Die Kamera läuft ab Januar." },
  { id: "M-01", datum: "Muster", titel: "Am zweiten Tag", quelle: "muster",
    text: "Am zweiten Tag hat die Firma aufgehört, sich zu erklären, und angefangen zu liefern. Im Hinterhof wurde über Kisten gestritten, am Empfang stand, wer gerade da war, und Kestrel Rentals schwieg weiter. Zwei Abteilungen arbeiteten gegeneinander, ohne es zu bemerken. Was fehlte, wurde gebaut. Was gebaut wurde, kam ins Bild." },
  { id: "001", datum: "2027-01 · Tag 1", titel: null, quelle: "imaginator", text: null },
  { id: "002", datum: "2027-01 · Tag 2", titel: null, quelle: "imaginator", text: null },
  { id: "003", datum: "2027-01 · Tag 3", titel: null, quelle: "imaginator", text: null },
  { id: "004", datum: "2027-01 · Tag 4", titel: null, quelle: "imaginator", text: null }
];

SF.tagebuecher = {
  kaisha: [],
  frank_the_drifter: [
    { datum: "Muster", auftrag: "dokumentiere einen sozialen konflikt", quelle: "muster",
      antritt: "müde, wenig geschlafen", rueckgabe: "ging leichter als gedacht",
      text: "Der Auftrag kam von oben: herausfinden, wo es zwischen den Leuten knirscht, und es für The Chair festhalten. Ich hatte kaum geschlafen und wenig Geduld für Menschen. Also bin ich in den Hinterhof, wo die Ausstattung ihre Kisten stapelt, und habe gewartet, bis jemand etwas über die Kisten sagt. Es ging leichter als gedacht. Seit der Brücke ist das der erste Ort, an dem meine Anwesenheit einen Unterschied macht." }
  ]
};

// Frontend zeigt nur, was keine Muster sind
SF.oeffentlich = (liste) => (liste || []).filter((e) => e.quelle !== "muster");
