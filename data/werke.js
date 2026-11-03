/* MANIFEST + WERKE — das, womit die Firma nach außen auftritt.
   Manifest: Entwurf, noch nicht freigegeben (Status steht im Backend).
   Werke: Register aller Produktionen. Felder mit null = Leerstelle. */
window.SF = window.SF || {};

SF.manifest = {
  status: "entwurf", // "entwurf" | "freigegeben"
  unterzeichnet: null, // z. B. "The Chair" oder "Kaisha Goonin"
  thesen: [],
  entwurf: [ // nicht öffentlich, nur Notiz
    "Wir drehen, was geschieht.",
    "Was fehlt, wird gebaut. Was gebaut wird, kommt ins Bild."
  ]
};

SF.werke = [
  { nr: "WK-001", titel: "Chance²", format: "Film", status: "in-produktion", jahr: "2027",
    ort: "Schinkel Pavillon, Berlin",
    logline: null,
    figuren: ["kaisha", "vex_ortega", "frank_the_drifter", "mother_solvent", "halcyon_bo", "nix_farrow", "iris_kann", "dubois", "salazar_prime", "the_chair", "marisol_vane"] },
  { nr: "WK-002", titel: "Tagebücher", format: "Buch, gedruckt und gebunden", status: "in-produktion", jahr: "2027",
    ort: null, logline: null, figuren: null },
  { nr: "WK-003", titel: "Firmengeschichte", format: "Buch, fortlaufend", status: "in-produktion", jahr: "2026–",
    ort: null, logline: null, figuren: null },
  { nr: "WK-004", titel: null, format: null, status: "geplant", jahr: null, ort: null, logline: null, figuren: null }
];

SF.werkStatus = {
  "geplant": "geplant",
  "in-produktion": "in Produktion",
  "abgeschlossen": "abgeschlossen"
};
