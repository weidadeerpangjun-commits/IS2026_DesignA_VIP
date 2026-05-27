(function () {
  let savedScrollY = 0;
  let lastTrigger = null;

  function t(key) {
    return window.SI_I18N && window.SI_I18N.t ? window.SI_I18N.t(key) : key;
  }

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

  function getDestination(trigger) {
    const lat = trigger.getAttribute("data-map-lat");
    const lng = trigger.getAttribute("data-map-lng");
    const lang =
      window.SI_I18N && window.SI_I18N.getLang ? window.SI_I18N.getLang() : "zh";
    const name =
      (lang === "en"
        ? trigger.getAttribute("data-map-name-en")
        : trigger.getAttribute("data-map-name-zh")) || "";
    const addressEl = document.querySelector('[data-i18n="hotel.addressFull"]');
    const address = addressEl ? addressEl.textContent.trim() : "";
    return {
      lat,
      lng,
      label: name || address,
    };
  }

  function buildProviders(dest) {
    const { lat, lng, label } = dest;
    const name = encodeURIComponent(label);
    return [
      {
        id: "amap",
        labelKey: "hotel.mapAmap",
        href: `iosamap://path?sourceApplication=SI2026&dlat=${lat}&dlon=${lng}&dname=${name}&dev=0&t=0`,
        fallback: `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car&callnative=1`,
      },
      {
        id: "apple",
        labelKey: "hotel.mapApple",
        href: `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
        fallback: `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
      },
      {
        id: "baidu",
        labelKey: "hotel.mapBaidu",
        href: `baidumap://map/direction?destination=latlng:${lat},${lng}|name:${name}&mode=driving&coord_type=gcj02`,
        fallback: `https://api.map.baidu.com/direction?destination=latlng:${lat},${lng}|name:${name}&mode=driving&region=${encodeURIComponent("深圳")}&output=html&src=SI2026`,
      },
    ];
  }

  function ensurePicker() {
    let dialog = document.getElementById("si-map-picker");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "si-map-picker";
    dialog.className = "si-map-picker";
    dialog.setAttribute("aria-labelledby", "si-map-picker-title");

    const title = document.createElement("p");
    title.id = "si-map-picker-title";
    title.className = "si-map-picker__title";
    title.setAttribute("data-i18n", "hotel.chooseMap");
    title.textContent = "选择地图应用";

    const list = document.createElement("ul");
    list.className = "si-map-picker__list";
    list.id = "si-map-picker-list";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "si-map-picker__cancel";
    cancel.setAttribute("data-i18n", "hotel.mapCancel");
    cancel.textContent = "取消";

    dialog.appendChild(title);
    dialog.appendChild(list);
    dialog.appendChild(cancel);
    document.body.appendChild(dialog);

    cancel.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      dialog.close();
    });
    dialog.addEventListener("close", () => {
      unlockScroll();
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });

    return dialog;
  }

  function renderPickerList(dialog, providers) {
    const list = dialog.querySelector("#si-map-picker-list");
    list.innerHTML = "";
    providers.forEach((p) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "si-map-picker__link";
      a.href = p.href;
      a.textContent = t(p.labelKey);
      a.setAttribute("data-fallback", p.fallback);
      a.addEventListener("click", (e) => {
        const fallback = a.getAttribute("data-fallback");
        if (fallback && fallback !== a.href) {
          const timer = window.setTimeout(() => {
            if (!document.hidden) window.location.href = fallback;
          }, 800);
          const clear = () => window.clearTimeout(timer);
          window.addEventListener("pagehide", clear, { once: true });
          document.addEventListener(
            "visibilitychange",
            () => {
              if (document.hidden) clear();
            },
            { once: true }
          );
        }
        dialog.close();
      });
      li.appendChild(a);
      list.appendChild(li);
    });

    const title = dialog.querySelector(".si-map-picker__title");
    if (title) title.textContent = t("hotel.chooseMap");
    const cancel = dialog.querySelector(".si-map-picker__cancel");
    if (cancel) {
      cancel.textContent = t("hotel.mapCancel");
      cancel.setAttribute("aria-label", t("hotel.mapCancel"));
    }
  }

  function openPicker(trigger) {
    const dest = getDestination(trigger);
    if (!dest.lat || !dest.lng) return;

    const dialog = ensurePicker();
    renderPickerList(dialog, buildProviders(dest));
    lastTrigger = trigger;
    lockScroll();
    dialog.showModal();
    const firstLink = dialog.querySelector(".si-map-picker__link");
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function bindTriggers(root) {
    root.querySelectorAll("[data-map-route]").forEach((trigger) => {
      if (trigger.dataset.mapRouteBound === "1") return;
      trigger.dataset.mapRouteBound = "1";
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        openPicker(trigger);
      });
    });
  }

  function init() {
    bindTriggers(document);
    document.addEventListener("si-lang-applied", () => bindTriggers(document));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
