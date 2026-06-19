"use strict";

/*
  Art-Zac Desing & Iron Work Welding
  Main JavaScript
  Architecture: single app.js file compiled by Gulp
*/

/* =========================================================
   Mobile Navigation
========================================================= */
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll("[data-nav-link]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("nav-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
      document.body.classList.remove("nav-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("nav-open");
  });
}

/* =========================================================
   Active Navigation Link
========================================================= */
(function setActiveNavigationLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) {
      return;
    }

    const normalizedHref = href.split("/").pop();

    const isHome =
      currentPath === "" &&
      (normalizedHref === "index.html" || normalizedHref === "");

    const isActive = normalizedHref === currentPath || isHome;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
})();

/* =========================================================
   Header Scroll State
========================================================= */
(function initHeaderScrollState() {
  const header = document.querySelector("[data-header]");

  if (!header) {
    return;
  }

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, { passive: true });
})();

/* =========================================================
   Home Weld Hero - Premium Sparks
========================================================= */
(function initHomeWeldHeroSparks() {
  const hero = document.querySelector("[data-weld-hero]");
  const scene = hero?.querySelector("[data-weld-scene]");
  const canvas = hero?.querySelector("[data-weld-sparks]");
  const glow = hero?.querySelector(".home-weld-hero__glow");

  if (!hero || !scene || !canvas) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    return;
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let particles = [];
  let arcStreaks = [];
  let rafId = null;
  let lastTime = 0;
  let elapsed = 0;
  let isVisible = true;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;
  let pointerInside = false;

  const sparkBase = {
    x: Number(scene.dataset.sparkX || 0.5),
    y: Number(scene.dataset.sparkY || 0.89)
  };

  function isMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function resizeCanvas() {
    const rect = scene.getBoundingClientRect();

    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.35 : 1.75);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getOrigin() {
    /*
      Simulación de mano/antorcha:
      el punto de soldadura se mueve poco, como si estuviera trabajando.
    */
    const sweep = Math.sin(elapsed * 1.8) * 0.015;
    const micro = Math.sin(elapsed * 9.5) * 0.004;
    const jitter = Math.sin(elapsed * 21.0) * 0.002;

    return {
      x: width * (sparkBase.x + sweep + micro),
      y: height * (sparkBase.y + Math.sin(elapsed * 2.4) * 0.004 + jitter)
    };
  }

  function syncCssOrigin() {
    const origin = getOrigin();
    const x = (origin.x / width) * 100;
    const y = (origin.y / height) * 100;

    scene.style.setProperty("--spark-x", `${x}%`);
    scene.style.setProperty("--spark-y", `${y}%`);

    if (glow) {
      glow.style.left = `${x}%`;
      glow.style.top = `${y}%`;
    }
  }


function handlePointerMove(event) {
  const rect = scene.getBoundingClientRect();

  const insideScene =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!insideScene) {
    pointerTargetX = 0;
    pointerTargetY = 0;
    pointerInside = false;
    return;
  }

  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

  pointerTargetX = Math.max(-1, Math.min(1, x));
  pointerTargetY = Math.max(-1, Math.min(1, y));
  pointerInside = true;
}


function handlePointerLeave() {
  pointerTargetX = 0;
  pointerTargetY = 0;
  pointerInside = false;
}

function updateParallax(delta) {
  const ease = Math.min(1, delta * 6.5);

  pointerCurrentX += (pointerTargetX - pointerCurrentX) * ease;
  pointerCurrentY += (pointerTargetY - pointerCurrentY) * ease;

  const rotateY = pointerCurrentX * 5.5;
  const rotateX = pointerCurrentY * -4.5;
  const moveX = pointerCurrentX * 10;
  const moveY = pointerCurrentY * 8;

  scene.style.transform = `
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    translate3d(${moveX * 0.25}px, ${moveY * 0.2}px, 0)
  `;

  scene.style.boxShadow = pointerInside
  ? `0 34px 100px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
  : `0 26px 80px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.04)`;

  const sweep = hero.querySelector(".home-weld-hero__metal-sweep");
const heat = hero.querySelector(".home-weld-hero__heat");
const smokeCanvas = hero.querySelector("[data-weld-smoke]");

if (sweep) {
  sweep.style.transform = `
    translateX(${pointerCurrentX * 10 - 35}%)
    translateY(${pointerCurrentY * 8}px)
    skewX(-18deg)
  `;
}

if (heat) {
  heat.style.transform = `
    translate(calc(-50% + ${pointerCurrentX * 8}px), calc(-50% + ${pointerCurrentY * 6}px))
    scale(${1 + Math.abs(pointerCurrentX) * 0.025})
  `;
}

if (smokeCanvas) {
  smokeCanvas.style.transform = `
    translate3d(${pointerCurrentX * 7}px, ${pointerCurrentY * 5}px, 0)
  `;
}
}

  function createSpark() {
    const origin = getOrigin();

    const direction = Math.random();

    /*
      65% de chispas salen hacia derecha,
      25% caen hacia abajo,
      10% saltan hacia cámara/arriba.
    */
    let angle;

    if (direction < 0.65) {
      angle = (-0.36 + Math.random() * 0.72);
    } else if (direction < 0.9) {
      angle = (0.35 + Math.random() * 0.75);
    } else {
      angle = (-1.1 + Math.random() * 0.6);
    }

    const speed = isMobile()
      ? 160 + Math.random() * 360
      : 220 + Math.random() * 620;

    const longTrail = Math.random() > 0.78;
    const blueSpark = Math.random() > 0.82;

    return {
      x: origin.x + (Math.random() - 0.5) * 10,
      y: origin.y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 340 + Math.random() * 520,
      drag: 0.986 + Math.random() * 0.008,
      life: 0,
      maxLife: longTrail ? 0.72 + Math.random() * 0.5 : 0.34 + Math.random() * 0.36,
      size: longTrail ? 1.25 + Math.random() * 2.6 : 0.8 + Math.random() * 1.8,
      trailLength: longTrail ? 9 : 5,
      blueSpark,
      trail: []
    };
  }

  function createArcStreak() {
    const origin = getOrigin();
    const length = isMobile()
      ? 44 + Math.random() * 90
      : 70 + Math.random() * 150;

    const angle = -0.08 + Math.random() * 0.45;

    return {
      x1: origin.x + (Math.random() - 0.5) * 8,
      y1: origin.y + (Math.random() - 0.5) * 8,
      x2: origin.x + Math.cos(angle) * length,
      y2: origin.y + Math.sin(angle) * length,
      life: 0,
      maxLife: 0.06 + Math.random() * 0.12,
      width: 0.8 + Math.random() * 1.6
    };
  }

  function emitSparks() {
    const maxParticles = isMobile() ? 150 : 260;
    const baseAmount = isMobile() ? 5 : 8;
    const burstAmount = Math.random() > 0.72 ? (isMobile() ? 8 : 14) : 0;

    for (let i = 0; i < baseAmount + burstAmount; i += 1) {
      if (particles.length >= maxParticles) {
        particles.shift();
      }

      particles.push(createSpark());
    }

    if (Math.random() > 0.52) {
      const maxStreaks = isMobile() ? 20 : 34;

      if (arcStreaks.length >= maxStreaks) {
        arcStreaks.shift();
      }

      arcStreaks.push(createArcStreak());
    }
  }

  function drawCoreFlash() {
    const origin = getOrigin();
    const pulse = 0.72 + Math.sin(elapsed * 18) * 0.08 + Math.random() * 0.08;
    const radius = isMobile() ? 50 : 72;

    const gradient = ctx.createRadialGradient(
      origin.x,
      origin.y,
      0,
      origin.x,
      origin.y,
      radius * pulse
    );

    gradient.addColorStop(0, "rgba(255,255,255,0.88)");
    gradient.addColorStop(0.14, "rgba(255,236,190,0.72)");
    gradient.addColorStop(0.34, "rgba(80,175,255,0.36)");
    gradient.addColorStop(0.68, "rgba(80,175,255,0.1)");
    gradient.addColorStop(1, "rgba(80,175,255,0)");

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function updateAndDrawSparks(delta) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    particles = particles.filter((particle) => {
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        return false;
      }

      particle.trail.push({
        x: particle.x,
        y: particle.y
      });

      if (particle.trail.length > particle.trailLength) {
        particle.trail.shift();
      }

      particle.vy += particle.gravity * delta;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;

      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;

      const progress = particle.life / particle.maxLife;
      const alpha = Math.max(0, 1 - progress);
      const glowAlpha = alpha * alpha;

      const coreColor = particle.blueSpark
        ? `rgba(185, 230, 255, ${alpha})`
        : `rgba(255, ${Math.floor(170 + Math.random() * 55)}, 72, ${alpha})`;

      const trailColor = particle.blueSpark
        ? `rgba(75, 170, 255, ${glowAlpha * 0.32})`
        : `rgba(255, 110, 34, ${glowAlpha * 0.38})`;

      if (particle.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);

        for (let i = 1; i < particle.trail.length; i += 1) {
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }

        ctx.lineTo(particle.x, particle.y);
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = Math.max(0.45, particle.size * alpha);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = coreColor;
      ctx.arc(particle.x, particle.y, Math.max(0.45, particle.size * alpha), 0, Math.PI * 2);
      ctx.fill();

      return (
        particle.x > -80 &&
        particle.x < width + 120 &&
        particle.y > -100 &&
        particle.y < height + 120
      );
    });

    ctx.restore();
  }

  function updateAndDrawArcStreaks(delta) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    arcStreaks = arcStreaks.filter((streak) => {
      streak.life += delta;

      if (streak.life >= streak.maxLife) {
        return false;
      }

      const alpha = 1 - streak.life / streak.maxLife;

      const gradient = ctx.createLinearGradient(streak.x1, streak.y1, streak.x2, streak.y2);
      gradient.addColorStop(0, `rgba(255,255,255,${alpha * 0.86})`);
      gradient.addColorStop(0.28, `rgba(255,220,150,${alpha * 0.58})`);
      gradient.addColorStop(1, `rgba(255,110,35,0)`);

      ctx.beginPath();
      ctx.moveTo(streak.x1, streak.y1);
      ctx.lineTo(streak.x2, streak.y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = streak.width;
      ctx.stroke();

      return true;
    });

    ctx.restore();
  }

function animateArt() {
  const art = hero.querySelector(".home-weld-hero__art");

  if (!art) {
    return;
  }

  const bodyMoveX = Math.sin(elapsed * 1.15) * 1.8;
  const bodyMoveY = Math.sin(elapsed * 1.75) * 1.2;
  const bodyRotate = Math.sin(elapsed * 1.25) * 0.32;

  const parallaxX = pointerCurrentX * 16;
  const parallaxY = pointerCurrentY * 10;
  const parallaxRotateY = pointerCurrentX * 2.4;
  const parallaxRotateX = pointerCurrentY * -1.6;

  art.style.transform = `
    translate3d(${bodyMoveX + parallaxX}px, ${bodyMoveY + parallaxY}px, 24px)
    rotateZ(${bodyRotate}deg)
    rotateY(${parallaxRotateY}deg)
    rotateX(${parallaxRotateX}deg)
    scale(1.035)
  `;
}


  function render(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }

    const delta = Math.min(0.033, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    elapsed += delta;

      if (isVisible) {
      ctx.clearRect(0, 0, width, height);

      syncCssOrigin();
      updateParallax(delta);
      animateArt();
      emitSparks();
      drawCoreFlash();
      updateAndDrawArcStreaks(delta);
      updateAndDrawSparks(delta);
    }

    rafId = window.requestAnimationFrame(render);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    },
    {
      threshold: 0.08
    }
  );

    observer.observe(hero);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    hero.addEventListener("mousemove", handlePointerMove);
    hero.addEventListener("mouseleave", handlePointerLeave);

    rafId = window.requestAnimationFrame(render);

  window.addEventListener("beforeunload", () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  });
})();


/* =========================================================
   Home Weld Hero - Back Sparks Depth Layer
========================================================= */
(function initHomeWeldHeroBackSparks() {
  const hero = document.querySelector("[data-weld-hero]");
  const scene = hero?.querySelector("[data-weld-scene]");
  const canvas = hero?.querySelector("[data-weld-sparks-back]");

  if (!hero || !scene || !canvas) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    return;
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let particles = [];
  let rafId = null;
  let lastTime = 0;
  let elapsed = 0;
  let isVisible = true;

  const sparkBase = {
    x: Number(scene.dataset.sparkX || 0.5),
    y: Number(scene.dataset.sparkY || 0.89)
  };

  function isMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function resizeCanvas() {
    const rect = scene.getBoundingClientRect();

    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.25 : 1.5);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getOrigin() {
    const sweep = Math.sin(elapsed * 1.8) * 0.012;
    const micro = Math.sin(elapsed * 9.5) * 0.003;

    return {
      x: width * (sparkBase.x + sweep + micro),
      y: height * (sparkBase.y + Math.sin(elapsed * 2.4) * 0.003)
    };
  }

  function createParticle() {
    const origin = getOrigin();
    const angle = -2.4 + Math.random() * 1.8;
    const speed = isMobile() ? 70 + Math.random() * 150 : 90 + Math.random() * 220;

    return {
      x: origin.x + (Math.random() - 0.5) * 18,
      y: origin.y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 120 + Math.random() * 160,
      life: 0,
      maxLife: 0.55 + Math.random() * 0.6,
      size: 0.55 + Math.random() * 1.2,
      trail: []
    };
  }

  function emit() {
    const maxParticles = isMobile() ? 45 : 80;
    const amount = isMobile() ? 1 : 2;

    for (let i = 0; i < amount; i += 1) {
      if (particles.length >= maxParticles) {
        particles.shift();
      }

      particles.push(createParticle());
    }
  }

  function draw(delta) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    particles = particles.filter((particle) => {
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        return false;
      }

      particle.trail.push({ x: particle.x, y: particle.y });

      if (particle.trail.length > 4) {
        particle.trail.shift();
      }

      particle.vy += particle.gravity * delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;

      const alpha = 1 - particle.life / particle.maxLife;

      if (particle.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);

        for (let i = 1; i < particle.trail.length; i += 1) {
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }

        ctx.strokeStyle = `rgba(255, 130, 40, ${alpha * 0.22})`;
        ctx.lineWidth = Math.max(0.35, particle.size * alpha);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 178, 72, ${alpha * 0.42})`;
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();

      return true;
    });

    ctx.restore();
  }

  function render(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }

    const delta = Math.min(0.033, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    elapsed += delta;

    if (isVisible) {
      ctx.clearRect(0, 0, width, height);
      emit();
      draw(delta);
    }

    rafId = window.requestAnimationFrame(render);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    },
    { threshold: 0.08 }
  );

  observer.observe(hero);

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  rafId = window.requestAnimationFrame(render);

  window.addEventListener("beforeunload", () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  });
})();

/* =========================================================
   Home Weld Hero - Premium Smoke
========================================================= */
/* =========================================================
   Home Weld Hero - Visible White Smoke
========================================================= */
(function initHomeWeldHeroSmoke() {
  const hero = document.querySelector("[data-weld-hero]");
  const scene = hero?.querySelector("[data-weld-scene]");
  const canvas = hero?.querySelector("[data-weld-smoke]");

  if (!hero || !scene || !canvas) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    return;
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let particles = [];
  let rafId = null;
  let lastTime = 0;
  let elapsed = 0;
  let isVisible = true;

  const sparkBase = {
    x: Number(scene.dataset.sparkX || 0.5),
    y: Number(scene.dataset.sparkY || 0.89)
  };

  function isMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function resizeCanvas() {
    const rect = scene.getBoundingClientRect();

    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.35 : 1.75);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getOrigin() {
    const sweep = Math.sin(elapsed * 1.8) * 0.014;
    const micro = Math.sin(elapsed * 9.5) * 0.004;
    const jitter = Math.sin(elapsed * 21.0) * 0.002;

    return {
      x: width * (sparkBase.x + sweep + micro),
      y: height * (sparkBase.y + Math.sin(elapsed * 2.4) * 0.004 + jitter)
    };
  }


  function createSmokeParticle() {
  const origin = getOrigin();
  const baseSize = isMobile() ? 64 : 92;

  return {
    x: origin.x + (Math.random() - 0.5) * 52,
    y: origin.y - (26 + Math.random() * 34), // nace más arriba
    vx: (Math.random() - 0.5) * 12,
    vy: -(16 + Math.random() * 28),
    size: baseSize + Math.random() * baseSize * 0.75,
    life: 0,
    maxLife: 2.5 + Math.random() * 1.6,
    alpha: isMobile()
      ? 0.14 + Math.random() * 0.10
      : 0.16 + Math.random() * 0.12,
    swirl: Math.random() * Math.PI * 2,
    swirlSpeed: 0.65 + Math.random() * 1.05,
    grow: 18 + Math.random() * 16
  };
}


function emitSmoke() {
  const maxParticles = isMobile() ? 30 : 52;
  const amount = isMobile() ? 1 : 2;

  for (let i = 0; i < amount; i += 1) {
    if (particles.length >= maxParticles) {
      particles.shift();
    }

    particles.push(createSmokeParticle());
  }
}


function drawSmokeParticle(particle, delta) {
  particle.life += delta;

  if (particle.life >= particle.maxLife) {
    return false;
  }

  const progress = particle.life / particle.maxLife;
  const fadeIn = Math.min(1, progress / 0.2);
  const fadeOut = Math.pow(1 - progress, 0.9);
  const alpha = particle.alpha * fadeIn * fadeOut;

  particle.swirl += particle.swirlSpeed * delta;
  particle.x += particle.vx * delta + Math.sin(particle.swirl) * 12 * delta;
  particle.y += particle.vy * delta;
  particle.size += particle.grow * delta;

  const gradient = ctx.createRadialGradient(
    particle.x,
    particle.y,
    0,
    particle.x,
    particle.y,
    particle.size
  );

  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.78})`);
  gradient.addColorStop(0.22, `rgba(245, 248, 250, ${alpha * 0.56})`);
  gradient.addColorStop(0.48, `rgba(220, 228, 235, ${alpha * 0.28})`);
  gradient.addColorStop(0.72, `rgba(190, 200, 210, ${alpha * 0.12})`);
  gradient.addColorStop(1, "rgba(190, 200, 210, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return true;
}



function drawWhiteMist() {
  const origin = getOrigin();
  const radius = isMobile() ? 110 : 160;

  const gradient = ctx.createRadialGradient(
    origin.x,
    origin.y - radius * 0.28,
    0,
    origin.x,
    origin.y - radius * 0.28,
    radius
  );

  gradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  gradient.addColorStop(0.26, "rgba(245, 248, 250, 0.05)");
  gradient.addColorStop(0.54, "rgba(220, 230, 238, 0.025)");
  gradient.addColorStop(1, "rgba(220, 230, 238, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y - radius * 0.28, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}


  function clearSparkArea() {
  const origin = getOrigin();
  const radius = isMobile() ? 58 : 82;

  const gradient = ctx.createRadialGradient(
    origin.x,
    origin.y,
    0,
    origin.x,
    origin.y,
    radius
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 0.98)");
  gradient.addColorStop(0.34, "rgba(0, 0, 0, 0.72)");
  gradient.addColorStop(0.62, "rgba(0, 0, 0, 0.28)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

  function render(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }

    const delta = Math.min(0.033, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    elapsed += delta;

if (isVisible) {
  ctx.clearRect(0, 0, width, height);

  emitSmoke();
  drawWhiteMist();

  particles = particles.filter((particle) => {
    return drawSmokeParticle(particle, delta);
  });

  clearSparkArea();
}

    rafId = window.requestAnimationFrame(render);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    },
    {
      threshold: 0.08
    }
  );

  observer.observe(hero);

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  rafId = window.requestAnimationFrame(render);

  window.addEventListener("beforeunload", () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  });
})();



/* =========================================================
   Reveal Animations
========================================================= */
/* =========================================================
   Reveal Animations
========================================================= */
(function initRevealAnimations() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  const revealGroups = document.querySelectorAll("[data-reveal-group]");

  const elements = [...revealItems, ...revealGroups];

  if (!elements.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
})();


/* =========================================================
   Premium Card Light Follow
========================================================= */
(function initPremiumCardLightFollow() {
  const cards = document.querySelectorAll(
    ".service-card, .value-card, .project-card, .capability-card, .process-card, .contact-card, .info-card"
  );

  if (!cards.length) {
    return;
  }

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--card-x", `${x}%`);
      card.style.setProperty("--card-y", `${y}%`);
    });
  });
})();

/* =========================================================
   Premium Tilt Cards
========================================================= */
(function initTiltCards() {
  const cards = document.querySelectorAll("[data-tilt-card]");

  if (!cards.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (prefersReducedMotion || !supportsFinePointer) {
    return;
  }

  cards.forEach((card) => {
    const maxTilt = 5;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateY = ((x / rect.width) - 0.5) * maxTilt * 2;
      const rotateX = (((y / rect.height) - 0.5) * maxTilt * -2);

      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });

    card.addEventListener("blur", () => {
      card.style.transform = "";
    });
  });
})();

/* =========================================================
   Smooth Anchor Scroll
========================================================= */
(function initSmoothAnchors() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  if (!anchorLinks.length) {
    return;
  }

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId) {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      const header = document.querySelector("[data-header]");
      const headerOffset = header ? header.offsetHeight + 20 : 20;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    });
  });
})();

/* =========================================================
   Google Translate
========================================================= */
window.googleTranslateElementInit = function googleTranslateElementInit() {
  const translateContainer = document.getElementById("google_translate_element");

  if (!translateContainer || !window.google || !window.google.translate) {
    return;
  }

  new window.google.translate.TranslateElement(
    {
      pageLanguage: "es",
      includedLanguages: "es,en",
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    },
    "google_translate_element"
  );
};

(function initLanguageSwitcher() {
  const languageButtons = document.querySelectorAll("[data-language-option]");

  if (!languageButtons.length) {
    return;
  }

  const DEFAULT_LANGUAGE = "es";
  const BASE_LANGUAGE = "es";

  function getRootDomain(hostname) {
    const parts = hostname.split(".").filter(Boolean);

    if (parts.length <= 2) {
      return hostname;
    }

    return `.${parts.slice(-2).join(".")}`;
  }

  function setTranslateCookie(language) {
    const value = `/${BASE_LANGUAGE}/${language}`;
    const hostname = window.location.hostname;
    const rootDomain = getRootDomain(hostname);

    document.cookie = `googtrans=${value}; path=/`;

    if (hostname && hostname !== "localhost") {
      document.cookie = `googtrans=${value}; path=/; domain=${hostname}`;
      document.cookie = `googtrans=${value}; path=/; domain=.${hostname}`;
      document.cookie = `googtrans=${value}; path=/; domain=${rootDomain}`;
    }
  }

  function deleteTranslateCookie() {
    const hostname = window.location.hostname;
    const rootDomain = getRootDomain(hostname);

    const expires = "Thu, 01 Jan 1970 00:00:00 GMT";

    const cookieVariants = [
      "googtrans=; path=/",
      `googtrans=; path=/; domain=${hostname}`,
      `googtrans=; path=/; domain=.${hostname}`,
      `googtrans=; path=/; domain=${rootDomain}`
    ];

    cookieVariants.forEach((cookie) => {
      document.cookie = `${cookie}; expires=${expires}`;
      document.cookie = `${cookie}; max-age=0`;
    });

    try {
      window.localStorage.removeItem("googtrans");
      window.sessionStorage.removeItem("googtrans");
    } catch (error) {
      // Storage may be unavailable in some browsers.
    }
  }

  function getCurrentLanguage() {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);

    if (match && match[1]) {
      return match[1];
    }

    return DEFAULT_LANGUAGE;
  }

  function setActiveLanguage(language) {
    languageButtons.forEach((button) => {
      const isActive = button.dataset.languageOption === language;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function reloadCleanPage() {
    const url = new URL(window.location.href);

    url.searchParams.delete("googtrans");
    url.hash = "";

    window.location.replace(url.toString());
  }

  function changeLanguage(language) {
    if (!language) {
      return;
    }

    if (language === DEFAULT_LANGUAGE) {
      deleteTranslateCookie();
      setActiveLanguage(DEFAULT_LANGUAGE);
      reloadCleanPage();
      return;
    }

    if (language === getCurrentLanguage()) {
      setActiveLanguage(language);
      return;
    }

    setTranslateCookie(language);
    setActiveLanguage(language);
    window.location.reload();
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.languageOption);
    });
  });

  setActiveLanguage(getCurrentLanguage());
})();

/* =========================================================
   Contact Form
========================================================= */
(function initArtZacContactForm() {
  const form = document.querySelector("#artZacContactForm");

  if (!form) {
    return;
  }

  const endpoint = form.dataset.endpoint || "";

  const fields = {
    website: form.querySelector("#website"),
    name: form.querySelector("#name"),
    phone: form.querySelector("#phone"),
    email: form.querySelector("#email"),
    service: form.querySelector("#service"),
    projectType: form.querySelector("#projectType"),
    location: form.querySelector("#location"),
    message: form.querySelector("#message"),
    consent: form.querySelector("#consent")
  };

  const submitButton = form.querySelector(".contact-form__submit");

  const showAlert = (options) => {
    if (window.Swal) {
      window.Swal.fire(options);
      return;
    }

    alert(options.text || options.title || "Mensaje del formulario");
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? "Enviando solicitud..."
      : "Enviar solicitud";
  };

  const setError = (fieldName, message) => {
    const field = fields[fieldName];
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !error) {
      return;
    }

    field.classList.add("is-invalid");
    error.textContent = message;
  };

  const clearError = (fieldName) => {
    const field = fields[fieldName];
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !error) {
      return;
    }

    field.classList.remove("is-invalid");
    error.textContent = "";
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7;
  };

  const validateForm = () => {
    let isValid = true;

    [
      "name",
      "phone",
      "email",
      "service",
      "projectType",
      "location",
      "message",
      "consent"
    ].forEach(clearError);

    if (fields.website && fields.website.value.trim()) {
      return false;
    }

    if (fields.name && !fields.name.value.trim()) {
      setError("name", "Ingrese su nombre completo.");
      isValid = false;
    }

    if (fields.phone && !fields.phone.value.trim()) {
      setError("phone", "Ingrese su número de teléfono.");
      isValid = false;
    } else if (fields.phone && !isValidPhone(fields.phone.value.trim())) {
      setError("phone", "Ingrese un número de teléfono válido.");
      isValid = false;
    }

    if (fields.email && !fields.email.value.trim()) {
      setError("email", "Ingrese su correo electrónico.");
      isValid = false;
    } else if (fields.email && !isValidEmail(fields.email.value.trim())) {
      setError("email", "Ingrese un correo electrónico válido.");
      isValid = false;
    }

    if (fields.service && !fields.service.value) {
      setError("service", "Seleccione el servicio requerido.");
      isValid = false;
    }

    if (fields.projectType && !fields.projectType.value) {
      setError("projectType", "Seleccione el tipo de proyecto.");
      isValid = false;
    }

    if (fields.location && !fields.location.value.trim()) {
      setError("location", "Ingrese la ubicación del proyecto.");
      isValid = false;
    }

    if (fields.message && !fields.message.value.trim()) {
      setError("message", "Cuéntenos brevemente qué necesita resolver.");
      isValid = false;
    } else if (fields.message && fields.message.value.trim().length < 12) {
      setError("message", "Agregue algunos detalles más sobre el proyecto.");
      isValid = false;
    }

    if (fields.consent && !fields.consent.checked) {
      setError("consent", "Confirme que podemos contactarlo sobre esta solicitud.");
      isValid = false;
    }

    return isValid;
  };

  Object.entries(fields).forEach(([fieldName, field]) => {
    if (!field || fieldName === "website") {
      return;
    }

    const eventName = field.type === "checkbox" || field.tagName === "SELECT"
      ? "change"
      : "input";

    field.addEventListener(eventName, () => {
      clearError(fieldName);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showAlert({
        icon: "error",
        title: "Revise el formulario",
        text: "Algunos campos obligatorios necesitan su atención antes de enviar.",
        confirmButtonText: "Revisar",
        confirmButtonColor: "#b7652a"
      });

      return;
    }

    const payload = {
      name: fields.name ? fields.name.value.trim() : "",
      phone: fields.phone ? fields.phone.value.trim() : "",
      email: fields.email ? fields.email.value.trim().toLowerCase() : "",
      service: fields.service ? fields.service.value : "",
      projectType: fields.projectType ? fields.projectType.value : "",
      location: fields.location ? fields.location.value.trim() : "",
      message: fields.message ? fields.message.value.trim() : "",
      consent: fields.consent && fields.consent.checked ? "true" : "false",
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    };

    if (!endpoint) {
      const subject = encodeURIComponent(`Solicitud de cotización - ${payload.service}`);
      const body = encodeURIComponent(
        `Nombre: ${payload.name}\n` +
        `Teléfono: ${payload.phone}\n` +
        `Email: ${payload.email}\n` +
        `Servicio: ${payload.service}\n` +
        `Tipo de proyecto: ${payload.projectType}\n` +
        `Ubicación: ${payload.location}\n\n` +
        `Detalles:\n${payload.message}`
      );

      showAlert({
        icon: "info",
        title: "Formulario sin endpoint",
        text: "El formulario todavía no tiene un endpoint configurado. Se abrirá su correo para enviar la solicitud.",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#b7652a"
      });

      window.location.href = `mailto:info@art-zacwelding.com?subject=${subject}&body=${body}`;
      return;
    }

    try {
      setSubmitting(true);

      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      showAlert({
        icon: "success",
        title: "Solicitud enviada",
        html: `
          <p style="margin:0 0 10px;">Gracias, <strong>${payload.name}</strong>.</p>
          <p style="margin:0;">Su solicitud fue enviada correctamente a Art-Zac Desing & Iron Work Welding.</p>
        `,
        confirmButtonText: "Perfecto",
        confirmButtonColor: "#b7652a"
      });

      form.reset();
    } catch (error) {
      console.error("Art-Zac Desing & Iron Work contact form error:", error);

      showAlert({
        icon: "error",
        title: "Error al enviar",
        text: "No se pudo enviar la solicitud. Por favor llame directamente a Art-Zac Desing & Iron Work Welding.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#b7652a"
      });
    } finally {
      setSubmitting(false);
    }
  });
})();

/* =========================================================
   Legacy Estimate Form Safety
   Kept only to avoid errors if an old page still includes #estimateForm
========================================================= */
(function initLegacyEstimateFormSafety() {
  const legacyForm = document.querySelector("#estimateForm");

  if (!legacyForm) {
    return;
  }

  legacyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("Este formulario fue reemplazado. Use el formulario principal de contacto.");
  });
})();

/* =========================================================
   Footer Current Year
========================================================= */
(function initCurrentYear() {
  const yearElements = document.querySelectorAll("[data-current-year]");

  if (!yearElements.length) {
    return;
  }

  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = String(currentYear);
  });
})();

/* =========================================================
   Scroll Progress / Back To Top
========================================================= */
(function initScrollProgress() {
  const progressButton = document.querySelector("[data-scroll-top]");
  const progressCircle = document.querySelector("[data-scroll-progress]");

  if (!progressButton) {
    return;
  }

  const setupCircle = () => {
    if (!progressCircle) {
      return null;
    }

    const radius = Number(progressCircle.getAttribute("r")) || 24;
    const circumference = 2 * Math.PI * radius;

    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;

    return circumference;
  };

  const circumference = setupCircle();

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    progressButton.classList.toggle("is-visible", scrollTop > 360);

    if (progressCircle && circumference) {
      const offset = circumference - progress * circumference;
      progressCircle.style.strokeDashoffset = `${offset}`;
    }
  };

  progressButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  updateProgress();

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
})();

/* =========================================================
   Video Cards Safety
========================================================= */
(function initVideoCards() {
  const videoCards = document.querySelectorAll("[data-video-card]");

  if (!videoCards.length) {
    return;
  }

  videoCards.forEach((card) => {
    const video = card.querySelector("video");
    const playButton = card.querySelector("[data-video-play]");

    if (!video || !playButton) {
      return;
    }

    playButton.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        card.classList.add("is-playing");
        playButton.setAttribute("aria-label", "Pausar video de Art-Zac Desing & Iron Work Welding");
      } else {
        video.pause();
        card.classList.remove("is-playing");
        playButton.setAttribute("aria-label", "Reproducir video de Art-Zac Desing & Iron Work Welding");
      }
    });
  });
})();

/* =========================================================
   WhatsApp Widget
========================================================= */
(function initWhatsAppWidget() {
  const whatsappWidget = document.querySelector("[data-whatsapp-widget]");

  if (!whatsappWidget) {
    return;
  }

  const toggleButton = whatsappWidget.querySelector("[data-whatsapp-toggle]");
  const panel = whatsappWidget.querySelector("[data-whatsapp-panel]");

  if (!toggleButton || !panel) {
    return;
  }

  function closeWidget() {
    whatsappWidget.classList.remove("is-open");
    toggleButton.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  }

  function openWidget() {
    whatsappWidget.classList.add("is-open");
    toggleButton.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
  }

  toggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (whatsappWidget.classList.contains("is-open")) {
      closeWidget();
      return;
    }

    openWidget();
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    if (!whatsappWidget.contains(event.target)) {
      closeWidget();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeWidget();
    }
  });
})();

