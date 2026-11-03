/* SCHEINFIRMA — Frontend + Backend in einer Datei.
   Inhalte liegen in data/*.js. Was im Backend zugeteilt oder protokolliert wird,
   bleibt vorerst im Browser (localStorage) und lässt sich als JSON exportieren. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const leer = (hint) => `<span class="leer">${esc(hint || "")}</span>`;
  const fig = (id) => SF.roster.find((f) => f.id === id);
  const view = $("#view");

  // ── lokaler Speicher (nur dieser Browser) ──
  const KEY = "scheinfirma.backend.v1";
  const store = {
    load() {
      try { return Object.assign({ zuteilung: {}, done: {}, neue: [], protokoll: [] }, JSON.parse(localStorage.getItem(KEY) || "{}")); }
      catch (e) { return { zuteilung: {}, done: {}, neue: [], protokoll: [] }; }
    },
    save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* privat-modus: dann eben flüchtig */ } }
  };
  let S = store.load();

  const allTasks = () => SF.aufgaben.concat(S.neue).map((t) => Object.assign({}, t, {
    figur: S.zuteilung[t.id] !== undefined ? S.zuteilung[t.id] : t.figur,
    erledigt: !!S.done[t.id]
  }));

  // ── Router ──
  const routes = {
    lobby, manifest, werke, roster, figur, weltbuch, chronik, tagebuecher, tagebuch, backend
  };
  function go() {
    const [r, arg] = (location.hash.replace(/^#\/?/, "") || "lobby").split("/");
    const fn = routes[r] || lobby;
    view.innerHTML = fn(arg);
    document.querySelectorAll(".nav a").forEach((a) => {
      const d = a.dataset.r;
      a.classList.toggle("on", d === r || (d === "roster" && r === "figur") || (d === "tagebuecher" && r === "tagebuch"));
    });
    document.body.classList.remove("nav-open");
    if (r === "backend") bindBackend(arg);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", go);

  // ── 00 LOBBY ──
  function lobby() {
    return `
    <section class="hero">
      <div>
        <h1><span class="glitch" data-t="Scheinfirma.">Scheinfirma.</span>
          <span class="l2">Filmproduktion.</span></h1>
        <div class="bars"><i></i><i></i><i></i></div>
      </div>
      <div class="hero-logo logo glitch-img big" style="--src:url(assets/brand/logo.png)"><img src="assets/brand/logo.png" alt="Scheinfirma Logo"></div>
    </section>`;
  }

  // ── 01 MANIFEST ──
  function manifest() {
    const m = SF.manifest;
    return `
    <p class="kick"><span class="c">01</span> // Manifest</p>
    <h1>Manifest</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    ${m.thesen.length ? `<ol class="manifest">${m.thesen.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>` : leer()}
    ${m.unterzeichnet ? `<p class="mono" style="margin-top:32px">— ${esc(m.unterzeichnet)}</p>` : ""}`;
  }

  // ── 02 WERKE ──
  function werke() {
    return `
    <p class="kick"><span class="c">02</span> // Werkverzeichnis</p>
    <h1>Werke</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="pool-wrap"><table class="pool werke"><thead><tr><th>Nr</th><th>Titel</th><th>Format</th><th>Jahr</th><th>Status</th></tr></thead><tbody>
    ${SF.werke.map((w) => `<tr>
      <td class="id">${esc(w.nr)}</td>
      <td>${w.titel ? `<b>${esc(w.titel)}</b>` : leer()}</td>
      <td>${w.format ? esc(w.format) : leer()}</td>
      <td class="mono">${w.jahr ? esc(w.jahr) : "—"}</td>
      <td class="mono" style="color:${w.status === "in-produktion" ? "var(--real)" : "var(--yellow)"}">${esc(SF.werkStatus[w.status])}</td></tr>`).join("")}
    </tbody></table></div>`;
  }

  // ── 01 ROSTER ──
  function card(f) {
    if (f.status !== "aktiv") {
      return `<a class="card void" href="#figur/${f.id}">
        <div class="pic"><span class="nr">${f.nr}</span><span class="sil">?_</span></div>
        <div class="meta"><h3>${esc(f.name)}</h3><p>${esc((f.funktionen || []).join(", "))} · <span style="color:var(--yellow)">Akte unvollständig</span></p></div></a>`;
    }
    return `<a class="card" href="#figur/${f.id}">
      <div class="pic"><span class="nr">${f.nr}</span><img src="${f.bilder.face}" alt="${esc(f.name)}" loading="lazy"></div>
      <div class="meta"><h3>${esc(f.name)}${f.kana ? `<span class="kana">${f.kana}</span>` : ""}</h3>
      <p>${f.funktionen ? esc(f.funktionen.join(", ")) : "Funktion offen"} · <span class="green">aktiv</span></p></div></a>`;
  }
  function roster() {
    return `
    <p class="kick"><span class="c">03</span> // Personal</p>
    <h1>Belegschaft</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="roster">${SF.roster.map(card).join("")}</div>`;
  }

  // ── Figur-Dossier ──
  function figur(id) {
    const f = fig(id);
    if (!f) return `<h1>404</h1><p>Keine Akte mit der Kennung <code>${esc(id)}</code>.</p>`;
    const val = (v, hint) => (v == null || (Array.isArray(v) && !v.length)) ? leer(hint) : Array.isArray(v) ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : esc(v);
    const tb = SF.oeffentlich(SF.tagebuecher[f.id]).length;
    const pic = f.bilder
      ? `<div class="idcard" data-id="${f.nr}"><img src="${f.bilder.front}" alt="${esc(f.name)}, Ganzkörper frontal"></div>`
      : `<div class="card void" style="pointer-events:none"><div class="pic"><span class="nr">${f.nr}</span><span class="sil">?_</span></div></div>`;
    return `
    <p class="kick"><a href="#roster">← Roster</a> &nbsp;/&nbsp; <span class="c">Personalakte ${f.nr}</span> // ${f.status === "aktiv" ? '<span class="green">AKTIV</span>' : '<span style="color:var(--yellow)">UNVOLLSTÄNDIG</span>'}</p>
    <h1>${esc(f.name)}${f.kana ? `<span class="kana" style="font-size:.5em">${f.kana}</span>` : ""}</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="dossier">
      <div>${pic}</div>
      <div>
        <dl class="rows">
          <dt>Kennung</dt><dd class="mono">${f.id}</dd>
          <dt>Funktionen</dt><dd>${f.funktionen ? f.funktionen.map((x) => `<span class="tag blue">${esc(x)}</span>`).join("") : leer("Funktion offen")}</dd>
          <dt>Vorgeschichte</dt><dd>${val(f.vorgeschichte)}</dd>
          <dt>Abzeichen</dt><dd>${f.insignie ? esc(f.insignie) : leer()}</dd>
          <dt>Erkennungszeichen</dt><dd>${val(f.erkennungszeichen)}</dd>
          ${f.palette ? `<dt>Palette</dt><dd class="swatches">${f.palette.map((c) => `<i style="background:${c}" title="${c}"></i>`).join("")}</dd>` : ""}
          <dt>Zuständigkeiten</dt><dd>${val(f.zustaendigkeiten)}</dd>
          <dt>Offene Fäden</dt><dd>${val(f.offeneFaeden)}</dd>
          <dt>Tagebuch</dt><dd><a href="#tagebuch/${f.id}">${tb} Eintr${tb === 1 ? "ag" : "äge"} →</a></dd>
        </dl>
      </div>
    </div>
    ${f.bilder && f.bilder.sheet ? `<section style="margin-top:48px"><div class="sec-head"><span class="code">SHEET</span><h2>Character Sheet</h2></div>
      <div class="sheet"><img src="${f.bilder.sheet}" alt="Character Sheet ${esc(f.name)}: Turnaround, Details, Linework, Palette" loading="lazy"></div></section>` : ""}`;
  }

  // ── 02 WELTBUCH ──
  function weltbuch() {
    return `
    <p class="kick"><span class="c">04</span> // Archiv</p>
    <h1>Das Weltbuch</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    ${SF.weltbuch.map((k) => `
      <section>
        <div class="sec-head"><span class="code">${k.code}</span><h2>${esc(k.kapitel)}</h2></div>
        <div class="wb">${k.eintraege.map((e) => `
          <div class="entry ${e.text ? "k" : ""}">
            <h4>${esc(e.titel)}</h4>
            ${e.text ? `<p>${esc(e.text)}</p>` : leer()}
          </div>`).join("")}</div>
      </section>`).join("")}`;
  }

  // ── 03 FIRMENGESCHICHTE ──
  function chronik() {
    return `
    <p class="kick"><span class="c">05</span> // fortlaufend</p>
    <h1>Firmengeschichte</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    ${logView(SF.oeffentlich(SF.chronik))}`;
  }
  function logView(list) {
    return `<div class="log">${list.map((e) => `
      <div class="ev ${e.text ? "" : "leer-ev"}">
        <div class="when">${esc(e.datum)} · Eintrag ${esc(e.id)}</div>
        ${e.titel ? `<h3 style="margin:6px 0 0">${esc(e.titel)}</h3>` : ""}
        ${e.text ? `<p class="prose">${esc(e.text)}</p>` : `<p style="margin-top:8px">${leer()}</p>`}
      </div>`).join("")}</div>`;
  }

  // ── 04 TAGEBÜCHER ──
  function tagebuecher() {
    return `
    <p class="kick"><span class="c">06</span> // Belegschaft</p>
    <h1>Tagebücher</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="diary-list">${SF.roster.map((f) => {
      const n = SF.oeffentlich(SF.tagebuecher[f.id]).length;
      return `<a class="diary-row ${f.status === "aktiv" ? "" : "void"}" href="#tagebuch/${f.id}">
        <span class="n">${f.nr}</span><span><b>${esc(f.name)}</b> <span class="dim mono">· ${n} Eintr${n === 1 ? "ag" : "äge"}</span></span>
        <span class="tag ${n ? "pink" : ""}" style="${n ? "" : "color:var(--yellow)"}">${n ? "lesen" : "leer"}</span></a>`;
    }).join("")}</div>`;
  }
  function tagebuch(id) {
    const f = fig(id);
    if (!f) return `<h1>404</h1>`;
    const eps = SF.oeffentlich(SF.tagebuecher[f.id]);
    return `
    <p class="kick"><a href="#tagebuecher">← Tagebücher</a> &nbsp;/&nbsp; <span class="c">${f.nr}</span></p>
    <h1>Tagebuch: ${esc(f.name)}</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    ${eps.length ? `<div class="log">${eps.map((e) => `
      <div class="ev">
        <div class="when">${esc(e.datum)}</div>
        <p class="prose diary">${esc(e.text)}</p>
      </div>`).join("")}</div>`
      : `<p>${leer("keine Einträge")}</p>`}`;
  }
  // ── ▚▚ BACKEND: 1 Workflow · 2 Aufgaben ──
  const TABS = [["workflow", "01 · Workflow: Figuren"], ["aufgaben", "02 · Aufgaben"]];
  function backend(tab) {
    tab = TABS.some((t) => t[0] === tab) ? tab : "workflow";
    const body = { workflow: bWorkflow, aufgaben: bAufgaben }[tab]();
    return `<div class="backend">
      <p class="kick"><span class="blue">▚▚ BACKEND</span></p>
      <h1>Backend</h1>
      <div class="tabs">${TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}</div>
      ${body}</div>`;
  }

  // Schematisches Filmbild für die Illustration (Schritt 4)
  function frame(stufe) {
    const k = SF.roster[0].bilder;
    const szene = `<rect width="320" height="180" fill="#1a1a24"/>
      <rect x="0" y="120" width="320" height="60" fill="#22222e"/>
      <rect x="220" y="30" width="70" height="90" fill="#2a2a38"/><rect x="232" y="44" width="46" height="30" fill="#3a3a50"/>
      <rect x="20" y="96" width="60" height="30" fill="#2c2c3a"/>`;
    const person = `<g fill="#6b6878"><ellipse cx="150" cy="58" rx="17" ry="21"/><path d="M118 180 L124 102 Q150 84 176 102 L182 180 Z"/></g>`;
    const track = `<g stroke="#2bf08f" stroke-width="1.5" fill="none">
      <rect x="128" y="32" width="44" height="54" stroke-dasharray="4 3"/>
      <path d="M118 96 h70 v84 h-70 z" stroke-dasharray="4 3" stroke="#5865ff"/></g>
      <g fill="#2bf08f">${[[133, 40], [167, 40], [150, 60], [138, 80], [162, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join("")}</g>`;
    const maske = `<defs><clipPath id="cf${stufe}"><ellipse cx="150" cy="58" rx="18" ry="23"/></clipPath></defs>
      <image href="${k.face}" x="122" y="28" width="56" height="70" preserveAspectRatio="xMidYMid slice" clip-path="url(#cf${stufe})"/>`;
    // Ergebnis: Körper in Kaishas Farben, Maske aus dem Sheet
    const voll = `<path d="M114 180 L120 100 Q150 80 180 100 L186 180 Z" fill="#4fb3a0"/>
      <path d="M140 92 L150 180 L160 92 Z" fill="#5d4470"/>
      <path d="M120 100 L114 180 L126 180 L130 112 Z M180 100 L186 180 L174 180 L170 112 Z" fill="#d77fae" opacity=".8"/>
      <circle cx="150" cy="150" r="5" fill="none" stroke="#c9a24a" stroke-width="2"/><rect x="148" y="155" width="4" height="14" fill="#a24f88"/>
      <defs><clipPath id="cf4"><ellipse cx="150" cy="58" rx="18" ry="23"/></clipPath></defs>
      <image href="${k.face}" x="122" y="28" width="56" height="70" preserveAspectRatio="xMidYMid slice" clip-path="url(#cf4)"/>`;
    const inhalt = { 1: person, 2: person + track, 3: person + maske + track, 4: voll }[stufe];
    const grade = stufe === 4 ? `<rect width="320" height="180" fill="#ff3b30" opacity=".08"/><rect width="320" height="180" fill="#4fe0c6" opacity=".05"/>` : "";
    return `<svg viewBox="0 0 320 180" class="frame" role="img" aria-label="Filmbild Stufe ${stufe}">${szene}${inhalt}${grade}
      <text x="8" y="14" font-size="9" fill="#8a8798" font-family="JetBrains Mono, monospace">SHOT_014 · TC 00:03:${10 + stufe * 7}</text></svg>`;
  }

  function bWorkflow() {
    const k = fig("kaisha");
    return `
    <p class="lead">Von der leeren Personalakte bis zur Figur im fertigen Bild. Beispiel durchgehend: Kaisha Goonin.</p>
    <ol class="wf-index mono">
      <li><a href="#wf1">Steckbrief anlegen</a></li><li><a href="#wf2">Character Sheet erzeugen</a></li>
      <li><a href="#wf3">Abzeichen festlegen</a></li><li><a href="#wf4">In Filmmaterial einsetzen</a></li><li><a href="#wf5">Eintragen und veröffentlichen</a></li>
    </ol>

    <section id="wf1">
      <div class="sec-head"><span class="code">SCHRITT 1</span><h2>Steckbrief anlegen</h2></div>
      <div class="grid g2">
        <div>
          <p>Jede Figur beginnt als Datensatz in <code>data/roster.js</code>. Was noch fehlt, bleibt <code>null</code> und erscheint auf der Seite als „Daten ausstehend“.</p>
          <dl class="rows">
            <dt>Name</dt><dd>Einprägsam, sprechbar, nicht an eine reale Person angelehnt.</dd>
            <dt>Funktion</dt><dd>Filmproduktion (Kamera, Schnitt …), Unvorhergesehenes (Empfang, Meldung …) oder was jede Firma braucht (Geschäftsführung, Buchhaltung …).</dd>
            <dt>Vorgeschichte</dt><dd>Zwei Sätze. Woher sie kommt, was sie schuldet.</dd>
            <dt>Abzeichen</dt><dd>Ein Gegenstand, der die Figur sofort erkennbar macht (Schritt 3).</dd>
            <dt>Palette</dt><dd>Fünf bis sechs Farben, aus dem Sheet abgelesen.</dd>
          </dl>
        </div>
        <pre class="code">{
  id: "kaisha",
  nr: "01",
  name: "Kaisha Goonin",
  kana: "会社",
  status: "aktiv",
  funktionen: null,      // ausstehend
  vorgeschichte: null,   // ausstehend
  insignie: null,        // Abzeichen
  erkennungszeichen: [ "Maske …", "Haori …" ],
  palette: ["#e6ddd2", "#4fb3a0", "#d77fae", …],
  bilder: { face, front, sheet }
}</pre>
      </div>
    </section>

    <section id="wf2">
      <div class="sec-head"><span class="code">SCHRITT 2</span><h2>Character Sheet erzeugen</h2></div>
      <p>Drei Bilder pro Figur, alle vor weißem Grund, gleiches neutrales Licht. Sie sind die Referenz für alles, was folgt: für Kostüm, Abzeichen und das Einsetzen ins Filmmaterial.</p>
      <div class="sheet-steps">
        <figure><img src="${k.bilder.face}" alt="Kaisha, Gesicht frontal" loading="lazy"><figcaption><b>2a · Gesicht frontal</b><br>Roster-Karte. Wichtigste Referenz für die Ersetzung im Bild.</figcaption></figure>
        <figure><img src="${k.bilder.front}" alt="Kaisha, Ganzkörper frontal" loading="lazy"><figcaption><b>2b · Ganzkörper frontal</b><br>Personalakte. Proportionen, Kostüm, Haltung.</figcaption></figure>
        <figure class="wide"><img src="${k.bilder.sheet}" alt="Kaisha, Full Sheet" loading="lazy"><figcaption><b>2c · Full Sheet</b><br>Turnaround (vorn, ¾, Profil, Rücken), Kopfansichten, Details, Linework, Palette.</figcaption></figure>
      </div>
      <div class="grid g2" style="margin-top:22px">
        <div class="panel" style="--c:var(--pink)"><p class="kick">Regeln für Konsistenz</p>
          <ul>
            <li>Erst Gesicht frontal erzeugen, dann alle weiteren Ansichten <b>mit diesem Bild als Referenz</b>.</li>
            <li>Weißer Hintergrund, keine Schlagschatten, Ganzkörper mit Füßen im Bild.</li>
            <li>Gleiche Kleidung, gleiche Farben, gleiches Abzeichen in jeder Ansicht.</li>
            <li>Maske oder Gesicht bei Turnaround auf Abweichungen prüfen, sonst neu erzeugen.</li>
            <li>Ablage: <code>assets/figuren/&lt;id&gt;/face-front.jpg · full-front.jpg · full-sheet.jpg</code></li>
          </ul></div>
        <pre class="code">// Vorlage für den Bildgenerator
Character sheet, [NAME], [FUNKTION] einer Filmfirma
in einer Cyberpunk-Stadt.
Merkmale: [MASKE/FRISUR], [KLEIDUNG], [ABZEICHEN].
Farben: [PALETTE].
Turnaround: front, three-quarter, side, back;
head views; detail close-ups; line art; color swatches.
Plain white background, neutral studio light,
photorealistic, consistent design across all views.</pre>
      </div>
    </section>

    <section id="wf3">
      <div class="sec-head"><span class="code">SCHRITT 3</span><h2>Abzeichen festlegen</h2></div>
      <p>Das Abzeichen ist der eine Gegenstand, der im Bild sofort die Figur zeigt. Es muss als echtes Objekt existieren, weil es beim Dreh getragen wird, und es muss im Sheet klar zu sehen sein, weil es bei der digitalen Ersetzung als Anker dient.</p>
      <div class="grid g3">
        <div class="panel" style="--c:var(--yellow)"><h3>Kaisha Goonin</h3><p>Vorschlag: Messingring mit violetter Quaste, oder die Maske mit dem Kreis.</p></div>
        <div class="panel" style="--c:var(--yellow)"><h3>Frank the Drifter</h3><p>Verspiegelte Schutzbrille.</p></div>
        <div class="panel" style="--c:var(--line)"><h3>Figur 02–11</h3><p>${leer("festzulegen")}</p></div>
      </div>
    </section>

    <section id="wf4">
      <div class="sec-head"><span class="code">SCHRITT 4</span><h2>Figuren in Filmmaterial einsetzen</h2></div>
      <div class="grid g2">
        <div class="panel" style="--c:var(--real)"><p class="kick">Weg A · beim Dreh</p><h3>Die Figur wird getragen</h3>
          <p>Wer die Aufgabe übernimmt, trägt Abzeichen und, wo vorhanden, Maske oder Kostüm. Die Figur ist dann schon im Rohmaterial. Danach nur noch Farbkorrektur. Am Schinkel Pavillon der Normalfall.</p></div>
        <div class="panel" style="--c:var(--symb)"><p class="kick">Weg B · in der Nachbearbeitung</p><h3>Die Figur wird eingesetzt</h3>
          <p>Für vorhandenes Material: Eine Person im Bild wird durch die Figur ersetzt, ganz oder teilweise (Gesicht, Maske, Abzeichen). Ablauf unten.</p></div>
      </div>
      <div class="frames">
        <figure>${frame(1)}<figcaption><b>4.1 · Shot auswählen</b><br>Person gut sichtbar, wenig verdeckt, ruhiges Licht, Gesicht mindestens einige Sekunden frontal.</figcaption></figure>
        <figure>${frame(2)}<figcaption><b>4.2 · Verfolgen</b><br>Gesicht und Körper über alle Frames tracken (Planar-Tracking für Masken, Körper-Tracking für ganze Figur).</figcaption></figure>
        <figure>${frame(3)}<figcaption><b>4.3 · Ersetzen</b><br>Maske/Gesicht aus Sheet 2a aufsetzen, oder mit einem KI-Videowerkzeug die ganze Person anhand von 2a–2c austauschen.</figcaption></figure>
        <figure>${frame(4)}<figcaption><b>4.4 · Angleichen</b><br>Licht, Körnung, Schärfe und Farbe an die Szene anpassen. Abzeichen muss erkennbar bleiben.</figcaption></figure>
      </div>
      <div class="grid g2" style="margin-top:22px">
        <div class="panel" style="--c:var(--symb)"><p class="kick">Werkzeuge (Auswahl offen, Aufgabe A-07)</p>
          <ul>
            <li><b>Tracking und Compositing:</b> Schnitt- und Compositing-Programm mit Planar- und Gesichtstracking.</li>
            <li><b>Ganze Figur ersetzen:</b> KI-Videowerkzeug, das eine Person im Video anhand eines Referenzbilds austauscht und Bewegung und Mimik übernimmt.</li>
            <li><b>Nur Maske oder Abzeichen:</b> Standbild aus dem Sheet freistellen, auf das Tracking legen. Kaishas Maske eignet sich dafür besonders, weil sie flach und starr ist.</li>
          </ul></div>
        <div class="panel" style="--c:var(--imag)"><p class="kick">Prüfen vor Freigabe</p>
          <ul>
            <li>Sieht die Figur in allen Shots gleich aus (Maske, Farben, Abzeichen)?</li>
            <li>Keine Artefakte an Rändern, Händen, Haaren?</li>
            <li>Stimmt die Bewegung mit dem Original überein?</li>
            <li>Haben alle sichtbaren Personen eingewilligt?</li>
            <li>Shot in der Shotliste mit Figur und Version vermerken.</li>
          </ul></div>
      </div>
    </section>

    <section id="wf5">
      <div class="sec-head"><span class="code">SCHRITT 5</span><h2>Eintragen und veröffentlichen</h2></div>
      <div class="steps">
        <div style="--c:var(--real)"><h4>Bilder ablegen</h4><p><code>assets/figuren/&lt;id&gt;/</code> als JPG, max. 1400 px.</p></div>
        <div style="--c:var(--symb)"><h4>Akte füllen</h4><p><code>data/roster.js</code>: Leerstelle ausfüllen, <code>status: "aktiv"</code>.</p></div>
        <div style="--c:var(--symb)"><h4>Tagebuch anlegen</h4><p><code>data/chronik.js</code>: <code>&lt;id&gt;: []</code>.</p></div>
        <div style="--c:var(--imag)"><h4>Version erhöhen</h4><p>In <code>index.html</code> alle <code>?v=</code> um eins hochzählen.</p></div>
        <div style="--c:var(--imag)"><h4>Commit, Push</h4><p>Nach ein bis zwei Minuten live.</p></div>
      </div>
    </section>`;
  }

  function figOptions(sel) {
    return `<option value="">— nicht zugeteilt —</option>` + SF.roster.map((f) =>
      `<option value="${f.id}" ${f.id === sel ? "selected" : ""}>${f.nr} · ${esc(f.name)}</option>`).join("");
  }

  function taskRows(ts) {
    return `<div class="pool-wrap"><table class="pool"><thead><tr><th>ID</th><th>Aufgabe</th><th>Figur</th><th></th></tr></thead><tbody>
      ${ts.map((t) => `<tr class="${t.erledigt ? "done" : ""}">
        <td class="id">${esc(t.id)}</td><td>${esc(t.titel)}</td>
        <td><select data-assign="${t.id}">${figOptions(t.figur)}</select></td>
        <td><button class="btn" data-done="${t.id}" title="erledigt">${t.erledigt ? "↺" : "✓"}</button></td></tr>`).join("")}
    </tbody></table></div>`;
  }

  function bAufgaben() {
    const ts = allTasks();
    const zahl = (l) => `${l.filter((t) => !t.erledigt).length} offen · ${l.filter((t) => t.erledigt).length} erledigt`;
    const allg = ts.filter((t) => t.bereich === "allgemein");
    const c2 = ts.filter((t) => t.bereich === "chance2");
    return `
    <div class="om">
      <img src="assets/brand/office-master.jpg" alt="Die Puppe, Office-Master">
      <div>
        <p class="lead">Alles, was ansteht. Der Office-Master teilt jede Aufgabe einer Figur zu.</p>
        <p class="mono dim">Zuteilungen und Häkchen werden nur in diesem Browser gespeichert. Dauerhaft: <code>data/aufgaben.js</code>.</p>
        <div class="toolbar"><button class="btn" id="expPool">Liste exportieren (JSON)</button></div>
      </div>
    </div>
    <section>
      <div class="sec-head"><span class="code">A</span><h2>${SF.bereiche.allgemein}</h2><span class="mono dim">${zahl(allg)}</span></div>
      ${taskRows(allg)}
    </section>
    <section>
      <div class="sec-head"><span class="code">C</span><h2>${SF.bereiche.chance2}</h2><span class="mono dim">${zahl(c2)}</span></div>
      ${Object.entries(SF.phasen).map(([p, l]) => `<h3 style="margin:28px 0 12px">${l}</h3>${taskRows(c2.filter((t) => t.phase === p))}`).join("")}
    </section>
    <section>
      <div class="sec-head"><span class="code">+</span><h2>Aufgabe hinzufügen</h2></div>
      <form class="form" id="neuForm">
        <label class="wide">Aufgabe<input name="titel" required></label>
        <label>Bereich<select name="bereich">${Object.entries(SF.bereiche).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <label>Phase (Chance²)<select name="phase">${Object.entries(SF.phasen).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <label>Figur<select name="figur">${figOptions(null)}</select></label>
        <div style="align-self:end"><button class="btn prim" type="submit">Hinzufügen</button></div>
      </form>
    </section>`;
  }

  // ── Backend-Interaktion ──
  function download(name, obj) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function rerender(tab) { const y = window.scrollY; view.innerHTML = backend(tab); bindBackend(tab); window.scrollTo(0, y); }

  function bindBackend(tab) {
    view.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { location.hash = "#backend/" + b.dataset.tab; }));
    view.querySelectorAll(".wf-index a").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault(); $(a.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
    }));
    view.querySelectorAll("[data-assign]").forEach((s) => s.addEventListener("change", () => {
      S.zuteilung[s.dataset.assign] = s.value || null; store.save(S); rerender("aufgaben");
    }));
    view.querySelectorAll("[data-done]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.done; S.done[id] = !S.done[id]; store.save(S); rerender("aufgaben");
    }));
    if ($("#expPool")) $("#expPool").addEventListener("click", () => download("aufgaben.json", allTasks()));
    const nf = $("#neuForm");
    if (nf) nf.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(nf));
      S.neue.push({ id: "N-" + String(S.neue.length + 1).padStart(2, "0"), bereich: d.bereich,
        phase: d.bereich === "chance2" ? d.phase : undefined, titel: d.titel, figur: d.figur || null });
      store.save(S); rerender("aufgaben");
    });
  }

  go();
})();
