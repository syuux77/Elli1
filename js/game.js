/* Elli lernt laufen – Spiel-Logik.
   Seitenansicht, Elli läuft nach rechts und balanciert wie ein umgedrehtes Pendel. */
(function () {
  'use strict';

  const CFG = window.ELLI_CONFIG || {};
  const ART = window.ELLI_ART;
  const IMG = ART.IMG;

  // ------------------------------------------------------------------
  // Stellschrauben (alles, was sich nach dem Testen anpassen lässt)
  // ------------------------------------------------------------------
  const T = {
    VH: 800,              // logische Höhe der Spielwelt
    floorTop: 560,        // Wandkante / Boden
    feetY: 650,           // Ellis Fußlinie
    elliScale: 1.15,
    stepLen: 46,          // Weltpixel pro Schritt
    baseSpeed: 100,       // Weltpixel pro Sekunde in Runde 1
    leanSpeed: 1.1,       // Vorlage macht schneller
    minSpeed: 0.15,       // Rücklage bremst bis auf 15 %
    maxAngle: 0.785,      // 45° = Plumps
    gravity: 1.5,         // Kipp-Stärke
    gravityPerLevel: 0.3,
    gravityQuad: 0.1,     // wächst ohne Deckel, irgendwann plumpst jede Elli
    damping: 0.55,
    tapImpulse: 0.62,
    maxOmega: 4.5,
    noise: 0.3,           // sanftes Grund-Wackeln
    noisePerLevel: 0.3,
    noiseQuad: 0.08,
    stepWobble: 0.35,     // Wackeln durch jeden Schritt
    kickMin: 0.15, kickMax: 0.4, kickPerLevel: 0.3, kickEvery: [2.2, 4.6],
    tiltTorque: 3.4, tiltRange: 22,
    redZone: 0.72,        // Anteil von maxAngle
    ladybugLean: 0.38,
    calmSeconds: 10, maxMult: 5,
    giraffeSeconds: 4,
    stepsPerGoal: 30, stepsPerGoalPerRound: 10,
    speedPerLevel: 0.15,
    goalPause: 1.7,
    blockKick: 0.6, rugKick: 0.42, trudeKick: 0.6, rubyPull: 1.0
  };

  const GOALS = [
    { name: 'Mama', img: 'mamaFull', av: 'avMama', h: 262 },
    { name: 'Papa', img: 'papaFull', av: 'avPapa', h: 270 },
    { name: 'Ruby', img: 'rubyFull', av: 'avRuby', h: 186 },
    { name: 'Trude', img: 'trudeA', av: 'avTrude', h: 82, dog: true }
  ];

  // ------------------------------------------------------------------
  // Hilfen
  // ------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = (n) => Math.round(n).toLocaleString('de-DE');
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* egal */ } }
  };

  function goalText(goals) {
    if (!goals) return 'noch kein Ziel';
    const idx = (goals - 1) % 4, rnd = Math.floor((goals - 1) / 4) + 1;
    return 'bis ' + GOALS[idx].name + ', Runde ' + rnd;
  }

  // ------------------------------------------------------------------
  // Canvas
  // ------------------------------------------------------------------
  const cv = $('cv');
  const ctx = cv.getContext('2d');
  let W = 400, S = 1, DPR = 1, wallGrad = null, floorGrad = null;

  function resize() {
    const cw = window.innerWidth, ch = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = Math.round(cw * DPR);
    cv.height = Math.round(ch * DPR);
    S = ch / T.VH;
    W = cw / S;
    wallGrad = ctx.createLinearGradient(0, 0, 0, T.floorTop);
    wallGrad.addColorStop(0, '#E6DDF7');
    wallGrad.addColorStop(1, '#FCE3EA');
    floorGrad = ctx.createLinearGradient(0, T.floorTop, 0, T.VH);
    floorGrad.addColorStop(0, '#EFCDA8');
    floorGrad.addColorStop(0.12, '#F6D9B8');
    floorGrad.addColorStop(1, '#F8DFC2');
  }
  window.addEventListener('resize', resize);
  resize();

  function drawImg(img, x, bottom, h, flip) {
    if (!img || !img.naturalWidth) return;
    const w = h * img.naturalWidth / img.naturalHeight;
    if (flip) {
      ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, bottom - h, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(img, x - w / 2, bottom - h, w, h);
    }
  }

  // ------------------------------------------------------------------
  // Spielzustand
  // ------------------------------------------------------------------
  let state = 'menu';       // menu | play | goal | fall | over
  let mode = store.get('elli_mode', 'tap');
  let g = null;
  let camX = 0, camRatio = 0.5;
  let menuT = 0;
  const hints = {};

  function newGame() {
    const nf = [0, 1, 2].map(() => ({ f: rand(0.6, 1.7), p: rand(0, Math.PI * 2), a: rand(0.6, 1) }));
    const na = nf.reduce((s, n) => s + n.a, 0);
    nf.forEach((n) => { n.a /= na; });
    g = {
      x: 0, dist: 0, steps: 0, theta: rand(-0.04, 0.04), omega: 0, phase: 0, t: 0,
      round: 1, goalIdx: 0, goalX: 0, goalsReached: 0,
      score: 0, mult: 1, calmT: 0, inRed: false,
      cats: { steps: 0, items: 0, goals: 0 }, bonusMult: 0,
      items: [], nextSpawnX: 260, lastGiraffeX: -9999,
      kickT: rand(T.kickEvery[0], T.kickEvery[1]) + 1.5,
      noise: nf,
      giraffeT: 0, worriedT: 0,
      trude: null, trudeT: rand(9, 16),
      ruby: null, rubyT: rand(15, 24),
      persons: [], pops: [], parts: [],
      stateT: 0, fallDir: 1, tilt: 0, tiltBase: null, tiltSeen: false
    };
    nextGoal();
  }

  function level() { return (g.round - 1) + g.goalIdx * 0.25; }

  function nextGoal() {
    const steps = T.stepsPerGoal + T.stepsPerGoalPerRound * (g.round - 1);
    const prevGoal = g.goalX;
    g.goalX = g.x + steps * T.stepLen;
    g.persons.push({ idx: g.goalIdx, x: g.goalX + 40, reached: false });
    g.nextSpawnX = Math.max(g.nextSpawnX, (prevGoal || 0) + 230, g.x + 230);
    buildGoalStrip();
  }

  function addPoints(base, cat) {
    const pts = base * g.mult;
    g.score += pts;
    g.cats[cat] += base;
    g.bonusMult += pts - base;
    return pts;
  }

  function pop(text, x, y, color, big) {
    g.pops.push({ text: text, x: x, y: y, color: color || '#C24F78', t: 0, life: big ? 1.3 : 0.9, big: !!big });
  }

  // ------------------------------------------------------------------
  // Gegenstände
  // ------------------------------------------------------------------
  function spawnItems() {
    const limit = Math.min(camX + W + 320, g.goalX - 170);
    while (g.nextSpawnX < limit) {
      const x = g.nextSpawnX;
      g.nextSpawnX += rand(150, 320);
      const d = level();
      const wObs = Math.min(32, 14 + 5 * d);
      const wGir = (x - g.lastGiraffeX > 2600) ? 4 : 0;
      const wTom = 46, wLady = 24;
      let r = Math.random() * (wTom + wLady + wObs + wGir);
      let type;
      if ((r -= wTom) < 0) type = 'tomato';
      else if ((r -= wLady) < 0) type = 'ladybug';
      else if ((r -= wObs) < 0) type = Math.random() < 0.6 ? 'block' : 'rug';
      else { type = 'giraffe'; g.lastGiraffeX = x; }
      g.items.push({ type: type, x: x, ph: rand(0, 6.28), done: false, t: 0, blk: Math.floor(Math.random() * 4) });
    }
  }

  function bubble(text, sec) {
    const el = $('bubble');
    el.textContent = text;
    el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(bubble.tm);
    bubble.tm = setTimeout(() => { el.hidden = true; }, (sec || 1.4) * 1000);
  }

  function headX() { return g.x + Math.sin(g.theta) * 103; }

  function updateItems(dt) {
    const lf = g.theta / T.maxAngle;
    for (const it of g.items) {
      it.t += dt;
      if (it.done) continue;
      if (it.type === 'tomato' && g.x >= it.x - 8) {
        it.done = true; it.got = true; it.t = 0;
        const p = addPoints(3, 'items'); pop('+' + p, it.x, T.feetY - 40, '#E0533F');
      } else if (it.type === 'ladybug') {
        if (!hints.ladybug && it.x - g.x < 330 && it.x > g.x) {
          hints.ladybug = true; bubble('Marienkäfer! Nach vorne lehnen', 2);
        }
        const hx = headX();
        if (Math.abs(hx - it.x) < 30 && lf > T.ladybugLean) {
          it.done = true; it.got = true; it.t = 0;
          const p = addPoints(15, 'items'); pop('+' + p, it.x, T.feetY - 150, '#D9473D', true);
        } else if (it.x < hx - 40) {
          it.done = true; it.got = false; it.t = 0;
        }
      } else if (it.type === 'block' && g.x + 16 >= it.x - 16) {
        it.done = true; it.t = 0; it.vx = 160; it.rot = 0;
        g.omega += T.blockKick * (1 + 0.1 * level()) * (g.giraffeT > 0 ? 0.5 : 1);
        g.worriedT = 0.7; bubble('Huch, Bauklotz!', 1.1);
      } else if (it.type === 'rug' && g.x >= it.x - 50) {
        it.done = true; it.t = 0;
        g.omega += T.rugKick * (1 + 0.1 * level()) * (g.giraffeT > 0 ? 0.5 : 1);
        g.worriedT = 0.5; bubble('Huch, Teppichkante!', 1.1);
      } else if (it.type === 'giraffe' && g.x >= it.x - 6) {
        it.done = true; it.got = true; it.t = 0;
        g.giraffeT = T.giraffeSeconds; bubble('Kuschel-Giraffe! Ganz ruhig …', 1.8);
      }
    }
    g.items = g.items.filter((it) => it.x > camX - 200 && !(it.done && it.t > 2.5));
  }

  // ------------------------------------------------------------------
  // Störungen: Trude & Ruby
  // ------------------------------------------------------------------
  function updateEvents(dt) {
    const d = level();
    const goalNear = g.goalX - g.x < 420;
    // Trude flitzt vorbei
    if (!g.trude) {
      g.trudeT -= dt;
      if (g.trudeT <= 0) {
        if (g.goalIdx !== 3 && !goalNear) {
          g.trude = { x: camX + W + 90, vx: -(430 + 40 * d), hit: false, t: 0 };
          bubble('Achtung, Trude flitzt vorbei!', 1.4);
        }
        g.trudeT = rand(10, 19) / (1 + 0.08 * d);
      }
    } else {
      const tr = g.trude;
      tr.t += dt; tr.x += tr.vx * dt;
      if (!tr.hit && tr.x < g.x + 12) {
        tr.hit = true;
        const sign = Math.random() < 0.5 ? -1 : 1;
        g.omega += sign * T.trudeKick * (1 + 0.12 * d) * (g.giraffeT > 0 ? 0.5 : 1);
        g.worriedT = 0.8;
      }
      if (tr.x < camX - 160) g.trude = null;
    }
    // Ruby winkt
    if (!g.ruby) {
      g.rubyT -= dt;
      if (g.rubyT <= 0) {
        if (g.goalIdx !== 2 && !goalNear) {
          g.ruby = { t: 0, dur: 2.0, mx: camX * 0.6 + W * 0.86 };
          bubble('Ruby winkt: „Hallo Elli!“', 1.6);
        }
        g.rubyT = rand(15, 26) / (1 + 0.06 * d);
      }
    } else {
      g.ruby.t += dt;
      if (g.ruby.t > g.ruby.dur) g.ruby = null;
    }
  }

  // ------------------------------------------------------------------
  // Physik & Ablauf
  // ------------------------------------------------------------------
  function noiseAt(t) {
    let s = 0;
    for (const n of g.noise) s += n.a * Math.sin(n.f * t * 2 * Math.PI / 2 + n.p);
    return s;
  }

  function physics(dt) {
    const d = level();
    const calm = g.giraffeT > 0;
    const G = T.gravity * (1 + T.gravityPerLevel * d + T.gravityQuad * d * d) * (calm ? 0.6 : 1);
    const warm = Math.min(1, 0.4 + g.t / 6);   // sanfter Einstieg in den ersten Sekunden
    const N = (T.noise + T.noisePerLevel * d + T.noiseQuad * d * d) * (calm ? 0.3 : 1) * warm;
    let alpha = G * Math.sin(g.theta) - T.damping * g.omega + N * noiseAt(g.t);
    alpha += T.stepWobble * Math.sin(2 * g.phase) * (1 + 0.1 * d);
    if (g.ruby && g.ruby.t > 0.35 && g.ruby.t < 1.35) alpha -= T.rubyPull * (1 + 0.1 * d) * (calm ? 0.5 : 1);
    if (mode === 'tilt') alpha += T.tiltTorque * g.tilt;
    g.omega = clamp(g.omega + alpha * dt, -T.maxOmega, T.maxOmega);
    g.theta += g.omega * dt;

    // zufällige Stupser
    if (!calm) {
      g.kickT -= dt;
      if (g.kickT <= 0) {
        g.omega += (Math.random() < 0.5 ? -1 : 1) * rand(T.kickMin, T.kickMax) * (1 + T.kickPerLevel * d);
        g.kickT = rand(T.kickEvery[0], T.kickEvery[1]) / (1 + 0.12 * d);
      }
    }

    // Vorwärtsbewegung
    const lf = g.theta / T.maxAngle;
    const speed = T.baseSpeed * (1 + T.speedPerLevel * d) * Math.max(T.minSpeed, 1 + T.leanSpeed * lf);
    g.x += speed * dt;
    g.dist += speed * dt;
    g.phase = g.dist / T.stepLen * Math.PI;
    const steps = Math.floor(g.dist / T.stepLen);
    while (g.steps < steps) { g.steps++; addPoints(1, 'steps'); }
  }

  function update(dt) {
    if (!g) return;
    g.stateT += dt;
    if (state === 'play') {
      g.t += dt;
      physics(dt);
      if (g.giraffeT > 0) g.giraffeT -= dt;
      if (g.worriedT > 0) g.worriedT -= dt;
      updateItems(dt);
      updateEvents(dt);
      spawnItems();

      // Multiplikator „Ruhige Hand“
      const alf = Math.abs(g.theta / T.maxAngle);
      if (alf >= T.redZone) {
        if (!g.inRed) {
          g.inRed = true;
          if (g.mult > 1) pop('Wackler! x1', g.x, T.feetY - 210, '#8F7A9C');
          g.mult = 1; g.calmT = 0;
        }
      } else {
        if (alf < T.redZone - 0.06) g.inRed = false;
        if (!g.inRed) {
          g.calmT += dt;
          if (g.calmT >= T.calmSeconds) {
            if (g.mult < T.maxMult) {
              g.mult++; g.calmT = 0;
              pop('Ruhige Hand! x' + g.mult, g.x, T.feetY - 210, '#3E9E7E', true);
              const m = $('hud-mult'); m.classList.add('bump'); setTimeout(() => m.classList.remove('bump'), 220);
            } else g.calmT = T.calmSeconds;
          }
        }
      }

      if (Math.abs(g.theta) >= T.maxAngle) {
        state = 'fall'; g.stateT = 0; g.fallDir = Math.sign(g.theta);
        $('bubble').hidden = true;
      } else if (g.x >= g.goalX) {
        reachGoal();
      }
    } else if (state === 'goal') {
      g.theta *= Math.pow(0.02, dt);
      g.omega = 0;
      updateParticles(dt);
      if (g.stateT >= T.goalPause) {
        $('banner').hidden = true;
        g.goalIdx++;
        if (g.goalIdx >= 4) { g.goalIdx = 0; g.round++; }
        nextGoal();
        state = 'play'; g.stateT = 0;
      }
    } else if (state === 'fall') {
      if (g.stateT > 0.25 && !g.dust) {
        g.dust = true;
        for (let i = 0; i < 10; i++) g.parts.push({ kind: 'dust', x: g.x + rand(-40, 40), y: T.feetY - rand(0, 10), vx: rand(-60, 60), vy: rand(-50, -10), t: 0, life: rand(0.5, 0.9), r: rand(6, 12) });
      }
      if (g.stateT > 1.25) gameOver();
    }
    if (state === 'play' || state === 'fall') updateParticles(dt);
    for (const p of g.pops) p.t += dt;
    g.pops = g.pops.filter((p) => p.t < p.life);
  }

  function updateParticles(dt) {
    for (const p of g.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'heart') p.vy -= 10 * dt; }
    g.parts = g.parts.filter((p) => p.t < p.life);
  }

  function reachGoal() {
    state = 'goal'; g.stateT = 0;
    const goal = GOALS[g.goalIdx];
    const base = 50 * g.round;
    const pts = addPoints(base, 'goals');
    g.goalsReached++;
    const person = g.persons.find((p) => p.idx === g.goalIdx && !p.reached);
    if (person) person.reached = true;
    for (let i = 0; i < 9; i++) {
      g.parts.push({ kind: 'heart', x: g.goalX + rand(-50, 70), y: T.feetY - rand(80, 220), vx: rand(-20, 20), vy: rand(-70, -35), t: 0, life: rand(1.1, 1.7), s: rand(14, 26) });
    }
    $('bubble').hidden = true;
    $('bn-title').innerHTML = 'Elli hat <span>' + goal.name + '</span> erreicht!';
    $('bn-av').src = ART.dataUri(goal.av);
    $('bn-bonus').textContent = g.mult > 1 ? '+' + base + ' × ' + g.mult + ' = +' + fmt(pts) : '+' + fmt(pts) + ' Ziel-Bonus';
    $('bn-sub').textContent = g.goalIdx === 3
      ? 'Runde ' + (g.round + 1) + '! Jetzt wird es schneller.'
      : 'Weiter zu ' + GOALS[g.goalIdx + 1].name;
    $('banner').hidden = false;
  }

  // ------------------------------------------------------------------
  // Zeichnen
  // ------------------------------------------------------------------
  const BUNT = ['#F28DAE', '#FFD98A', '#8ED5BF', '#A9CBF2', '#EE7B72'];

  function drawBackground() {
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, W, T.floorTop);

    // Ferne Ebene: Fenster, Bilder
    const f1 = 0.25, T1 = 560, o1 = camX * f1;
    for (let i = Math.floor(o1 / T1) - 1; i <= Math.floor((o1 + W) / T1) + 1; i++) {
      const bx = i * T1 - o1;
      drawImg(IMG.windowImg, bx + 110, 360, 160);
      const fr = [IMG.frameSun, IMG.frameHeart, IMG.frameOne][Math.floor(hash(i) * 3)];
      drawImg(fr, bx + 330, 330, 84);
      if (hash(i + 7) > 0.4) drawImg([IMG.frameHeart, IMG.frameSun, IMG.frameOne][Math.floor(hash(i + 3) * 3)], bx + 440, 390, 64);
    }
    // Wimpelkette
    const f2 = 0.35, T2 = 240, o2 = camX * f2;
    for (let i = Math.floor(o2 / T2) - 1; i <= Math.floor((o2 + W) / T2) + 1; i++) {
      const bx = i * T2 - o2;
      ctx.strokeStyle = '#C9B6D6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx, 110); ctx.quadraticCurveTo(bx + T2 / 2, 150, bx + T2, 110); ctx.stroke();
      for (let k = 0; k < 6; k++) {
        const t = (k + 0.5) / 6, px = bx + t * T2, py = 110 + 4 * t * (1 - t) * 20;
        ctx.fillStyle = BUNT[(i * 6 + k + 1000) % BUNT.length];
        ctx.beginPath(); ctx.moveTo(px - 13, py); ctx.lineTo(px + 13, py); ctx.lineTo(px, py + 30); ctx.closePath(); ctx.fill();
      }
    }
    // Sockelleiste
    ctx.fillStyle = '#F4E4EF';
    ctx.fillRect(0, T.floorTop - 16, W, 16);

    // Mittlere Ebene: Möbel
    const f3 = 0.6, T3 = 720, o3 = camX * f3;
    for (let i = Math.floor(o3 / T3) - 1; i <= Math.floor((o3 + W) / T3) + 1; i++) {
      const bx = i * T3 - o3, h = hash(i + 11);
      if (h < 0.5) {
        drawImg(IMG.sofa, bx + 170, T.floorTop + 8, 120);
        drawImg(IMG.balloons[i & 3], bx + 60, T.floorTop - 70, 90);
        drawImg(IMG.balloons[(i + 1) & 3], bx + 84, T.floorTop - 84, 96);
      } else {
        drawImg(IMG.shelf, bx + 140, T.floorTop + 8, 150);
        drawImg(IMG.balloons[(i + 2) & 3], bx + 220, T.floorTop - 110, 92);
      }
      drawImg(IMG.plant, bx + 470 + hash(i + 5) * 120, T.floorTop + 10, 120);
    }
    // Ruby winkt aus dem Hintergrund
    if (g && g.ruby) {
      const r = g.ruby, sx = r.mx - camX * f3;
      const appear = Math.min(1, r.t / 0.25, (r.dur - r.t) / 0.25);
      ctx.save();
      ctx.globalAlpha = clamp(appear, 0, 1);
      ctx.translate(sx, T.floorTop + 14);
      ctx.rotate(Math.sin(r.t * 12) * 0.06);
      drawImg(IMG.rubyFull, 0, 0, 150);
      ctx.restore();
    }

    // Boden
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, T.floorTop, W, T.VH - T.floorTop);
    ctx.strokeStyle = 'rgba(214,170,128,.55)'; ctx.lineWidth = 2;
    const pw = 48, off = camX % pw;
    ctx.beginPath();
    for (let x = -off; x < W + pw; x += pw) { ctx.moveTo(x, T.floorTop); ctx.lineTo(x, T.VH); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(160,110,90,.08)';
    ctx.fillRect(0, T.floorTop, W, 6);
  }

  function drawPersons() {
    for (const p of g.persons) {
      const sx = p.x - camX;
      if (sx < -200 || sx > W + 200) continue;
      const goal = GOALS[p.idx];
      const bounce = (state === 'goal' && p.reached && GOALS[g.goalIdx] === goal) ? Math.abs(Math.sin(g.stateT * 9)) * 8 : 0;
      ctx.fillStyle = 'rgba(0,0,0,.08)';
      ctx.beginPath(); ctx.ellipse(sx, T.feetY + 2, goal.dog ? 48 : 36, 7, 0, 0, Math.PI * 2); ctx.fill();
      if (goal.dog) {
        const img = (Math.floor(menuT * 3) % 2) ? IMG.trudeA : IMG.trudeB;
        drawImg(img, sx, T.feetY + 4 - bounce, goal.h, true);
      } else {
        drawImg(IMG[goal.img], sx, T.feetY + 4 - bounce, goal.h);
      }
    }
  }

  function drawItemsBack() {
    for (const it of g.items) {
      const sx = it.x - camX;
      if (sx < -120 || sx > W + 120) continue;
      if (it.type === 'rug') {
        drawImg(IMG.rug, sx + 10, T.feetY + 8, 22);
      } else if (it.type === 'tomato') {
        if (it.done) {
          const k = Math.min(1, it.t / 0.35);
          ctx.globalAlpha = 1 - k;
          drawImg(IMG.tomato, sx, T.feetY - 4 - k * 60, 34);
          ctx.globalAlpha = 1;
        } else drawImg(IMG.tomato, sx, T.feetY + 2, 34);
      } else if (it.type === 'block') {
        if (it.done) {
          const k = Math.min(it.t, 0.6);
          ctx.save();
          ctx.translate(sx + it.vx * k * 0.6, T.feetY - 18 - Math.sin(k / 0.6 * Math.PI) * 30);
          ctx.rotate(k * 5);
          drawImg(IMG.blocks[it.blk], 0, 18, 38);
          ctx.restore();
        } else drawImg(IMG.blocks[it.blk], sx, T.feetY + 2, 38);
      } else if (it.type === 'giraffe' && !it.done) {
        drawImg(IMG.giraffe, sx, T.feetY + 2 - Math.abs(Math.sin(menuT * 3 + it.ph)) * 6, 46);
      }
    }
  }

  function drawItemsFront() {
    for (const it of g.items) {
      if (it.type !== 'ladybug') continue;
      let sx = it.x - camX;
      let y = T.feetY - 108 + Math.sin(menuT * 4 + it.ph) * 7;
      let a = 1;
      if (it.done) {
        const k = Math.min(1, it.t / 0.6);
        if (it.got) { y -= k * 40; a = 1 - k; } else { sx += k * 90; y -= k * 120; a = 1 - k; }
      }
      if (sx < -60 || sx > W + 60 || a <= 0) continue;
      ctx.globalAlpha = a;
      ctx.save(); ctx.translate(sx, y); ctx.rotate(Math.sin(menuT * 9 + it.ph) * 0.15);
      drawImg(IMG.ladybug, 0, 15, 30);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  function drawLeg(hx, hy, ang, lift, back) {
    ctx.save();
    ctx.translate(hx, hy - lift);
    ctx.rotate(ang);
    ctx.fillStyle = back ? '#EEC6AE' : '#F7D4BF';
    roundRect(-5, -2, 10, 28, 5); ctx.fill();
    ctx.fillStyle = back ? '#E57FA2' : '#F28DAE';
    ctx.beginPath(); ctx.ellipse(1.5, 27, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawArm(sx, sy, vx, vy, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const ex = sx + vx * c - vy * s, ey = sy + vx * s + vy * c;
    ctx.strokeStyle = '#F7D4BF'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawElli(sx, theta, phase, moving, t) {
    const s = T.elliScale;
    const sitting = state === 'fall' && g.stateT > 0.25 || state === 'over';
    // Schatten
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.beginPath(); ctx.ellipse(sx + (sitting ? 0 : Math.sin(theta) * 10), T.feetY + 2, sitting ? 46 : 26, 6, 0, 0, Math.PI * 2); ctx.fill();
    if (sitting) {
      drawImg(IMG.elliSit, sx + g.fallDir * 18, T.feetY + 6, 110 * s);
      return;
    }
    const lf = theta / T.maxAngle;
    ctx.save();
    ctx.translate(sx, T.feetY);
    ctx.rotate(theta);
    ctx.scale(s, s);
    const bob = moving ? -Math.abs(Math.sin(phase)) * 3 : 0;
    ctx.translate(0, bob);
    const sw = moving ? Math.sin(phase) : 0;
    // Beine: abwechselnd anheben und schwingen
    drawLeg(8, -28, -sw * 0.38, moving ? Math.max(0, -sw) * 7 : 0, true);
    drawLeg(-8, -28, sw * 0.38, moving ? Math.max(0, sw) * 7 : 0, false);
    // Arme: rudern, bei viel Wackeln wild
    const flail = Math.max(0, Math.abs(lf) - 0.45) * 2.2;
    const swing = moving ? Math.sin(phase * 0.5) * 0.18 : Math.sin(t * 2) * 0.08;
    drawArm(-27, -64, -13, -14, swing + Math.sin(t * 15) * 0.45 * flail - lf * 0.3);
    drawArm(27, -64, 13, -14, -swing - Math.sin(t * 15 + 1) * 0.45 * flail - lf * 0.3);
    const worried = (g && g.worriedT > 0) || Math.abs(lf) > 0.62;
    const up = worried ? IMG.elliUpperWorried : IMG.elliUpper;
    if (up.naturalWidth) ctx.drawImage(up, -50, -130, 100, 140);
    if (g && g.giraffeT > 0) drawImg(IMG.giraffe, 4, -50, 34);
    ctx.restore();
  }

  function drawTrude() {
    const tr = g.trude;
    if (!tr) return;
    const sx = tr.x - camX;
    const img = (Math.floor(tr.t * 14) % 2) ? IMG.trudeA : IMG.trudeB;
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.beginPath(); ctx.ellipse(sx, T.feetY + 30, 40, 6, 0, 0, Math.PI * 2); ctx.fill();
    drawImg(img, sx, T.feetY + 30 - Math.abs(Math.sin(tr.t * 14)) * 6, 74, true);
    // Speed-Linien
    ctx.strokeStyle = 'rgba(74,53,87,.25)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k < 3; k++) { ctx.moveTo(sx + 50 + k * 6, T.feetY - 20 + k * 12); ctx.lineTo(sx + 80 + k * 10, T.feetY - 20 + k * 12); }
    ctx.stroke();
  }

  function drawParticles() {
    for (const p of g.parts) {
      const sx = p.x - camX, k = p.t / p.life;
      if (p.kind === 'heart') {
        ctx.globalAlpha = 1 - k * k;
        drawImg(IMG.heart, sx, p.y, p.s);
      } else {
        ctx.globalAlpha = (1 - k) * 0.6;
        ctx.fillStyle = '#E8CDB0';
        ctx.beginPath(); ctx.arc(sx, p.y, p.r * (1 + k), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPops() {
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    for (const p of g.pops) {
      const k = p.t / p.life;
      const sx = p.x - camX, y = p.y - k * 50;
      ctx.globalAlpha = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
      ctx.font = '700 ' + (p.big ? 34 : 28) + 'px Fredoka, "Trebuchet MS", sans-serif';
      ctx.lineWidth = 7; ctx.strokeStyle = '#fff';
      ctx.strokeText(p.text, sx, y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, sx, y);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.setTransform(DPR * S, 0, 0, DPR * S, 0, 0);
    drawBackground();
    if (!g) return;
    drawPersons();
    drawItemsBack();
    const moving = state === 'play';
    if (state !== 'menu') drawElli(g.x - camX, state === 'fall' ? g.theta + g.fallDir * Math.min(1, g.stateT / 0.25) * 0.6 : g.theta, g.phase, moving, menuT);
    drawItemsFront();
    drawTrude();
    drawParticles();
    drawPops();
  }

  // ------------------------------------------------------------------
  // HUD
  // ------------------------------------------------------------------
  const hud = { score: -1, mult: -1, best: -1 };
  function buildGoalStrip() {
    const el = $('hud-goals');
    let html = '';
    for (let i = 0; i < 4; i++) {
      if (i > 0) html += '<span class="bar" id="gbar' + i + '"><i></i></span>';
      html += '<img id="gav' + i + '" alt="' + GOALS[i].name + '" src="' + ART.dataUri(GOALS[i].av) + '">';
    }
    if (el.dataset.built !== '1') { el.innerHTML = html; el.dataset.built = '1'; }
    for (let i = 0; i < 4; i++) {
      const av = $('gav' + i);
      av.className = i < g.goalIdx ? 'done' : (i === g.goalIdx ? 'now' : '');
      if (i > 0) {
        const bar = $('gbar' + i);
        bar.className = 'bar' + (i < g.goalIdx ? ' done' : '');
        bar.firstChild.style.width = i < g.goalIdx ? '100%' : '0';
      }
    }
  }

  function updateHud() {
    if (!g) return;
    if (hud.score !== Math.round(g.score)) { hud.score = Math.round(g.score); $('hud-score').textContent = fmt(g.score); }
    if (hud.mult !== g.mult) {
      hud.mult = g.mult;
      const m = $('hud-mult'); m.textContent = 'x' + g.mult; m.classList.toggle('hot', g.mult > 1);
    }
    const best = Math.max(store.get('elli_best', 0), Math.round(g.score));
    if (hud.best !== best) { hud.best = best; $('hud-best').textContent = fmt(best); }
    $('hud-multbar').style.width = (g.mult >= T.maxMult ? 100 : (g.calmT / T.calmSeconds) * 100) + '%';
    const lf = clamp(g.theta / T.maxAngle, -1, 1);
    $('hud-needle').style.left = (50 + lf * 50) + '%';
    const remaining = Math.max(0, Math.ceil((g.goalX - g.x) / T.stepLen));
    const label = (g.round > 1 ? 'Runde ' + g.round + ' · ' : '') + 'Zu ' + GOALS[g.goalIdx].name + ' · noch ' + remaining + ' Schritte';
    const gl = $('hud-goal-label'); if (gl.textContent !== label) gl.textContent = label;
    if (g.goalIdx > 0) {
      const total = (T.stepsPerGoal + T.stepsPerGoalPerRound * (g.round - 1)) * T.stepLen;
      const prog = clamp(1 - (g.goalX - g.x) / total, 0, 1);
      const bar = $('gbar' + g.goalIdx);
      if (bar) bar.firstChild.style.width = (prog * 100) + '%';
    }
  }

  // ------------------------------------------------------------------
  // Ablauf / Screens
  // ------------------------------------------------------------------
  function show(id) {
    ['scr-start', 'scr-help', 'scr-over', 'scr-board'].forEach((s) => { $(s).hidden = s !== id; });
  }

  function setPlayUi(on) {
    $('hud').hidden = !on;
    $('tapzones').hidden = !on || mode !== 'tap';
    $('tilt-hint').hidden = !on || mode !== 'tilt';
    if (!on) { $('bubble').hidden = true; $('banner').hidden = true; }
  }

  let wakeLock = null;
  function keepAwake(on) {
    try {
      if (on && navigator.wakeLock && !wakeLock) {
        navigator.wakeLock.request('screen').then((l) => { wakeLock = l; l.addEventListener('release', () => { wakeLock = null; }); }).catch(() => {});
      } else if (!on && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    } catch (e) { /* egal */ }
  }

  function startGame() {
    newGame();
    state = 'play';
    camRatio = 0.5;
    show(null);
    setPlayUi(true);
    hud.score = hud.mult = hud.best = -1;
    buildGoalStrip();
    updateHud();
    keepAwake(true);
    if (mode === 'tilt') {
      setTimeout(() => {
        if (state === 'play' && mode === 'tilt' && g && !g.tiltSeen) {
          setMode('tap'); setPlayUi(true);
          toast('Neigen klappt auf diesem Handy nicht. Tippen ist aktiv.');
        }
      }, 1800);
      setTimeout(() => { $('tilt-hint').hidden = true; }, 3500);
    }
  }

  let lastRun = null;
  function gameOver() {
    state = 'over';
    keepAwake(false);
    setPlayUi(false);
    const score = Math.round(g.score);
    const prevBest = store.get('elli_best', 0);
    const isRecord = score > prevBest;
    if (isRecord) store.set('elli_best', score);
    lastRun = { score: score, goals: g.goalsReached, round: g.round, duration: Math.round(g.t * 10) / 10, steps: g.steps, mode: mode, submitted: false };
    $('ov-score').textContent = fmt(score);
    $('ov-record').hidden = !isRecord || score === 0;
    $('ov-break').innerHTML =
      '<span class="reach">' + (g.goalsReached ? 'Geschafft: ' + goalText(g.goalsReached) : 'Noch kein Ziel erreicht') + '</span>' +
      '<span>Schritte</span><span class="v">' + fmt(g.cats.steps) + '</span>' +
      '<span>Tomaten &amp; Käfer</span><span class="v">' + fmt(g.cats.items) + '</span>' +
      '<span>Ziele</span><span class="v">' + fmt(g.cats.goals) + '</span>' +
      '<span>Multiplikator-Bonus</span><span class="v">' + fmt(g.bonusMult) + '</span>';
    $('ov-name').value = store.get('elli_name', '');
    $('ov-status').textContent = '';
    $('ov-status').className = 'status';
    $('ov-submit').disabled = false;
    $('ov-form').hidden = false;
    show('scr-over');
  }

  function toMenu() {
    state = 'menu';
    keepAwake(false);
    setPlayUi(false);
    newGame();
    camRatio = 0.5;
    show('scr-start');
  }

  function toast(text, sec) {
    const el = $('toast');
    el.textContent = text; el.hidden = false;
    clearTimeout(toast.tm);
    toast.tm = setTimeout(() => { el.hidden = true; }, (sec || 3) * 1000);
  }

  // ------------------------------------------------------------------
  // Eingabe
  // ------------------------------------------------------------------
  function tap(dir) {
    if (state !== 'play' || mode !== 'tap') return;
    g.omega = clamp(g.omega + dir * T.tapImpulse, -T.maxOmega, T.maxOmega);
    const el = $(dir > 0 ? 'tap-r' : 'tap-l');
    el.classList.add('flash');
    clearTimeout(el._tm);
    el._tm = setTimeout(() => el.classList.remove('flash'), 110);
  }

  $('app').addEventListener('pointerdown', (e) => {
    if (state !== 'play' && state !== 'goal') return;
    if (e.target.closest('button,input,form')) return;
    e.preventDefault();
    tap(e.clientX >= window.innerWidth / 2 ? 1 : -1);
  }, { passive: false });
  // Doppeltipp-Zoom und Kontextmenü verhindern
  $('app').addEventListener('touchstart', (e) => { if (state === 'play' || state === 'goal') e.preventDefault(); }, { passive: false });
  $('app').addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { tap(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { tap(-1); e.preventDefault(); }
    else if ((e.key === 'Enter' || e.key === ' ') && state === 'menu' && !$('scr-start').hidden) { $('btn-play').click(); e.preventDefault(); }
  });

  // Neigen
  function screenAngle() {
    if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle;
    return typeof window.orientation === 'number' ? window.orientation : 0;
  }
  window.addEventListener('deviceorientation', (e) => {
    if (!g || mode !== 'tilt' || e.gamma == null) return;
    const a = ((screenAngle() % 360) + 360) % 360;
    let v = e.gamma;
    if (a === 90) v = e.beta; else if (a === 270) v = -e.beta; else if (a === 180) v = -e.gamma;
    if (state !== 'play' && state !== 'goal') return;
    if (!g.tiltSeen) { g.tiltSeen = true; g.tiltBase = v; }
    g.tilt = clamp((v - g.tiltBase) / T.tiltRange, -1, 1);
  });

  function setMode(m) {
    mode = m;
    store.set('elli_mode', m);
    $('mode-tap').classList.toggle('on', m === 'tap');
    $('mode-tilt').classList.toggle('on', m === 'tilt');
    $('mode-tap').setAttribute('aria-checked', String(m === 'tap'));
    $('mode-tilt').setAttribute('aria-checked', String(m === 'tilt'));
  }

  // ------------------------------------------------------------------
  // Bestenliste
  // ------------------------------------------------------------------
  const Scores = {
    url: (CFG.scoreUrl || '').trim(),
    local() { return store.get('elli_local_scores', []); },
    saveLocal(entry) {
      const list = this.local();
      list.push(entry);
      store.set('elli_local_scores', list.slice(-200));
    },
    best(list) {
      const map = {};
      list.forEach((e) => {
        const k = String(e.name).trim().toLowerCase();
        if (!map[k] || e.score > map[k].score) map[k] = { name: e.name, score: e.score, goals: e.goals };
      });
      return Object.keys(map).map((k) => map[k]).sort((a, b) => b.score - a.score);
    },
    request(opts) {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const tm = setTimeout(() => ctrl && ctrl.abort(), 9000);
      const o = Object.assign({ redirect: 'follow' }, opts || {});
      if (ctrl) o.signal = ctrl.signal;
      return fetch(this.url + (o.method === 'POST' ? '' : '?action=top'), o)
        .then((r) => r.json())
        .then((j) => { clearTimeout(tm); if (!j || !j.ok) throw new Error((j && j.error) || 'Fehler'); return j; })
        .catch((e) => { clearTimeout(tm); throw e; });
    },
    top() {
      if (!this.url) return Promise.resolve({ list: this.best(this.local()), online: false });
      return this.request().then((j) => ({ list: j.top, online: true }));
    },
    submit(entry) {
      this.saveLocal(entry);
      if (!this.url) return Promise.resolve({ list: this.best(this.local()), online: false });
      return this.request({ method: 'POST', body: JSON.stringify(entry) })
        .then((j) => ({ list: j.top, online: true }))
        .catch((e) => { this.queue(entry); throw e; });
    },
    queue(entry) {
      const q = store.get('elli_pending', []);
      q.push(entry); store.set('elli_pending', q.slice(-30));
    },
    flush() {
      if (!this.url) return;
      const q = store.get('elli_pending', []);
      if (!q.length) return;
      store.set('elli_pending', []);
      q.reduce((p, entry) => p.then(() => this.request({ method: 'POST', body: JSON.stringify(entry) }).catch(() => this.queue(entry))), Promise.resolve());
    }
  };

  function renderBoard(list, note) {
    const me = String(store.get('elli_name', '')).trim().toLowerCase();
    const ol = $('bd-list');
    ol.innerHTML = '';
    if (!list || !list.length) {
      ol.innerHTML = '<li class="empty">Noch keine Einträge. Sei die oder der Erste!</li>';
    } else {
      list.slice(0, 10).forEach((e, i) => {
        const li = document.createElement('li');
        if (me && String(e.name).trim().toLowerCase() === me) li.className = 'me';
        const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = String(i + 1);
        const nm = document.createElement('span'); nm.textContent = e.name;
        const sm = document.createElement('small'); sm.textContent = goalText(e.goals); nm.appendChild(sm);
        const pts = document.createElement('span'); pts.className = 'pts'; pts.textContent = fmt(e.score);
        li.append(rank, nm, pts);
        ol.appendChild(li);
      });
    }
    $('bd-note').textContent = note || '';
  }

  function openBoard(preset) {
    show('scr-board');
    if (preset) { renderBoard(preset.list, preset.note); return; }
    renderBoard([], 'Lade Bestenliste …');
    $('bd-list').innerHTML = '';
    Scores.top().then((r) => {
      renderBoard(r.list, r.online ? 'Bester Versuch pro Name' : 'Nur auf diesem Handy · Online-Liste noch nicht eingerichtet');
    }).catch(() => {
      renderBoard(Scores.best(Scores.local()), 'Gerade offline · zeige Ergebnisse von diesem Handy');
    });
  }

  $('ov-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!lastRun || lastRun.submitted) return;
    const name = $('ov-name').value.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
    if (!name) { $('ov-status').textContent = 'Bitte gib einen Namen ein.'; $('ov-status').className = 'status err'; $('ov-name').focus(); return; }
    store.set('elli_name', name);
    lastRun.submitted = true;
    $('ov-submit').disabled = true;
    $('ov-status').className = 'status';
    $('ov-status').textContent = 'Wird eingetragen …';
    $('ov-name').blur();
    const entry = { name: name, score: lastRun.score, goals: lastRun.goals, round: lastRun.round, duration: lastRun.duration, steps: lastRun.steps, mode: lastRun.mode, v: 1 };
    Scores.submit(entry).then((r) => {
      openBoard({ list: r.list, note: r.online ? 'Bester Versuch pro Name' : 'Nur auf diesem Handy · Online-Liste noch nicht eingerichtet' });
    }).catch(() => {
      openBoard({ list: Scores.best(Scores.local()), note: 'Offline gespeichert · wird automatisch nachgesendet' });
    });
  });

  // Buttons
  $('mode-tap').addEventListener('click', () => setMode('tap'));
  $('mode-tilt').addEventListener('click', () => setMode('tilt'));
  $('btn-play').addEventListener('click', () => {
    if (mode === 'tilt' && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS: Erlaubnis muss direkt im Tipp angefragt werden
      DeviceOrientationEvent.requestPermission().then((res) => {
        if (res !== 'granted') { setMode('tap'); toast('Neigen wurde nicht erlaubt. Tippen ist aktiv.'); }
        startGame();
      }).catch(() => { setMode('tap'); toast('Neigen nicht verfügbar. Tippen ist aktiv.'); startGame(); });
    } else {
      startGame();
    }
  });
  $('btn-board').addEventListener('click', () => openBoard());
  $('btn-help').addEventListener('click', () => show('scr-help'));
  $('help-close').addEventListener('click', () => show('scr-start'));
  $('ov-again').addEventListener('click', () => startGame());
  $('ov-board').addEventListener('click', () => openBoard());
  $('bd-play').addEventListener('click', () => startGame());
  $('bd-back').addEventListener('click', () => toMenu());

  // Bilder im DOM
  $('ov-sit').src = ART.dataUri('elliSit');
  $('help-elli').src = ART.dataUri('elliFull');
  $('start-elli').src = ART.dataUri('elliFull');
  $('help-tomato').src = ART.dataUri('tomato');
  $('help-ladybug').src = ART.dataUri('ladybug');
  $('help-giraffe').src = ART.dataUri('giraffe');
  $('help-mama').src = ART.dataUri('avMama');

  // ------------------------------------------------------------------
  // Hauptschleife
  // ------------------------------------------------------------------
  let last = performance.now(), acc = 0;
  const STEP = 1 / 120;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    menuT += dt;
    if (state === 'menu' || state === 'over') {
      // Elli wackelt im Menü leicht auf der Stelle
      if (g) { g.theta = Math.sin(menuT * 1.6) * 0.08; }
    } else {
      acc += dt;
      while (acc >= STEP) { update(STEP); acc -= STEP; }
    }
    if (g) {
      camRatio += ((state === 'menu' ? 0.5 : 0.3) - camRatio) * Math.min(1, dt * 2);
      camX = g.x - W * camRatio;
    }
    render();
    if (state === 'play' || state === 'goal' || state === 'fall') updateHud();
    requestAnimationFrame(frame);
  }

  setMode(mode);
  newGame();
  ART.ready().then(() => { Scores.flush(); });
  requestAnimationFrame(frame);

  // Testzugang (für automatische Tests und Feintuning in der Konsole)
  window.__elli = {
    T: T,
    get g() { return g; },
    get state() { return state; },
    tap: tap,
    start: startGame,
    // Spielt ohne Zeichnen im Schnelldurchlauf: controller(g) liefert -1, 0 oder 1
    sim(controller, maxSeconds, reaction) {
      startGame();
      let t = 0, next = 0;
      const rt = reaction || 0.12;
      while ((state === 'play' || state === 'goal') && t < maxSeconds) {
        if (state === 'play' && t >= next) { const d = controller(g); if (d) tap(d); next = t + rt; }
        update(STEP); t += STEP;
        camX = g.x - W * 0.3;
      }
      const res = { score: Math.round(g.score), goals: g.goalsReached, round: g.round, time: Math.round(t), mult: g.mult, cats: g.cats };
      $('banner').hidden = true;
      toMenu();
      return res;
    }
  };
})();
