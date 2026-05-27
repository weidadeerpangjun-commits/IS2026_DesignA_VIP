/**
 * Ambient aurora background — brand palette, Canvas 2D (no Three.js).
 *
 * ARCHIVED — not loaded by default.
 * Active: css/image-background.css · js/image-background.js
 * Silk: css/silk-background.css · js/silk-background.js · three.min.js
 */
function initSiteBackground() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const root = document.createElement("div");
  root.id = "site-background";
  root.setAttribute("aria-hidden", "true");
  document.body.prepend(root);
  document.body.classList.add("has-site-background");

  if (reducedMotion) {
    return;
  }

  const canvas = document.createElement("canvas");
  root.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: false });

  const ORBS = [
    { x: 0.18, y: 0.28, r: 0.52, rgb: [155, 226, 252], speed: 0.11, phase: 0 },
    { x: 0.78, y: 0.22, r: 0.42, rgb: [52, 181, 244], speed: 0.085, phase: 1.4 },
    { x: 0.55, y: 0.72, r: 0.48, rgb: [164, 172, 212], speed: 0.07, phase: 2.8 },
    { x: 0.32, y: 0.62, r: 0.36, rgb: [100, 140, 210], speed: 0.095, phase: 4.1 },
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBase() {
    const bg = ctx.createLinearGradient(0, 0, width * 0.35, height);
    bg.addColorStop(0, "#081224");
    bg.addColorStop(0.45, "#1a3568");
    bg.addColorStop(1, "#3255a4");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }

  function drawRays(t) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.22;
    const cx = width * (0.5 + Math.sin(t * 0.04) * 0.06);
    const cy = height * 0.38;
    for (let i = 0; i < 5; i += 1) {
      const angle = t * 0.015 + i * 1.25;
      const len = Math.max(width, height) * 1.1;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      const ray = ctx.createLinearGradient(cx, cy, x2, y2);
      ray.addColorStop(0, "rgba(155, 226, 252, 0.55)");
      ray.addColorStop(1, "rgba(155, 226, 252, 0)");
      ctx.strokeStyle = ray;
      ctx.lineWidth = 48 + i * 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawOrbs(t) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const span = Math.min(width, height);

    ORBS.forEach((orb) => {
      const ox = (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.07) * width;
      const oy = (orb.y + Math.cos(t * orb.speed * 0.82 + orb.phase) * 0.05) * height;
      const radius = orb.r * span;
      const [r, g, b] = orb.rgb;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.42)`);
      grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.14)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });

    ctx.restore();
  }

  function drawVignette() {
    const cx = width * 0.5;
    const cy = height * 0.48;
    const outer = Math.max(width, height) * 0.92;
    const vig = ctx.createRadialGradient(cx, cy, outer * 0.12, cx, cy, outer);
    vig.addColorStop(0, "rgba(8, 18, 36, 0)");
    vig.addColorStop(1, "rgba(8, 18, 36, 0.5)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  }

  function render(t) {
    drawBase();
    drawRays(t);
    drawOrbs(t);
    drawVignette();
  }

  resize();
  window.addEventListener("resize", resize);

  let visible = document.visibilityState === "visible";
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
  });

  let raf = 0;
  let start = performance.now();
  let last = start;

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (!visible) {
      last = now;
      return;
    }
    const elapsed = (now - start) / 1000;
    if (now - last >= 32 || last === start) {
      render(elapsed);
      last = now;
    }
  }

  render(0);
  requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteBackground);
} else {
  initSiteBackground();
}
