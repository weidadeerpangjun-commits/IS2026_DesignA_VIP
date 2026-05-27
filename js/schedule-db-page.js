(function () {
  const STORAGE_KEY = "si-schedule-db-v2";
  const VERSIONS_KEY = "si-schedule-db-versions-v2";
  const MAX_SAVED_VERSIONS = 50;
  const SCHEMA_VERSION = 1;

  const ALL_DAYS = [
    { id: "d1", month: { zh: "8月", en: "Aug" }, day: 3, dow: { zh: "一", en: "M" } },
    { id: "d2", month: { zh: "8月", en: "Aug" }, day: 4, dow: { zh: "二", en: "T" } },
    { id: "d3", month: { zh: "8月", en: "Aug" }, day: 5, dow: { zh: "三", en: "W" } },
    { id: "d4", month: { zh: "8月", en: "Aug" }, day: 6, dow: { zh: "四", en: "T" } },
    { id: "d5", month: { zh: "8月", en: "Aug" }, day: 7, dow: { zh: "五", en: "F" } },
  ];

  const SCOPE_DAY_IDS = {
    v1: ["d1", "d2", "d3", "d4", "d5"],
    v2: ["d1", "d2", "d3", "d4", "d5"],
  };

  /** Day ids with ≥1 row for this scope; if none, return null (caller falls back to SCOPE_DAY_IDS). */
  function dayIdsWithDataFromEntries(entries, scopeId) {
    if (!scopeId || !entries) return null;
    const prefix = scopeId + ":";
    const ids = [];
    Object.keys(entries).forEach(function (key) {
      if (!key.startsWith(prefix)) return;
      const dayId = key.slice(prefix.length);
      if (!/^d\d+$/.test(dayId)) return;
      const arr = entries[key];
      if (Array.isArray(arr) && arr.length > 0) ids.push(dayId);
    });
    ids.sort(function (a, b) {
      return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10);
    });
    return ids.length ? ids : null;
  }

  function dayIdsForSchdb(entries, scopeId) {
    const template = SCOPE_DAY_IDS[scopeId];
    const fromData = dayIdsWithDataFromEntries(entries, scopeId);
    return fromData && fromData.length ? fromData : template;
  }

  const SCOPE_SCOPES = ["v1", "v2"];

  const FIELDS = [
    "timeZh",
    "timeEn",
    "topicZh",
    "topicEn",
    "introZh",
    "introEn",
    "locZh",
    "locEn",
    "detailZh",
    "detailEn",
    "groupTsvZh",
    "groupTsvEn",
  ];

  function t(key) {
    return window.SI_I18N && window.SI_I18N.t ? window.SI_I18N.t(key) : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function groupMatrixPreviewHtml(m) {
    if (!matrixHasContent(m)) return "";
    const lang = getLang();
    const ths = m.columns
      .map(function (col) {
        const h = lang === "en" ? col.en || col.zh : col.zh || col.en;
        return `<th scope="col">${escapeHtml(h)}</th>`;
      })
      .join("");
    const trs = (m.rows || [])
      .map(function (row) {
        const tds = row
          .map(function (cell) {
            const v = lang === "en" ? cell.en || cell.zh : cell.zh || cell.en;
            return `<td>${escapeHtml(v)}</td>`;
          })
          .join("");
        return `<tr>${tds}</tr>`;
      })
      .join("");
    return `<table class="si-schdb-matrix-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  }

  function getLang() {
    return window.SI_I18N && window.SI_I18N.getLang ? window.SI_I18N.getLang() : "zh";
  }

  function getSrc() {
    return window.__SI_SCHEDULE_SOURCE || null;
  }

  function publishStorageKey() {
    const s = getSrc();
    return (s && s.PUBLISH_STORE_KEY) || "si-schedule-front-publish-v1";
  }

  function publishBcName() {
    const s = getSrc();
    return (s && s.PUBLISH_BC_NAME) || "si-schedule-front-channel";
  }

  function entriesSyncStorageKey() {
    const s = getSrc();
    return (s && s.ENTRIES_SYNC_KEY) || "si-schedule-front-entries-sync-v2";
  }

  function actorNameStorageKey() {
    const s = getSrc();
    return (s && s.ACTOR_NAME_KEY) || "si-schedule-actor-name";
  }

  function readPublishDoc() {
    try {
      const raw = localStorage.getItem(publishStorageKey());
      if (!raw) return { v: 1, slots: {} };
      const doc = JSON.parse(raw);
      if (!doc || typeof doc !== "object") return { v: 1, slots: {} };
      const slots = doc.slots;
      doc.slots = slots && typeof slots === "object" ? slots : {};
      return doc;
    } catch {
      return { v: 1, slots: {} };
    }
  }

  function getSlotPublishMeta(dayId, index) {
    const doc = readPublishDoc();
    const pack = doc.slots[dayId + ":" + index];
    if (!pack || !pack.publishedAt) return null;
    return pack;
  }

  function formatPublishInstant(iso) {
    if (!iso) return "—";
    const ms = Date.parse(iso);
    if (Number.isNaN(ms)) return escapeHtml(String(iso));
    const d = new Date(ms);
    const ln = getLang();
    const loc = ln === "en" ? "en-US" : "zh-CN";
    return escapeHtml(d.toLocaleString(loc, { dateStyle: "short", timeStyle: "short" }));
  }

  function publishStatusHtml(dayId, index) {
    const meta = getSlotPublishMeta(dayId, index);
    if (!meta) {
      return (
        `<p class="si-schdb-publish-status__line si-schdb-publish-status__line--muted">${escapeHtml(
          t("schdb.frontUnpublished")
        )}</p>` +
        `<p class="si-schdb-publish-status__note">${escapeHtml(t("schdb.frontSlotNote"))}</p>`
      );
    }
    const pubBy = escapeHtml(String(meta.publishedBy || "—"));
    const updBy = escapeHtml(String(meta.updatedBy || "—"));
    const pubTime = formatPublishInstant(meta.publishedAt);
    const updTime = formatPublishInstant(meta.updatedAt);
    let html =
      `<p class="si-schdb-publish-status__line"><span class="si-schdb-publish-status__tag">${escapeHtml(
        t("schdb.statusPublished")
      )}</span> ${pubTime} · ${pubBy}</p>`;
    const tPub = Date.parse(meta.publishedAt);
    const tUpd = Date.parse(meta.updatedAt || meta.publishedAt);
    if (!Number.isNaN(tPub) && !Number.isNaN(tUpd) && tUpd > tPub) {
      html +=
        `<p class="si-schdb-publish-status__line"><span class="si-schdb-publish-status__tag si-schdb-publish-status__tag--update">${escapeHtml(
          t("schdb.statusUpdated")
        )}</span> ${updTime} · ${updBy}</p>`;
    }
    html += `<p class="si-schdb-publish-status__note">${escapeHtml(t("schdb.frontSlotNote"))}</p>`;
    return html;
  }

  function writeSlotToFront(dayId, index, ev, actorName) {
    const now = new Date().toISOString();
    const doc = readPublishDoc();
    const slotKey = dayId + ":" + index;
    const prev = doc.slots[slotKey];
    const evClone = clone(ev);
    if (!evClone) return false;
    const by = String(actorName || "").trim() || "—";
    if (prev && prev.publishedAt) {
      doc.slots[slotKey] = {
        ev: evClone,
        publishedAt: prev.publishedAt,
        publishedBy: prev.publishedBy != null ? prev.publishedBy : "",
        updatedAt: now,
        updatedBy: by,
      };
    } else {
      doc.slots[slotKey] = {
        ev: evClone,
        publishedAt: now,
        publishedBy: by,
        updatedAt: now,
        updatedBy: by,
      };
    }
    try {
      localStorage.setItem(
        publishStorageKey(),
        JSON.stringify({ v: doc.v || 1, slots: doc.slots })
      );
    } catch {
      window.alert(t("schdb.publishSaveErr"));
      return false;
    }
    return true;
  }

  function notifyScheduleFrontChanged() {
    try {
      const ch = new BroadcastChannel(publishBcName());
      ch.postMessage({ type: "si-schedule-front-refresh" });
      ch.close();
    } catch {
      /* ignore */
    }
    const src = getSrc();
    if (src && typeof src.refreshPublishLayer === "function") {
      try {
        src.refreshPublishLayer();
      } catch {
        /* ignore */
      }
    }
  }

  function notifyScheduleEntriesFullSynced() {
    try {
      const ch = new BroadcastChannel(publishBcName());
      ch.postMessage({ type: "si-schedule-entries-synced" });
      ch.close();
    } catch {
      /* ignore */
    }
  }

  function emptyRow() {
    return {
      timeZh: "",
      timeEn: "",
      topicZh: "",
      topicEn: "",
      introZh: "",
      introEn: "",
      locZh: "",
      locEn: "",
      detailZh: "",
      detailEn: "",
      groupTsvZh: "",
      groupTsvEn: "",
    };
  }

  /** First row = headers, following rows = data (tab-separated, Excel paste). */
  function parseTsvGrid(text) {
    const raw = String(text || "").replace(/\r\n/g, "\n");
    const lines = raw
      .split("\n")
      .map((l) => l.replace(/\s+$/, ""))
      .filter((l) => l.length > 0);
    if (!lines.length) return { headers: [], rows: [] };
    const headers = lines[0].split("\t");
    const n = headers.length;
    const rows = lines.slice(1).map((line) => {
      const cells = line.split("\t");
      const out = cells.slice(0, n);
      while (out.length < n) out.push("");
      return out;
    });
    return { headers, rows };
  }

  function mergeGroupMatrix(zhTsv, enTsv) {
    const a = parseTsvGrid(zhTsv);
    const b = parseTsvGrid(enTsv);
    const nCol = Math.max(a.headers.length, b.headers.length, 0);
    if (!nCol) return null;
    const nRow = Math.max(a.rows.length, b.rows.length);
    const columns = [];
    for (let j = 0; j < nCol; j++) {
      columns.push({ zh: (a.headers[j] || "").trim(), en: (b.headers[j] || "").trim() });
    }
    const rows = [];
    for (let i = 0; i < nRow; i++) {
      const rzh = a.rows[i] || [];
      const ren = b.rows[i] || [];
      const row = [];
      for (let j = 0; j < nCol; j++) {
        row.push({ zh: (rzh[j] || "").trim(), en: (ren[j] || "").trim() });
      }
      rows.push(row);
    }
    return { columns, rows };
  }

  function matrixHasContent(m) {
    if (!m || !m.columns || !m.columns.length) return false;
    if (m.columns.some((c) => (c.zh || "").trim() || (c.en || "").trim())) return true;
    return (m.rows || []).some((r) => r.some((c) => (c.zh || "").trim() || (c.en || "").trim()));
  }

  function matrixToTsvZh(m) {
    if (!m || !m.columns || !m.columns.length) return "";
    const head = m.columns.map((c) => c.zh).join("\t");
    const lines = (m.rows || []).map((r) => r.map((c) => c.zh).join("\t"));
    return [head, ...lines].join("\n");
  }

  function matrixToTsvEn(m) {
    if (!m || !m.columns || !m.columns.length) return "";
    const head = m.columns.map((c) => c.en).join("\t");
    const lines = (m.rows || []).map((r) => r.map((c) => c.en).join("\t"));
    return [head, ...lines].join("\n");
  }

  function clone(o) {
    try {
      return JSON.parse(JSON.stringify(o));
    } catch {
      return null;
    }
  }

  function loadVersionsDoc() {
    try {
      const raw = localStorage.getItem(VERSIONS_KEY);
      if (!raw) return { v: 1, items: [] };
      const o = JSON.parse(raw);
      if (!o || !Array.isArray(o.items)) return { v: 1, items: [] };
      return { v: 1, items: o.items };
    } catch {
      return { v: 1, items: [] };
    }
  }

  function saveVersionSnapshot() {
    const doc = loadVersionsDoc();
    const snap = clone(state);
    if (!snap) return false;
    const id = new Date().toISOString();
    doc.items.unshift({ id: id, savedAt: id, snapshot: snap });
    while (doc.items.length > MAX_SAVED_VERSIONS) {
      doc.items.pop();
    }
    try {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify({ v: 1, items: doc.items }));
      return true;
    } catch {
      window.alert(t("schdb.versionsSaveErr"));
      return false;
    }
  }

  function versionEntryCount(snapshot) {
    if (!snapshot || typeof snapshot.entries !== "object") return 0;
    return Object.keys(snapshot.entries).reduce(function (acc, k) {
      const arr = snapshot.entries[k];
      return acc + (Array.isArray(arr) ? arr.length : 0);
    }, 0);
  }

  function renderVersionList() {
    const ul = document.getElementById("schdb-versions-list");
    if (!ul) return;
    ul.innerHTML = "";
    const items = loadVersionsDoc().items;
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "si-schdb-versions-list__empty";
      li.textContent = t("schdb.versionsEmpty");
      ul.appendChild(li);
      return;
    }
    const ln = getLang();
    const loc = ln === "en" ? "en-US" : "zh-CN";
    items.forEach(function (item) {
      const li = document.createElement("li");
      li.className = "si-schdb-versions-list__item";
      li.setAttribute("role", "listitem");
      const ms = Date.parse(item.savedAt || item.id || "");
      const d = Number.isNaN(ms) ? null : new Date(ms);
      const label = document.createElement("span");
      label.className = "si-schdb-versions-list__label";
      label.textContent = d
        ? d.toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })
        : String(item.id || "—");
      const meta = document.createElement("span");
      meta.className = "si-schdb-versions-list__meta";
      const n = versionEntryCount(item.snapshot);
      meta.textContent = t("schdb.versionRowMeta").replace("{n}", String(n));
      const actions = document.createElement("span");
      actions.className = "si-schdb-versions-list__actions";
      const dlBtn = document.createElement("button");
      dlBtn.type = "button";
      dlBtn.className = "si-schdb-versions-list__btn";
      dlBtn.textContent = t("schdb.versionDownload");
      dlBtn.setAttribute("data-schdb-version-download", item.id);
      const rsBtn = document.createElement("button");
      rsBtn.type = "button";
      rsBtn.className = "si-schdb-versions-list__btn si-schdb-versions-list__btn--danger";
      rsBtn.textContent = t("schdb.versionRestore");
      rsBtn.setAttribute("data-schdb-version-restore", item.id);
      actions.appendChild(dlBtn);
      actions.appendChild(rsBtn);
      li.appendChild(label);
      li.appendChild(meta);
      li.appendChild(actions);
      ul.appendChild(li);
    });
  }

  function downloadVersionById(id) {
    const item = loadVersionsDoc().items.find(function (x) {
      return x.id === id;
    });
    if (!item || !item.snapshot) return;
    const blob = new Blob([JSON.stringify(item.snapshot, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const safe = String(id || "version").replace(/[:.]/g, "-");
    a.href = URL.createObjectURL(blob);
    a.download = "si-schedule-db-" + safe + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function restoreVersionById(id) {
    const item = loadVersionsDoc().items.find(function (x) {
      return x.id === id;
    });
    if (!item || !item.snapshot) return;
    const next = clone(item.snapshot);
    if (!next || typeof next.entries !== "object") return;
    state = { v: SCHEMA_VERSION, entries: next.entries };
    editingKey = null;
    editingIndex = -1;
    saveState();
    renderAll();
  }

  let versionPanelBound = false;
  function bindVersionPanel() {
    if (versionPanelBound) return;
    const sec = document.getElementById("schdb-versions-section");
    if (!sec) return;
    versionPanelBound = true;
    sec.addEventListener("click", function (ev) {
      const dl = ev.target.closest("[data-schdb-version-download]");
      if (dl) {
        downloadVersionById(dl.getAttribute("data-schdb-version-download"));
        return;
      }
      const rs = ev.target.closest("[data-schdb-version-restore]");
      if (rs) {
        const vid = rs.getAttribute("data-schdb-version-restore");
        if (vid && window.confirm(t("schdb.versionRestoreConfirm"))) {
          restoreVersionById(vid);
        }
      }
    });
  }

  function formRowToSyntheticEvent(row) {
    const hasDetail = !!(row.detailZh || row.detailEn);
    const gm = mergeGroupMatrix(row.groupTsvZh, row.groupTsvEn);
    const hasGroup = gm && matrixHasContent(gm);
    const items = [{ zh: row.topicZh || "", en: row.topicEn || "" }];
    const ev = {
      variant: "primary",
      expandable: !!(hasDetail || hasGroup),
      showChevron: !!(hasDetail || hasGroup),
      expanded: false,
      time: { zh: row.timeZh || "", en: row.timeEn || "" },
      items,
    };
    if (row.introZh || row.introEn) {
      ev.audience = { zh: row.introZh || "", en: row.introEn || "" };
    }
    if (row.locZh || row.locEn) {
      ev.location = { zh: row.locZh || "", en: row.locEn || "" };
    }
    if (hasDetail) {
      const zl = (row.detailZh || "").split("\n");
      const el = (row.detailEn || "").split("\n");
      const n = Math.max(zl.length, el.length);
      const lines = [];
      for (let i = 0; i < n; i++) {
        lines.push({ zh: (zl[i] || "").trim(), en: (el[i] || "").trim() });
      }
      ev.detailLines = lines.filter((x) => x.zh || x.en);
      if (!ev.detailLines.length && (row.detailZh || "").trim() + (row.detailEn || "").trim()) {
        ev.detailLines = [{ zh: (row.detailZh || "").trim(), en: (row.detailEn || "").trim() }];
      }
    }
    if (hasGroup) {
      ev.groupMatrix = gm;
    }
    return ev;
  }

  function eventForDisplay(row) {
    if (row._sourceEv) {
      const c = clone(row._sourceEv);
      if (c) {
        const gmFromTsv = mergeGroupMatrix(row.groupTsvZh, row.groupTsvEn);
        if (matrixHasContent(gmFromTsv)) {
          c.groupMatrix = gmFromTsv;
        }
        const inner =
          (c.detailLines && c.detailLines.length) ||
          c.table ||
          matrixHasContent(c.groupMatrix);
        c.expandable = !!inner;
        c.showChevron = !!inner;
        return c;
      }
    }
    return formRowToSyntheticEvent(row);
  }

  function idBaseFor(scopeId, dayId, idx) {
    return String(scopeId).replace(/_/g, "-") + "-" + dayId + "-" + idx;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { v: SCHEMA_VERSION, entries: {} };
      const o = JSON.parse(raw);
      if (!o || typeof o.entries !== "object") return { v: SCHEMA_VERSION, entries: {} };
      return { v: SCHEMA_VERSION, entries: o.entries || {} };
    } catch {
      return { v: SCHEMA_VERSION, entries: {} };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }

  function compositeKey(scopeId, dayId) {
    return scopeId + ":" + dayId;
  }

  function dayLabel(day) {
    const ln = getLang();
    if (ln === "en") {
      return day.month.en + " " + day.day + ", 2026 (" + day.dow.en + ")";
    }
    return "2026年" + day.month.zh + day.day + "日（周" + day.dow.zh + "）";
  }

  function sessionLegend(index) {
    return getLang() === "zh" ? "场次 " + (index + 1) : "Session " + (index + 1);
  }

  let state = loadState();
  let dirty = false;
  let saveTimer = null;
  let toolbarBound = false;
  let schdbCategoryFoldDelegationBound = false;
  let schdbPublishListenBound = false;
  let editingKey = null;
  let editingIndex = -1;

  function markDirty() {
    dirty = true;
    const st = document.getElementById("schdb-save-status");
    if (st) st.textContent = t("schdb.saveIdle");
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 700);
  }

  function flushSave() {
    saveTimer = null;
    if (!dirty) return;
    dirty = false;
    readRowsFromDom();
    saveState();
    const st = document.getElementById("schdb-save-status");
    if (st) st.textContent = t("schdb.saved");
  }

  function readRowFromFieldset(entry) {
    const r = {};
    FIELDS.forEach((f) => {
      const inp = entry.querySelector('[data-field="' + f + '"]');
      r[f] = inp ? String(inp.value) : "";
    });
    return r;
  }

  /** Only merges fieldsets present in DOM; card-only hosts leave state unchanged. */
  function readRowsFromDom() {
    document.querySelectorAll("[data-schdb-day]").forEach((host) => {
      const scopeId = host.getAttribute("data-scope");
      const dayId = host.getAttribute("data-day");
      if (!scopeId || !dayId) return;
      const key = compositeKey(scopeId, dayId);
      const fieldsets = host.querySelectorAll("fieldset.si-schdb-entry");
      if (!fieldsets.length) return;
      const rows = state.entries[key] || [];
      fieldsets.forEach((entry) => {
        const idx = parseInt(entry.getAttribute("data-row-index") || "-1", 10);
        if (Number.isNaN(idx) || idx < 0) return;
        const r = readRowFromFieldset(entry);
        const prev = rows[idx] || {};
        rows[idx] = Object.assign({}, prev, r);
      });
      state.entries[key] = rows;
    });
  }

  function applyFormToRow(scopeId, dayId, index, fieldset) {
    const key = compositeKey(scopeId, dayId);
    const arr = state.entries[key] || [];
    const flat = readRowFromFieldset(fieldset);
    const prev = arr[index] || {};
    const merged = Object.assign({}, prev, flat);
    const syn = formRowToSyntheticEvent(merged);
    if (prev._sourceEv && prev._sourceEv.table) {
      syn.table = clone(prev._sourceEv.table);
    }
    merged._sourceEv = syn;
    arr[index] = merged;
    state.entries[key] = arr;
  }

  function renderEntryForm(scopeId, dayId, index, row) {
    const wrap = document.createElement("fieldset");
    wrap.className = "si-schdb-entry";
    wrap.setAttribute("data-row-index", String(index));
    const leg = document.createElement("legend");
    leg.className = "si-schdb-entry__legend";
    leg.textContent = sessionLegend(index);
    wrap.appendChild(leg);

    function pair(labelKey, fZh, fEn, multiline) {
      const box = document.createElement("div");
      box.className = "si-schdb-field";
      const lab = document.createElement("div");
      lab.className = "si-schdb-field__label";
      lab.textContent = t(labelKey);
      box.appendChild(lab);
      const grid = document.createElement("div");
      grid.className = "si-schdb-pair";
      [
        ["schdb.subZh", fZh],
        ["schdb.subEn", fEn],
      ].forEach(([subK, field]) => {
        const cell = document.createElement("div");
        cell.className = "si-schdb-pair__cell";
        const sl = document.createElement("span");
        sl.className = "si-schdb-pair__sub";
        sl.textContent = t(subK);
        cell.appendChild(sl);
        let inp;
        if (multiline) {
          inp = document.createElement("textarea");
          inp.rows = multiline === "large" ? 4 : 2;
        } else {
          inp = document.createElement("input");
          inp.type = "text";
        }
        inp.className = "si-schdb-input";
        inp.setAttribute("data-field", field);
        inp.value = row[field] || "";
        inp.addEventListener("input", markDirty);
        cell.appendChild(inp);
        grid.appendChild(cell);
      });
      box.appendChild(grid);
      wrap.appendChild(box);
    }

    pair("schdb.fieldTime", "timeZh", "timeEn", false);
    pair("schdb.fieldTopic", "topicZh", "topicEn", false);
    pair("schdb.fieldIntro", "introZh", "introEn", "medium");
    pair("schdb.fieldLoc", "locZh", "locEn", false);
    pair("schdb.fieldDetail", "detailZh", "detailEn", "large");

    const groupWrap = document.createElement("div");
    groupWrap.className = "si-schdb-field si-schdb-field--groupmatrix";
    const gTitle = document.createElement("div");
    gTitle.className = "si-schdb-field__label";
    gTitle.textContent = t("schdb.fieldGroupMatrix");
    groupWrap.appendChild(gTitle);
    const gHint = document.createElement("p");
    gHint.className = "si-schdb-hint";
    gHint.textContent = t("schdb.groupPasteHint");
    groupWrap.appendChild(gHint);

    const gGrid = document.createElement("div");
    gGrid.className = "si-schdb-pair";
    const taZh = document.createElement("textarea");
    const taEn = document.createElement("textarea");
    [["schdb.subZh", taZh, "groupTsvZh"], ["schdb.subEn", taEn, "groupTsvEn"]].forEach(([subK, ta, field]) => {
      const cell = document.createElement("div");
      cell.className = "si-schdb-pair__cell";
      const sl = document.createElement("span");
      sl.className = "si-schdb-pair__sub";
      sl.textContent = t(subK);
      cell.appendChild(sl);
      ta.className = "si-schdb-input si-schdb-input--tsv";
      ta.rows = 6;
      ta.setAttribute("data-field", field);
      ta.value = row[field] || "";
      ta.addEventListener("input", markDirty);
      cell.appendChild(ta);
      gGrid.appendChild(cell);
    });
    groupWrap.appendChild(gGrid);

    const preview = document.createElement("div");
    preview.className = "si-schdb-matrix-preview";
    function refreshGroupPreview() {
      const gm = mergeGroupMatrix(taZh.value, taEn.value);
      preview.innerHTML = gm && matrixHasContent(gm) ? groupMatrixPreviewHtml(gm) : "";
    }
    taZh.addEventListener("input", refreshGroupPreview);
    taEn.addEventListener("input", refreshGroupPreview);
    refreshGroupPreview();
    groupWrap.appendChild(preview);
    wrap.appendChild(groupWrap);

    const actions = document.createElement("div");
    actions.className = "si-schdb-form-actions";

    const done = document.createElement("button");
    done.type = "button";
    done.className = "si-schdb-form-actions__primary";
    done.textContent = t("schdb.doneEdit");
    done.addEventListener("click", () => {
      applyFormToRow(scopeId, dayId, index, wrap);
      editingKey = null;
      editingIndex = -1;
      markDirty();
      renderAll();
    });

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "si-schdb-form-actions__ghost";
    cancel.textContent = t("schdb.cancelEdit");
    cancel.addEventListener("click", () => {
      editingKey = null;
      editingIndex = -1;
      renderAll();
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "si-schdb-form-actions__danger";
    del.textContent = t("schdb.delete");
    del.addEventListener("click", () => {
      const key = compositeKey(scopeId, dayId);
      const arr = state.entries[key] || [];
      arr.splice(index, 1);
      state.entries[key] = arr;
      editingKey = null;
      editingIndex = -1;
      markDirty();
      renderAll();
    });

    actions.appendChild(done);
    actions.appendChild(cancel);
    actions.appendChild(del);
    wrap.appendChild(actions);

    return wrap;
  }

  function createCardRow(scopeId, dayId, index, row) {
    const src = getSrc();
    const wrap = document.createElement("div");
    wrap.className = "si-schdb-cardrow";
    wrap.setAttribute("data-row-index", String(index));

    const slot = document.createElement("div");
    slot.className = "si-schdb-card-slot";
    if (src && typeof src.cardHtml === "function") {
      const ev = eventForDisplay(row);
      slot.innerHTML = src.cardHtml(ev, idBaseFor(scopeId, dayId, index));
    } else {
      slot.textContent = (row.topicZh || row.topicEn || "").trim() || "—";
    }
    wrap.appendChild(slot);

    const status = document.createElement("div");
    status.className = "si-schdb-publish-status";
    status.innerHTML = publishStatusHtml(dayId, index);
    wrap.appendChild(status);

    const actions = document.createElement("div");
    actions.className = "si-schdb-card-actions";

    const syncBtn = document.createElement("button");
    syncBtn.type = "button";
    syncBtn.className = "si-schdb-card-actions__btn si-schdb-card-actions__btn--sync";
    syncBtn.textContent = t("schdb.syncToFront");
    syncBtn.addEventListener("click", () => {
      readRowsFromDom();
      const k = compositeKey(scopeId, dayId);
      const arr = state.entries[k] || [];
      const liveRow = arr[index];
      if (!liveRow) return;
      let defaultName = "";
      try {
        defaultName = localStorage.getItem(actorNameStorageKey()) || "";
      } catch {
        /* ignore */
      }
      const name = window.prompt(t("schdb.actorPrompt"), defaultName);
      if (name === null) return;
      const trimmed = name.trim();
      if (!trimmed) {
        window.alert(t("schdb.actorRequired"));
        return;
      }
      try {
        localStorage.setItem(actorNameStorageKey(), trimmed);
      } catch {
        /* ignore */
      }
      const ev = eventForDisplay(liveRow);
      if (!writeSlotToFront(dayId, index, ev, trimmed)) return;
      notifyScheduleFrontChanged();
      status.innerHTML = publishStatusHtml(dayId, index);
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "si-schdb-card-actions__btn";
    editBtn.textContent = t("schdb.edit");
    editBtn.addEventListener("click", () => {
      editingKey = compositeKey(scopeId, dayId);
      editingIndex = index;
      renderAll();
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "si-schdb-card-actions__btn si-schdb-card-actions__btn--danger";
    delBtn.textContent = t("schdb.delete");
    delBtn.addEventListener("click", () => {
      const key = compositeKey(scopeId, dayId);
      const arr = state.entries[key] || [];
      arr.splice(index, 1);
      state.entries[key] = arr;
      if (editingKey === key && editingIndex === index) {
        editingKey = null;
        editingIndex = -1;
      }
      markDirty();
      renderAll();
    });

    actions.appendChild(syncBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    wrap.appendChild(actions);

    return wrap;
  }

  function wireCardToggles(host) {
    const src = getSrc();
    if (src && typeof src.wireExpandToggles === "function") {
      src.wireExpandToggles(host);
    }
    const tFn = window.SI_I18N && window.SI_I18N.t;
    if (tFn) {
      host.querySelectorAll(".si-sch-table").forEach((tbl) => {
        tbl.setAttribute("aria-label", tFn("schedule.tableAria"));
      });
    }
  }

  function renderDayBody(host, scopeId, dayId) {
    const k = compositeKey(scopeId, dayId);
    if (!Array.isArray(state.entries[k])) state.entries[k] = [];

    if (state.entries[k].length === 0) {
      const empty = document.createElement("p");
      empty.className = "si-schdb-empty";
      empty.textContent = t("schdb.emptyDay");
      host.appendChild(empty);

      const rowBtns = document.createElement("div");
      rowBtns.className = "si-schdb-empty-actions";

      const addFirst = document.createElement("button");
      addFirst.type = "button";
      addFirst.className = "si-schdb-toolbar__btn";
      addFirst.textContent = t("schdb.addRow");
      addFirst.addEventListener("click", () => {
        state.entries[k] = [emptyRow()];
        editingKey = k;
        editingIndex = 0;
        markDirty();
        renderAll();
      });

      rowBtns.appendChild(addFirst);
      host.appendChild(rowBtns);
      return;
    }

    (state.entries[k] || []).forEach((row, idx) => {
      if (editingKey === k && editingIndex === idx) {
        host.appendChild(renderEntryForm(scopeId, dayId, idx, row));
      } else {
        host.appendChild(createCardRow(scopeId, dayId, idx, row));
      }
    });

    wireCardToggles(host);
  }

  function renderScope(container, scopeIds) {
    scopeIds.forEach((scopeId) => {
      const dayIds = dayIdsForSchdb(state.entries, scopeId);
      if (!dayIds) return;

      const scopeWrap = document.createElement("section");
      scopeWrap.className = "si-schdb-scope";
      const h = document.createElement("h3");
      h.className = "si-schdb-scope__title";
      h.textContent = t("schdb.scope." + scopeId);
      scopeWrap.appendChild(h);

      dayIds.forEach((dayId) => {
        const day = ALL_DAYS.find((d) => d.id === dayId);
        if (!day) return;

        const details = document.createElement("details");
        details.className = "si-schdb-day";
        details.setAttribute("data-schdb-scope", scopeId);
        details.setAttribute("data-schdb-day", dayId);
        details.open = true;

        const sum = document.createElement("summary");
        sum.className = "si-schdb-day__summary";
        sum.textContent = t("schdb.dayPrefix") + " · " + dayLabel(day);
        details.appendChild(sum);

        const host = document.createElement("div");
        host.className = "si-schdb-day__body si-schdb-day__body--cards";
        host.setAttribute("data-schdb-day", "1");
        host.setAttribute("data-scope", scopeId);
        host.setAttribute("data-day", dayId);

        const k = compositeKey(scopeId, dayId);
        renderDayBody(host, scopeId, dayId);

        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "si-schdb-addrow";
        addBtn.textContent = t("schdb.addRow");
        addBtn.addEventListener("click", () => {
          readRowsFromDom();
          const arr = state.entries[k] || [];
          arr.push(emptyRow());
          state.entries[k] = arr;
          editingKey = k;
          editingIndex = arr.length - 1;
          markDirty();
          renderAll();
        });

        details.appendChild(host);
        details.appendChild(addBtn);
        scopeWrap.appendChild(details);
      });

      container.appendChild(scopeWrap);
    });
  }

  function collapseSchdbCategoryDays(main, categoryId) {
    const sec = main.querySelector("[data-schdb-category='" + categoryId + "']");
    if (!sec) return;
    sec.querySelectorAll("details.si-schdb-day").forEach(function (d) {
      d.open = false;
    });
  }

  function bindSchdbCategoryFold() {
    if (schdbCategoryFoldDelegationBound) return;
    const main = document.getElementById("schdb-main");
    if (!main) return;
    schdbCategoryFoldDelegationBound = true;
    main.addEventListener("click", function (ev) {
      const head = ev.target.closest("[data-schdb-category-toggle]");
      if (!head) return;
      const cat = head.getAttribute("data-schdb-category-toggle");
      if (!cat) return;
      collapseSchdbCategoryDays(main, cat);
    });
    main.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      const head = ev.target.closest("[data-schdb-category-toggle]");
      if (!head || !main.contains(head)) return;
      ev.preventDefault();
      const cat = head.getAttribute("data-schdb-category-toggle");
      if (!cat) return;
      collapseSchdbCategoryDays(main, cat);
    });
  }

  function bindToolbar() {
    if (toolbarBound) return;
    toolbarBound = true;
    bindVersionPanel();
    bindSchdbCategoryFold();

    document.getElementById("schdb-save")?.addEventListener("click", () => {
      readRowsFromDom();
      if (!saveVersionSnapshot()) return;
      dirty = true;
      flushSave();
      renderVersionList();
      const st = document.getElementById("schdb-save-status");
      if (st) st.textContent = t("schdb.versionSaved");
    });

    document.getElementById("schdb-sync-front")?.addEventListener("click", () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      readRowsFromDom();
      dirty = false;
      saveState();
      const entries = clone(state.entries);
      if (!entries || typeof entries !== "object") {
        window.alert(t("schdb.publishSaveErr"));
        return;
      }
      const doc = { v: 1, syncedAt: new Date().toISOString(), entries: entries };
      try {
        localStorage.setItem(entriesSyncStorageKey(), JSON.stringify(doc));
        localStorage.setItem(publishStorageKey(), JSON.stringify({ v: 1, slots: {} }));
      } catch {
        window.alert(t("schdb.publishSaveErr"));
        return;
      }
      notifyScheduleEntriesFullSynced();
      const st = document.getElementById("schdb-save-status");
      if (st) st.textContent = t("schdb.syncToFrontDone");
    });

    document.getElementById("schdb-export")?.addEventListener("click", () => {
      readRowsFromDom();
      dirty = true;
      flushSave();
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "si-schedule-db.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById("schdb-import-btn")?.addEventListener("click", () => {
      document.getElementById("schdb-import")?.click();
    });

    document.getElementById("schdb-import")?.addEventListener("change", (ev) => {
      const file = ev.target.files && ev.target.files[0];
      ev.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result || ""));
          if (!data || typeof data.entries !== "object") throw new Error("bad");
          if (!window.confirm(t("schdb.importReplace"))) return;
          state = { v: SCHEMA_VERSION, entries: data.entries };
          editingKey = null;
          editingIndex = -1;
          saveState();
          const st = document.getElementById("schdb-save-status");
          if (st) st.textContent = t("schdb.importOk");
          renderAll();
        } catch {
          window.alert(t("schdb.importErr"));
        }
      };
      reader.readAsText(file);
    });

    window.addEventListener("beforeunload", () => {
      readRowsFromDom();
      saveState();
    });
  }

  function captureSchdbDayOpenState(root) {
    const map = {};
    if (!root) return map;
    root.querySelectorAll("details.si-schdb-day").forEach(function (el) {
      const sid = el.getAttribute("data-schdb-scope");
      const did = el.getAttribute("data-schdb-day");
      if (sid && did) {
        map[sid + ":" + did] = !!el.open;
      }
    });
    return map;
  }

  function applySchdbDayOpenState(root, map) {
    if (!root || !map) return;
    root.querySelectorAll("details.si-schdb-day").forEach(function (el) {
      const sid = el.getAttribute("data-schdb-scope");
      const did = el.getAttribute("data-schdb-day");
      if (!sid || !did) return;
      const key = sid + ":" + did;
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        el.open = map[key];
      }
    });
  }

  function openSchdbDayForEditingKey(root, key) {
    if (!root || !key) return;
    const colon = key.indexOf(":");
    if (colon < 0) return;
    const sid = key.slice(0, colon);
    const did = key.slice(colon + 1);
    const target = root.querySelector(
      'details.si-schdb-day[data-schdb-scope="' + sid + '"][data-schdb-day="' + did + '"]'
    );
    if (target) target.open = true;
  }

  function renderAll() {
    const root = document.getElementById("schdb-main");
    if (!root) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const dayOpenMap = captureSchdbDayOpenState(root);
    root.innerHTML = "";

    const catH = document.createElement("h2");
    catH.className = "si-h2 si-schdb-cathead si-schdb-cathead--fold-category";
    catH.setAttribute("data-schdb-category-toggle", "scopes");
    catH.setAttribute("role", "button");
    catH.setAttribute("tabindex", "0");
    catH.setAttribute("aria-label", t("schdb.scopesFoldAria"));
    catH.title = t("schdb.scopesFoldTitle");
    catH.textContent = t("schdb.scopesHeading");
    root.appendChild(catH);

    const catSec = document.createElement("div");
    catSec.className = "si-schdb-category";
    catSec.setAttribute("data-schdb-category", "scopes");
    renderScope(catSec, SCOPE_SCOPES);
    root.appendChild(catSec);

    applySchdbDayOpenState(root, dayOpenMap);
    openSchdbDayForEditingKey(root, editingKey);

    requestAnimationFrame(function () {
      window.scrollTo(0, scrollY);
    });

    bindToolbar();
    renderVersionList();
  }

  function ensureSchdbPublishListen() {
    if (schdbPublishListenBound) return;
    schdbPublishListenBound = true;
    try {
      const ch = new BroadcastChannel(publishBcName());
      ch.addEventListener("message", function () {
        if (document.getElementById("schdb-main")) {
          renderAll();
        }
      });
    } catch {
      /* ignore */
    }
  }

  function boot() {
    ensureSchdbPublishListen();
    const ready =
      window.__SI_SCHEDULE_SOURCE && typeof window.__SI_SCHEDULE_SOURCE.whenReady === "function"
        ? window.__SI_SCHEDULE_SOURCE.whenReady()
        : Promise.resolve();
    ready.finally(() => {
      state = loadState();
      renderAll();
    });
    document.addEventListener("si-lang-applied", () => {
      readRowsFromDom();
      dirty = true;
      flushSave();
      renderAll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
