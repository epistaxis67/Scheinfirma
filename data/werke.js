/* MANIFEST + WERKE — das, womit die Firma nach außen auftritt.
   Manifest: Entwurf, noch nicht freigegeben (Status steht im Backend).
   Werke: Register aller Produktionen. Felder mit null = Leerstelle. */
window.SF = window.SF || {};

SF.manifest = {
  status: "entwurf", // "entwurf" | "freigegeben"
  unterzeichnet: null, // z. B. "The Chair" oder "Kaisha Goonin"
  thesen: [
    "Wir stellen keine Menschen ein. Wir besetzen Figuren.",
    "Wer bei uns arbeitet, arbeitet unter einem fremden Namen. Der Name bleibt, wenn er geht.",
    "Jede Figur hat eine Vergangenheit, die sie nicht selbst erlebt hat, und eine Zukunft, die jemand anderes erleben wird.",
    "Wir drehen, was bei uns geschieht. Unser erster Film handelt von uns.",
    "Nichts wird erfunden. Alles wird erzählt.",
    "Wer fragt, warum ein Auftrag kommt, bekommt den Auftrag.",
    "Was hier geleistet wird, gehört der Figur. Wer sie getragen hat, steht auf der Liste."
  ]
};

SF.werke = [
  { nr: "WK-001", titel: "Chance²", format: "Film", status: "in-produktion", jahr: "2027",
    ort: "Schinkel Pavillon, Berlin",
    logline: "Eine Filmproduktion dreht ihre eigene Entstehung.",
    figuren: ["kaisha", "vex_ortega", "frank_the_drifter", "mother_solvent", "halcyon_bo", "nix_farrow", "iris_kann", "dubois", "salazar_prime", "the_chair", "marisol_vane"] },
  { nr: "WK-002", titel: "Tagebücher", format: "Buch, gedruckt und gebunden", status: "in-produktion", jahr: "2027",
    ort: null, logline: "Je Figur ein Band.", figuren: null },
  { nr: "WK-003", titel: "Firmengeschichte", format: "Buch, fortlaufend", status: "in-produktion", jahr: "2026–",
    ort: null, logline: "Die Chronik der Firma, geschrieben, während sie arbeitet.", figuren: null },
  { nr: "WK-004", titel: null, format: null, status: "geplant", jahr: null, ort: null, logline: null, figuren: null }
];

SF.werkStatus = {
  "geplant": "geplant",
  "in-produktion": "in Produktion",
  "abgeschlossen": "abgeschlossen"
};
