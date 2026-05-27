/**
 * Image background — images/background3.png with medium Ken Burns drift.
 *
 * Aurora archived: css/site-background.css · js/site-background.js
 * Silk archived: css/silk-background.css · js/silk-background.js · three.min.js
 */
function initImageBackground() {
  const root = document.createElement("div");
  root.id = "site-background";
  root.setAttribute("aria-hidden", "true");

  const image = document.createElement("div");
  image.className = "site-background__image";
  image.setAttribute("aria-hidden", "true");
  root.appendChild(image);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion) {
    const glow = document.createElement("div");
    glow.className = "site-background__glow";
    glow.setAttribute("aria-hidden", "true");
    root.appendChild(glow);
  }

  document.body.prepend(root);
  document.body.classList.add("has-site-background");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initImageBackground);
} else {
  initImageBackground();
}
