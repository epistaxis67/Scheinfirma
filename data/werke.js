/* MANIFEST + WERKE — das, womit die Firma nach außen auftritt.
   Manifest: Entwurf, noch nicht freigegeben (Status steht im Backend).
   Werke: Register aller Produktionen. Felder mit null = Leerstelle. */
window.SF = window.SF || {};

SF.manifest = {
  status: "entwurf", // "entwurf" | "freigegeben"
  unterzeichnet: null, // z. B. "The Chair" oder "Kaisha Goonin"
  thesen: [
    "Wir drehen, was geschieht.",
    "Wir erfinden nichts. Die Stadt liefert genug.",
    "Kein Auftrag wird erklärt. Jeder Auftrag wird erledigt.",
    "Was fehlt, wird gebaut. Was gebaut wird, kommt ins Bild.",
    "Wer für uns arbeitet, steht im Bild. Wer im Bild steht, gehört zur Firma.",
    "Wir schulden niemandem eine Antwort. Außer Kestrel Rentals: drei.",
    "Die Firma vergisst nichts. Alles geht ins Archiv."
  ]
};

SF.werke = [
  { nr: "WK-001", titel: "Chance²", format: "Film", status: "in-produktion", jahr: "2027",
    ort: "Schinkel Pavillon, Berlin",
    logline: "Die Firma vor der eigenen Kamera. Vier Tage, ein Film.",
    figuren: ["kaisha", "vex_ortega", "frank_the_drifter", "mother_solvent", "halcyon_bo", "nix_farrow", "iris_kann", "dubois", "salazar_prime", "the_chair", "marisol_vane"] },
  { nr: "WK-002", titel: "Tagebücher", format: "Buch, gedruckt und gebunden", status: "in-produktion", jahr: "2027",
    ort: null, logline: "Die Tagebücher der Belegschaft, gedruckt und gebunden.", figuren: null },
  { nr: "WK-003", titel: "Firmengeschichte", format: "Buch, fortlaufend", status: "in-produktion", jahr: "2026–",
    ort: null, logline: "Die Chronik der Firma.", figuren: null },
  { nr: "WK-004", titel: null, format: null, status: "geplant", jahr: null, ort: null, logline: null, figuren: null }
];

SF.werkStatus = {
  "geplant": "geplant",
  "in-produktion": "in Produktion",
  "abgeschlossen": "abgeschlossen"
};
