/* SCHEINFIRMA — generativer Sound. Wird live im Browser synthetisiert, keine Audiodatei.
   Drone + Bass-Puls + gefiltertes Arpeggio + Datenrauschen, dazu Glitch-Effekte für die Puppe.
   Startet nur auf Klick (Browser erlauben kein Autoplay). API: SF.sound.toggle(), .glitch(), .tick() */
window.SF = window.SF || {};

SF.sound = (function () {
  let ctx = null, master, bus, on = false;
  let timer = null, step = 0, nextTime = 0, bar = 0, pattern = [];
  const BPM = 84, STEP = 60 / BPM / 4;                       // Sechzehntel
  // A phrygisch: dunkel, leicht fremd
  const SCALE = [0, 1, 3, 5, 7, 8, 10];
  const ROOT = 110;                                          // A2
  const hz = (deg, oct = 0) => ROOT * Math.pow(2, (SCALE[((deg % 7) + 7) % 7] + 12 * (oct + Math.floor(deg / 7))) / 12);

  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function noiseBuf(sec) {
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);

    // Hall + Echo als gemeinsamer Bus
    bus = ctx.createGain();
    const verb = ctx.createConvolver(); verb.buffer = impulse(3.5, 2.5);
    const verbGain = ctx.createGain(); verbGain.gain.value = 0.35;
    const delay = ctx.createDelay(1); delay.delayTime.value = STEP * 3;
    const fb = ctx.createGain(); fb.gain.value = 0.38;
    const dlp = ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 2400;
    bus.connect(master);
    bus.connect(verb).connect(verbGain).connect(master);
    bus.connect(delay); delay.connect(dlp).connect(fb).connect(delay); dlp.connect(verbGain);

    // Drone: zwei verstimmte Sägezähne + Quinte, langsam atmender Filter
    const droneF = ctx.createBiquadFilter(); droneF.type = "lowpass"; droneF.frequency.value = 380; droneF.Q.value = 6;
    const droneG = ctx.createGain(); droneG.gain.value = 0.11;
    [[55, -7], [55, 6], [82.4, 0]].forEach(([f, det]) => {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = det;
      o.connect(droneF); o.start();
    });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.045;
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 260;
    lfo.connect(lfoAmt).connect(droneF.frequency); lfo.start();
    droneF.connect(droneG).connect(master);
    droneG.connect(verb);

    // Datenrauschen: gefiltertes Rauschen, leise, wandernd
    const n = ctx.createBufferSource(); n.buffer = noiseBuf(4); n.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 3200; nf.Q.value = 3;
    const ng = ctx.createGain(); ng.gain.value = 0.012;
    const nl = ctx.createOscillator(); nl.frequency.value = 0.07;
    const nla = ctx.createGain(); nla.gain.value = 1800;
    nl.connect(nla).connect(nf.frequency); nl.start();
    n.connect(nf).connect(ng).connect(master); n.start();
  }

  function newPattern() {
    // 16 Schritte, Lücken erwünscht; alle 4 Takte neu gewürfelt
    const motif = [0, 2, 4, 6, 7, 4, 2, 9];
    pattern = Array.from({ length: 16 }, (_, i) =>
      Math.random() < (i % 2 ? 0.35 : 0.7) ? motif[Math.floor(Math.random() * motif.length)] + (Math.random() < 0.2 ? 7 : 0) : null);
  }

  function pluck(t, f, dur, vol, type = "square", cutoff = 1600) {
    const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = f;
    fl.type = "lowpass"; fl.Q.value = 8;
    fl.frequency.setValueAtTime(cutoff * 2.2, t); fl.frequency.exponentialRampToValueAtTime(cutoff * 0.3, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl).connect(g).connect(bus);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.5);
  }
  function hat(t, vol) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf(0.08);
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f).connect(g).connect(master); s.start(t);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.12) {
      const s = step % 16, t = nextTime;
      if (s === 0) { bar++; if (bar % 4 === 1) newPattern(); }
      // Puls: Kick auf 1 und 3, Bass dazwischen
      if (s === 0 || s === 8) kick(t);
      if (s === 3 || s === 11 || (s === 14 && bar % 2)) pluck(t, hz(0, -2) * (bar % 8 > 5 ? 1.335 : 1), 0.32, 0.22, "sawtooth", 500);
      if (s % 4 === 2) hat(t, 0.05);
      if (s % 2 === 1 && Math.random() < 0.3) hat(t, 0.018);
      // Arpeggio ab Takt 3, damit es sich aufbaut
      const deg = pattern[s];
      if (bar > 2 && deg !== null) pluck(t, hz(deg, 1), STEP * 2.4, 0.07, Math.random() < 0.8 ? "square" : "triangle", 1400 + 600 * Math.sin(bar / 3));
      nextTime += STEP; step++;
    }
  }

  function start() {
    if (!ctx) build();
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.55, ctx.currentTime, 1.2);
    nextTime = ctx.currentTime + 0.1; step = 0; bar = 0;
    timer = setInterval(schedule, 25);
    on = true;
  }
  function stop() {
    if (!ctx) return;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    clearInterval(timer); timer = null;
    setTimeout(() => { if (!on) ctx.suspend(); }, 1600);
    on = false;
  }

  // Effekte (nur hörbar, wenn Sound an ist)
  function glitch() {
    if (!on) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square"; o.frequency.setValueAtTime(200 + Math.random() * 1800, t + i * 0.045);
      g.gain.setValueAtTime(0.0001, t + i * 0.045); g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.045 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.045 + 0.04);
      o.connect(g).connect(bus); o.start(t + i * 0.045); o.stop(t + i * 0.045 + 0.05);
    }
    // Scan: abfallender Ton
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(1600, t + 0.3); o.frequency.exponentialRampToValueAtTime(90, t + 1.0);
    g.gain.setValueAtTime(0.0001, t + 0.3); g.gain.exponentialRampToValueAtTime(0.05, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
    o.connect(g).connect(bus); o.start(t + 0.3); o.stop(t + 1.1);
  }
  function tick() {
    if (!on) return;
    pluck(ctx.currentTime, hz(4, 2), 0.12, 0.05, "square", 3000);
  }

  return {
    get on() { return on; },
    toggle() { on ? stop() : start(); return on; },
    glitch, tick
  };
})();
