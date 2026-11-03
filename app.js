/* SCHEINFIRMA — Frontend + Backend in einer Datei.
   Inhalte liegen in data/*.js. Was im Backend zugeteilt oder protokolliert wird,
   bleibt vorerst im Browser (localStorage) und lässt sich als JSON exportieren. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const leer = (hint) => `<span class="leer">${esc(hint || "noch nicht geschrieben")}</span>`;
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
    lobby, roster, figur, weltbuch, chronik, tagebuecher, tagebuch, backend
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
    const aktiv = SF.roster.filter((f) => f.status === "aktiv").length;
    return `
    <section class="hero">
      <div>
        <p class="kick"><span class="c">▚</span> Zur Organisationsform der Scheinfirma</p>
        <h1><span class="glitch" data-t="Personen kommen und gehen.">Personen kommen und gehen.</span>
          <span class="l2">Die Figuren bleiben.</span></h1>
        <div class="bars"><i></i><i></i><i></i></div>
        <p class="lead">Scheinfirma ist eine Filmproduktionsfirma, die ihre eigene Entstehung dreht. Geführt wird sie nicht von Menschen,
        sondern von ihrem <b>Figurenstand</b>. Wer hier arbeitet, tritt an die Puppe, legt eine Insignie an und handelt unter fremdem Namen.
        Die Arbeit ist echt. Die Geschichte schreibt eine Maschine.</p>
        <p style="margin-top:26px"><a class="tag" href="#roster">→ Roster öffnen</a><a class="tag" href="#chronik" style="color:var(--pink)">→ Firmengeschichte</a></p>
      </div>
      <div class="hero-logo logo glitch-img big" style="--src:url(assets/brand/logo.png)"><img src="assets/brand/logo.png" alt="Scheinfirma Logo"></div>
    </section>

    <div class="ticker"><span>
      ORGANISATIONS DEPEND ON PEOPLE BEING RELIABLE · THEY LACK IMAGINATION · THIS ONE SUPPLIES IT ·
      会社 · CHANCE² · SCHINKEL PAVILLON · JANUAR 2027 · VIER TAGE · FIGURENSTAND ${String(aktiv).padStart(2, "0")}/${String(SF.roster.length).padStart(2, "0")} BESETZT ·
      NARROR, ERGO SUM · ICH WERDE ERZÄHLT, ALSO BIN ICH ·
    </span></div>

    <section>
      <div class="sec-head"><span class="code">SYS/01</span><h2>Wie die Firma läuft</h2></div>
      <div class="flow">
        <div style="--c:var(--real)"><span class="k">ITERABILITÄT</span><h3 class="green">Zuteilung</h3>
          <p>Die Person meldet sich verfügbar und bekommt eine Rolle: eine Zuständigkeit mit Aufgaben daran, verzeichnet und mehrfach besetzt.</p></div>
        <div style="--c:var(--symb)"><span class="k">EINSETZUNGSRITUS</span><h3 class="blue">Übernahme</h3>
          <p>Mit den Insignien geht die Rolle über in die Figur: anweisen, abzeichnen, unter ihrem Namen angesprochen werden.</p></div>
        <div style="--c:var(--imag)"><span class="k">ÉCRITURE AUTOMATIQUE</span><h3 class="red">Fortschreibung</h3>
          <p>Jeder Vorgang geht in das Tagebuch der Figur. Sie wächst mit jeder Besetzung und trägt beim nächsten Antritt mehr.</p></div>
      </div>
    </section>

    <section>
      <div class="sec-head"><span class="code">SYS/02</span><h2>Produktionsdaten</h2></div>
      <div class="facts">
        <div><b>Projekt</b>Chance²</div>
        <div><b>Ort</b>Schinkel Pavillon, Berlin</div>
        <div><b>Zeitraum</b>Januar 2027 · vier Tage</div>
        <div><b>Besetzung</b>Menschen aus Arbeitsgelegenheiten</div>
        <div><b>Erzeugnis</b>Film · Tagebücher · Firmengeschichte</div>
        <div><b>Figurenstand</b>${aktiv} aktiv · ${SF.roster.length - aktiv} Leerstellen</div>
      </div>
    </section>

    <section class="grid g2">
      <a class="panel" href="#figur/kaisha" style="--c:var(--pink);color:var(--text)">
        <p class="kick">Figur 01 · zuerst im Roster</p>
        <h2>Kaisha Goonin <span class="kana">会社</span></h2>
        <p class="dim">Die Maske mit dem Kreis auf der Stirn. Der Name heißt „Firma“. Dossier öffnen →</p>
      </a>
      <a class="panel" href="#backend" style="--c:var(--symb);color:var(--text)">
        <p class="kick">Für Beteiligte</p>
        <h2>Backend</h2>
        <p class="dim">Workflow, Character-Sheet-Vorlage, Aufgabenpool, Protokoll und offene Fragen. Hier teilt der Office-Master zu →</p>
      </a>
    </section>`;
  }

  // ── 01 ROSTER ──
  function card(f) {
    if (f.status !== "aktiv") {
      return `<a class="card void" href="#figur/${f.id}">
        <div class="pic"><span class="nr">${f.nr}</span><span class="sil">?_</span></div>
        <div class="meta"><h3>${esc(f.name)}</h3><p>${esc((f.funktionen || []).join(", "))} · <span style="color:var(--yellow)">Leerstelle</span></p></div></a>`;
    }
    return `<a class="card" href="#figur/${f.id}">
      <div class="pic"><span class="nr">${f.nr}</span><img src="${f.bilder.face}" alt="${esc(f.name)}" loading="lazy"></div>
      <div class="meta"><h3>${esc(f.name)}${f.kana ? `<span class="kana">${f.kana}</span>` : ""}</h3>
      <p>${f.funktionen ? esc(f.funktionen.join(", ")) : "Funktion offen"} · <span class="green">aktiv</span></p></div></a>`;
  }
  function roster() {
    return `
    <p class="kick"><span class="c">01</span> // Figurenstand</p>
    <h1>Der Roster</h1>
    <p class="lead">Keine Figur ist ihre Funktion. Drei Sorten von Rollen sind auf die Figuren verteilt, nicht auf sie aufgeteilt:
      die einer <span class="green">Filmproduktion</span>, die für das <span class="blue">Unvorhergesehene</span> und die, die <span class="red">jede Firma</span> braucht.</p>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="roster">${SF.roster.map(card).join("")}</div>
    <p class="mono dim" style="margin-top:24px">Figur 02–11: Arbeitstitel aus dem Pitch-Deck, noch ohne Character Sheet. Ob Kaisha eine davon ablöst oder hinzukommt, ist offen.</p>`;
  }

  // ── Figur-Dossier ──
  function figur(id) {
    const f = fig(id);
    if (!f) return `<h1>404</h1><p>Keine Figur mit der Kennung <code>${esc(id)}</code>.</p>`;
    const val = (v, hint) => (v == null || (Array.isArray(v) && !v.length)) ? leer(hint) : Array.isArray(v) ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : esc(v);
    const tb = (SF.tagebuecher[f.id] || []).length;
    const pic = f.bilder
      ? `<div class="idcard" data-id="${f.nr}"><img src="${f.bilder.front}" alt="${esc(f.name)}, Ganzkörper frontal"></div>`
      : `<div class="card void" style="pointer-events:none"><div class="pic"><span class="nr">${f.nr}</span><span class="sil">?_</span></div></div>
         <p style="margin-top:12px">${leer("Character Sheet fehlt: Gesicht, Ganzkörper, Turnaround")}</p>`;
    return `
    <p class="kick"><a href="#roster">← Roster</a> &nbsp;/&nbsp; <span class="c">Figur ${f.nr}</span> // ${f.status === "aktiv" ? '<span class="green">AKTIV</span>' : '<span style="color:var(--yellow)">LEERSTELLE</span>'}</p>
    <h1>${esc(f.name)}${f.kana ? `<span class="kana" style="font-size:.5em">${f.kana}</span>` : ""}</h1>
    ${f.kurz ? `<p class="lead">${esc(f.kurz)}</p>` : ""}
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="dossier">
      <div>${pic}</div>
      <div>
        <dl class="rows">
          <dt>Kennung</dt><dd class="mono">${f.id}</dd>
          <dt>Rollen-Sorte</dt><dd>${f.sorte ? SF.sorten[f.sorte] : leer("Filmproduktion / Unvorhergesehenes / jede Firma?")}</dd>
          <dt>Funktionen</dt><dd>${f.funktionen ? f.funktionen.map((x) => `<span class="tag blue">${esc(x)}</span>`).join("") : leer("Funktion offen")}</dd>
          <dt>Vorgeschichte</dt><dd>${val(f.vorgeschichte)}</dd>
          <dt>Insignie</dt><dd>${f.insignie ? esc(f.insignie) : leer(f.insignieVorschlag ? "Vorschlag: " + f.insignieVorschlag : "Insignie festlegen")}</dd>
          <dt>Erkennungszeichen</dt><dd>${val(f.erkennungszeichen, "aus dem Character Sheet ableiten")}</dd>
          ${f.palette ? `<dt>Palette</dt><dd class="swatches">${f.palette.map((c) => `<i style="background:${c}" title="${c}"></i>`).join("")}</dd>` : ""}
          <dt>Zuständigkeiten</dt><dd>${val(f.zustaendigkeiten)}</dd>
          <dt>Offene Fäden</dt><dd>${val(f.offeneFaeden)}</dd>
          <dt>Tonlage</dt><dd>${val(f.ton, "Wie klingt das Tagebuch dieser Figur?")}</dd>
          <dt>Tagebuch</dt><dd><a href="#tagebuch/${f.id}">${tb} Episode${tb === 1 ? "" : "n"} →</a></dd>
        </dl>
        ${f.fragen ? `<div class="panel" style="margin-top:24px;--c:var(--yellow)"><p class="kick">Offene Fragen zu dieser Figur</p><ol class="fragen">${f.fragen.map((q) => `<li>${esc(q)}</li>`).join("")}</ol></div>` : ""}
      </div>
    </div>
    ${f.bilder && f.bilder.sheet ? `<section style="margin-top:48px"><div class="sec-head"><span class="code">SHEET</span><h2>Character Sheet</h2></div>
      <div class="sheet"><img src="${f.bilder.sheet}" alt="Character Sheet ${esc(f.name)}: Turnaround, Details, Linework, Palette" loading="lazy"></div></section>` : ""}`;
  }

  // ── 02 WELTBUCH ──
  function weltbuch() {
    return `
    <p class="kick"><span class="c">02</span> // Lore</p>
    <h1>Das Weltbuch</h1>
    <p class="lead">Schauplätze, Konzerne, Technik, Sprache: die Welt, in der die Figuren gelten. Der Imaginator liest daraus, bevor er schreibt.
      <span class="teal">KANON</span> steht so im Pitch-Deck, <span style="color:var(--yellow)">OFFEN</span> ist noch zu schreiben.</p>
    <div class="bars"><i></i><i></i><i></i></div>
    ${SF.weltbuch.map((k) => `
      <section>
        <div class="sec-head"><span class="code">${k.code}</span><h2>${esc(k.kapitel)}</h2></div>
        <div class="wb">${k.eintraege.map((e) => `
          <div class="entry ${e.kanon ? "k" : ""}">
            <h4>${esc(e.titel)}<span class="badge ${e.kanon ? "k" : "o"}">${e.kanon ? "KANON" : "OFFEN"}</span></h4>
            ${e.text ? `<p>${esc(e.text)}</p>` : leer()}
          </div>`).join("")}</div>
      </section>`).join("")}`;
  }

  // ── 03 FIRMENGESCHICHTE ──
  function chronik() {
    return `
    <p class="kick"><span class="c">03</span> // fortlaufend</p>
    <h1>Firmengeschichte</h1>
    <p class="lead">Während im Raum gearbeitet wird, schreibt sich die Arbeit fort: aus dem Protokoll in die Tagebücher, aus allen Tagebüchern hierher.
      <i>Ein Cyberpunk-Abenteuer, dessen Stoff aus wirklicher Arbeit stammt.</i></p>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="log">${SF.chronik.map((e) => `
      <div class="ev ${e.text ? "" : "leer-ev"}">
        <div class="when">${esc(e.datum)} · Eintrag ${esc(e.id)} ${e.quelle === "muster" ? '· <span class="muster">MUSTER AUS DEM PITCH-DECK</span>' : e.quelle === "gruendung" ? '· <span class="green">GRÜNDUNG</span>' : ""}</div>
        ${e.titel ? `<h3 style="margin:6px 0 0">${esc(e.titel)}</h3>` : ""}
        ${e.text ? `<p class="prose">${esc(e.text)}</p>` : `<p style="margin-top:8px">${leer("wird vom Imaginator aus dem Protokoll geschrieben")}</p>`}
      </div>`).join("")}</div>`;
  }

  // ── 04 TAGEBÜCHER ──
  function tagebuecher() {
    return `
    <p class="kick"><span class="c">04</span> // je Figur</p>
    <h1>Tagebücher</h1>
    <p class="lead">Aus jedem Vorgang wird eine Episode, und die gehört von da an der Figur. Antritt meldet die Person, Rückgabe die Figur.</p>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="diary-list">${SF.roster.map((f) => {
      const n = (SF.tagebuecher[f.id] || []).length;
      return `<a class="diary-row ${f.status === "aktiv" ? "" : "void"}" href="#tagebuch/${f.id}">
        <span class="n">${f.nr}</span><span><b>${esc(f.name)}</b> <span class="dim mono">· ${n} Episode${n === 1 ? "" : "n"}</span></span>
        <span class="tag ${n ? "pink" : ""}" style="${n ? "" : "color:var(--yellow)"}">${n ? "lesen" : "leer"}</span></a>`;
    }).join("")}</div>`;
  }
  function tagebuch(id) {
    const f = fig(id);
    if (!f) return `<h1>404</h1>`;
    const eps = SF.tagebuecher[f.id] || [];
    return `
    <p class="kick"><a href="#tagebuecher">← Tagebücher</a> &nbsp;/&nbsp; <span class="c">${f.nr}</span></p>
    <h1>Tagebuch: ${esc(f.name)}</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    ${eps.length ? `<div class="log">${eps.map((e) => `
      <div class="ev">
        <div class="when">${esc(e.datum)} ${e.quelle === "muster" ? '· <span class="muster">MUSTER AUS DEM PITCH-DECK</span>' : ""}</div>
        <div class="grid g2" style="margin-top:10px;align-items:start">
          <div class="protokoll">FIGUR     ${esc(f.id)}
AUFTRAG   ${esc(e.auftrag)}
<span class="a">ANTRITT   „${esc(e.antritt)}“</span>
<span class="r">RÜCKGABE  „${esc(e.rueckgabe)}“</span></div>
          <p class="prose diary" style="margin:0">${esc(e.text)}</p>
        </div>
      </div>`).join("")}</div>`
      : `<p>${leer("Noch keine Episode. Die erste entsteht, wenn jemand diese Figur trägt und zurückmeldet.")}</p>`}`;
  }

  // ── ▚▚ BACKEND ──
  const TABS = [["workflow", "Workflow"], ["sheets", "Character Sheets"], ["pool", "Office-Master · Aufgabenpool"], ["protokoll", "Protokoll"], ["offen", "Offene Fragen"]];
  function backend(tab) {
    tab = TABS.some((t) => t[0] === tab) ? tab : "workflow";
    const body = { workflow: bWorkflow, sheets: bSheets, pool: bPool, protokoll: bProtokoll, offen: bOffen }[tab]();
    return `<div class="backend">
      <p class="kick"><span class="blue">▚▚ BACKEND</span> // real × symbolisch</p>
      <h1>Backend</h1>
      <div class="warn">STATUS: PROTOTYP. Keine Zugangskontrolle, kein Server. Zuteilungen und Protokolleinträge werden nur in diesem Browser gespeichert
        und lassen sich als JSON exportieren. Dauerhafte Änderungen gehören in <code>data/*.js</code> im Repository.</div>
      <div class="tabs">${TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}</div>
      ${body}</div>`;
  }

  function bWorkflow() {
    return `
    <section>
      <div class="sec-head"><span class="code">B-01</span><h2>Zwei Werkzeuge, ein Protokoll</h2></div>
      <div class="grid g2" style="align-items:center">
        <svg class="arch" viewBox="0 0 420 340" role="img" aria-label="Drei Register: real (Person), symbolisch (Rolle), imaginär (Figur). Office-Master zwischen real und symbolisch, Imaginator zwischen symbolisch und imaginär, Übernahme zwischen real und imaginär.">
          <g fill="none" stroke-width="2.5">
            <circle cx="210" cy="115" r="95" stroke="#5865ff" fill="rgba(88,101,255,.08)"/>
            <circle cx="150" cy="215" r="95" stroke="#2bf08f" fill="rgba(43,240,143,.06)"/>
            <circle cx="270" cy="215" r="95" stroke="#ff3b30" fill="rgba(255,59,48,.07)"/>
          </g>
          <g font-size="10" fill="#8a8798" text-anchor="middle" letter-spacing="3">
            <text x="210" y="60" fill="#5865ff">SYMBOLISCH</text><text x="210" y="76" fill="#e9e6df" font-size="12" letter-spacing="0">die Rolle</text>
            <text x="105" y="250" fill="#2bf08f">REAL</text><text x="105" y="266" fill="#e9e6df" font-size="12" letter-spacing="0">die Person</text>
            <text x="318" y="250" fill="#ff3b30">IMAGINÄR</text><text x="318" y="266" fill="#e9e6df" font-size="12" letter-spacing="0">die Figur</text>
          </g>
          <g font-size="11" fill="#e9e6df" text-anchor="middle" font-weight="600">
            <text x="150" y="150">Office-Master</text><text x="272" y="150">Imaginator</text><text x="210" y="268">Übernahme</text>
          </g>
        </svg>
        <div>
          <div class="panel" style="--c:var(--symb);margin-bottom:14px"><p class="kick">Backend · real × symbolisch</p><h3>Office-Master</h3>
            <p>Teilt der Person eine Rolle zu, gibt ihr eine Aufgabe aus dem <b>Aufgabenpool</b>. Nach der Rückgabe steht im <b>Protokoll</b>, was unter dieser Rolle ausgeführt wurde.</p></div>
          <div class="panel" style="--c:var(--imag)"><p class="kick">Frontend · symbolisch × imaginär</p><h3>Imaginator</h3>
            <p>Hält im <b>Roster</b> den Figurenstand, liest im Protokoll, was unter jeder Figur geschah, und schreibt daraus <b>Tagebuch</b> und <b>Firmengeschichte</b>.</p></div>
        </div>
      </div>
    </section>
    <section>
      <div class="sec-head"><span class="code">B-02</span><h2>Ablauf an der Puppe</h2></div>
      <div class="steps">
        <div style="--c:var(--real)"><h4>An die Puppe treten</h4><p>Die Person meldet sich verfügbar.</p></div>
        <div style="--c:var(--real)"><h4>Antritt melden</h4><p>„Wie kommst du an?“</p><div class="out">→ ins Protokoll</div></div>
        <div style="--c:var(--imag)"><h4>Insignie anlegen</h4><p>Ab hier gilt die Figur.</p><div class="out" style="color:var(--real)">→ in die Anwesenheitsliste</div></div>
        <div style="--c:var(--imag)"><h4>Ausführen</h4><p>Unter ihrem Namen: dreht, baut auf, telefoniert, geht aufs Amt.</p></div>
        <div style="--c:var(--symb)"><h4>An die Puppe zurück</h4><p>„Wie ist es gelaufen?“</p><div class="out">→ ins Protokoll</div></div>
      </div>
      <p class="dim" style="margin-top:18px">Die Anwesenheitsliste steht außerhalb der Werkzeuge, von Hand, auf Papier. Sie ist die Brücke: Was eine Figur wert geworden ist,
        lässt sich über sie denen zurechnen, die sie getragen haben. Der Imaginator sieht nur pseudonymisierte Einträge (DSGVO Art. 4 Nr. 5, Art. 25).</p>
    </section>
    <section>
      <div class="sec-head"><span class="code">B-03</span><h2>Die Puppe = Office-Master im Raum</h2></div>
      <div class="om">
        <img src="assets/brand/office-master.jpg" alt="Die Puppe: Babypuppe mit Webcam auf dem Kopf und Kabeln, sitzt auf einem Tisch zwischen Kaffeetassen">
        <dl class="rows">
          <dt>Gerät</dt><dd>Rechner in der Puppe</dd>
          <dt>Kanal</dt><dd>Chat, Karte auf Papier</dd>
          <dt>Spricht</dt><dd>Office-Master, Imaginator</dd>
          <dt>Adressat</dt><dd>immer eine Rolle</dd>
          <dt>Regel</dt><dd>Wer sie fragt, warum eine Aufgabe kommt, bekommt keine bessere Antwort als die Aufgabe selbst.</dd>
        </dl>
      </div>
    </section>`;
  }

  function bSheets() {
    const tpl = `{
  id: "neue_figur",           // klein, unterstrichen: wird im Protokoll benutzt
  nr: "12",
  name: "Name der Figur",
  kana: null,                 // optional, z. B. "会社"
  status: "aktiv",            // "aktiv" sobald das Sheet steht, sonst "leerstelle"
  sorte: "filmproduktion",    // | "unvorhergesehenes" | "jede-firma"
  funktionen: ["Kamera", "Ton"],
  kurz: "Ein Satz: was die Figur tut.",
  vorgeschichte: "Woher sie kommt. Was sie schuldet.",
  insignie: "der Gegenstand, mit dem die Rolle übergeht",
  erkennungszeichen: ["…", "…"],
  palette: ["#hex", "#hex"],
  zustaendigkeiten: ["…"],
  offeneFaeden: ["…"],          // daraus kann der Imaginator neue Aufgaben ableiten
  ton: "Wie klingt ihr Tagebuch?",
  bilder: {
    face:  "assets/figuren/neue_figur/face-front.jpg",
    front: "assets/figuren/neue_figur/full-front.jpg",
    sheet: "assets/figuren/neue_figur/full-sheet.jpg"
  }
}`;
    return `
    <section>
      <div class="sec-head"><span class="code">B-10</span><h2>Was ein Character Sheet enthält</h2></div>
      <div class="grid g3">
        <div class="panel" style="--c:var(--pink)"><p class="kick">Bild</p><h3>Drei Ansichten</h3>
          <p><b>Gesicht frontal</b> (Roster-Karte), <b>Ganzkörper frontal</b> (Dossier), <b>Full Sheet</b>: Turnaround, Details, Linework, Palette. Vorbild: Kaisha.</p></div>
        <div class="panel" style="--c:var(--symb)"><p class="kick">Steckbrief</p><h3>Name · Funktion · Vorgeschichte</h3>
          <p>Rollen-Sorte, Funktionen, Vorgeschichte, Erkennungszeichen. Der Office-Master liest daraus die Figur zur Aufgabe.</p></div>
        <div class="panel" style="--c:var(--imag)"><p class="kick">Stand</p><h3>Insignie · Fäden · Ton</h3>
          <p>Insignie für die Übernahme, Zuständigkeiten, offene Fäden, Tonlage. Der Imaginator liest daraus die Figur zum Tagebuch.</p></div>
      </div>
    </section>
    <section>
      <div class="sec-head"><span class="code">B-11</span><h2>Neue Figur anlegen</h2></div>
      <ol>
        <li>Bilder als JPG nach <code>assets/figuren/&lt;id&gt;/</code>: <code>face-front.jpg</code>, <code>full-front.jpg</code>, <code>full-sheet.jpg</code>.</li>
        <li>In <code>data/roster.js</code> den Eintrag anlegen oder eine Leerstelle ausfüllen. Felder mit <code>null</code> erscheinen als Leerstelle.</li>
        <li><code>status: "aktiv"</code> setzen. In <code>data/chronik.js</code> unter <code>SF.tagebuecher</code> ein leeres Tagebuch <code>&lt;id&gt;: []</code> anlegen.</li>
        <li>Committen und pushen. GitHub Pages zeigt die Figur nach ein bis zwei Minuten.</li>
      </ol>
      <pre class="code">${esc(tpl)}</pre>
    </section>
    <section>
      <div class="sec-head"><span class="code">B-12</span><h2>Stand der Sheets</h2></div>
      <div class="pool-wrap"><table class="pool"><thead><tr><th>Nr</th><th>Figur</th><th>Bild</th><th>Steckbrief</th><th>Insignie</th></tr></thead><tbody>
      ${SF.roster.map((f) => `<tr><td class="id">${f.nr}</td><td><a href="#figur/${f.id}">${esc(f.name)}</a></td>
        <td>${f.bilder ? '<span class="green">✓</span>' : '<span style="color:var(--yellow)">fehlt</span>'}</td>
        <td>${f.vorgeschichte ? '<span class="green">teilweise</span>' : '<span style="color:var(--yellow)">fehlt</span>'}</td>
        <td>${f.insignie ? esc(f.insignie) : '<span style="color:var(--yellow)">fehlt</span>'}</td></tr>`).join("")}
      </tbody></table></div>
    </section>`;
  }

  function figOptions(sel) {
    return `<option value="">— nicht zugeteilt —</option>` + SF.roster.map((f) =>
      `<option value="${f.id}" ${f.id === sel ? "selected" : ""}>${f.nr} · ${esc(f.name)}${f.status === "aktiv" ? "" : " (Leerstelle)"}</option>`).join("");
  }

  function bPool() {
    const ts = allTasks();
    const offen = ts.filter((t) => !t.erledigt).length;
    const ohne = ts.filter((t) => !t.figur && !t.erledigt).length;
    return `
    <div class="om">
      <img src="assets/brand/office-master.jpg" alt="Die Puppe als Office-Master">
      <div>
        <p class="kick">Office-Master · teilt zu, nimmt zurück</p>
        <h2>Aufgabenpool</h2>
        <p>${offen} offen · <span style="color:var(--yellow)">${ohne} ohne Figur</span> · ${ts.length - offen} erledigt.
          Jede Aufgabe bekommt ihre Figur. Zugeordnet wird von Hand: vorher von denen, die den Pool schreiben, später von der Figur, die neue Aufgaben einspeist.</p>
        <div class="toolbar">
          <select id="flt"><option value="">alle Typen</option>${Object.entries(SF.aufgabenTypen).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
          <label class="mono"><input type="checkbox" id="fltOhne"> nur ohne Figur</label>
          <button class="btn" id="expPool">Zuteilung exportieren</button>
        </div>
      </div>
    </div>
    <div class="pool-wrap"><table class="pool" id="poolT"><thead><tr><th>ID</th><th>Typ</th><th>Aufgabe</th><th>Figur</th><th></th></tr></thead><tbody>
      ${ts.map((t) => `<tr data-id="${t.id}" data-typ="${t.typ}" data-fig="${t.figur || ""}" class="${t.erledigt ? "done" : ""}">
        <td class="id">${esc(t.id)}</td><td class="mono typ-${t.typ}">${SF.aufgabenTypen[t.typ] || t.typ}</td><td>${esc(t.titel)}</td>
        <td><select data-assign="${t.id}">${figOptions(t.figur)}</select></td>
        <td style="white-space:nowrap"><button class="btn" data-card="${t.id}" title="Karte auf Papier">Karte</button>
          <button class="btn" data-done="${t.id}">${t.erledigt ? "↺" : "✓"}</button></td></tr>`).join("")}
    </tbody></table></div>
    <section style="margin-top:40px">
      <div class="sec-head"><span class="code">REST</span><h2>Neue Aufgabe melden</h2></div>
      <p class="dim">Was der Ablauf nicht vorsah, wird gemeldet und als neue Aufgabe eingehängt — mit derselben Zuordnung zu einer Figur.</p>
      <form class="form" id="neuForm">
        <label class="wide">Aufgabe<input name="titel" required placeholder="z. B. Kestrel Rentals anrufen und die Kaution klären"></label>
        <label>Typ<select name="typ">${Object.entries(SF.aufgabenTypen).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <label>Figur<select name="figur">${figOptions(null)}</select></label>
        <div style="align-self:end"><button class="btn prim" type="submit">In den Pool</button></div>
      </form>
    </section>
    <div id="cardOut" style="margin-top:32px"></div>`;
  }

  function bProtokoll() {
    const ts = allTasks();
    return `
    <section>
      <div class="sec-head"><span class="code">B-20</span><h2>Vorgang protokollieren</h2></div>
      <p class="dim">Antritt meldet die Person, Rückgabe die Figur. Der Ausführende erscheint nur als Pseudonym — der Klarname gehört auf die Anwesenheitsliste, nicht hierher.</p>
      <form class="form" id="protForm">
        <label>Figur (sub)<select name="sub" required>${figOptions(null)}</select></label>
        <label>Person (act, pseudonym)<input name="act" required pattern="person_[0-9]{4}" placeholder="person_0001"></label>
        <label class="wide">Auftrag<select name="auftrag">${ts.map((t) => `<option value="${t.id}">${t.id} · ${esc(t.titel)}</option>`).join("")}</select></label>
        <label class="wide">Antritt — „Wie kommst du an?“<textarea name="antritt"></textarea></label>
        <label class="wide">Rückgabe — „Wie ist es gelaufen?“<textarea name="rueckgabe"></textarea></label>
        <label>Zurück<select name="zurueck"><option>ja</option><option>nein</option></select></label>
        <div style="align-self:end"><button class="btn prim" type="submit">Ins Protokoll</button></div>
      </form>
    </section>
    <section>
      <div class="sec-head"><span class="code">B-21</span><h2>Protokoll</h2>
        <span style="margin-left:auto"><button class="btn" id="expProt">Export JSON</button> <button class="btn" id="clrProt">Leeren</button></span></div>
      ${S.protokoll.length ? S.protokoll.slice().reverse().map((p) => `<div class="protokoll" style="margin-bottom:10px">ZEIT      ${esc(p.zeit)}
FIGUR     ${esc(p.sub)}
ACT       ${esc(p.act)}  <span class="dim">→ abgetrennt, nur Anwesenheitsliste</span>
AUFTRAG   ${esc(p.auftrag)}
<span class="a">ANTRITT   „${esc(p.antritt)}“</span>
<span class="r">RÜCKGABE  „${esc(p.rueckgabe)}“</span>
ZURÜCK    ${esc(p.zurueck)}</div>`).join("") : `<p class="empty">Noch keine Einträge in diesem Browser.</p>`}
    </section>
    <section>
      <div class="sec-head"><span class="code">B-22</span><h2>Ereignisschema</h2></div>
      <pre class="code">{
  "sub": "frank_the_drifter",        // die Figur → Imaginator: Tagebuch, Firmengeschichte
  "act": { "sub": "person_0000" },   // die Person → abgetrennt, Anwesenheitsliste, pseudonymisiert
  "antritt": "müde, wenig geschlafen",
  "rueckgabe": "ging leichter als gedacht"
}</pre>
    </section>`;
  }

  function bOffen() {
    const qs = [
      ["Figuren", "Ist Kaisha Goonin die elfte Figur oder ersetzt sie eine der zehn aus dem Pitch-Deck (z. B. The Chair)?"],
      ["Figuren", "Wer erstellt die Character Sheets für Figur 02–11, im selben Bildstil wie Kaisha?"],
      ["Figuren", "Welche Insignien gibt es? Bisher bekannt: verspiegelte Schutzbrille (Frank). Für Kaisha: Ring mit Quaste oder Maske?"],
      ["Welt", "In welcher Stadt und welchem Jahr spielt die Fiktion? Ist Berlin auch in der Welt Berlin?"],
      ["Welt", "Was ist „die Brücke“, was „Arizona“, welche Konzerne außer Kestrel Rentals?"],
      ["Welt", "Tonlage der Texte: eher Noir, Satire, Behördenprosa, Manga?"],
      ["Werkzeuge", "Wo laufen Office-Master und Imaginator technisch (Rechner in der Puppe, Chat-Modell, Kartendrucker)?"],
      ["Werkzeuge", "Wie viel fragt die Puppe bei Antritt und Rückgabe: je eine Frage oder ein Interview?"],
      ["Werkzeuge", "Braucht das Backend echte Zugangskontrolle und gemeinsamen Speicher (statt Browser-Speicher)? Wer darf zuteilen?"],
      ["Seite", "Öffentlich oder intern? Soll das Pitch-Deck verlinkt werden? Impressum/Datenschutz für die Live-Seite?"],
      ["Seite", "Sprache: nur Deutsch, oder auch Englisch (das Techdeck liegt auf EN vor)?"],
      ["Recht", "Wem gehört die Figur? Wie wird ihr Wert über die Anwesenheitsliste verteilt — Beteiligung, Anerkennung, gemeinsamer Bestand?"]
    ];
    return `
    <section>
      <div class="sec-head"><span class="code">B-30</span><h2>Offene Fragen</h2></div>
      <div class="pool-wrap"><table class="pool"><thead><tr><th>#</th><th>Bereich</th><th>Frage</th></tr></thead><tbody>
        ${qs.map(([b, q], i) => `<tr><td class="id">Q-${String(i + 1).padStart(2, "0")}</td><td class="mono" style="color:var(--yellow)">${b}</td><td>${esc(q)}</td></tr>`).join("")}
      </tbody></table></div>
    </section>`;
  }

  // ── Backend-Interaktion ──
  function download(name, obj) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function rerender(tab) { view.innerHTML = backend(tab); bindBackend(tab); }

  function bindBackend(tab) {
    view.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { location.hash = "#backend/" + b.dataset.tab; }));

    view.querySelectorAll("[data-assign]").forEach((s) => s.addEventListener("change", () => {
      S.zuteilung[s.dataset.assign] = s.value || null; store.save(S); rerender("pool");
    }));
    view.querySelectorAll("[data-done]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.done; S.done[id] = !S.done[id]; store.save(S); rerender("pool");
    }));
    view.querySelectorAll("[data-card]").forEach((b) => b.addEventListener("click", () => {
      const t = allTasks().find((x) => x.id === b.dataset.card);
      const f = t.figur && fig(t.figur);
      $("#cardOut").innerHTML = `<div class="taskcard print-me">
        <div class="lbl">SCHEINFIRMA · CHANCE² · AUFTRAG ${esc(t.id)}</div>
        <h4>${esc(t.titel)}</h4>
        <div class="lbl">FIGUR</div><div style="font-size:18px;margin-bottom:10px">${f ? esc(f.name) : "— noch keine —"}</div>
        <div class="lbl">INSIGNIE</div><div>${f && f.insignie ? esc(f.insignie) : "— offen —"}</div>
        <hr style="border:0;border-top:1px dashed #999;margin:14px 0">
        <div class="lbl">ANTRITT · Wie kommst du an?</div><div style="height:40px"></div>
        <div class="lbl">RÜCKGABE · Wie ist es gelaufen?</div><div style="height:40px"></div>
      </div><p style="margin-top:10px"><button class="btn" onclick="window.print()">Karte drucken</button></p>`;
      $("#cardOut").scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    const filt = () => {
      const typ = $("#flt").value, ohne = $("#fltOhne").checked;
      view.querySelectorAll("#poolT tbody tr").forEach((tr) => {
        tr.style.display = (!typ || tr.dataset.typ === typ) && (!ohne || !tr.dataset.fig) ? "" : "none";
      });
    };
    if ($("#flt")) { $("#flt").addEventListener("change", filt); $("#fltOhne").addEventListener("change", filt); }
    if ($("#expPool")) $("#expPool").addEventListener("click", () => download("aufgabenpool.json", allTasks()));

    const nf = $("#neuForm");
    if (nf) nf.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(nf));
      const n = S.neue.length + 1;
      S.neue.push({ id: "N-" + String(n).padStart(2, "0"), typ: d.typ, titel: d.titel, figur: d.figur || null });
      store.save(S); rerender("pool");
    });

    const pf = $("#protForm");
    if (pf) pf.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(pf));
      d.zeit = new Date().toISOString().slice(0, 16).replace("T", " ");
      S.protokoll.push(d); store.save(S); rerender("protokoll");
    });
    if ($("#expProt")) $("#expProt").addEventListener("click", () => download("protokoll.json",
      S.protokoll.map((p) => ({ zeit: p.zeit, sub: p.sub, act: { sub: p.act }, auftrag: p.auftrag, antritt: p.antritt, rueckgabe: p.rueckgabe, zurueck: p.zurueck }))));
    if ($("#clrProt")) $("#clrProt").addEventListener("click", () => {
      if (confirm("Alle Protokolleinträge in diesem Browser löschen?")) { S.protokoll = []; store.save(S); rerender("protokoll"); }
    });
  }

  go();
})();
