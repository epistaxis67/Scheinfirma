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
        text: "Drehort von Chance². Vier Tage im Januar 2027." },
      { titel: "Der Hinterhof", kanon: true,
        text: "Wo die Ausstattung ihre Kisten stapelt. Hier wird über Kisten gestritten." },
      { titel: "Der Empfang", kanon: true,
        text: "Am Empfang steht, wer gerade da ist." },
      { titel: "Die Brücke", kanon: true,
        text: "Frank the Drifter kam über die Brücke. Was auf der anderen Seite liegt, sagt er nicht." },
      { titel: "Arizona", kanon: false,
        text: "Steht in Katakana auf Kaishas Rücken: アリゾナ." },
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
      { titel: "Die Puppe", kanon: true,
        text: "Sitzt am Eingang, eine Kamera auf dem Kopf, Kabel im Arm. Verteilt die Aufträge des Tages. Wer sie fragt, warum, bekommt den Auftrag noch einmal." },
      { titel: "Verspiegelte Schutzbrille", kanon: true,
        text: "Franks. Er nimmt sie nicht ab, auch nicht drinnen." },
      { titel: "Geräte, Implantate, Netz", kanon: false, text: null }
    ]
  },
  {
    kapitel: "Sprache",
    code: "W-04",
    eintraege: [
      { titel: "„Wie kommst du an?“", kanon: true, text: "Gruß am Morgen." },
      { titel: "„Wie ist es gelaufen?“", kanon: true, text: "Gruß am Abend." },
      { titel: "Slang, Flüche, Grußformeln", kanon: false, text: null }
    ]
  }
];
