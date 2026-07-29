/* ═══════════════════════════════════════════════════════════════
   Para Cata 💗 — experiencia
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* Mensajes del jardín */
const GARDEN_MESSAGES = {
  sunflower:
    "Como un girasol, siempre encuentras la luz. Y sin darte cuenta, también se la das a los demás. 🌻",
  lily:
    "Señor, gracias por su vida. Cuídala mientras duerme, renueva sus fuerzas y regálale siempre tu paz. 🤍",
};

/* ── Utilidades ──────────────────────────────────────────────── */

const $ = (sel) => document.querySelector(sel);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (min, max) => min + Math.random() * (max - min);

/* ── Elementos ───────────────────────────────────────────────── */

const intro       = $("#intro");
const openBtn     = $("#open-btn");
const bloom       = $("#bloom");
const experience  = $("#experience");
const heroFrame   = $("#hero-frame");
const heroFigure  = $("#hero-figure");
const heroPhoto   = $("#hero-photo");
const finale      = $("#finale");
const replayBtn   = $("#replay-btn");
const popover     = $("#popover");
const popoverText = $("#popover-text");
const audio       = $("#audio");
const player      = $("#player");

/* ═══════════════════════════════════════════════════════════════
   Motor de pétalos y partículas (un solo canvas, 60 fps)
   ═══════════════════════════════════════════════════════════════ */

const PetalEngine = (() => {
  const canvas = $("#petal-canvas");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const PETAL_COLORS = ["#efd3cc", "#e8c4bb", "#f3e2d0", "#e9d7ae", "#ccd6c5"];
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  let W = 0, H = 0;
  let petals = [];
  let motes = [];
  let bursts = [];
  let ambientTarget = 0;
  let running = false;
  let raf = null;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makePetal(fromTop = false) {
    return {
      x: rand(0, W),
      y: fromTop ? rand(-40, -10) : rand(0, H),
      size: rand(5, 11),
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      vy: rand(0.25, 0.7),
      drift: rand(0.2, 0.9),
      phase: rand(0, Math.PI * 2),
      spin: rand(-0.01, 0.01),
      angle: rand(0, Math.PI * 2),
      alpha: rand(0.5, 0.9),
    };
  }

  function makeMote() {
    return {
      x: rand(0, W),
      y: rand(0, H),
      r: rand(0.6, 1.8),
      vy: rand(-0.12, -0.03),
      vx: rand(-0.05, 0.05),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.12, 0.4),
    };
  }

  function makeBurstPetal(cx, cy) {
    const a = rand(0, Math.PI * 2);
    const speed = rand(1.5, 6.5);
    return {
      x: cx, y: cy,
      size: rand(5, 12),
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - rand(1, 3),
      phase: rand(0, Math.PI * 2),
      spin: rand(-0.06, 0.06),
      angle: rand(0, Math.PI * 2),
      life: 1,
      decay: rand(0.004, 0.008),
    };
  }

  function drawPetal(p, alpha) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    // forma de pétalo: dos curvas bézier
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.5, p.size * 0.7, p.size * 0.6, 0, p.size);
    ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.6, -p.size * 0.9, -p.size * 0.5, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  let t = 0;

  function frame() {
    if (!running) return;
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    // ajustar población ambiente suavemente
    if (petals.length < ambientTarget && Math.random() < 0.1) petals.push(makePetal(true));
    if (petals.length > ambientTarget) petals.splice(ambientTarget);

    // pétalos ambiente
    for (const p of petals) {
      p.phase += 0.012;
      p.x += Math.sin(p.phase) * p.drift;
      p.y += p.vy;
      p.angle += p.spin + Math.sin(p.phase) * 0.006;
      if (p.y > H + 30) { Object.assign(p, makePetal(true)); }
      drawPetal(p, p.alpha * 0.85);
    }

    // motas de luz doradas
    for (const m of motes) {
      m.phase += 0.02;
      m.x += m.vx;
      m.y += m.vy;
      if (m.y < -10) { m.y = H + 10; m.x = rand(0, W); }
      const a = m.alpha * (0.6 + 0.4 * Math.sin(m.phase));
      ctx.globalAlpha = a;
      ctx.fillStyle = "#d9bd85";
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ráfagas
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      p.phase += 0.02;
      p.vy += 0.05;           // gravedad suave
      p.vx *= 0.985;
      p.vy *= 0.992;
      p.x += p.vx + Math.sin(p.phase) * 0.4;
      p.y += p.vy;
      p.angle += p.spin;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > H + 40) { bursts.splice(i, 1); continue; }
      drawPetal(p, Math.min(1, p.life * 1.6) * 0.9);
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reducedMotion || running) return;
    running = true;
    resize();
    ambientTarget = isMobile ? 12 : 20;
    if (!motes.length) {
      const n = isMobile ? 14 : 24;
      for (let i = 0; i < n; i++) motes.push(makeMote());
    }
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  function burst(cx = W / 2, cy = H / 2, count = 60) {
    if (reducedMotion) return;
    for (let i = 0; i < count; i++) bursts.push(makeBurstPetal(cx, cy));
  }

  /* lluvia desde arriba (triple clic en la foto) */
  function rain(count = 70) {
    if (reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const p = makeBurstPetal(rand(0, W), rand(-H * 0.25, -10));
      p.vx = rand(-0.6, 0.6);
      p.vy = rand(0.8, 2.6);
      p.decay = rand(0.002, 0.004);
      bursts.push(p);
    }
  }

  function setFinale(on) {
    ambientTarget = on ? (isMobile ? 26 : 44) : (isMobile ? 12 : 20);
  }

  window.addEventListener("resize", () => { if (running) resize(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (experience && !experience.hidden) start();
  });

  return { start, burst, rain, setFinale };
})();

/* ═══════════════════════════════════════════════════════════════
   Reproductor personalizado
   ═══════════════════════════════════════════════════════════════ */

const Player = (() => {
  const toggle   = $("#player-toggle");
  const track    = $("#player-track");
  const fill     = $("#player-fill");
  const thumb    = $("#player-thumb");
  const tCurrent = $("#time-current");
  const tTotal   = $("#time-total");
  const vizBars  = [...document.querySelectorAll("#player-viz i")];

  let analyser = null;
  let vizRaf = null;
  let scrubbing = false;

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  function setupAnalyser() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error("no AudioContext");
      const ctx = new AC();
      const src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      if (ctx.state === "suspended") ctx.resume();
    } catch {
      analyser = null;
      player.classList.add("no-analyser");
    }
  }

  const vizData = new Uint8Array(32);
  const BAR_BINS = [2, 5, 9, 14, 20]; // graves → agudos

  function vizFrame() {
    if (!analyser || audio.paused) return;
    analyser.getByteFrequencyData(vizData);
    vizBars.forEach((bar, i) => {
      const v = vizData[BAR_BINS[i]] / 255;
      bar.style.transform = `scaleY(${Math.max(0.12, v * v * 1.05).toFixed(3)})`;
    });
    vizRaf = requestAnimationFrame(vizFrame);
  }

  function updateProgress() {
    if (scrubbing || !audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    fill.style.width = `${pct}%`;
    thumb.style.left = `${pct}%`;
    tCurrent.textContent = fmt(audio.currentTime);
    track.setAttribute("aria-valuenow", Math.round(pct));
  }

  function seekFromEvent(e) {
    const rect = track.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    fill.style.width = `${ratio * 100}%`;
    thumb.style.left = `${ratio * 100}%`;
    tCurrent.textContent = fmt(ratio * (audio.duration || 0));
    return ratio;
  }

  /* eventos */

  toggle.addEventListener("click", () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });

  audio.addEventListener("play", () => {
    player.classList.add("is-playing");
    toggle.setAttribute("aria-label", "Pausar la música");
    if (analyser) vizRaf = requestAnimationFrame(vizFrame);
  });

  audio.addEventListener("pause", () => {
    player.classList.remove("is-playing");
    toggle.setAttribute("aria-label", "Reproducir la música");
    if (vizRaf) cancelAnimationFrame(vizRaf);
    vizBars.forEach((b) => (b.style.transform = "scaleY(0.15)"));
  });

  const showDuration = () => {
    if (isFinite(audio.duration) && audio.duration > 0) tTotal.textContent = fmt(audio.duration);
  };

  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", showDuration);
  audio.addEventListener("durationchange", showDuration);
  audio.addEventListener("ended", () => { audio.currentTime = 0; audio.play(); }); // bucle suave

  track.addEventListener("pointerdown", (e) => {
    scrubbing = true;
    track.classList.add("is-scrubbing");
    track.setPointerCapture(e.pointerId);
    seekFromEvent(e);
  });

  track.addEventListener("pointermove", (e) => { if (scrubbing) seekFromEvent(e); });

  track.addEventListener("pointerup", (e) => {
    if (!scrubbing) return;
    scrubbing = false;
    track.classList.remove("is-scrubbing");
    audio.currentTime = seekFromEvent(e) * (audio.duration || 0);
  });

  track.addEventListener("keydown", (e) => {
    if (!audio.duration) return;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    if (e.key === "ArrowLeft")  audio.currentTime = Math.max(0, audio.currentTime - 5);
  });

  function begin() {
    setupAnalyser();
    showDuration();
    audio.volume = 1;
    const p = audio.play();
    if (p) p.catch(() => {/* si el navegador lo bloquea, queda listo el botón */});
    player.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => player.classList.add("is-in")));
  }

  return { begin };
})();

/* ═══════════════════════════════════════════════════════════════
   ESCENA 1 → apertura
   ═══════════════════════════════════════════════════════════════ */

let opened = false;

openBtn.addEventListener("click", () => {
  if (opened) return;
  opened = true;

  bloom.classList.add("is-active");
  PetalEngine.start();
  PetalEngine.burst(window.innerWidth / 2, window.innerHeight / 2, 70);
  Player.begin();

  intro.classList.add("is-leaving");
  experience.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => experience.classList.add("is-open")));

  setTimeout(() => { intro.remove(); }, 2000);
  initReveals();
});

/* ═══════════════════════════════════════════════════════════════
   Scroll reveal (con escalonado por grupo)
   ═══════════════════════════════════════════════════════════════ */

function initReveals() {
  document.querySelectorAll(".reveal-group").forEach((group) => {
    group.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.setProperty("--d", `${Math.min(i * 0.12, 0.6)}s`);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   ESCENA 2 · Hero: parallax + tilt + fallback de imagen
   ═══════════════════════════════════════════════════════════════ */

(function heroDepth() {
  if (reducedMotion) return;

  let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
  let scrollY = 0;
  let ticking = false;

  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer) {
    window.addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetRY = nx * 6;
      targetRX = -ny * 5;
    });
  }

  function apply() {
    ticking = false;
    curRX += (targetRX - curRX) * 0.06;
    curRY += (targetRY - curRY) * 0.06;
    const rect = heroFigure.getBoundingClientRect();
    const par = rect.top * -0.06; // parallax sutil al hacer scroll
    heroFrame.style.transform =
      `translateY(${par.toFixed(1)}px) rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg)`;
    if (Math.abs(targetRX - curRX) > 0.01 || Math.abs(targetRY - curRY) > 0.01 || finePointer) {
      requestAnimationFrame(apply);
    }
  }

  function kick() {
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
  }

  window.addEventListener("scroll", kick, { passive: true });
  if (finePointer) requestAnimationFrame(apply);
})();

/* fallback elegante si la foto aún no está en assets/images/cata.jpg */
(function photoFallback() {
  const activate = () => {
    heroFrame.classList.add("is-fallback");
    document.querySelector(".finale__photo-wrap").classList.add("is-fallback");
  };
  // el error pudo dispararse antes de que este script cargara
  if (heroPhoto.complete && heroPhoto.naturalWidth === 0) activate();
  else heroPhoto.addEventListener("error", activate);
})();

/* ═══════════════════════════════════════════════════════════════
   ESCENA 4 · Jardín interactivo
   ═══════════════════════════════════════════════════════════════ */

let popoverTimer = null;

function showPopover(text) {
  popoverText.textContent = text;
  popover.hidden = false;
  requestAnimationFrame(() => popover.classList.add("is-visible"));
  clearTimeout(popoverTimer);
  popoverTimer = setTimeout(hidePopover, 5200);
}

function hidePopover() {
  popover.classList.remove("is-visible");
  clearTimeout(popoverTimer);
  popoverTimer = setTimeout(() => { popover.hidden = true; }, 650);
}

document.addEventListener("pointerdown", (e) => {
  if (popover.classList.contains("is-visible") && !popover.contains(e.target) && !e.target.closest(".flower")) {
    hidePopover();
  }
});

function floatHearts(x, y) {
  for (let i = 0; i < 7; i++) {
    const h = document.createElement("span");
    h.className = "float-heart";
    h.textContent = ["💗", "🤍", "💗", "🩷"][i % 4];
    h.style.left = `${x + rand(-36, 36)}px`;
    h.style.top = `${y + rand(-8, 8)}px`;
    h.style.setProperty("--r", `${rand(-18, 18)}deg`);
    h.style.animationDelay = `${i * 0.12}s`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 3400);
  }
}

document.querySelectorAll(".flower").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    btn.classList.remove("is-pulsing");
    void btn.offsetWidth; // reinicia la animación
    btn.classList.add("is-pulsing");

    const kind = btn.dataset.flower;
    const rect = btn.getBoundingClientRect();

    if (kind === "tulip") {
      hidePopover();
      floatHearts(rect.left + rect.width / 2, rect.top);
    } else {
      showPopover(GARDEN_MESSAGES[kind]);
    }
  });
});

/* triple clic/tap en la fotografía → lluvia de pétalos */
(function tripleTap() {
  let taps = 0;
  let timer = null;
  heroFrame.addEventListener("click", () => {
    taps++;
    clearTimeout(timer);
    if (taps >= 3) {
      taps = 0;
      PetalEngine.rain(80);
    } else {
      timer = setTimeout(() => (taps = 0), 700);
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   FINAL — la luz cambia, las flores rodean, silencio visual
   ═══════════════════════════════════════════════════════════════ */

(function finaleSequence() {
  let played = false;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || played) continue;
        played = true;
        io.disconnect();

        document.body.classList.add("is-finale");
        PetalEngine.setFinale(true);
        finale.classList.add("is-live");          // aparece el mensaje

        setTimeout(() => {
          finale.classList.add("is-quiet");       // silencio visual: solo la foto
        }, 6000);

        setTimeout(() => {
          replayBtn.hidden = false;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => replayBtn.classList.add("is-in"))
          );
        }, 10500);
      }
    },
    { threshold: 0.45 }
  );

  io.observe(finale);

  replayBtn.addEventListener("click", () => {
    document.body.classList.remove("is-finale");
    PetalEngine.setFinale(false);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
})();
