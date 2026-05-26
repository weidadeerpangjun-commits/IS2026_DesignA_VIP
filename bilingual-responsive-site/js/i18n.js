(function () {
  const STORAGE_KEY = "si-lang";

  const teachingCardDefs = [
    { dateKey: "cards.t1.date", itemKeys: ["cards.t1.i1", "cards.t1.i2"], muted: false },
    { dateKey: "cards.t2.date", itemKeys: ["cards.t2.i1", "cards.t2.i2"], muted: true },
    {
      dateKey: "cards.t3.date",
      itemKeys: ["cards.t3.i1", "cards.t3.i2", "cards.t3.i3"],
      muted: false,
    },
    {
      dateKey: "cards.t4.date",
      itemKeys: ["cards.t4.i1", "cards.t4.i2", "cards.t4.i3", "cards.t4.i4", "cards.t4.i5", "cards.t4.i6"],
      muted: true,
    },
    {
      dateKey: "cards.t5.date",
      itemKeys: ["cards.t5.i1", "cards.t5.i2", "cards.t5.i3"],
      muted: false,
    },
    {
      dateKey: "cards.t6.date",
      itemKeys: ["cards.t6.i1", "cards.t6.i2", "cards.t6.i3"],
      muted: true,
    },
  ];

  const messages = {
    zh: {
      "meta.title": "2026 暑期培训",
      "a11y.skip": "跳到主内容",
      "header.langLabel": "EN",
      "hero.title": "2026 Summer Institute",
      "hero.subtitleZh": "中国 • 贝赛思国际/双语学校",
      "hero.subtitleEn": "BASIS INTERNATIONAL & BILINGUAL SCHOOLS • CHINA",
      "hero.titleZh": "暑期培训",
      "hero.dateEn": "August 3rd–7th, 2026",
      "hero.dateZh": "2026年8月3日–7日",
      "hero.addressEn":
        "BASIS International School Shenzhen No. 198, Yanshan Road, Nanshan District, Shenzhen, Guangdong, China",
      "hero.addressZh": "深圳贝赛思国际学校广东省深圳市南山区沿山路198号",
      "section.titleZh": "参训范围及时间",
      "section.titleEn": "Attendees & Participation Days",
      "section.hint": "请选择您的角色",
      "tabs.teaching": "教学岗位",
      "tabs.admin": "行政岗位",
      "cards.t1.date": "8月4日–8日",
      "cards.t1.i1": "VCIO/IO/PM",
      "cards.t1.i2": "全体（All）",
      "cards.t2.date": "8月4日–8日",
      "cards.t2.i1": "VHOS",
      "cards.t2.i2": "Senior",
      "cards.t3.date": "8月6日–8日",
      "cards.t3.i1": "Senior Chair & Chair",
      "cards.t3.i2": "CAD",
      "cards.t3.i3": "新学部校长（新任岗位）",
      "cards.t4.date": "8月5日–8日",
      "cards.t4.i1": "新教师",
      "cards.t4.i2": "新任校长/学部助理",
      "cards.t4.i3": "新学部校长（新加入网络）",
      "cards.t4.i4": "新任 DCA & CAC",
      "cards.t4.i5": "新任 DAP & CC",
      "cards.t4.i6": "全体 VHOD",
      "cards.t5.date": "8月6日–8日",
      "cards.t5.i1": "Senior Chair & Chair",
      "cards.t5.i2": "CAD",
      "cards.t5.i3": "新学部校长（新任岗位）",
      "cards.t6.date": "8月4日–8日",
      "cards.t6.i1": "返校学部校长",
      "cards.t6.i2": "返校校长/学部助理",
      "cards.t6.i3": "返校 DAP & CC",
      "admin.note": "行政岗位参训安排请以人力资源部门通知为准。",
    },
    en: {
      "meta.title": "2026 Summer Institute",
      "a11y.skip": "Skip to main content",
      "header.langLabel": "中文",
      "hero.title": "2026 Summer Institute",
      "hero.subtitleZh": "中国 • 贝赛思国际/双语学校",
      "hero.subtitleEn": "BASIS INTERNATIONAL & BILINGUAL SCHOOLS • CHINA",
      "hero.titleZh": "暑期培训",
      "hero.dateEn": "August 3rd–7th, 2026",
      "hero.dateZh": "2026年8月3日–7日",
      "hero.addressEn":
        "BASIS International School Shenzhen No. 198, Yanshan Road, Nanshan District, Shenzhen, Guangdong, China",
      "hero.addressZh": "深圳贝赛思国际学校广东省深圳市南山区沿山路198号",
      "section.titleZh": "参训范围及时间",
      "section.titleEn": "Attendees & Participation Days",
      "section.hint": "Please choose your role",
      "tabs.teaching": "Teaching Role",
      "tabs.admin": "Admin Role",
      "cards.t1.date": "August 4th–8th",
      "cards.t1.i1": "VCIO/IO/PM",
      "cards.t1.i2": "All",
      "cards.t2.date": "August 4th–8th",
      "cards.t2.i1": "VHOS",
      "cards.t2.i2": "Senior",
      "cards.t3.date": "August 6th–8th",
      "cards.t3.i1": "Senior Chair & Chair",
      "cards.t3.i2": "CAD",
      "cards.t3.i3": "New Dean (New to Position)",
      "cards.t4.date": "August 5th–8th",
      "cards.t4.i1": "New teacher",
      "cards.t4.i2": "New Assistant to HOS/Division",
      "cards.t4.i3": "New Dean (New to Network)",
      "cards.t4.i4": "New DCA & CAC",
      "cards.t4.i5": "New DAP & CC",
      "cards.t4.i6": "All VHOD",
      "cards.t5.date": "August 6th–8th",
      "cards.t5.i1": "Senior Chair & Chair",
      "cards.t5.i2": "CAD",
      "cards.t5.i3": "New Dean (New to Position)",
      "cards.t6.date": "August 4th–8th",
      "cards.t6.i1": "Returning Dean",
      "cards.t6.i2": "Returning Assistant to HOS/Division",
      "cards.t6.i3": "Returning DAP & CC",
      "admin.note":
        "Administrator schedules follow your campus HR guidance. Details will be communicated separately.",
    },
  };

  function getStoredLang() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "zh" || v === "en") return v;
    } catch {
      /* ignore */
    }
    const nav = navigator.language || "";
    return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function t(lang, key) {
    const dict = messages[lang];
    return dict && dict[key] != null ? dict[key] : key;
  }

  function renderTeachingCards(lang) {
    const panel = document.getElementById("panel-teaching");
    if (!panel) return;
    panel.innerHTML = "";
    teachingCardDefs.forEach((def) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "si-card" + (def.muted ? " si-card--muted" : "");
      const body = document.createElement("div");
      body.className = "si-card__body";
      const title = document.createElement("h3");
      title.className = "si-card__title";
      title.textContent = t(lang, def.dateKey);
      const ul = document.createElement("ul");
      ul.className = "si-card__list";
      def.itemKeys.forEach((ik) => {
        const li = document.createElement("li");
        li.textContent = t(lang, ik);
        ul.appendChild(li);
      });
      body.appendChild(title);
      body.appendChild(ul);
      const arrow = document.createElement("span");
      arrow.className = "si-card__arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M17.84 15.4679C18.14 14.8679 18.44 14.3279 18.74 13.8479C19.06 13.3679 19.38 12.9379 19.7 12.5579H2V11.5379H19.7C19.38 11.1579 19.06 10.7279 18.74 10.2479C18.44 9.76793 18.14 9.22793 17.84 8.62793H18.65C19.89 10.0479 21.2 11.1279 22.58 11.8679V12.2279C21.2 12.9479 19.89 14.0279 18.65 15.4679H17.84Z" fill="currentColor"/></svg>';
      btn.appendChild(body);
      btn.appendChild(arrow);
      panel.appendChild(btn);
    });
  }

  function renderAdminPanel(lang) {
    const panel = document.getElementById("panel-admin");
    if (!panel) return;
    panel.innerHTML = "";
    const note = document.createElement("p");
    note.className = "si-admin-note";
    note.textContent = t(lang, "admin.note");
    panel.appendChild(note);
  }

  function setLang(lang) {
    const dict = messages[lang];
    if (!dict) return;

    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key || dict[key] == null) return;
      el.textContent = dict[key];
    });

    renderTeachingCards(lang);
    renderAdminPanel(lang);

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }

  function getLang() {
    return document.documentElement.getAttribute("data-si-lang") || getStoredLang();
  }

  function applyLang(lang) {
    document.documentElement.setAttribute("data-si-lang", lang);
    setLang(lang);
  }

  function toggleLang() {
    const next = getLang() === "zh" ? "en" : "zh";
    applyLang(next);
    syncTabs(getActiveTab());
  }

  function getActiveTab() {
    const active = document.querySelector(".si-tab.is-active");
    return active && active.getAttribute("data-tab") === "admin" ? "admin" : "teaching";
  }

  function syncTabs(which) {
    const teachingPanel = document.getElementById("panel-teaching");
    const adminPanel = document.getElementById("panel-admin");
    const tabTeaching = document.getElementById("tab-teaching");
    const tabAdmin = document.getElementById("tab-admin");

    if (!teachingPanel || !adminPanel || !tabTeaching || !tabAdmin) return;

    if (which === "admin") {
      tabTeaching.classList.remove("is-active");
      tabAdmin.classList.add("is-active");
      tabTeaching.setAttribute("aria-selected", "false");
      tabAdmin.setAttribute("aria-selected", "true");
      teachingPanel.classList.remove("is-active");
      adminPanel.classList.add("is-active");
      adminPanel.removeAttribute("hidden");
      teachingPanel.setAttribute("hidden", "");
    } else {
      tabAdmin.classList.remove("is-active");
      tabTeaching.classList.add("is-active");
      tabAdmin.setAttribute("aria-selected", "false");
      tabTeaching.setAttribute("aria-selected", "true");
      adminPanel.classList.remove("is-active");
      teachingPanel.classList.add("is-active");
      teachingPanel.removeAttribute("hidden");
      adminPanel.setAttribute("hidden", "");
    }
  }

  document.getElementById("lang-toggle")?.addEventListener("click", toggleLang);

  document.querySelectorAll(".si-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.getAttribute("data-tab");
      document.querySelectorAll(".si-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      syncTabs(name === "admin" ? "admin" : "teaching");
    });
  });

  applyLang(getStoredLang());
  syncTabs("teaching");
})();
