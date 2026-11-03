/* WELTBUCH — Schauplätze, Konzerne, Technik, Sprache.
   Nur Inhalte aus der Welt; Erklärungen zum Verfahren gehören ins Backend.
   kanon: true  = steht so im Pitch-Deck (wird nur im Backend angezeigt)
   text: null   = Leerstelle */
window.SF = window.SF || {};

SF.weltbuch = [
  {
    kapitel: "Schauplätze",
    code: "W-01",
    eintraege: [
      { titel: "Schinkel Pavillon, Berlin", kanon: true,
        text: "Chance², Januar 2027." },
      { titel: "Der Hinterhof", kanon: true,
        text: "Kisten der Ausstattung." },
      { titel: "Der Empfang", kanon: true,
        text: null },
      { titel: "Die Brücke", kanon: true,
        text: "Frank the Drifter kam über die Brücke." },
      { titel: "Arizona", kanon: false,
        text: "アリゾナ" },
      { titel: "Die Stadt", kanon: false, text: null }
    ]
  },
  {
    kapitel: "Konzerne",
    code: "W-02",
    eintraege: [
      { titel: "Kestrel Rentals", kanon: true,
        text: "Geräteverleih. Frank schuldet dort eine Kaution und drei Antworten. Kestrel Rentals schweigt." },
      { titel: "Weitere Konzerne", kanon: false, text: null }
    ]
  },
  {
    kapitel: "Technik",
    code: "W-03",
    eintraege: [
      { titel: "Verspiegelte Schutzbrille", kanon: true,
        text: "Frank the Drifter." },
      { titel: "Geräte, Implantate, Netz", kanon: false, text: null }
    ]
  },
  {
    kapitel: "Sprache",
    code: "W-04",
    eintraege: [
      { titel: "Slang, Flüche, Grußformeln", kanon: false, text: null }
    ]
  }
];
