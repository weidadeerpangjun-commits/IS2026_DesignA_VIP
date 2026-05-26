(function () {
  function t(key) {
    return window.SI_I18N && window.SI_I18N.t ? window.SI_I18N.t(key) : "";
  }

  function wireTransportPanels(root) {
    root.querySelectorAll(".si-transport-accordions .si-sch-card--detail .si-sch-card__lead--expand").forEach((lead) => {
      if (lead.dataset.bound === "1") return;
      lead.dataset.bound = "1";

      const card = lead.closest(".si-sch-card--detail");
      const timeBtn = lead.querySelector(".si-sch-card__timebtn");
      const chevBtn = lead.querySelector(".si-sch-card__chevbtn");
      if (!timeBtn || !card) return;

      const setAria = () => {
        const open = timeBtn.getAttribute("aria-expanded") === "true";
        const lab = open ? t("schedule.collapse") : t("schedule.expand");
        if (lab) timeBtn.setAttribute("aria-label", lab);
      };
      setAria();

      const flip = () => {
        if (card.getAttribute("data-expandable") !== "true") return;
        const open = timeBtn.getAttribute("aria-expanded") === "true";
        const next = !open;
        timeBtn.setAttribute("aria-expanded", String(next));
        if (chevBtn) chevBtn.setAttribute("aria-expanded", String(next));
        card.classList.toggle("is-expanded", next);
        setAria();
      };

      const onLeadClick = (e) => {
        const interactive =
          e.target && e.target.closest && e.target.closest("a,button,input,textarea,select,label");
        if (interactive) return;
        flip();
      };

      timeBtn.addEventListener("click", flip);
      if (chevBtn) chevBtn.addEventListener("click", flip);
      lead.addEventListener("click", onLeadClick);
    });
  }

  function init() {
    if (document.body.dataset.section !== "transport") return;
    wireTransportPanels(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
