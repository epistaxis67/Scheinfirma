/* ROSTER — der Figurenstand der Scheinfirma.
   Eine Figur = ein Objekt. Felder mit null erscheinen auf der Seite als LEERSTELLE.
   Neue Figur: Bilder nach assets/figuren/<id>/ legen, Objekt unten ergänzen, status auf "aktiv". */
window.SF = window.SF || {};

SF.roster = [
  {
    id: "kaisha",
    nr: "01",
    name: "Kaisha Goonin",
    kana: "会社",
    status: "aktiv",
    sorte: null, // "filmproduktion" | "unvorhergesehenes" | "jede-firma"
    funktionen: null,
    kurz: null,
    vorgeschichte: null,
    insignie: null,
    insignieVorschlag: "Messingring an Kette mit violetter Quaste — die Figur hält ihn auf allen Ansichten in den Händen.",
    erkennungszeichen: [
      "Maske aus gealtertem, elfenbeinfarbenem Material: Mittelnaht, Wangenplatten, violetter Kreis auf der Stirn",
      "Riemen mit Messingschnallen, lange violette Bänder am Hinterkopf",
      "Türkise Haori-Jacke: Kirschblüten, Fuji vor gelber Sonne, Schachbrettmuster am Saum",
      "Rückenaufschrift アリゾナ („Arizona“)",
      "Violette Lederjacke mit Messing-Reißverschluss, Stehkragen",
      "Sandfarbene Cargohose mit violetten Riemen, Sneaker in Jackenfarben"
    ],
    palette: ["#e6ddd2", "#4fb3a0", "#d77fae", "#5d4470", "#f1c84b", "#2e2a33"],
    zustaendigkeiten: null,
    offeneFaeden: null,
    ton: null,
    bilder: {
      face: "assets/figuren/kaisha/face-front.jpg",
      front: "assets/figuren/kaisha/full-front.jpg",
      sheet: "assets/figuren/kaisha/full-sheet.jpg"
    },
    fragen: [
      "Welche Funktion(en) trägt Kaisha in Chance²? Ersetzt die Figur eine der zehn aus dem Pitch-Deck oder ist sie die elfte?",
      "Was bedeutet „Goonin“? Gibt es eine Schreibweise in Kanji/Katakana?",
      "Warum „Arizona“ auf dem Rücken — Herkunft, Firmenname, Ort im Weltbuch?",
      "Ist der Messingring die Insignie, oder die Maske?",
      "Vorgeschichte und Tonlage für das Tagebuch."
    ]
  },

  // ── LEERSTELLEN: Arbeitstitel aus dem Pitch-Deck (S. 15), noch ohne Character Sheet ──
  { id: "vex_ortega", nr: "02", name: "Vex Ortega", status: "leerstelle", sorte: "filmproduktion",
    funktionen: ["Produktion"], kurz: "hält den Tag zusammen, entscheidet, was zuerst läuft" },
  { id: "frank_the_drifter", nr: "03", name: "Frank the Drifter", status: "leerstelle", sorte: "filmproduktion",
    funktionen: ["Kamera", "Ton"], kurz: "dreht, nimmt auf, geht dahin, wo etwas passiert",
    vorgeschichte: "Kam über die Brücke, mit dem Gerät und ohne Papiere. Schuldet Kestrel Rentals eine Kaution und drei Antworten.",
    insignie: "verspiegelte Schutzbrille" },
  { id: "mother_solvent", nr: "04", name: "Mother Solvent", status: "leerstelle", sorte: "filmproduktion",
    funktionen: ["Schnitt", "Material"], kurz: "sichtet, sortiert, sichert, wirft weg" },
  { id: "halcyon_bo", nr: "05", name: "Halcyon Bo", status: "leerstelle", sorte: "filmproduktion",
    funktionen: ["Ausstattung"], kurz: "beschafft und baut, was im Bild steht" },
  { id: "nix_farrow", nr: "06", name: "Nix Farrow", status: "leerstelle", sorte: "filmproduktion",
    funktionen: ["Technik"], kurz: "Licht, Strom, Gerät, Reparatur" },
  { id: "iris_kann", nr: "07", name: "Iris Kann", status: "leerstelle", sorte: "unvorhergesehenes",
    funktionen: ["Empfang"], kurz: "nimmt an, wer und was hereinkommt" },
  { id: "dubois", nr: "08", name: "Dubois", status: "leerstelle", sorte: "unvorhergesehenes",
    funktionen: ["Meldung"], kurz: "bemerkt, was anfällt, und gibt es weiter" },
  { id: "salazar_prime", nr: "09", name: "Salazar Prime", status: "leerstelle", sorte: "unvorhergesehenes",
    funktionen: ["Disposition"], kurz: "macht aus Gemeldetem neue Aufträge" },
  { id: "the_chair", nr: "10", name: "The Chair", status: "leerstelle", sorte: "jede-firma",
    funktionen: ["Geschäftsführung"], kurz: "vertritt die Firma nach außen, zeichnet ab" },
  { id: "marisol_vane", nr: "11", name: "Marisol Vane", status: "leerstelle", sorte: "jede-firma",
    funktionen: ["Buchhaltung", "Reinigung"], kurz: "führt Bestand und Fristen, hält den Raum in Ordnung" }
];

SF.sorten = {
  "filmproduktion": "Filmproduktion",
  "unvorhergesehenes": "Unvorhergesehenes",
  "jede-firma": "jede Firma"
};
