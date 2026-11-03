/* WELTBUCH — Schauplätze, Konzerne, Technik, Sprache.
   kanon: true  = steht so im Pitch-Deck
   text: null   = Leerstelle */
window.SF = window.SF || {};

SF.weltbuch = [
  {
    kapitel: "Die Firma",
    code: "W-00",
    eintraege: [
      { titel: "Scheinfirma", kanon: true,
        text: "Die Organisationsform. Löst die Kopplung von Identität und Ausführendem: Personen kommen und gehen, die Figuren bleiben und wachsen weiter." },
      { titel: "Chance²", kanon: true,
        text: "Erste Konfiguration der Scheinfirma: eine Filmproduktionsfirma, die ihre eigene Entstehung dreht. Ihr erstes Erzeugnis ist nicht der Film, sondern die Figur." },
      { titel: "Der Figurenstand", kanon: true,
        text: "Die Firma wird von einem fiktiven Figurenstand geführt. Wer arbeitet, tritt als Figur auf, handelt unter ihrem Namen und wird gefilmt." },
      { titel: "Firmensitz in der Fiktion", kanon: false, text: null }
    ]
  },
  {
    kapitel: "Schauplätze",
    code: "W-01",
    eintraege: [
      { titel: "Schinkel Pavillon, Berlin", kanon: true,
        text: "Januar 2027, vier Tage. Besetzt mit Menschen aus Arbeitsgelegenheiten. Erzeugnis: Film, Tagebücher, Firmengeschichte." },
      { titel: "Der Hinterhof", kanon: true,
        text: "Wo die Ausstattung ihre Kisten stapelt. Hier wurde am zweiten Tag über Kisten gestritten." },
      { titel: "Der Empfang", kanon: true,
        text: "Am Empfang steht, wer gerade da ist." },
      { titel: "Die Brücke", kanon: true,
        text: "Frank the Drifter kam über die Brücke. Welche Brücke, und was liegt auf der anderen Seite?" },
      { titel: "Arizona", kanon: false,
        text: "Steht in Katakana auf Kaishas Rücken. Ort, Konzern oder Erinnerung? Offen." },
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
        text: "Die Ordnung steht im Raum und ist ansprechbar. Gerät: Rechner in der Puppe. Kanal: Chat, Karte auf Papier. Spricht: Office-Master und Imaginator. Adressat: immer eine Rolle." },
      { titel: "Office-Master", kanon: true,
        text: "Backend (real × symbolisch). Teilt der Person eine Rolle zu, gibt ihr eine Aufgabe aus dem Aufgabenpool und nimmt sie zurück." },
      { titel: "Imaginator", kanon: true,
        text: "Frontend (symbolisch × imaginär). Liest Roster, Weltbuch und Protokoll und schreibt daraus ein Tagebuch je Figur und die Firmengeschichte." },
      { titel: "Das Protokoll", kanon: true,
        text: "Die einzige Verbindung zwischen beiden Werkzeugen. Ausgabe, Rückgabe, Eingang. Der Imaginator liest nur pseudonymisierte Einträge." },
      { titel: "Insignien", kanon: true,
        text: "Mit der Insignie geht die Rolle in die Figur über. Bekannt: verspiegelte Schutzbrille (Frank the Drifter)." }
    ]
  },
  {
    kapitel: "Sprache",
    code: "W-04",
    eintraege: [
      { titel: "Antritt", kanon: true, text: "Meldet die Person: „Wie kommst du an?“ Geht ins Protokoll." },
      { titel: "Rückgabe", kanon: true, text: "Meldet die Figur: „Wie ist es gelaufen?“ Geht ins Protokoll." },
      { titel: "Übernahme", kanon: true, text: "Einsetzungsritus. Mit den Insignien geht die Rolle in die Figur über." },
      { titel: "Fortschreibung", kanon: true, text: "Écriture automatique. Aus dem Protokoll wächst das Tagebuch der Figur, bevor sie der Nächste übernimmt." },
      { titel: "Narror, ergo sum", kanon: true, text: "Ich werde erzählt, also bin ich." },
      { titel: "Slang, Flüche, Grußformeln", kanon: false, text: null },
      { titel: "Tonlage der Erzählung", kanon: false, text: null }
    ]
  }
];
