(function () {
  let savedScrollY = 0;
  let lastTrigger = null;

  function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY);
  }

  function ensureDialog() {
    let dialog = document.getElementById("si-lightbox");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "si-lightbox";
    dialog.className = "si-lightbox";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "si-lightbox__close";
    closeBtn.setAttribute("data-i18n", "hotel.closeLargeImage");
    closeBtn.textContent = "关闭";

    const img = document.createElement("img");
    img.className = "si-lightbox__img";
    img.alt = "";

    dialog.appendChild(img);
    dialog.appendChild(closeBtn);
    document.body.appendChild(dialog);

    closeBtn.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      dialog.close();
    });
    dialog.addEventListener("close", () => {
      unlockScroll();
      if (lastTrigger) {
        lastTrigger.focus({ preventScroll: true });
      }
    });

    syncDialogLabels();

    return dialog;
  }

  function syncDialogLabels() {
    const dialog = document.getElementById("si-lightbox");
    if (!dialog || !window.SI_I18N) return;
    const closeBtn = dialog.querySelector(".si-lightbox__close");
    if (!closeBtn) return;
    const label = window.SI_I18N.t("hotel.closeLargeImage");
    closeBtn.textContent = label;
    closeBtn.setAttribute("aria-label", label);
  }

  function openLightbox(trigger) {
    const src = trigger.getAttribute("data-si-lightbox-src");
    if (!src) return;

    const thumb = trigger.querySelector("img");
    const dialog = ensureDialog();
    const img = dialog.querySelector(".si-lightbox__img");
    const closeBtn = dialog.querySelector(".si-lightbox__close");
    img.src = src;
    img.alt = (thumb && thumb.getAttribute("alt")) || "";

    lastTrigger = trigger;
    lockScroll();

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }
  }

  function bindTriggers(root) {
    root.querySelectorAll("[data-si-lightbox-src]").forEach((trigger) => {
      if (trigger.dataset.lightboxBound === "1") return;
      trigger.dataset.lightboxBound = "1";
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        openLightbox(trigger);
      });
    });
  }

  function init() {
    bindTriggers(document);
    document.addEventListener("si-lang-applied", () => {
      bindTriggers(document);
      syncDialogLabels();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
