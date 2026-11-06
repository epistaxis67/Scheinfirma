/* WERKSTATT — Live-Ansicht der geführten Figuren-Erstellung (/figur in Claude Code).
   Claude schreibt den Stand nach jeder Runde nach data/werkstatt/sitzung.json;
   diese Ansicht liest die Datei alle 2 Sekunden neu. Die Datei liegt nur lokal (nicht im Repo).
   Schema: siehe ../.claude/skills/figur/SKILL.md */
window.SF = window.SF || {};
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const HEX = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;
  const PFAD = /^assets\/figuren\/[a-z0-9_-]+\/[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/i;
  const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const leer = (v) => v == null || v === "" || (Array.isArray(v) && !v.length);

  const PHASEN = [["abgleich", "Abgleich"], ["kopf", "Kopf"], ["koerper", "Körper"], ["details", "Details"], ["palette", "Palette"],
    ["stimme", "Stimme"], ["hintergrund", "Hintergrund"], ["wissen", "Wissen"], ["ergebnis", "Ergebnis"], ["bildabgleich", "Bild"]];
  const SLOTS = [["face-front", "Gesicht · frontal", "kopf"], ["face-34", "Gesicht · ¾", "kopf"], ["face-side", "Gesicht · Profil", "kopf"],
    ["full-front", "Ganzkörper · frontal", "koerper"], ["full-34", "Ganzkörper · ¾", "koerper"], ["full-side", "Ganzkörper · Profil", "koerper"],
    ["full-back", "Ganzkörper · Rücken", "koerper"], ["full-side2", "Ganzkörper · Profil 2", "koerper"], ["full-sheet", "Full Sheet", "sheet"]];
  const SIL = {
    kopf: `<svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="24" rx="12" ry="15"/><path d="M8 60c2-12 10-18 22-18s20 6 22 18"/></svg>`,
    koerper: `<svg viewBox="0 0 40 100" aria-hidden="true"><circle cx="20" cy="10" r="7"/><path d="M8 24h24l3 34h-6l-2 40h-6l-1-30-1 30h-6l-2-40H5z"/></svg>`,
    sheet: `<svg viewBox="0 0 90 60" aria-hidden="true"><rect x="2" y="2" width="20" height="56"/><rect x="26" y="2" width="62" height="30"/><rect x="26" y="36" width="40" height="22"/><rect x="70" y="36" width="18" height="22"/></svg>`
  };
  const STATUS = { kanon: ["KANON", "teal"], vorschlag: ["VORSCHLAG", "yellow"], verworfen: ["VERWORFEN", "red"], offen: ["OFFEN", "dim"] };

  let D = null, stamp = "", timer = null, fehler = "";

  const txt = (v) => (leer(v) ? `<span class="ws-leer">▒ offen</span>` : Array.isArray(v) ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : esc(v));
  const slot = ([k, l, typ]) => {
    const p = D && D.bilder && D.bilder[k];
    const ok = p && PFAD.test(p);
    return `<div class="slot slot-${typ}${ok ? " on" : ""}"><span class="slot-l">${esc(l)}</span>${ok ? `<img src="${esc(p)}?t=${esc(stamp)}" alt="${esc(l)}">` : `<span class="sil">${SIL[typ]}</span>`}</div>`;
  };
  const zone = (l, v, cls) => `<div class="zone ${cls || ""}${leer(v) ? "" : " on"}"><span class="zone-l">${esc(l)}</span><div class="ws-val">${txt(v)}</div></div>`;

  function sheet(f) {
    const pal = arr(f.palette).filter((c) => HEX.test(c));
    return `<div class="cs ws-sheet">
      <div class="cs-head">
        <div class="cs-id mono"><span class="red">PERSONNEL.DB</span> // ${D.ziel && D.ziel !== "neu" ? `AKTE ${esc(D.ziel)}` : "NEUE AKTE"} · ${esc(f.id || "ID-??")}</div>
        <div class="cs-name ws-name"><span class="n">${esc(f.name || "NAME")}</span><span class="k">${esc(f.kana || "")}</span></div>
      </div>
      <div class="cs-board">
        <div class="cs-faces">${SLOTS.slice(0, 3).map(slot).join("")}</div>
        <div class="cs-bodies">${SLOTS.slice(3, 8).map(slot).join("")}</div>
        ${zone("Details", f.erkennungszeichen, "cs-det")}
        <div class="zone cs-pal${pal.length ? " on" : ""}"><span class="zone-l">Palette</span><div class="pal-slots">${Array.from({ length: 6 }, (_, i) => pal[i]
          ? `<span class="sw on" style="--c:${pal[i]}" title="${pal[i]}"></span>` : `<span class="sw"><b>·</b></span>`).join("")}</div></div>
        ${zone("Kopf", f.kopf, "cs-kopf")}${zone("Körper", f.koerper, "cs-koerper")}
        <div class="cs-full">${slot(SLOTS[8])}</div>
      </div>
      <div class="cs-dossier">
        <fieldset><legend>Stimme</legend>${zone("Tonlage", f.ton)}${zone("Beispielsätze", f.beispielsaetze)}${zone("Sagt nie", f.sagtNie)}${zone("Text der Figur", f.stimme)}</fieldset>
        <fieldset><legend>Hintergrund</legend>${zone("Vorgeschichte", f.vorgeschichte)}${zone("Offene Fäden", f.offeneFaeden)}${zone("Beziehungen", f.beziehungen)}</fieldset>
        <fieldset><legend>Wissen</legend>${zone("Weiß", f.weiss)}${zone("Weiß nicht", f.weissNicht)}</fieldset>
      </div>
    </div>`;
  }

  function panel() {
    const ph = D.phase || "abgleich", idx = PHASEN.findIndex((p) => p[0] === ph);
    const fr = D.frage, konf = arr(D.konflikte), prot = arr(D.protokoll), bek = arr(D.bekannt), abw = arr(D.abweichungen);
    const offen = konf.filter((k) => k.status !== "geklärt");
    return `<div class="ws-panel">
      <ol class="ws-steps">${PHASEN.map(([k, l], i) => `<li class="${i < idx ? "done" : i === idx ? "on" : ""}">${esc(l)}</li>`).join("")}</ol>
      ${fr ? `<div class="ws-frage">
        <div class="lbl">FRAGE${fr.thema ? " · " + esc(fr.thema) : ""}</div>
        <p>${esc(fr.text)}</p>
        ${arr(fr.optionen).map((o) => `<button class="ws-opt" data-copy="${esc(o.id)}"><b>${esc(o.id)}</b><span>${esc(o.text)}${o.bezug ? `<em>↳ ${esc(o.bezug)}</em>` : ""}</span></button>`).join("")}
        <p class="dim small">Antwort im Chat: Buchstabe, eigene Worte oder „überspringen“. Klick kopiert den Buchstaben.</p>
      </div>` : `<div class="ws-frage idle"><div class="lbl">FRAGE</div><p class="dim">Gerade keine offene Frage.</p></div>`}
      ${offen.length ? `<div class="ws-block"><div class="lbl red">WIDERSPRUCH · ${offen.length}</div>${offen.map((k) => `<div class="ws-konf">
        <p><span class="dim">Neu:</span> ${esc(k.neu)}</p><p><span class="dim">Kanon:</span> ${esc(k.kanon)}${k.quelle ? ` <em class="dim">(${esc(k.quelle)})</em>` : ""}</p>
        ${arr(k.optionen).length ? `<p class="mono small">${arr(k.optionen).map((o, i) => `<span class="tag">${i + 1} · ${esc(o)}</span>`).join("")}</p>` : ""}</div>`).join("")}</div>` : ""}
      ${abw.length ? `<div class="ws-block"><div class="lbl pink">BILD-ABGLEICH</div><ul class="ws-list">${abw.map((a) => `<li><span class="mono dim">${esc(a.bild || "")}</span> ${esc(a.text)}${a.entscheidung ? ` → <b>${esc(a.entscheidung)}</b>` : ""}</li>`).join("")}</ul></div>` : ""}
      ${bek.length ? `<details class="ws-block" ${ph === "abgleich" ? "open" : ""}><summary class="lbl teal">BEKANNT · ${bek.length}</summary><ul class="ws-list">${bek.map((b) => `<li>${esc(b.text)}${b.quelle ? ` <em class="dim">${esc(b.quelle)}</em>` : ""}</li>`).join("")}</ul></details>` : ""}
      ${prot.length ? `<details class="ws-block" open><summary class="lbl">PROTOKOLL · ${prot.length}</summary><ul class="ws-list ws-prot">${prot.slice().reverse().map((p) => { const s = STATUS[p.status] || STATUS.offen;
        return `<li><span class="tag ${s[1]}">${s[0]}</span><b>${esc(p.feld || "")}</b> ${esc(p.wert || "")}${p.notiz ? ` <em class="dim">${esc(p.notiz)}</em>` : ""}</li>`; }).join("")}</ul></details>` : ""}
      ${konf.length - offen.length ? `<details class="ws-block"><summary class="lbl dim">GEKLÄRT · ${konf.length - offen.length}</summary><ul class="ws-list">${konf.filter((k) => k.status === "geklärt").map((k) => `<li>${esc(k.neu)} → <b>${esc(k.entscheidung || "")}</b></li>`).join("")}</ul></details>` : ""}
      ${D.higgsfield ? `<div class="ws-block"><div class="lbl blue">HIGGSFIELD-PROMPT</div><div class="gj-prompt mono">${esc(D.higgsfield)}</div><button class="btn" data-copytext>Kopieren</button></div>` : ""}
    </div>`;
  }

  function inhalt() {
    if (!D) return `<div class="ws-empty">
      <p class="mono"><span class="red">▚ KEINE SITZUNG</span> ${fehler ? `<span class="dim">· ${esc(fehler)}</span>` : ""}</p>
      <p>Die Werkstatt zeigt eine laufende Figuren-Sitzung aus Claude Code. Sie funktioniert nur lokal: In Claude Code <code>/figur</code> eingeben, optional mit Name, Leerstelle oder Bild. Die Seite füllt sich dann hier live.</p>
    </div>`;
    return `<div class="ws">${panel()}${sheet(D.figur || {})}</div>
      <p class="mono dim small ws-stamp">stand ${esc((D.aktualisiert || "").replace("T", " ").slice(0, 19))} · liest data/werkstatt/sitzung.json</p>`;
  }

  function view() {
    return `<p class="lead">Geführte Figuren-Erstellung. Das Gespräch läuft in Claude Code (<code>/figur</code>), hier erscheint live der Stand: Frage, Widersprüche, Entscheidungen und das Character Sheet.</p>
      <div id="wsBox">${inhalt()}</div>`;
  }

  async function laden() {
    try {
      const r = await fetch("data/werkstatt/sitzung.json?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) { const f = r.status === 404 ? "" : "HTTP " + r.status; if (D !== null || f !== fehler) { D = null; stamp = ""; fehler = f; zeichnen(); } return; }
      const d = await r.json(), s = d.aktualisiert || JSON.stringify(d).length + "";
      if (s !== stamp || D === null) { D = d; stamp = s; fehler = ""; zeichnen(); }
    } catch (e) { if (!fehler) { fehler = "Datei nicht lesbar"; D = null; zeichnen(); } }
  }
  function zeichnen() {
    const box = document.getElementById("wsBox"); if (!box) return;
    const y = window.scrollY; box.innerHTML = inhalt(); window.scrollTo(0, y);
    box.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => { navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy); b.classList.add("hit"); setTimeout(() => b.classList.remove("hit"), 600); }));
    const c = box.querySelector("[data-copytext]");
    if (c) c.addEventListener("click", () => { navigator.clipboard && navigator.clipboard.writeText(D.higgsfield); c.textContent = "✓ kopiert"; });
  }
  function bind() {
    clearInterval(timer); laden();
    timer = setInterval(() => { if (!document.getElementById("wsBox")) { clearInterval(timer); return; } if (!document.hidden) laden(); }, 2000);
  }

  SF.werkstatt = { view, bind };
})();
