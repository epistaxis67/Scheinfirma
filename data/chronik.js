/* FIRMENGESCHICHTE + TAGEBÜCHER — werden vom Imaginator fortgeschrieben.
   quelle: "imaginator" | "gruendung" | "werkstatt" (aus /figur) | "muster" (Beispieltext aus dem Pitch-Deck)
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
  kaisha: [
    { id: "K-001", datum: "Ankunft", titel: "Erwacht", quelle: "werkstatt",
      text: "Erwacht. Kein Licht, nur das Summen des Aggregats. Um mich Gestalten, die sich ansehen, als suchten sie ihr eigenes Gesicht. Höflinge ohne Rang. Niemand kennt die Etikette. In der Mitte die Puppe. Sie schläft. Ein Kind auf dem Thron, und schon schreibt jemand in seinem Namen: Am Morgen lag eine Dispo vor mir. Ich habe unterschrieben. Am Mittag trug ich ein Double. Es saß schlecht an den Schultern, wie ein geliehenes Gewand. Am Abend gab ich es zurück. Auf dem Boden lag ein Blatt, nass von irgendwas, die Schrift lief aus. Ich habe lange davor gestanden. Zu Hause hätte man dafür ein Gedicht geschrieben. Hier gibt es kein Zuhause. Also schreibe ich es hier." }
  ],
  shiny: [
    { id: "S-001", datum: "Ankunft", titel: "Programmwechsel", quelle: "werkstatt",
      text: "Achtung, Programmwechsel. Bitte bleiben Sie dran. Kurzes Rauschen, dann ein neues Bild: ein Raum ohne Fenster, das Aggregat brummt, überall Gesichter, die nicht wissen, wohin sie schauen sollen. Kein Grund zur Sorge. Haar sitzt. Kragen sitzt. Lächeln sitzt. In der Mitte die Puppe, die neue Sendeleitung. Sie druckt eine Dispo: drei Auftritte, ein Double, Rückgabe bis Drehschluss. Wer würde da nein sagen? Erster Auftritt am Pavillon. Ein Lichtmesser schaut her und bekommt ein Lächeln. Jemand fragt: Wofür werben Sie? Kurze Unterbrechung. Gleich geht es weiter. Am Abend geht das Double zurück, ohne Kratzer. Das alte Programm ist abgeschaltet. Das neue läuft. Jetzt neu. Hier. Jeden Tag." }
  ]
};

// Frontend zeigt nur, was keine Muster sind
SF.oeffentlich = (liste) => (liste || []).filter((e) => e.quelle !== "muster");
