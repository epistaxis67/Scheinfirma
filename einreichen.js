/* EINREICHEN — Figuren-Generator, Welt-Formular, KI-Austausch, Eingang im Backend.
   Ohne Server: Einreichungen werden als JSON-Datei (oder Text) weitergegeben
   und im Backend unter „Eingang“ importiert, geprüft und Feld für Feld angenommen.
   Format: { format: "scheinfirma.einreichung", version: 1, erstellt, von, figuren: [], welt: [] } */
window.SF = window.SF || {};
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const HEX = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;
  const FORMAT = "scheinfirma.einreichung";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const leerWert = (v) => v == null || v === "" || (Array.isArray(v) && !v.length);

  // ── Felder des Figuren-Baukastens: Aufbau wie ein Character Sheet ──
  //    Rolle (Funktion, Sorte, Abzeichen) ist bewusst nicht Teil der Figur.
  const FIG = [
    ["Sheet", [
      { k: "name", l: "Name", t: "text", ph: "NAME DER FIGUR" },
      { k: "kana", l: "Schriftzeichen", t: "text", ph: "z. B. 会社" },
      { k: "kopf", l: "Kopf", t: "area", ph: "Gesicht oder Maske, Haare, Kopfbedeckung, was man im Profil sieht" },
      { k: "koerper", l: "Körper", t: "area", ph: "Silhouette, Haltung, Kleidung in Schichten, Schuhe" },
      { k: "erkennungszeichen", l: "Details", t: "lines", ph: "Gegenstände, Muster, Aufschriften, Spuren – eins pro Zeile" },
      { k: "palette", l: "Palette", t: "colors" }]],
    ["Stimme", [
      { k: "ton", l: "Tonlage", t: "text", ph: "knapp, misstrauisch, trocken …" },
      { k: "beispielsaetze", l: "Beispielsätze", t: "lines", ph: "eins pro Zeile" },
      { k: "sagtNie", l: "Sagt nie", t: "text", ph: "was nicht zu ihr passt" },
      { k: "stimme", l: "Text der Figur", t: "area", ph: "ein paar Sätze in ihrer eigenen Stimme, Ich-Form" }]],
    ["Hintergrund", [
      { k: "vorgeschichte", l: "Vorgeschichte", t: "area", ph: "woher sie kommt, was vorher war" },
      { k: "offeneFaeden", l: "Offene Fäden", t: "lines", ph: "Schulden, Fragen, Versprechen – eins pro Zeile" },
      { k: "beziehungen", l: "Beziehungen", t: "lines", ph: "Frank the Drifter: … – eine pro Zeile" }]],
    ["Wissen", [
      { k: "weiss", l: "Weiß", t: "area", ph: "was sie über die Welt weiß" },
      { k: "weissNicht", l: "Weiß nicht", t: "area", ph: "was sie nicht weiß oder falsch glaubt" }]]
  ];
  // Bildplätze wie auf dem Sheet (Schlüssel = Dateinamen in assets/figuren/<id>/)
  const SLOTS = [
    ["face-front", "Gesicht · frontal", "kopf"], ["face-34", "Gesicht · ¾", "kopf"], ["face-side", "Gesicht · Profil", "kopf"],
    ["full-front", "Ganzkörper · frontal", "koerper"], ["full-34", "Ganzkörper · ¾", "koerper"], ["full-side", "Ganzkörper · Profil", "koerper"],
    ["full-back", "Ganzkörper · Rücken", "koerper"], ["full-side2", "Ganzkörper · Profil 2", "koerper"], ["full-sheet", "Full Sheet", "sheet"]];
  const SLOTKEYS = SLOTS.map((x) => x[0]);
  const IMG = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
  const FIELDS = FIG.flatMap(([, f]) => f);
  const FDEF = Object.fromEntries(FIELDS.map((f) => [f.k, f]));
  const ARRAY = (k) => ["list", "lines", "colors"].includes(FDEF[k] && FDEF[k].t);

  const ARTEN = {
    ort: ["Ort", "W-01"], begriff: ["Begriff", "W-04"], kraft: ["Konzern / Kraft", "W-02"],
    gegenstand: ["Gegenstand / Technik", "W-03"], ereignis: ["Ereignis / Geschichte", "W-00"],
    sprache: ["Redewendung / Sprache", "W-04"], anti: ["Gehört nicht in die Welt (Anti-Liste)", "W-AL"]
  };
  const WFIELDS = ["titel", "text", "verweise"];

  // ── lokaler Speicher ──
  const KEY = "scheinfirma.einreichung.v1", EKEY = "scheinfirma.eingang.v1";
  const load = (k, d) => { try { return Object.assign(d, JSON.parse(localStorage.getItem(k) || "{}")); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat-modus */ } };
  let P = load(KEY, { von: "", figuren: [], welt: [], fig: {}, img: {}, wf: {}, tab: "figur" });
  let E = load(EKEY, { pakete: [], arbeit: null, vorschau: false, n: 0 });
  const saveP = () => save(KEY, P), saveE = () => save(EKEY, E);

  // ── Werte lesen und schreiben ──
  const toArr = (v, t) => String(v || "").split(t === "list" || t === "colors" ? /[,;\s]+(?=#)|[,;\n]/ : /\n/).map((x) => x.trim()).filter(Boolean)
    .filter((x) => t !== "colors" || HEX.test(x));
  const fromArr = (a, t) => (Array.isArray(a) ? a.join(t === "list" ? ", " : "\n") : a || "");
  function readFig(form) {
    const o = {};
    FIELDS.forEach((f) => {
      const el = form.elements[f.k]; if (!el) return;
      const v = ARRAY(f.k) ? toArr(el.value, f.t === "colors" ? "colors" : f.t) : el.value.trim();
      if (!leerWert(v)) o[f.k] = v;
    });
    return o;
  }
  function writeFig(form, o, mark) {
    Object.entries(o).forEach(([k, v]) => {
      const el = form.elements[k]; if (!el || !FDEF[k]) return;
      el.value = fromArr(v, FDEF[k].t === "colors" ? "list" : FDEF[k].t);
      if (mark) el.classList.add("ki");
      if (k === "palette") swatches(form);
    });
  }
  function swatches(form) {
    const box = $(".pal-slots", form); if (!box) return;
    const a = toArr(form.elements.palette.value, "colors");
    box.innerHTML = Array.from({ length: 6 }, (_, i) => a[i]
      ? `<label class="sw on" style="--c:${a[i]}" title="${a[i]}"><input type="color" value="${a[i].length === 4 ? "#" + [...a[i].slice(1)].map((c) => c + c).join("") : a[i]}" data-sw="${i}"><b>${a[i]}</b><button type="button" class="sw-x" data-swx="${i}" aria-label="Farbe entfernen">×</button></label>`
      : `<label class="sw" title="Farbe hinzufügen"><input type="color" value="#4fb3a0" data-sw="${i}"><b>+</b></label>`).join("");
  }

  // ── Kontext für KI-Prompts (nur Inhalte, die schon auf der Seite stehen) ──
  let BIBEL = null;
  const ladeBibel = () => { if (BIBEL === null) { BIBEL = ""; fetch("data/weltbibel.md", { cache: "no-cache" }).then((r) => (r.ok ? r.text() : "")).then((t) => { BIBEL = t; }).catch(() => {}); } };
  function kontext() {
    const wb = SF.weltbuch.map((k) => `## ${k.kapitel}\n` + k.eintraege.filter((e) => e.text)
      .map((e) => `- ${e.titel}${e.herkunft === "vorschlag" ? " [Vorschlag]" : ""}: ${e.text}`).join("\n")).join("\n\n");
    const ro = SF.roster.map((f) => `- ${f.name}${f.vorgeschichte ? `: ${f.vorgeschichte}` : ""}`).join("\n");
    const muster = ((SF.chronik || []).find((c) => c.quelle === "muster") || {}).text;
    return (BIBEL ? `# WELTBIBEL\n${BIBEL}\n\n` : "") +
      `# WORLDBOOK\n${wb}\n\n# FIGUREN\n${ro}` + (muster ? `\n\n# SO KLINGT ES (Beispiel)\n${muster}` : "");
  }
  const REGELN = `Du schreibst für die Welt der SCHEINFIRMA, einer Filmproduktion, die den Schein im Namen führt. Die Unterlagen unten sind verbindlich.
- Widersprich nie dem, was im Worldbook und bei den Figuren steht. Einträge mit [Vorschlag] darfst du verwenden, aber nicht als sicher behandeln.
- Triff den Ton der vorhandenen Texte: kurze Aussagesätze, Dinge statt Begriffe, keine Erklärung der Welt, trockene Wendung am Ende.
- Keine Genre-Klischees: kein Neonregen, keine Hacker, kein Cyberware-Vokabular, keine Auserwählten, keine abtrünnige KI.
- Schreibe auf Deutsch.`;

  function figPrompt(form, ziel) {
    const da = readFig(form);
    const fehlt = FIELDS.filter((f) => leerWert(da[f.k])).map((f) => `- ${f.k}: ${f.l}${f.ph ? ` (${f.ph})` : ""}${ARRAY(f.k) ? " [Liste]" : ""}${f.k === "palette" ? " [Hex-Farben wie #4fb3a0]" : ""}`).join("\n");
    const best = ziel !== "neu" ? SF.roster.find((f) => f.id === ziel) : null;
    return `${REGELN}

${kontext()}

# AUFGABE
${best ? `Ergänze die bestehende Figur „${best.name}“. Was über sie schon gilt:\n${JSON.stringify(best, ["name", "kana", "kopf", "koerper", "erkennungszeichen", "palette", "vorgeschichte", "stimme", "ton"], 2)}\n` : "Entwirf eine neue Figur für die Scheinfirma. Beschreibe die Figur, nicht ihre Aufgabe in der Firma.\n"}
Schon ausgefüllt (übernehmen, nicht ändern):
${Object.keys(da).length ? JSON.stringify(da, null, 2) : "(noch nichts)"}

Fülle diese leeren Felder:
${fehlt || "(keine – überarbeite nichts)"}

Antworte ausschließlich mit einem JSON-Objekt der Form {"felder": { … }} mit genau diesen Feldnamen. Listen als Arrays. Keine Erklärung, kein Text davor oder danach.`;
  }
  function weltPrompt(form) {
    const d = readWelt(form);
    const art = ARTEN[d.art] ? ARTEN[d.art][0] : "Eintrag";
    const ziel = d.ziel !== "neu" ? findEntry(SF.weltbuch, d.ziel) : null;
    return `${REGELN}

${kontext()}

# AUFGABE
${ziel ? `Ergänze den bestehenden Worldbook-Eintrag „${ziel.e.titel}“ (${ziel.k.kapitel}). Bisher: ${ziel.e.text || "(leer)"}` : `Schlage einen neuen Worldbook-Eintrag der Art „${art}“ vor.`}
${d.art === "anti" ? "Es geht um etwas, das es in dieser Welt NICHT gibt oder wie sie NICHT klingt. Begründe in einem Satz.\n" : ""}Schon ausgefüllt: ${JSON.stringify({ titel: d.titel, text: d.text, verweise: d.verweise })}
Fülle leere Felder; bestehende nur verbessern, wenn sie dem Worldbook widersprechen.
Antworte ausschließlich mit JSON der Form {"titel": "…", "text": "2–4 Sätze", "verweise": "verwandte Einträge, Komma"}. Keine Erklärung.`;
  }
  function bildPrompt(form) {
    const d = readFig(form);
    const teile = [
      `Character sheet of ${d.name || "a character"} from the SCHEINFIRMA world`,
      d.kopf && `Head: ${d.kopf}`,
      d.koerper && `Body and clothing: ${d.koerper}`,
      d.erkennungszeichen && `Details: ${d.erkennungszeichen.join("; ")}`,
      d.palette && `Color palette: ${d.palette.join(", ")}`,
      "Layout: face front, three-quarter and profile on the left; full body front, three-quarter, side, back, side in a row; detail close-ups; line drawings; color palette swatches",
      "Neutral light grey background, even studio light, photorealistic, film still, consistent costume in every view"
    ].filter(Boolean);
    return teile.join(". ") + ".";
  }
  function parseKI(txt) {
    const s = String(txt || "").replace(/```(json)?/gi, "");
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a < 0 || b <= a) throw new Error("Kein JSON gefunden.");
    const o = JSON.parse(s.slice(a, b + 1));
    return o.felder || o;
  }
  async function copy(txt, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {
      const t = document.createElement("textarea"); t.value = txt; document.body.appendChild(t); t.select();
      try { ok = document.execCommand("copy"); } catch (e2) { /* nichts */ } t.remove();
    }
    if (btn) { const l = btn.textContent; btn.textContent = ok ? "✓ kopiert" : "kopieren ging nicht"; setTimeout(() => (btn.textContent = l), 1600); }
    return ok;
  }
  function download(name, obj) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ── Welt-Formular lesen ──
  function readWelt(form) {
    const d = Object.fromEntries(WFIELDS.map((k) => [k, (form.elements[k].value || "").trim()]));
    d.art = form.elements.art.value; d.ziel = form.elements.ziel.value; d.anmerkung = form.elements.anmerkung.value.trim();
    return d;
  }
  function findEntry(wb, ziel) {
    const [code, ...t] = String(ziel).split("|"); const titel = t.join("|");
    const k = wb.find((x) => x.code === code); if (!k) return null;
    const e = k.eintraege.find((x) => x.titel === titel); return e ? { k, e } : null;
  }

  // ═════════════ ÖFFENTLICHE SEITE ═════════════
  const SIL = {
    kopf: `<svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="24" rx="12" ry="15"/><path d="M8 60c2-12 10-18 22-18s20 6 22 18"/></svg>`,
    koerper: `<svg viewBox="0 0 40 100" aria-hidden="true"><circle cx="20" cy="10" r="7"/><path d="M8 24h24l3 34h-6l-2 40h-6l-1-30-1 30h-6l-2-40H5z"/></svg>`,
    sheet: `<svg viewBox="0 0 90 60" aria-hidden="true"><rect x="2" y="2" width="20" height="56"/><rect x="26" y="2" width="62" height="30"/><rect x="26" y="36" width="40" height="22"/><rect x="70" y="36" width="18" height="22"/></svg>`
  };
  function slot([k, l, typ]) {
    const src = P.img[k];
    return `<label class="slot slot-${typ}${src ? " on" : ""}" data-slot="${k}">
      <input type="file" accept="image/*" hidden data-file="${k}">
      <span class="slot-l">${esc(l)}</span>
      ${src ? `<img src="${src}" alt="${esc(l)}"><button type="button" class="slot-x" data-slotx="${k}" aria-label="Bild entfernen">×</button>` : `<span class="sil">${SIL[typ]}</span><span class="slot-plus">＋ BILD</span>`}
    </label>`;
  }
  function zone(k, cls) {
    const f = FDEF[k], v = esc(fromArr(P.fig[k], f.t));
    return `<div class="zone ${cls || ""}${leerWert(P.fig[k]) ? "" : " on"}" data-zone="${k}"><label class="zone-l" for="f-${k}">${esc(f.l)}</label>
      ${f.t === "text" ? `<input id="f-${k}" name="${k}" value="${v}" placeholder="${esc(f.ph || "")}">` : `<textarea id="f-${k}" name="${k}" rows="${f.t === "area" ? 4 : 3}" placeholder="${esc(f.ph || "")}">${v}</textarea>`}</div>`;
  }
  const kiBox = (bild) => `
    <div class="ki-tools">
      <button type="button" class="btn" data-ki="prompt">✦ Prompt für deine KI kopieren</button>
      <button type="button" class="btn" data-ki="paste">KI-Antwort einfügen</button>
      ${bild ? `<button type="button" class="btn" data-ki="bild">Bild-Prompt (Higgsfield)</button>` : ""}
    </div>
    <div class="ki-out" hidden><label>Prompt: in ChatGPT, Claude o. ä. einfügen</label><textarea readonly rows="6"></textarea></div>
    <div class="ki-in" hidden><label>Antwort der KI hier einfügen</label><textarea rows="5" placeholder='{"felder": { … }}'></textarea>
      <button type="button" class="btn prim" data-ki="apply">Übernehmen</button><span class="mono ki-msg"></span></div>`;

  function figForm() {
    const ziel = P.fig._ziel || "neu", best = ziel !== "neu" ? SF.roster.find((f) => f.id === ziel) : null;
    return `<form id="figForm" class="ein-form cs" autocomplete="off">
      <div class="cs-head">
        <div class="cs-id mono"><span class="red">PERSONNEL.DB</span> // ${best ? `AKTE ID-${best.nr}` : "NEUE AKTE · ID-??"}
          <select name="_ziel" aria-label="Neue Figur oder Beitrag"><option value="neu">neue Figur</option>${SF.roster.map((f) => `<option value="${f.id}" ${ziel === f.id ? "selected" : ""}>Beitrag zu ID-${f.nr} · ${esc(f.name)}</option>`).join("")}</select></div>
        <div class="cs-name"><input name="name" value="${esc(P.fig.name || "")}" placeholder="${best ? esc(best.name.toUpperCase()) : "NAME"}" aria-label="Name" spellcheck="false"><input name="kana" class="cs-kana" value="${esc(P.fig.kana || "")}" placeholder="${best && best.kana ? esc(best.kana) : "字"}" aria-label="Schriftzeichen"></div>
        <div class="cs-meter"><div class="cs-bar"></div><span class="mono cs-pct"></span></div>
      </div>
      <div class="cs-board">
        <div class="cs-faces">${SLOTS.slice(0, 3).map(slot).join("")}</div>
        <div class="cs-bodies">${SLOTS.slice(3, 8).map(slot).join("")}</div>
        ${zone("erkennungszeichen", "cs-det")}
        <div class="zone cs-pal${leerWert(P.fig.palette) ? "" : " on"}" data-zone="palette"><span class="zone-l">Palette</span><input type="hidden" name="palette" value="${esc(fromArr(P.fig.palette, "list"))}"><div class="pal-slots"></div></div>
        ${zone("kopf", "cs-kopf")}${zone("koerper", "cs-koerper")}
        <div class="cs-full">${slot(SLOTS[8])}</div>
      </div>
      <div class="cs-log mono" aria-live="polite">&gt; bereit. Felder anklicken, Bilder in die Plätze ziehen oder antippen.</div>
      <div class="cs-dossier">
        ${FIG.slice(1).map(([sec, fs]) => `<fieldset><legend>${esc(sec)}</legend>${fs.map((f) => zone(f.k)).join("")}</fieldset>`).join("")}
      </div>
      <div class="zone"><label class="zone-l" for="f-anm">Anmerkung</label><textarea id="f-anm" name="_anmerkung" rows="2" placeholder="Frage, Idee, Begründung (freiwillig)">${esc(P.fig._anmerkung || "")}</textarea></div>
      ${kiBox(true)}
      <div class="ein-act"><button class="btn prim" type="submit">＋ Akte zum Paket</button><button class="btn" type="button" data-clear>Leeren</button><span class="mono ein-msg"></span></div>
    </form>`;
  }
  function weltForm() {
    const w = P.wf;
    return `<form id="weltForm" class="ein-form" autocomplete="off">
      <div class="fgrid">
        <div class="fld"><label for="w-art">Art</label><select id="w-art" name="art">${Object.entries(ARTEN).map(([k, [l]]) => `<option value="${k}" ${w.art === k ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>
        <div class="fld"><label for="w-ziel">Neu oder Ergänzung?</label><select id="w-ziel" name="ziel"><option value="neu">Neuer Eintrag</option>
          ${SF.weltbuch.map((k) => `<optgroup label="${esc(k.code + " · " + k.kapitel)}">${k.eintraege.map((e) => { const z = k.code + "|" + e.titel; return `<option value="${esc(z)}" ${w.ziel === z ? "selected" : ""}>Ergänzung zu: ${esc(e.titel)}</option>`; }).join("")}</optgroup>`).join("")}</select></div>
        <div class="fld wide"><label for="w-titel">Titel</label><input id="w-titel" name="titel" value="${esc(w.titel || "")}" placeholder="z. B. Die Kantine im Keller"></div>
        <div class="fld wide"><label for="w-text">Text</label><textarea id="w-text" name="text" rows="5" placeholder="Was ist das, wo ist es, was passiert dort? Kurz und konkret.">${esc(w.text || "")}</textarea></div>
        <div class="fld wide"><label for="w-verweise">Verweise</label><input id="w-verweise" name="verweise" value="${esc(w.verweise || "")}" placeholder="verwandte Orte, Figuren, Begriffe"></div>
        <div class="fld wide"><label for="w-anm">Anmerkung</label><textarea id="w-anm" name="anmerkung" rows="2" placeholder="Frage, Idee, Begründung (freiwillig)">${esc(w.anmerkung || "")}</textarea></div>
      </div>
      ${kiBox(false)}
      <div class="ein-act"><button class="btn prim" type="submit">＋ Zum Paket hinzufügen</button><button class="btn" type="button" data-clear>Leeren</button><span class="mono ein-msg"></span></div>
    </form>`;
  }
  function paket() {
    const n = P.figuren.length + P.welt.length;
    const figName = (x) => x.felder.name || (x.ziel !== "neu" ? ((SF.roster.find((f) => f.id === x.ziel) || {}).name || x.ziel) : "neue Figur");
    return `<aside class="paket">
      <div class="lbl">DEIN PAKET · ${n} ${n === 1 ? "Beitrag" : "Beiträge"}</div>
      ${n ? `<ul>${P.figuren.map((x, i) => `<li><span class="tag pink">Figur</span>${esc(figName(x))}${x.ziel !== "neu" ? " <span class=dim>(Ergänzung)</span>" : ""} <span class="dim">· ${Object.keys(x.felder).length} Felder${x.bilder && Object.keys(x.bilder).length ? ` · ${Object.keys(x.bilder).length} Bilder` : ""}</span><button class="x" data-del="figuren:${i}" aria-label="entfernen">×</button></li>`).join("")}
        ${P.welt.map((x, i) => `<li><span class="tag blue">${esc(ARTEN[x.art] ? ARTEN[x.art][0] : x.art)}</span>${esc(x.titel || "(ohne Titel)")}${x.ziel !== "neu" ? " <span class=dim>(Ergänzung)</span>" : ""}<button class="x" data-del="welt:${i}" aria-label="entfernen">×</button></li>`).join("")}</ul>`
        : `<p class="dim">Noch leer. Formular ausfüllen und „Zum Paket hinzufügen“.</p>`}
      <label for="p-von">Dein Name (freiwillig)</label><input id="p-von" value="${esc(P.von)}" placeholder="wie du genannt werden willst">
      <div class="paket-btns"><button class="btn prim" id="pSave" ${n ? "" : "disabled"}>⬇ Als Datei speichern</button><button class="btn" id="pCopy" ${n ? "" : "disabled"}>Als Text kopieren</button>
        ${n ? `<button class="btn" id="pReset">Paket leeren</button>` : ""}</div>
      <p class="dim small">Die Datei oder den Text schickst du ans Scheinfirma-Team, per Mail oder Messenger. Eingereichtes kann auf der Seite erscheinen und in die Welt der Scheinfirma eingehen.</p>
    </aside>`;
  }
  function view() {
    const tab = P.tab === "welt" ? "welt" : "figur";
    ladeBibel();
    return `
    <p class="lead">Baukasten für Figuren und Welt. Alles darf unvollständig sein: ein Name, ein Bild, ein einzelner Satz. Beiträge kommen in ein Paket, das Paket geht als Datei ans Team und landet hier unter „Eingang“.</p>
    <div class="subtabs"><button data-etab="figur" class="${tab === "figur" ? "on" : ""}">▚ Figur · Character Sheet</button><button data-etab="welt" class="${tab === "welt" ? "on" : ""}">▚ Welt</button></div>
    <div class="ein">${tab === "figur" ? figForm() : weltForm()}${paket()}</div>`;
  }

  function verkleinern(file, max = 720) {
    return new Promise((ok, err) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        ok({ data: c.toDataURL("image/jpeg", 0.82), w: c.width, h: c.height });
      };
      im.onerror = () => err(new Error("Bild nicht lesbar")); im.src = url;
    });
  }
  function bindSheet(form, persist) {
    const log = (t) => { const l = $(".cs-log", form); l.textContent = "> " + t; l.classList.remove("blink"); void l.offsetWidth; l.classList.add("blink"); };
    const tick = () => { if (SF.sound) SF.sound.tick(); };
    const meter = () => {
      const d = readFig(form), teile = FIELDS.map((f) => !leerWert(d[f.k])).concat(SLOTKEYS.map((k) => !!P.img[k]));
      const n = teile.filter(Boolean).length, pct = Math.round(n / teile.length * 100);
      $(".cs-bar", form).innerHTML = teile.map((x) => `<i class="${x ? "on" : ""}"></i>`).join("");
      $(".cs-pct", form).textContent = `AKTE ${String(pct).padStart(2, "0")} % · ${n}/${teile.length}`;
      $$("[data-zone]", form).forEach((z) => z.classList.toggle("on", !leerWert(d[z.dataset.zone])));
    };
    swatches(form); meter();
    form.addEventListener("input", meter);
    form.elements._ziel.addEventListener("change", () => { persist(); SF.einreichen.rerender(); });
    // Palette
    const pal = form.elements.palette;
    const setPal = (a) => { pal.value = a.join(", "); persist(); swatches(form); meter(); };
    $(".pal-slots", form).addEventListener("input", (e) => {
      if (!e.target.dataset.sw) return;
      const a = toArr(pal.value, "colors"), i = +e.target.dataset.sw;
      if (i >= a.length) a.push(e.target.value); else a[i] = e.target.value;
      const lab = e.target.closest(".sw"); lab.style.setProperty("--c", e.target.value); lab.classList.add("on"); $("b", lab).textContent = e.target.value;
      pal.value = a.join(", "); persist(); meter();
    });
    $(".pal-slots", form).addEventListener("change", (e) => { if (e.target.dataset.sw) { swatches(form); log(`palette[${e.target.dataset.sw}] = ${e.target.value}`); tick(); } });
    $(".pal-slots", form).addEventListener("click", (e) => {
      const x = e.target.dataset.swx; if (x === undefined) return;
      e.preventDefault(); const a = toArr(pal.value, "colors"); a.splice(+x, 1); setPal(a); log(`palette[${x}] gelöscht`);
    });
    // Bilder
    const setzen = async (k, file) => {
      if (!file || !/^image\//.test(file.type)) { log("kein Bild"); return; }
      log(`scanne ${file.name} …`);
      try {
        const r = await verkleinern(file); P.img[k] = r.data; saveP();
        const el = $(`[data-slot="${k}"]`, form), def = SLOTS.find((x) => x[0] === k);
        el.outerHTML = slot(def); bindSlot($(`[data-slot="${k}"]`, form));
        meter(); tick(); log(`${k} ← ${file.name} (${r.w}×${r.h})`);
      } catch (e) { log("Fehler: " + e.message); }
    };
    const bindSlot = (el) => {
      const k = el.dataset.slot;
      $("input[type=file]", el).addEventListener("change", (e) => setzen(k, e.target.files[0]));
      el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("drag"); });
      el.addEventListener("dragleave", () => el.classList.remove("drag"));
      el.addEventListener("drop", (e) => { e.preventDefault(); el.classList.remove("drag"); setzen(k, e.dataTransfer.files[0]); });
      const x = $("[data-slotx]", el);
      if (x) x.addEventListener("click", (e) => {
        e.preventDefault(); delete P.img[k]; saveP();
        el.outerHTML = slot(SLOTS.find((s) => s[0] === k)); bindSlot($(`[data-slot="${k}"]`, form)); meter(); log(`${k} geleert`);
      });
    };
    $$("[data-slot]", form).forEach(bindSlot);
    $$("[data-zone] input, [data-zone] textarea", form).forEach((el) => el.addEventListener("focus", () => log(`${el.name} …`)));
  }

  function bind(tab) {
    const root = document.getElementById("view");
    $$("[data-etab]", root).forEach((b) => b.addEventListener("click", () => { P.tab = b.dataset.etab; saveP(); SF.einreichen.rerender(); }));
    const form = $("#figForm", root) || $("#weltForm", root);
    const isFig = form.id === "figForm";
    const msg = (t, err) => { const m = $(".ein-msg", form); m.textContent = t; m.style.color = err ? "var(--imag)" : "var(--real)"; };
    const persist = () => {
      if (isFig) { P.fig = Object.assign(readFig(form), { _ziel: form.elements._ziel.value, _anmerkung: form.elements._anmerkung.value }); }
      else P.wf = readWelt(form);
      saveP();
    };
    form.addEventListener("input", (e) => { e.target.classList.remove("ki"); if (e.target.type !== "color") persist(); });
    form.addEventListener("change", persist);
    if (isFig) bindSheet(form, persist);
    // KI
    $$("[data-ki]", form).forEach((b) => b.addEventListener("click", async () => {
      const a = b.dataset.ki, out = $(".ki-out", form), inp = $(".ki-in", form), kmsg = $(".ki-msg", form);
      if (a === "prompt" || a === "bild") {
        persist();
        const t = a === "bild" ? bildPrompt(form) : isFig ? figPrompt(form, form.elements._ziel.value) : weltPrompt(form);
        out.hidden = false; $("label", out).textContent = a === "bild" ? "Bild-Prompt für Higgsfield (Character Sheet)" : "Prompt: in ChatGPT, Claude o. ä. einfügen, Antwort unten einfügen";
        $("textarea", out).value = t; await copy(t, b);
        if (a === "prompt") inp.hidden = false;
      } else if (a === "paste") { inp.hidden = !inp.hidden; }
      else if (a === "apply") {
        try {
          const o = parseKI($("textarea", inp).value);
          if (isFig) {
            const sauber = {};
            Object.entries(o).forEach(([k, v]) => {
              if (!FDEF[k] || leerWert(v)) return;
              if (ARRAY(k)) v = (Array.isArray(v) ? v : toArr(v, FDEF[k].t)).map(String).filter((x) => FDEF[k].t !== "colors" || HEX.test(x));
              else if (k === "sorte" && !SF.sorten[v]) return;
              else v = String(v);
              sauber[k] = v;
            });
            writeFig(form, sauber, true); form.dispatchEvent(new Event("input"));
            kmsg.textContent = `✓ ${Object.keys(sauber).length} Felder übernommen (gelb markiert). Prüfen und ändern, was nicht passt.`;
          } else {
            WFIELDS.forEach((k) => { if (o[k]) { form.elements[k].value = String(o[k]); form.elements[k].classList.add("ki"); } });
            kmsg.textContent = "✓ übernommen (gelb markiert). Prüfen und ändern, was nicht passt.";
          }
          kmsg.style.color = "var(--real)"; persist();
        } catch (e) { kmsg.textContent = "Konnte die Antwort nicht lesen: " + e.message; kmsg.style.color = "var(--imag)"; }
      }
    }));
    // Hinzufügen / Leeren
    form.addEventListener("submit", (e) => {
      e.preventDefault(); persist();
      if (isFig) {
        const felder = readFig(form), ziel = form.elements._ziel.value;
        if (!Object.keys(felder).length && !Object.keys(P.img).length) { msg("Mindestens ein Feld oder Bild ausfüllen.", true); return; }
        P.figuren.push({ ziel, felder, bilder: P.img, anmerkung: form.elements._anmerkung.value.trim() }); P.fig = {}; P.img = {};
        if (SF.sound) SF.sound.glitch();
      } else {
        const d = readWelt(form);
        if (!d.titel && !d.text) { msg("Titel oder Text ausfüllen.", true); return; }
        d.kapitel = d.ziel !== "neu" ? d.ziel.split("|")[0] : ARTEN[d.art][1];
        P.welt.push(d); P.wf = { art: d.art };
      }
      saveP(); SF.einreichen.rerender();
    });
    $("[data-clear]", form).addEventListener("click", () => { if (isFig) { P.fig = {}; P.img = {}; } else P.wf = {}; saveP(); SF.einreichen.rerender(); });
    // Paket
    const pk = $(".paket", root);
    $("#p-von", pk).addEventListener("input", (e) => { P.von = e.target.value; saveP(); });
    $$("[data-del]", pk).forEach((b) => b.addEventListener("click", () => { const [l, i] = b.dataset.del.split(":"); P[l].splice(+i, 1); saveP(); SF.einreichen.rerender(); }));
    const paketObj = () => ({ format: FORMAT, version: 1, erstellt: new Date().toISOString(), von: P.von.trim(), figuren: P.figuren, welt: P.welt });
    if ($("#pSave", pk)) $("#pSave", pk).addEventListener("click", () => {
      const tag = new Date().toISOString().slice(0, 10), wer = (P.von || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      download(`scheinfirma-einreichung_${tag}${wer ? "_" + wer : ""}.json`, paketObj());
    });
    if ($("#pCopy", pk)) $("#pCopy", pk).addEventListener("click", (e) => copy(JSON.stringify(paketObj(), null, 2), e.target));
    if ($("#pReset", pk)) $("#pReset", pk).addEventListener("click", () => { if (confirm("Paket wirklich leeren?")) { P.figuren = []; P.welt = []; saveP(); SF.einreichen.rerender(); } });
  }

  // ═════════════ BACKEND: EINGANG ═════════════
  const orig = () => SF._orig || { roster: SF.roster, weltbuch: SF.weltbuch };
  function arbeit() {
    if (!E.arbeit) E.arbeit = { roster: clone(orig().roster), weltbuch: clone(orig().weltbuch), aenderungen: 0 };
    return E.arbeit;
  }
  function pruefe(o) {
    if (!o || o.format !== FORMAT) throw new Error("keine Scheinfirma-Einreichung");
    const figuren = (Array.isArray(o.figuren) ? o.figuren : []).map((x) => {
      const felder = {};
      Object.entries((x && x.felder) || {}).forEach(([k, v]) => {
        if (!FDEF[k] || leerWert(v)) return;
        if (ARRAY(k)) { v = (Array.isArray(v) ? v : [v]).map((s) => String(s).slice(0, 500)); if (FDEF[k].t === "colors") v = v.filter((c) => HEX.test(c)); }
        else v = String(v).slice(0, 4000);
        if (!leerWert(v)) felder[k] = v;
      });
      const bilder = {};
      Object.entries((x && x.bilder) || {}).forEach(([k, v]) => { if (SLOTKEYS.includes(k) && typeof v === "string" && v.length < 3e6 && IMG.test(v)) bilder[k] = v; });
      return { ziel: String((x && x.ziel) || "neu"), felder, bilder, anmerkung: String((x && x.anmerkung) || "").slice(0, 2000), status: "offen" };
    }).filter((x) => Object.keys(x.felder).length || Object.keys(x.bilder).length);
    const welt = (Array.isArray(o.welt) ? o.welt : []).map((x) => ({
      art: ARTEN[x && x.art] ? x.art : "begriff", ziel: String((x && x.ziel) || "neu"),
      kapitel: String((x && x.kapitel) || "W-04"), titel: String((x && x.titel) || "").slice(0, 200),
      text: String((x && x.text) || "").slice(0, 4000), verweise: String((x && x.verweise) || "").slice(0, 500),
      anmerkung: String((x && x.anmerkung) || "").slice(0, 2000), status: "offen"
    })).filter((x) => x.titel || x.text);
    return { id: ++E.n, von: String(o.von || "").slice(0, 80), erstellt: String(o.erstellt || "").slice(0, 30), figuren, welt };
  }
  const showVal = (k, v) => {
    if (leerWert(v)) return `<span class="dim">—</span>`;
    if (k === "palette") return `<span class="swatches">${v.filter((c) => HEX.test(c)).map((c) => `<i style="background:${c}" title="${c}"></i>`).join("")}</span>`;
    if (k === "sorte") return esc(SF.sorten[v] || v);
    return Array.isArray(v) ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : esc(v);
  };
  const stat = (s) => (s === "offen" ? "" : `<span class="tag ${s === "angenommen" ? "green" : "dim"}">${s}</span>`);
  function figItem(p, x, i) {
    const A = arbeit(), best = x.ziel !== "neu" ? A.roster.find((f) => f.id === x.ziel) : null;
    const titel = best ? `Ergänzung zu ID-${best.nr} · ${esc(best.name)}` : x.ziel !== "neu" ? `Ergänzung zu unbekannter Figur „${esc(x.ziel)}“ → wird als neue Figur angelegt` : `Neue Figur: ${esc(x.felder.name || "ohne Namen")}`;
    return `<div class="ein-item${x.status !== "offen" ? " erledigt" : ""}" data-item="${p.id}:f:${i}">
      <h4><span class="tag pink">Figur</span>${titel} ${stat(x.status)}</h4>
      ${x.anmerkung ? `<p class="dim">Anmerkung: ${esc(x.anmerkung)}</p>` : ""}
      ${x.bilder && Object.keys(x.bilder).length ? `<div class="ein-imgs">${Object.entries(x.bilder).map(([k, v]) => `<figure><img src="${v}" alt="${esc(k)}"><figcaption>${esc(k)}</figcaption></figure>`).join("")}</div>
      <p><button class="btn" data-imgdl>⬇ ${Object.keys(x.bilder).length} Bilder speichern</button> <span class="dim small">für <code>assets/figuren/${esc(best ? best.id : slug(x.felder.name))}/</code></span></p>` : ""}
      <div class="pool-wrap"><table class="pool cmp"><thead><tr><th>Feld</th><th>Bisher</th><th>Eingereicht</th><th>Aktion</th></tr></thead><tbody>
      ${Object.entries(x.felder).map(([k, v]) => { const alt = best ? best[k] : null; const leer = leerWert(alt);
        return `<tr><td class="id">${esc(FDEF[k].l)}</td><td>${showVal(k, alt)}</td><td>${showVal(k, v)}</td>
        <td>${x.status === "offen" ? `<select data-act="${esc(k)}"><option value="set" ${leer ? "selected" : ""}>${leer ? "übernehmen" : "ersetzen"}</option>${leer ? "" : `<option value="add">anhängen</option>`}<option value="" ${leer ? "" : "selected"}>— nicht —</option></select>` : ""}</td></tr>`; }).join("")}
      </tbody></table></div>
      ${x.status === "offen" ? `<div class="ein-act"><button class="btn prim" data-take>Annehmen</button><button class="btn" data-drop>Verwerfen</button></div>` : ""}
    </div>`;
  }
  function weltItem(p, x, i) {
    const A = arbeit(), z = x.ziel !== "neu" ? findEntry(A.weltbuch, x.ziel) : null;
    const kap = (A.weltbuch.find((k) => k.code === x.kapitel) || {}).kapitel || (x.kapitel === "W-AL" ? "Anti-Liste (neu)" : x.kapitel);
    return `<div class="ein-item${x.status !== "offen" ? " erledigt" : ""}" data-item="${p.id}:w:${i}">
      <h4><span class="tag blue">${esc(ARTEN[x.art][0])}</span>${z ? `Ergänzung zu „${esc(z.e.titel)}“` : esc(x.titel || "(ohne Titel)")} <span class="dim mono">→ ${esc(kap)}</span> ${stat(x.status)}</h4>
      ${z ? `<p><span class="dim">Bisher:</span> ${esc(z.e.text || "—")}</p>` : ""}
      <p>${z && x.titel ? `<b>${esc(x.titel)}</b> · ` : ""}${esc(x.text)}</p>
      ${x.verweise ? `<p class="dim">Verweise: ${esc(x.verweise)}</p>` : ""}${x.anmerkung ? `<p class="dim">Anmerkung: ${esc(x.anmerkung)}</p>` : ""}
      ${x.status === "offen" ? `<div class="ein-act">${z ? `<select data-wact><option value="add">Text anhängen</option><option value="set">Text ersetzen</option></select>` : ""}<button class="btn prim" data-take>Annehmen</button><button class="btn" data-drop>Verwerfen</button></div>` : ""}
    </div>`;
  }
  function eingang() {
    const A = E.arbeit, offen = E.pakete.reduce((n, p) => n + p.figuren.concat(p.welt).filter((x) => x.status === "offen").length, 0);
    return `
    <p class="lead">Einreichungen aus dem Formular „Einreichen“ hier laden, prüfen und Feld für Feld annehmen. Angenommenes landet in einer Arbeitskopie von Roster und Worldbook. Damit es auf der Seite erscheint: <b>roster.json</b> und <b>weltbuch.json</b> herunterladen und in <code>website/data/</code> ersetzen.</p>
    <div class="ein-load">
      <label class="drop-mini">⬆ Dateien wählen<input type="file" id="eFiles" accept=".json,application/json" multiple hidden></label>
      <textarea id="eText" rows="2" placeholder="… oder kopierten Text hier einfügen"></textarea><button class="btn" id="eTextGo">Laden</button>
      <span class="mono" id="eMsg"></span>
    </div>
    <div class="ein-status mono">
      <span><b>${offen}</b> offen</span>
      <span><b>${A ? A.aenderungen : 0}</b> angenommene Änderungen in der Arbeitskopie</span>
      ${A ? `<button class="btn prim" id="eDlR">⬇ roster.json</button><button class="btn prim" id="eDlW">⬇ weltbuch.json</button>
      <label class="chk"><input type="checkbox" id="eVor" ${E.vorschau ? "checked" : ""}> Vorschau auf der Seite (nur dieser Browser)</label>
      <button class="btn" id="eReset">Arbeitskopie verwerfen</button>` : ""}
    </div>
    ${E.pakete.length ? E.pakete.slice().reverse().map((p) => `
      <section class="ein-paket">
        <div class="sec-head"><span class="code">PAKET ${p.id}</span><h2>${esc(p.von || "ohne Namen")}</h2><span class="mono dim">${esc(p.erstellt.slice(0, 10))} · ${p.figuren.length} Figur · ${p.welt.length} Welt</span><button class="btn" data-pdel="${p.id}">Paket entfernen</button></div>
        ${p.figuren.map((x, i) => figItem(p, x, i)).join("")}${p.welt.map((x, i) => weltItem(p, x, i)).join("")}
      </section>`).join("") : `<p class="dim">Noch keine Einreichungen geladen.</p>`}`;
  }
  const slug = (s) => String(s || "figur").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "figur";
  function nimmFigur(p, x, acts) {
    const A = arbeit();
    let f = x.ziel !== "neu" ? A.roster.find((r) => r.id === x.ziel) : null;
    if (!f) {
      let id = slug(x.felder.name), n = 2; while (A.roster.some((r) => r.id === id)) id = slug(x.felder.name) + "_" + n++;
      const nr = String(Math.max(0, ...A.roster.map((r) => parseInt(r.nr, 10) || 0)) + 1).padStart(2, "0");
      f = { id, nr, name: x.felder.name || "Unbenannt", status: "leerstelle", quelle: "eingereicht", eingereichtVon: p.von || null };
      A.roster.push(f);
    }
    Object.entries(x.felder).forEach(([k, v]) => {
      const a = acts[k]; if (!a) return;
      if (a === "add" && !leerWert(f[k])) {
        if (ARRAY(k)) f[k] = [...new Set([].concat(f[k], v))];
        else f[k] = String(f[k]) + " " + v;
      } else f[k] = clone(v);
    });
    if (x.ziel !== "neu" && p.von) f.beitraegeVon = [...new Set([].concat(f.beitraegeVon || [], p.von))];
    A.aenderungen++;
  }
  function nimmWelt(p, x, wact) {
    const A = arbeit(), z = x.ziel !== "neu" ? findEntry(A.weltbuch, x.ziel) : null;
    if (z) {
      z.e.text = wact === "set" || !z.e.text ? x.text : z.e.text + " " + x.text;
      if (!z.e.herkunft) z.e.herkunft = "eingereicht";
    } else {
      let k = A.weltbuch.find((c) => c.code === x.kapitel);
      if (!k) { k = { kapitel: x.kapitel === "W-AL" ? "Anti-Liste" : x.kapitel, code: x.kapitel, eintraege: [] }; A.weltbuch.push(k); }
      k.eintraege.push({ titel: x.titel || "(ohne Titel)", herkunft: "eingereicht", text: x.text || null, ...(p.von ? { von: p.von } : {}), ...(x.verweise ? { verweise: x.verweise } : {}) });
    }
    A.aenderungen++;
  }
  function bindEingang(rer) {
    const root = document.getElementById("view"), m = $("#eMsg", root);
    const add = (txt, name) => {
      try { const p = pruefe(JSON.parse(txt)); E.pakete.push(p); saveE(); return `${name}: ${p.figuren.length} Figur, ${p.welt.length} Welt`; }
      catch (e) { return `${name}: nicht lesbar (${e.message})`; }
    };
    $("#eFiles", root).addEventListener("change", async (e) => {
      const r = []; for (const f of e.target.files) r.push(add(await f.text(), f.name));
      rer(); $("#eMsg").textContent = r.join(" · ");
    });
    $("#eTextGo", root).addEventListener("click", () => { const r = add($("#eText", root).value, "Text"); rer(); $("#eMsg").textContent = r; });
    const dl = (n, o, extra) => download(n, Object.assign({ _info: o._info }, extra));
    if ($("#eDlR", root)) $("#eDlR", root).addEventListener("click", () => dl("roster.json", SF._meta.roster, { roster: E.arbeit.roster, sorten: SF.sorten }));
    if ($("#eDlW", root)) $("#eDlW", root).addEventListener("click", () => dl("weltbuch.json", SF._meta.weltbuch, { weltbuch: E.arbeit.weltbuch, herkunft: SF.herkunft }));
    if ($("#eVor", root)) $("#eVor", root).addEventListener("change", (e) => { E.vorschau = e.target.checked; saveE(); location.reload(); });
    if ($("#eReset", root)) $("#eReset", root).addEventListener("click", () => {
      if (!confirm("Arbeitskopie verwerfen? Angenommenes geht verloren, die Pakete bleiben.")) return;
      E.arbeit = null; E.vorschau = false; E.pakete.forEach((p) => p.figuren.concat(p.welt).forEach((x) => (x.status = "offen"))); saveE(); location.reload();
    });
    $$("[data-pdel]", root).forEach((b) => b.addEventListener("click", () => { E.pakete = E.pakete.filter((p) => p.id !== +b.dataset.pdel); saveE(); rer(); }));
    $$("[data-item]", root).forEach((el) => {
      const [pid, typ, i] = el.dataset.item.split(":"), p = E.pakete.find((x) => x.id === +pid), x = (typ === "f" ? p.figuren : p.welt)[+i];
      const t = $("[data-take]", el), d = $("[data-drop]", el), dl = $("[data-imgdl]", el);
      if (dl) dl.addEventListener("click", () => Object.entries(x.bilder).forEach(([k, v], n) => setTimeout(() => {
        const a = document.createElement("a"); a.href = v; a.download = `${k}.jpg`; document.body.appendChild(a); a.click(); a.remove();
      }, n * 250)));
      if (t) t.addEventListener("click", () => {
        if (typ === "f") nimmFigur(p, x, Object.fromEntries($$("[data-act]", el).map((s) => [s.dataset.act, s.value])));
        else nimmWelt(p, x, ($("[data-wact]", el) || {}).value);
        x.status = "angenommen"; saveE(); if (E.vorschau) applyOverlay(); rer();
      });
      if (d) d.addEventListener("click", () => { x.status = "verworfen"; saveE(); rer(); });
    });
  }
  // Vorschau: Arbeitskopie statt Original anzeigen (nur in diesem Browser)
  function applyOverlay() {
    if (E.vorschau && E.arbeit) { SF.roster = E.arbeit.roster; SF.weltbuch = E.arbeit.weltbuch; document.body.classList.add("vorschau"); }
  }
  function init(r, w) {
    SF._orig = { roster: r.roster, weltbuch: w.weltbuch };
    SF._meta = { roster: { _info: r._info }, weltbuch: { _info: w._info } };
    applyOverlay();
  }

  SF.einreichen = { view, bind, eingang, bindEingang, init, rerender: null };
})();
