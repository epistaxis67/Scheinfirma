/* SCHEINFIRMA — Frontend + Backend in einer Datei.
   Frontend: nur die Welt. Backend: Higgsfield-Workflow, Character Sheets, Worldbook, Aufgaben.
   Inhalte liegen in data/*.json (Figuren, Worldbook) und data/*.js. Zuteilungen im Backend bleiben im Browser (localStorage). */
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
      try { return Object.assign({ zuteilung: {}, done: {}, neue: [] }, JSON.parse(localStorage.getItem(KEY) || "{}")); }
      catch (e) { return { zuteilung: {}, done: {}, neue: [] }; }
    },
    save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* privat-modus: dann eben flüchtig */ } }
  };
  let S = store.load();

  const allTasks = () => SF.aufgaben.concat(S.neue.filter((t) => t.bereich)).map((t) => Object.assign({}, t, {
    figur: S.zuteilung[t.id] !== undefined ? S.zuteilung[t.id] : t.figur,
    erledigt: !!S.done[t.id]
  }));

  // ── Router ──
  const routes = { lobby, manifest, werke, roster, figur, chronik, logbuch, log, backend, einreichen: () => { location.replace("#backend/baukasten"); return ""; } };
  const alias = { tagebuecher: "logbuch", tagebuch: "log" };
  function go() {
    let [r, arg] = (location.hash.replace(/^#\/?/, "") || "lobby").split("/");
    r = alias[r] || r;
    const fn = routes[r] || lobby;
    view.innerHTML = fn(arg);
    document.querySelectorAll(".nav a").forEach((a) => {
      const d = a.dataset.r;
      a.classList.toggle("on", d === r || (d === "roster" && r === "figur") || (d === "logbuch" && r === "log"));
    });
    document.body.classList.remove("nav-open");
    if (r === "backend") bindBackend(arg);
    window.scrollTo(0, 0);
    SF.sound.tick();
  }
  window.addEventListener("hashchange", go);

  // Sound-Schalter in der Kopfzeile
  $("#snd").addEventListener("click", () => {
    const an = SF.sound.toggle();
    $("#snd").classList.toggle("on", an);
    $("#snd").setAttribute("aria-pressed", an);
    $(".snd-l").textContent = an ? "SOUND ON" : "SOUND OFF";
  });

  // ═════════════ FRONTEND ═════════════

  function lobby() {
    return `
    <section class="hero">
      <div>
        <h1><span class="glitch" data-t="Scheinfirma.">Scheinfirma.</span>
          <span class="l2">Filmproduktion.</span></h1>
        <p class="yurei" lang="ja">幽霊会社</p>
        <div class="bars"><i></i><i></i><i></i></div>
      </div>
      <div class="hero-logo logo glitch-img big" style="--src:url(assets/brand/logo.svg)"><img src="assets/brand/logo.svg" alt="Scheinfirma Logo"></div>
    </section>`;
  }

  function manifest() {
    const m = SF.manifest;
    return `
    <p class="kick"><span class="c">01</span> // Manifest</p>
    <div class="manifest-text">
      ${m.absaetze.length ? m.absaetze.map((p, i) => `<p class="${i === m.absaetze.length - 1 ? "final" : p.length < 40 ? "beat" : ""}">${esc(p)}</p>`).join("") : leer()}
      ${m.unterzeichnet ? `<p class="sig">${esc(m.unterzeichnet)}</p>` : ""}
    </div>`;
  }

  function werke() {
    return `
    <p class="kick"><span class="c">02</span> // 幽霊会社 · FILMOGRAPHY</p>
    <h1><span class="glitch" data-t="WORKS">WORKS</span></h1>
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

  function card(f) {
    if (f.status !== "aktiv") {
      return `<a class="card void" href="#figur/${f.id}">
        <div class="pic"><span class="nr">ID-${f.nr}</span><span class="sil">?_</span></div>
        <div class="meta"><h3>${esc(f.name)}</h3><p>${esc((f.funktionen || []).join(", "))} · <span style="color:var(--yellow)">OFFLINE</span></p></div></a>`;
    }
    return `<a class="card" href="#figur/${f.id}">
      <div class="pic"><span class="nr">ID-${f.nr}</span><img src="${f.bilder.face}" alt="${esc(f.name)}" loading="lazy"></div>
      <div class="meta"><h3>${esc(f.name)}${f.kana ? `<span class="kana">${f.kana}</span>` : ""}</h3>
      <p>${f.funktionen ? esc(f.funktionen.join(", ")) : "—"} · <span class="green">ONLINE</span></p></div></a>`;
  }
  function roster() {
    return `
    <p class="kick"><span class="c">03</span> // PERSONNEL.DB · 幽霊会社</p>
    <h1><span class="glitch" data-t="ROSTER">ROSTER</span></h1>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="roster">${SF.roster.map(card).join("")}</div>`;
  }

  function figur(id) {
    const f = fig(id);
    if (!f) return `<h1>404</h1><p class="mono">ID ${esc(id)} nicht gefunden.</p>`;
    const n = SF.oeffentlich(SF.tagebuecher[f.id]).length;
    const pic = f.bilder
      ? `<div class="idcard" data-id="${f.nr}"><img src="${f.bilder.front}" alt="${esc(f.name)}"></div>`
      : `<div class="card void" style="pointer-events:none"><div class="pic"><span class="nr">ID-${f.nr}</span><span class="sil">?_</span></div></div>`;
    return `
    <p class="kick"><a href="#roster">← ROSTER</a> &nbsp;/&nbsp; <span class="c">ID-${f.nr}</span> // ${f.status === "aktiv" ? '<span class="green">ONLINE</span>' : '<span style="color:var(--yellow)">OFFLINE</span>'}</p>
    <h1>${esc(f.name)}${f.kana ? `<span class="kana" style="font-size:.5em">${f.kana}</span>` : ""}</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="dossier">
      <div>${pic}</div>
      <div>
        <blockquote class="stimme">${f.stimme ? esc(f.stimme) : leer()}</blockquote>
        <dl class="rows">
          <dt>Funktion</dt><dd>${f.funktionen ? f.funktionen.map((x) => `<span class="tag blue">${esc(x)}</span>`).join("") : leer()}</dd>
          <dt>Vorgeschichte</dt><dd>${f.vorgeschichte ? esc(f.vorgeschichte) : leer()}</dd>
          <dt>Ghost Log</dt><dd><a href="#log/${f.id}">${n} Eintr${n === 1 ? "ag" : "äge"} →</a></dd>
        </dl>
      </div>
    </div>`;
  }

  function chronik() {
    return `
    <p class="kick"><span class="c">04</span> // 幽霊会社 · CHRONICLE</p>
    <h1><span class="glitch" data-t="CORE LOG">CORE LOG</span></h1>
    <div class="bars"><i></i><i></i><i></i></div>
    ${logView(SF.oeffentlich(SF.chronik))}`;
  }
  function logView(list) {
    return `<div class="log">${list.map((e) => `
      <div class="ev ${e.text ? "" : "leer-ev"}">
        <div class="when">${esc(e.datum)} · ${esc(e.id)}</div>
        ${e.titel ? `<h3 style="margin:6px 0 0">${esc(e.titel)}</h3>` : ""}
        ${e.text ? `<p class="prose">${esc(e.text)}</p>` : `<p style="margin-top:8px">${leer()}</p>`}
      </div>`).join("")}</div>`;
  }

  function logbuch() {
    return `
    <p class="kick"><span class="c">05</span> // 幽霊会社 · PERSONAL</p>
    <h1><span class="glitch" data-t="GHOST LOGS">GHOST LOGS</span></h1>
    <div class="bars"><i></i><i></i><i></i></div>
    <div class="diary-list">${SF.roster.map((f) => {
      const n = SF.oeffentlich(SF.tagebuecher[f.id]).length;
      return `<a class="diary-row ${f.status === "aktiv" ? "" : "void"}" href="#log/${f.id}">
        <span class="n">${f.nr}</span><span><b>${esc(f.name)}</b> <span class="dim mono">· ${n} Eintr${n === 1 ? "ag" : "äge"}</span></span>
        <span class="tag ${n ? "pink" : ""}" style="${n ? "" : "color:var(--yellow)"}">${n ? "öffnen" : "leer"}</span></a>`;
    }).join("")}</div>`;
  }
  function log(id) {
    const f = fig(id);
    if (!f) return `<h1>404</h1>`;
    const eps = SF.oeffentlich(SF.tagebuecher[f.id]);
    return `
    <p class="kick"><a href="#logbuch">← GHOST LOGS</a> &nbsp;/&nbsp; <span class="c">ID-${f.nr}</span></p>
    <h1>GHOST LOG // ${esc(f.name)}</h1>
    <div class="bars"><i></i><i></i><i></i></div>
    ${eps.length ? `<div class="log">${eps.map((e) => `
      <div class="ev"><div class="when">${esc(e.datum)}</div><p class="prose diary">${esc(e.text)}</p></div>`).join("")}</div>`
      : `<p>${leer()}</p>`}`;
  }

  // ═════════════ BACKEND ═════════════

  const TABS = [["workflow", "01 · Higgsfield-Workflow"], ["sheets", "02 · Character Sheets"], ["worldbook", "03 · Worldbook"], ["aufgaben", "04 · Aufgaben"], ["logo", "05 · Logo-Motion"], ["tool", "06 · Logo-Tool"], ["baukasten", "07 · Baukasten"], ["werkstatt", "08 · Werkstatt"], ["eingang", "09 · Eingang"]];
  function backend(tab) {
    tab = TABS.some((t) => t[0] === tab) ? tab : "workflow";
    const body = { workflow: bWorkflow, sheets: bSheets, worldbook: bWorldbook, aufgaben: bAufgaben, logo: bLogo, tool: bTool, baukasten: () => SF.einreichen.view(), werkstatt: () => SF.werkstatt.view(), eingang: () => SF.einreichen.eingang() }[tab]();
    return `<div class="backend">
      <p class="kick"><span class="blue">▚▚ BACKEND</span></p>
      <h1>Backend</h1>
      <div class="tabs">${TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}</div>
      ${body}</div>`;
  }

  const refSrc = (f, key) => `assets/figuren/${f.id}/${key}.jpg`;

  // Schematisches Filmbild: vorher (Person) / nachher (Kaisha)
  function frame(nachher) {
    const k = fig("kaisha").bilder;
    const szene = `<rect width="320" height="180" fill="#1a1a24"/>
      <rect x="0" y="120" width="320" height="60" fill="#22222e"/>
      <rect x="220" y="30" width="70" height="90" fill="#2a2a38"/><rect x="232" y="44" width="46" height="30" fill="#3a3a50"/>
      <rect x="20" y="96" width="60" height="30" fill="#2c2c3a"/>`;
    const person = `<g fill="#6b6878"><ellipse cx="150" cy="58" rx="17" ry="21"/><path d="M118 180 L124 102 Q150 84 176 102 L182 180 Z"/></g>`;
    const kaisha = `<path d="M114 180 L120 100 Q150 80 180 100 L186 180 Z" fill="#4fb3a0"/>
      <path d="M140 92 L150 180 L160 92 Z" fill="#5d4470"/>
      <path d="M120 100 L114 180 L126 180 L130 112 Z M180 100 L186 180 L174 180 L170 112 Z" fill="#d77fae" opacity=".8"/>
      <circle cx="150" cy="150" r="5" fill="none" stroke="#c9a24a" stroke-width="2"/><rect x="148" y="155" width="4" height="14" fill="#a24f88"/>
      <defs><clipPath id="cfk"><ellipse cx="150" cy="58" rx="18" ry="23"/></clipPath></defs>
      <image href="${k.face}" x="122" y="28" width="56" height="70" preserveAspectRatio="xMidYMid slice" clip-path="url(#cfk)"/>`;
    return `<svg viewBox="0 0 320 180" class="frame" role="img" aria-label="${nachher ? "Ergebnis mit Kaisha" : "Ausgangsclip"}">${szene}${nachher ? kaisha : person}
      <text x="8" y="14" font-size="9" fill="#8a8798" font-family="JetBrains Mono, monospace">${nachher ? "OUTPUT · genjutsu" : "INPUT · clip_014.mp4 · 0:12"}</text></svg>`;
  }

  function bWorkflow() {
    const k = fig("kaisha");
    return `
    <p class="lead">Wie eine Figur in Higgsfield entsteht, stabil bleibt und in Filmmaterial landet. Beispiel: Kaisha Goonin.</p>
    <ol class="wf-index mono">
      <li><a href="#wf1">Referenzbilder</a></li><li><a href="#wf2">Soul ID</a></li>
      <li><a href="#wf3">Neue Szenen</a></li><li><a href="#wf4">Vorhandenes Material: Genjutsu</a></li><li><a href="#wf5">Prüfen</a></li>
    </ol>

    <section id="wf1">
      <div class="sec-head"><span class="code">SCHRITT 1</span><h2>Referenzbilder erzeugen</h2></div>
      <p>Jede Figur beginnt mit einem Character Sheet und einem Satz Referenzbilder. Je mehr saubere, unterschiedliche Ansichten derselben Figur, desto stabiler bleibt sie in Bild und Video.</p>
      <div class="refgrid">${(k.referenzen || []).map(([key, label]) => `
        <figure><img src="${refSrc(k, key)}" alt="Kaisha, ${esc(label)}" loading="lazy"><figcaption>${esc(label)}</figcaption></figure>`).join("")}
      </div>
      <div class="grid g2" style="margin-top:22px">
        <div class="panel" style="--c:var(--pink)"><p class="kick">So geht es in Higgsfield</p>
          <ol>
            <li>Mit einem Bildmodell das erste Bild erzeugen, meist Gesicht frontal oder Ganzkörper frontal.</li>
            <li>Dieses Bild als Referenz hochladen und davon weitere Ansichten erzeugen: ¾, Profil, Rücken, Kopf aus mehreren Winkeln.</li>
            <li>Ein Full Sheet erzeugen (Turnaround, Details, Palette) als Übersicht.</li>
            <li>Abweichungen (andere Maske, falsche Farbe, fehlendes Detail) verwerfen und neu erzeugen.</li>
            <li>Für Soul ID weitere Varianten erzeugen: andere Posen, Licht, Umgebungen.</li>
          </ol></div>
        <div class="panel" style="--c:var(--symb)"><p class="kick">Worauf es ankommt</p>
          <ul>
            <li>Kostüm, Maske, Farben und Gegenstände in jeder Ansicht identisch.</li>
            <li>Für das Sheet: neutraler Hintergrund, gleichmäßiges Licht, ganze Figur im Bild.</li>
            <li>Für Soul ID: Abwechslung bei Winkel, Licht, Ausdruck, Umgebung.</li>
            <li>Hohe Auflösung, keine Artefakte an Händen und Rändern.</li>
            <li>Ablage: <code>Avatar/Character Sheets/&lt;Name&gt;/</code>, für die Seite verkleinert nach <code>website/assets/figuren/&lt;id&gt;/</code>.</li>
          </ul></div>
      </div>
    </section>

    <section id="wf2">
      <div class="sec-head"><span class="code">SCHRITT 2</span><h2>Identität festigen: Soul ID</h2></div>
      <div class="grid g2" style="align-items:start">
        <div>
          <p>Aus den Referenzbildern wird in Higgsfield eine Soul ID trainiert. Sie ist danach bei jeder Bild- und Videogenerierung auswählbar.</p>
          <dl class="rows">
            <dt>Eingabe</dt><dd>20 oder mehr Bilder aus verschiedenen Winkeln. Für Kaisha: die ${(k.referenzen || []).length} Ansichten plus Varianten aus Schritt 1.</dd>
            <dt>Training</dt><dd>Soul ID anlegen, Bilder hochladen, trainieren. Dauert wenige Minuten.</dd>
            <dt>Kostüm</dt><dd>Kostüm, Maske und Gegenstände bei jeder Generierung zusätzlich als Referenzbilder mitgeben. Bei Kaisha: Maske und Ring immer dabei.</dd>
            <dt>Mehrere Figuren</dt><dd>Eine Soul ID pro Figur. Für gemeinsame Szenen beide auswählen.</dd>
            <dt>Archiv</dt><dd>Referenzbilder immer im eigenen Ordner aufbewahren: <code>Avatar/Character Sheets/&lt;Name&gt;/</code>.</dd>
          </dl>
        </div>
        <div class="soul">
          <div class="soul-in">${(k.referenzen || []).slice(0, 8).map(([key]) => `<img src="${refSrc(k, key)}" alt="" loading="lazy">`).join("")}</div>
          <div class="soul-arrow mono">→ TRAIN →</div>
          <div class="soul-id"><img src="${k.bilder.face}" alt=""><span class="mono">SOUL ID<br><b>kaisha_goonin</b></span></div>
        </div>
      </div>
    </section>

    <section id="wf3">
      <div class="sec-head"><span class="code">SCHRITT 3</span><h2>Figur in neue Szenen setzen</h2></div>
      <p>Mit Soul ID entstehen Standbilder und Clips, in denen die Figur auftritt: Plakate, Einstellungen für den Film, Bilder für Core Log und Ghost Logs.</p>
      <div class="steps">
        <div style="--c:var(--real)"><h4>Soul ID wählen</h4><p>Die trainierte Figur auswählen, bei Bedarf Kostüm-Referenzen ergänzen.</p></div>
        <div style="--c:var(--symb)"><h4>Bild erzeugen</h4><p>Szene im Prompt beschreiben, Orte und Begriffe aus dem Worldbook verwenden.</p></div>
        <div style="--c:var(--symb)"><h4>Video erzeugen</h4><p>Bild als Startframe nehmen oder direkt ein Videomodell mit Soul ID nutzen.</p></div>
        <div style="--c:var(--imag)"><h4>Auswählen</h4><p>Das beste Ergebnis behalten, in die Shotliste eintragen.</p></div>
      </div>
      <pre class="code" style="margin-top:18px">Kaisha Goonin steht am Empfang des Pavillons, hinter Glas,
Nacht, Neonreflexe auf der Maske, Messingring in der Hand.
Halbtotale, Handkamera, leichte Unschärfe im Vordergrund.</pre>
    </section>

    <section id="wf4">
      <div class="sec-head"><span class="code">SCHRITT 4</span><h2>Figur in vorhandenes Material einsetzen: Genjutsu</h2></div>
      <p>Genjutsu verändert ein bestehendes Video und lässt den Rest stehen. Damit wird aus jemandem, der am Schinkel Pavillon gefilmt wurde, im Bild die Figur, die er an diesem Tag war.</p>
      <div class="gj">
        <div class="gj-box"><span class="gj-l mono">1 · CLIP</span>${frame(false)}<p>Ein Video hochladen, 4 bis 30 Sekunden.</p></div>
        <div class="gj-plus mono">+</div>
        <div class="gj-box"><span class="gj-l mono">2 · REFERENZEN</span>
          <div class="gj-refs">${(k.referenzen || []).slice(0, 6).map(([key]) => `<img src="${refSrc(k, key)}" alt="" loading="lazy">`).join("")}</div>
          <p>Bis zu 30 Referenzbilder (Lite: bis zu 10): Figur, Kostüm, Gegenstände.</p></div>
        <div class="gj-plus mono">+</div>
        <div class="gj-box"><span class="gj-l mono">3 · PROMPT</span>
          <div class="gj-prompt mono">Behalte Bewegung, Kameraführung und Raum. Ersetze die Person in der Mitte durch Kaisha Goonin aus den Referenzen: Maske mit Kreis, türkise Jacke, Messingring.</div>
          <p>Sagen, was bleibt und was sich ändert.</p></div>
        <div class="gj-plus mono">=</div>
        <div class="gj-box out"><span class="gj-l mono">4 · ERGEBNIS</span>${frame(true)}<p>Gleicher Clip, gleiche Bewegung, neue Figur.</p></div>
      </div>
      <div class="grid g2" style="margin-top:22px">
        <div class="panel" style="--c:var(--symb)"><p class="kick">Zwei Arten</p>
          <ul>
            <li><b>Motion Transfer:</b> Die Bewegung aus dem Clip wird auf die Figur übertragen. Für den Tausch der ganzen Person.</li>
            <li><b>Object Swap:</b> Nur ein Element wird ersetzt, der Rest bleibt. Für Maske, Jacke oder einen Gegenstand.</li>
          </ul>
</div>
        <div class="panel" style="--c:var(--real)"><p class="kick">Tipps</p>
          <ul>
            <li>Eine große Änderung pro Durchgang, z. B. erst Person, dann Hintergrund.</li>
            <li>Clips wählen, in denen die Person gut sichtbar und wenig verdeckt ist.</li>
            <li>Klare, hoch aufgelöste Referenzen. Bei Kaisha immer Maske und Ring mitgeben.</li>
            <li>Lite für schnelle Tests, volle Version für die Endfassung.</li>
          </ul></div>
      </div>
    </section>

    <section id="wf5">
      <div class="sec-head"><span class="code">SCHRITT 5</span><h2>Prüfen</h2></div>
      <ul class="check">
        <li>Sieht die Figur in allen Shots gleich aus: Maske, Farben, Gegenstände?</li>
        <li>Keine Artefakte an Händen, Haaren, Rändern?</li>
        <li>Haben alle Personen im Ausgangsmaterial eingewilligt?</li>
        <li>Shot mit Figur und Version in der Shotliste vermerken.</li>
      </ul>
    </section>`;
  }

  function bSheets() {
    return SF.roster.map((f) => {
      if (f.status !== "aktiv") return "";
      return `
      <section>
        <div class="sec-head"><span class="code">ID-${f.nr}</span><h2>${esc(f.name)}</h2><span class="mono dim">${(f.referenzen || []).length} Referenzbilder</span></div>
        <div class="sheet"><img src="${f.bilder.sheet}" alt="Character Sheet ${esc(f.name)}" loading="lazy"></div>
        <div class="refgrid" style="margin-top:14px">${(f.referenzen || []).map(([key, label]) => `
          <figure><img src="${refSrc(f, key)}" alt="${esc(label)}" loading="lazy"><figcaption>${esc(label)}</figcaption></figure>`).join("")}</div>
        <dl class="rows" style="margin-top:22px">
          <dt>Erkennungszeichen</dt><dd>${f.erkennungszeichen ? `<ul>${f.erkennungszeichen.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : leer()}</dd>
          ${f.palette ? `<dt>Palette</dt><dd class="swatches">${f.palette.map((c) => `<i style="background:${c}" title="${c}"></i>`).join("")}</dd>` : ""}
          <dt>Abzeichen</dt><dd>${f.insignie ? esc(f.insignie) : f.insignieVorschlag ? `<span style="color:var(--yellow)">Vorschlag:</span> ${esc(f.insignieVorschlag)}` : leer()}</dd>
          <dt>Text der Figur</dt><dd>${f.stimme ? esc(f.stimme) : leer("fehlt: Vorlage für den Ghost Log")}</dd>
          ${f.fragen ? `<dt>Offen</dt><dd><ul>${f.fragen.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></dd>` : ""}
        </dl>
      </section>`;
    }).join("") + `
    <section>
      <div class="sec-head"><span class="code">ID-02–11</span><h2>Noch ohne Sheet</h2></div>
      <div class="pool-wrap"><table class="pool"><thead><tr><th>ID</th><th>Figur</th><th>Funktion</th><th>Vorgeschichte</th><th>Abzeichen</th></tr></thead><tbody>
      ${SF.roster.filter((f) => f.status !== "aktiv").map((f) => `<tr><td class="id">${f.nr}</td><td>${esc(f.name)}</td>
        <td class="mono">${esc((f.funktionen || []).join(", "))}</td>
        <td>${f.vorgeschichte ? esc(f.vorgeschichte) : '<span style="color:var(--yellow)">fehlt</span>'}</td>
        <td>${f.insignie ? esc(f.insignie) : '<span style="color:var(--yellow)">fehlt</span>'}</td></tr>`).join("")}
      </tbody></table></div>
    </section>`;
  }

  function bWorldbook() {
    return `
    <p class="lead">Die Lore der Scheinfirma. Grundlage für Prompts, Ghost Logs und den Prolog des Core Log.</p>
    <p class="mono">${Object.entries(SF.herkunft).map(([k, v]) => `<span class="badge h-${k}">${v}</span>`).join(" ")}</p>
    ${SF.weltbuch.map((k) => `
      <section>
        <div class="sec-head"><span class="code">${k.code}</span><h2>${esc(k.kapitel)}</h2></div>
        <div class="wb">${k.eintraege.map((e) => `
          <div class="entry h-${e.herkunft || "leer"}">
            <h4>${esc(e.titel)}${e.herkunft ? `<span class="badge h-${e.herkunft}">${SF.herkunft[e.herkunft]}</span>` : ""}</h4>
            ${e.text ? `<p>${esc(e.text)}</p>` : leer()}
          </div>`).join("")}</div>
      </section>`).join("")}`;
  }

  function bLogo() {
    return `
    <p class="lead">Entwürfe: Wie das Logo einen Clip eröffnet und beendet. Fünf Varianten laufen synchron, umschaltbar zwischen 9:16 (Reels) und 16:9. „DEIN CLIP“ ist ein Platzhalter.</p>
    <iframe class="logo-frame" src="backend/logo-varianten.html?embed&v=12" title="Logo-Varianten"></iframe>`;
  }
  function bTool() {
    const url = new URL("logo-tool.html", location.href).href;
    return `
    <p class="lead">Video wählen, Logo kommt automatisch drauf (Variante 1 · Glitch-Schnitt): Intro am Anfang, klein in der Ecke, Outro am Ende. Funktioniert mit jeder Clip-Länge, am Handy und am Rechner. Das Video bleibt auf dem eigenen Gerät.</p>
    <p><a class="btn tool-open" href="logo-tool.html" target="_blank" rel="noopener">▶ LOGO-TOOL ÖFFNEN</a></p>
    <p class="mono">Link zum Weitergeben: <code>${url}</code></p>`;
  }
  window.addEventListener("message", (e) => {
    const f = document.querySelector(".logo-frame");
    if (f && e.source === f.contentWindow && e.data && e.data.sfLogoH) f.style.height = e.data.sfLogoH + "px";
  });

  function figOptions(sel) {
    return `<option value="">— nicht zugeteilt —</option>` + SF.roster.map((f) =>
      `<option value="${f.id}" ${f.id === sel ? "selected" : ""}>${f.nr} · ${esc(f.name)}</option>`).join("");
  }
  function taskRows(ts) {
    return `<div class="pool-wrap"><table class="pool"><thead><tr><th>ID</th><th>Aufgabe</th><th>Figur</th><th></th></tr></thead><tbody>
      ${ts.map((t) => `<tr class="${t.erledigt ? "done" : ""}" data-row="${t.id}">
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
    <div class="aufg">
      <aside class="om-side">
        <div class="puppet" id="puppet" role="button" tabindex="0" aria-label="Die Puppe: Auftrag ziehen">
          <div class="beam"></div>
          <img src="assets/brand/puppe.png" alt="Die Puppe, Office-Master" draggable="false">
          <span class="lens"></span>
        </div>
        <div class="speech mono" id="speech">Wie kommst du an?</div>
        <div class="om-count mono"><b id="omOpen">${ts.filter((t) => !t.erledigt).length}</b> offen</div>
        <button class="btn prim" id="ask">Auftrag ziehen</button>
        <div id="ticket"></div>
      </aside>
      <div>
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
          <p class="mono dim" style="margin-top:14px">Zuteilungen und Häkchen bleiben in diesem Browser. Dauerhaft: <code>data/aufgaben.js</code>. <button class="btn" id="expPool">Liste als JSON</button></p>
        </section>
      </div>
    </div>`;
  }

  // ── Die Puppe: zieht einen offenen Auftrag und teilt ihn einer Figur zu ──
  function bindPuppet() {
    const p = $("#puppet");
    if (!p) return;
    const speech = $("#speech"), ticket = $("#ticket");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let busy = false;

    const tilt = (e) => {
      if (reduce) return;
      const r = p.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 3)) / window.innerHeight;
      p.style.setProperty("--rx", (dx * 14).toFixed(2) + "deg");
      p.style.setProperty("--ry", (dy * -8).toFixed(2) + "deg");
    };
    window.addEventListener("mousemove", tilt);
    const off = () => { window.removeEventListener("mousemove", tilt); window.removeEventListener("hashchange", off); };
    window.addEventListener("hashchange", off);

    const say = (t) => { speech.textContent = t; speech.classList.remove("pop"); void speech.offsetWidth; speech.classList.add("pop"); };

    const zieh = () => {
      if (busy) return;
      const offen = allTasks().filter((t) => !t.erledigt);
      if (!offen.length) { say("Alles erledigt. Wie ist es gelaufen?"); return; }
      busy = true;
      p.classList.add("work");
      SF.sound.glitch();
      say("…");
      ticket.innerHTML = "";
      setTimeout(() => {
        const t = offen[Math.floor(Math.random() * offen.length)];
        let fid = t.figur, neu = false;
        if (!fid) { fid = SF.roster[Math.floor(Math.random() * SF.roster.length)].id; neu = true; }
        const f = fig(fid);
        p.classList.remove("work");
        say(neu ? `${f.name}. Ab jetzt.` : `${f.name}. Wie immer.`);
        ticket.innerHTML = `<div class="taskcard ticket-out">
          <div class="lbl">AUFTRAG ${esc(t.id)} · ${t.bereich === "chance2" ? "CHANCE²" : "ALLGEMEIN"}</div>
          <h4>${esc(t.titel)}</h4>
          <div class="lbl">FIGUR</div><div class="tk-fig">${f.bilder ? `<img src="${f.bilder.face}" alt="">` : `<span class="tk-void">?_</span>`}<b>ID-${f.nr} · ${esc(f.name)}</b></div>
          <div class="tk-btns"><button class="btn" data-tk="ok">Übernehmen</button><button class="btn" data-tk="done">Erledigt</button><button class="btn" data-tk="next">Nächster</button></div>
        </div>`;
        ticket.querySelectorAll("[data-tk]").forEach((b) => b.addEventListener("click", () => {
          const a = b.dataset.tk;
          if (a === "next") { busy = false; zieh(); return; }
          S.zuteilung[t.id] = fid;
          if (a === "done") S.done[t.id] = true;
          store.save(S);
          const sel = view.querySelector(`[data-assign="${t.id}"]`);
          if (sel) sel.value = fid;
          if (a === "done") {
            const row = view.querySelector(`[data-row="${t.id}"]`);
            if (row) row.classList.add("done");
            $("#omOpen").textContent = allTasks().filter((x) => !x.erledigt).length;
            say("Wie ist es gelaufen?");
          } else say("Wie kommst du an?");
          ticket.innerHTML = `<p class="mono green">${esc(t.id)} → ${esc(f.name)}${a === "done" ? " · erledigt" : ""}</p>`;
        }));
        busy = false;
      }, reduce ? 50 : 1100);
    };
    p.addEventListener("click", zieh);
    p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zieh(); } });
    $("#ask").addEventListener("click", zieh);
    p.addEventListener("mouseenter", () => { if (!busy) say("Wie kommst du an?"); });
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
      S.zuteilung[s.dataset.assign] = s.value || null; store.save(S);
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
    bindPuppet();
    if (tab === "eingang") SF.einreichen.bindEingang(() => rerender("eingang"));
    if (tab === "baukasten") SF.einreichen.bind();
    if (tab === "werkstatt") SF.werkstatt.bind();
  }

  // Figuren und Worldbook liegen als JSON vor (Austausch mit dem Einreichen-Formular)
  const json = (f) => fetch(f + "?v=16", { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(f); return r.json(); });
  Promise.all([json("data/roster.json"), json("data/weltbuch.json")]).then(([r, w]) => {
    SF.roster = r.roster; SF.sorten = r.sorten;
    SF.weltbuch = w.weltbuch; SF.herkunft = w.herkunft;
    SF.einreichen.init(r, w);
    SF.einreichen.rerender = () => rerender("baukasten");
    go();
  }).catch((e) => { view.innerHTML = `<h1>Fehler</h1><p class="mono">Daten konnten nicht geladen werden (${esc(e.message)}).</p>`; });
})();
