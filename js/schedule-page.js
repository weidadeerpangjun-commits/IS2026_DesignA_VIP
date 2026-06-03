(function () {
  /** Aug 3–7, 2026 — ids align with calendar day (d1 = 3rd … d5 = 7th). */
  const ALL_DAYS = [
    { id: "d1", month: { zh: "8月", en: "Aug" }, day: 3, dow: { zh: "一", en: "M" } },
    { id: "d2", month: { zh: "8月", en: "Aug" }, day: 4, dow: { zh: "二", en: "T" } },
    { id: "d3", month: { zh: "8月", en: "Aug" }, day: 5, dow: { zh: "三", en: "W" } },
    { id: "d4", month: { zh: "8月", en: "Aug" }, day: 6, dow: { zh: "四", en: "T" } },
    { id: "d5", month: { zh: "8月", en: "Aug" }, day: 7, dow: { zh: "五", en: "F" } },
  ];

  /** Which schedule days appear for each scope when there is no row data yet. V1 日程可填满 d1–d5；首页 Scope 参训展示仍为 8/5–7。 */
  const SCOPE_DAY_IDS = {
    v1: ["d1", "d2", "d3", "d4", "d5"],
    v2: ["d1", "d2", "d3", "d4", "d5"],
  };

  const DEFAULT_DAY_IDS = ["d1", "d2", "d3", "d4", "d5"];

  function readScope() {
    try {
      return localStorage.getItem("si-scope");
    } catch {
      return null;
    }
  }

  /** Cached DB `entries` after successful fetch — used to derive tab days from data + rebuild on scope change. */
  let SCHEDULE_ENTRIES_CACHE = null;

  /** Day ids (d1…d5) that have ≥1 session row for this scope in `entries` (sorted by day number). */
  function dayIdsWithDataForScope(entries, scope) {
    if (!scope || !entries) return null;
    const prefix = scope + ":";
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

  function pickDbRowsStrict(entries, dayId, scope) {
    const arr = entries[scope + ":" + dayId];
    return Array.isArray(arr) ? arr : [];
  }

  function getActiveDays() {
    const scope = readScope();
    const entries = SCHEDULE_ENTRIES_CACHE;
    const fromData = scope && entries ? dayIdsWithDataForScope(entries, scope) : null;
    const template = scope && SCOPE_DAY_IDS[scope];
    if (fromData && fromData.length) {
      return fromData
        .map(function (id) {
          return ALL_DAYS.find(function (d) {
            return d.id === id;
          });
        })
        .filter(Boolean);
    }
    const ids = template || DEFAULT_DAY_IDS;
    const set = new Set(ids);
    return ALL_DAYS.filter((d) => set.has(d.id));
  }

  const EVENTS_BUILTIN = {
    d1: [],
    d2: [],
    d3: [],
    d4: [],
    d5: [],
  };
  const PUBLISH_STORE_KEY = "si-schedule-front-publish-v2";
  const PUBLISH_BC_NAME = "si-schedule-front-channel-v2";
  /** Full `entries` snapshot from schedule-db «sync all to front»; overrides fetched JSON when present. */
  const ENTRIES_SYNC_KEY = "si-schedule-front-entries-sync-v2";
  const ACTOR_NAME_KEY = "si-schedule-actor-name";

  function deepCloneEventsMap(src) {
    try {
      return JSON.parse(JSON.stringify(src));
    } catch {
      return null;
    }
  }

  function emptySlotPlaceholderEvent() {
    return {
      variant: "secondary",
      expandable: false,
      showChevron: false,
      time: { zh: "", en: "" },
      items: [{ zh: "", en: "" }],
    };
  }

  function applyFrontPublishSlots(baseMap) {
    const out = deepCloneEventsMap(baseMap) || {};
    try {
      const raw = localStorage.getItem(PUBLISH_STORE_KEY);
      if (!raw) return out;
      const doc = JSON.parse(raw);
      const slots = doc && doc.slots;
      if (!slots || typeof slots !== "object") return out;
      Object.keys(slots).forEach(function (slotKey) {
        const parts = slotKey.split(":");
        if (parts.length !== 2) return;
        const dayId = parts[0];
        const idx = parseInt(parts[1], 10);
        const pack = slots[slotKey];
        if (!pack || pack.ev == null) return;
        if (Number.isNaN(idx) || idx < 0) return;
        if (!Array.isArray(out[dayId])) out[dayId] = [];
        while (out[dayId].length <= idx) {
          out[dayId].push(emptySlotPlaceholderEvent());
        }
        const evCopy = cloneEvent(pack.ev);
        if (evCopy) out[dayId][idx] = evCopy;
      });
    } catch {
      /* ignore */
    }
    return out;
  }

  let EVENTS_BASE = deepCloneEventsMap(EVENTS_BUILTIN) || {};
  let EVENTS = applyFrontPublishSlots(EVENTS_BASE);

  let eventsHydratePromise = null;

  function cloneEvent(o) {
    try {
      return JSON.parse(JSON.stringify(o));
    } catch {
      return null;
    }
  }

  function bilingualLinesToItems(zhText, enText) {
    const zl = String(zhText || "")
      .replace(/\r\n/g, "\n")
      .split("\n");
    const el = String(enText || "")
      .replace(/\r\n/g, "\n")
      .split("\n");
    const n = Math.max(zl.length, el.length);
    const items = [];
    for (let i = 0; i < n; i++) {
      const zh = (zl[i] || "").trim();
      const en = (el[i] || "").trim();
      if (zh || en) items.push({ zh: zh, en: en });
    }
    if (!items.length && ((zhText || "").trim() || (enText || "").trim())) {
      items.push({ zh: (zhText || "").trim(), en: (enText || "").trim() });
    }
    return items;
  }

  function rowDbToEvent(row) {
    if (!row) return null;

    function applyRowFieldsOntoClonedEvent(ev) {
      const hasDetail = !!(row.detailZh || row.detailEn);
      const gm = mergeGroupMatrixFromRow(row);
      const hasGroup = gm && matrixHasContentSch(gm);

      const tz = (row.timeZh || "").trim();
      const te = (row.timeEn || "").trim();
      if (tz || te) {
        ev.time = ev.time || { zh: "", en: "" };
        if (tz) ev.time.zh = row.timeZh || "";
        if (te) ev.time.en = row.timeEn || "";
      }

      if ((row.topicZh || "").trim() || (row.topicEn || "").trim()) {
        const topicItems = bilingualLinesToItems(row.topicZh, row.topicEn);
        if (topicItems.length) ev.items = topicItems;
      }

      if ((row.introZh || "").trim() || (row.introEn || "").trim()) {
        ev.audience = { zh: row.introZh || "", en: row.introEn || "" };
      }

      if ((row.locZh || "").trim() || (row.locEn || "").trim()) {
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
        ev.detailLines = lines.filter(function (x) {
          return x.zh || x.en;
        });
        if (!ev.detailLines.length) {
          ev.detailLines = [{ zh: (row.detailZh || "").trim(), en: (row.detailEn || "").trim() }];
        }
      }

      if (hasGroup) {
        ev.groupMatrix = gm;
      }

      const innerBlocks =
        (ev.detailLines && ev.detailLines.length > 0) ||
        !!ev.table ||
        matrixHasContentSch(ev.groupMatrix);
      ev.expandable = !!innerBlocks;
      ev.showChevron = !!innerBlocks;
      return ev;
    }

    if (row._sourceEv) {
      const c = cloneEvent(row._sourceEv);
      if (c) return applyRowFieldsOntoClonedEvent(c);
    }

    const hasDetail = !!(row.detailZh || row.detailEn);
    const gm = mergeGroupMatrixFromRow(row);
    const hasGroup = gm && matrixHasContentSch(gm);
    const items = bilingualLinesToItems(row.topicZh, row.topicEn);
    if (!items.length) items.push({ zh: "", en: "" });
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
      if (!ev.detailLines.length) {
        ev.detailLines = [{ zh: (row.detailZh || "").trim(), en: (row.detailEn || "").trim() }];
      }
    }
    if (hasGroup) {
      ev.groupMatrix = gm;
    }
    return ev;
  }

  function parseTsvGridSch(text) {
    const raw = String(text || "").replace(/\r\n/g, "\n");
    const lines = raw
      .split("\n")
      .map(function (l) {
        return l.replace(/\s+$/, "");
      })
      .filter(function (l) {
        return l.length > 0;
      });
    if (!lines.length) return { headers: [], rows: [] };
    const headers = lines[0].split("\t");
    const n = headers.length;
    const rows = lines.slice(1).map(function (line) {
      const cells = line.split("\t");
      const out = cells.slice(0, n);
      while (out.length < n) out.push("");
      return out;
    });
    return { headers: headers, rows: rows };
  }

  function mergeGroupMatrixFromRow(row) {
    const a = parseTsvGridSch(row.groupTsvZh);
    const b = parseTsvGridSch(row.groupTsvEn);
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
      const rowCells = [];
      for (let j = 0; j < nCol; j++) {
        rowCells.push({ zh: (rzh[j] || "").trim(), en: (ren[j] || "").trim() });
      }
      rows.push(rowCells);
    }
    return { columns: columns, rows: rows };
  }

  function matrixHasContentSch(m) {
    if (!m || !m.columns || !m.columns.length) return false;
    if (m.columns.some(function (c) { return (c.zh || "").trim() || (c.en || "").trim(); })) return true;
    return (m.rows || []).some(function (r) {
      return r.some(function (c) { return (c.zh || "").trim() || (c.en || "").trim(); });
    });
  }

  function pickDbRows(entries, dayId) {
    const suf = ":" + dayId;
    const scope = readScope();
    if (scope && SCOPE_DAY_IDS[scope]) {
      const exact = entries[scope + suf];
      if (Array.isArray(exact) && exact.length) return exact;
    }
    const preferred = entries["v1" + suf];
    if (Array.isArray(preferred) && preferred.length) return preferred;
    const keys = Object.keys(entries).sort();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].endsWith(suf)) {
        const r = entries[keys[i]];
        if (Array.isArray(r) && r.length) return r;
      }
    }
    return [];
  }

  function resolveScheduleEntriesFromStores(fileData) {
    const fileEntries =
      fileData && fileData.entries && typeof fileData.entries === "object" ? fileData.entries : {};
    try {
      const raw = localStorage.getItem(ENTRIES_SYNC_KEY);
      if (!raw) return fileEntries;
      const doc = JSON.parse(raw);
      if (doc && doc.entries && typeof doc.entries === "object") return doc.entries;
    } catch {
      /* ignore */
    }
    return fileEntries;
  }

  function buildEventsFromDbPayload(data) {
    const entries = (data && data.entries) || {};
    const scope = readScope();
    const dataDayIds = dayIdsWithDataForScope(entries, scope);
    const out = {};

    if (dataDayIds && dataDayIds.length) {
      dataDayIds.forEach(function (dayId) {
        out[dayId] = pickDbRowsStrict(entries, dayId, scope)
          .map(rowDbToEvent)
          .filter(Boolean);
      });
    } else {
      ["d1", "d2", "d3", "d4", "d5"].forEach(function (dayId) {
        out[dayId] = pickDbRows(entries, dayId)
          .map(rowDbToEvent)
          .filter(Boolean);
      });
    }
    return out;
  }

  function whenScheduleEventsReady() {
    if (!eventsHydratePromise) {
      eventsHydratePromise = fetch("data/si-schedule-db.json", { cache: "no-store" })
        .then(function (res) {
          if (!res.ok) throw new Error("no json");
          return res.json();
        })
        .then(function (data) {
          const mergedEntries = resolveScheduleEntriesFromStores(data);
          SCHEDULE_ENTRIES_CACHE = mergedEntries;
          const next = buildEventsFromDbPayload({ entries: mergedEntries });
          const hasAny = Object.keys(next).some(function (id) {
            return next[id] && next[id].length;
          });
          if (hasAny) {
            EVENTS_BASE = deepCloneEventsMap(next) || {};
            EVENTS = applyFrontPublishSlots(EVENTS_BASE);
          }
        })
        .catch(function () {
          const mergedEntries = resolveScheduleEntriesFromStores(null);
          if (!mergedEntries || !Object.keys(mergedEntries).length) {
            SCHEDULE_ENTRIES_CACHE = null;
            EVENTS_BASE = deepCloneEventsMap(EVENTS_BUILTIN) || {};
            EVENTS = applyFrontPublishSlots(EVENTS_BASE);
            return;
          }
          SCHEDULE_ENTRIES_CACHE = mergedEntries;
          const next = buildEventsFromDbPayload({ entries: mergedEntries });
          const hasAny = Object.keys(next).some(function (id) {
            return next[id] && next[id].length;
          });
          if (hasAny) {
            EVENTS_BASE = deepCloneEventsMap(next) || {};
            EVENTS = applyFrontPublishSlots(EVENTS_BASE);
          } else {
            SCHEDULE_ENTRIES_CACHE = null;
            EVENTS_BASE = deepCloneEventsMap(EVENTS_BUILTIN) || {};
            EVENTS = applyFrontPublishSlots(EVENTS_BASE);
          }
        });
    }
    return eventsHydratePromise;
  }

  whenScheduleEventsReady();

  let currentDayId = "d1";

  function lang() {
    return (window.SI_I18N && window.SI_I18N.getLang && window.SI_I18N.getLang()) || "zh";
  }

  function L(obj) {
    const l = lang();
    return obj[l] || obj.zh || obj.en || "";
  }

  function formatScheduleTimePart(token) {
    const t = (token || "").trim();
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return t;
    return String(parseInt(m[1], 10)).padStart(2, "0") + ":" + m[2];
  }

  /** Schedule card times: zero-padded hours, spaced hyphen (e.g. 09:00 - 09:30). */
  function formatScheduleTime(raw) {
    if (raw == null) return "";
    const s = String(raw).trim();
    if (!s) return s;
    const parts = s.split(/\s*[-–—−]\s*/);
    if (parts.length === 1) return formatScheduleTimePart(parts[0]);
    return parts.map(formatScheduleTimePart).join(" - ");
  }

  /** Location pin — paths match `icon/ic-location.svg` (stroke uses currentColor). */
  function pinSvg() {
    return (
      '<svg class="si-sch-pin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<path d="M12 11H12.01V11.01H12V11Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M12 21.9999L17.5 16.4999C18.5878 15.4121 19.3285 14.0262 19.6286 12.5175C19.9287 11.0087 19.7747 9.4448 19.186 8.02358C18.5972 6.60235 17.6003 5.38762 16.3212 4.53297C15.0422 3.67833 13.5384 3.22217 12 3.22217C10.4617 3.22217 8.95794 3.67833 7.67886 4.53297C6.39978 5.38762 5.40286 6.60235 4.81415 8.02358C4.22544 9.4448 4.07139 11.0087 4.37148 12.5175C4.67156 14.0262 5.41231 15.4121 6.50005 16.4999L12 21.9999Z" stroke="currentColor" stroke-linejoin="round"/>' +
      "</svg>"
    );
  }

  function chevronSvg() {
    return (
      '<svg class="si-sch-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<path d="M3 12.5H21V11.5H3V12.5Z" fill="currentColor"/>' +
      '<path d="M11.5 3.5L11.5 21.5H12.5L12.5 3.5L11.5 3.5Z" fill="currentColor"/>' +
      "</svg>"
    );
  }

  function itemsHtml(items) {
    const lis = items
      .map(
        (it) =>
          `<li><span class="si-sch-item-text">${escapeHtml(L(it))}</span></li>`
      )
      .join("");
    return `<ul class="si-sch-bullets">${lis}</ul>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tableHtml(table) {
    const h = table.headers;
    const rows = table.rows
      .map(
        (r) =>
          `<div class="si-sch-table__row${r.stripe ? " is-stripe" : ""}">` +
          `<div class="si-sch-table__cell">${escapeHtml(L(r.attendees))}</div>` +
          `<div class="si-sch-table__cell si-sch-table__cell--loc">${escapeHtml(L(r.location))}</div>` +
          `</div>`
      )
      .join("");
    return (
      `<div class="si-sch-table" role="table" aria-label="">` +
      `<div class="si-sch-table__head" role="row">` +
      `<div class="si-sch-table__h" role="columnheader">${escapeHtml(L(h.attendees))}</div>` +
      `<div class="si-sch-table__h si-sch-table__h--loc" role="columnheader">${escapeHtml(L(h.location))}</div>` +
      `</div>` +
      `<div class="si-sch-table__group" role="rowgroup">` +
      `<div class="si-sch-table__group-label" role="row"><div class="si-sch-table__group-cell" role="cell">${escapeHtml(
        L(table.groupLabel)
      )}</div></div>` +
      `<div class="si-sch-table__rows">${rows}</div>` +
      `</div></div>`
    );
  }

  function mergeAdjacentMatrixBodyHtml(textGrid) {
    if (!textGrid || !textGrid.length) return "";
    const rows = textGrid.length;
    const cols = textGrid.reduce(function (max, row) {
      return Math.max(max, row.length);
    }, 0);
    if (!cols) return "";

    const grid = textGrid.map(function (row) {
      const next = row.slice();
      while (next.length < cols) next.push("");
      return next.map(function (cell) {
        return String(cell == null ? "" : cell);
      });
    });

    const covered = Array.from({ length: rows }, function () {
      return Array(cols).fill(false);
    });
    let html = "";

    for (let i = 0; i < rows; i++) {
      html += "<tr>";
      for (let j = 0; j < cols; j++) {
        if (covered[i][j]) continue;
        const val = grid[i][j];

        let rowspan = 1;
        while (i + rowspan < rows && grid[i + rowspan][j] === val) {
          rowspan++;
        }

        let colspan = 1;
        while (j + colspan < cols) {
          let blockOk = true;
          for (let r = 0; r < rowspan; r++) {
            if (grid[i + r][j + colspan] !== val) {
              blockOk = false;
              break;
            }
          }
          if (!blockOk) break;
          colspan++;
        }

        for (let r = 0; r < rowspan; r++) {
          for (let c = 0; c < colspan; c++) {
            covered[i + r][j + c] = true;
          }
        }

        const attrs = [];
        if (rowspan > 1) attrs.push('rowspan="' + rowspan + '"');
        if (colspan > 1) attrs.push('colspan="' + colspan + '"');
        html += "<td" + (attrs.length ? " " + attrs.join(" ") : "") + ">" + escapeHtml(val) + "</td>";
      }
      html += "</tr>";
    }

    return html;
  }

  function groupMatrixHtml(m) {
    if (!matrixHasContentSch(m)) return "";
    const ths = m.columns
      .map(function (c) {
        return `<th scope="col">${escapeHtml(L(c))}</th>`;
      })
      .join("");
    const grid = (m.rows || []).map(function (row) {
      return row.map(function (cell) {
        return L(cell);
      });
    });
    const trs = mergeAdjacentMatrixBodyHtml(grid);
    return (
      `<div class="table-style-a si-sch-group-matrix">` +
      `<div class="si-card table-style-a__wrap si-card--tablewrap">` +
      `<table class="si-inner-table table-style-a__table"><thead><tr>` +
      ths +
      `</tr></thead><tbody>` +
      trs +
      `</tbody></table></div></div>`
    );
  }

  function cardHtml(ev, idBase) {
    const innerBlocks =
      (ev.detailLines && ev.detailLines.length > 0) ||
      !!ev.table ||
      matrixHasContentSch(ev.groupMatrix);
    const canExpand = !!ev.expandable || innerBlocks;
    const showChev = !!ev.showChevron || innerBlocks;
    const hasExtra = canExpand && innerBlocks;
    const expandedDefault = !!(canExpand && ev.expanded);
    const extraId = "sch-extra-" + idBase;
    const timeText = escapeHtml(formatScheduleTime(L(ev.time)));

    const cardKind = hasExtra ? "si-sch-card--detail" : "si-sch-card--simple";
    const articleClass =
      "si-sch-card " + cardKind + (hasExtra && expandedDefault ? " is-expanded" : "");

    const topicsUl = itemsHtml(ev.items);
    const ari = expandedDefault ? "true" : "false";

    let audience = "";
    if (ev.audience) {
      audience = `<p class="si-sch-audience">${escapeHtml(L(ev.audience))}</p>`;
    }

    let loc = "";
    if (ev.location) {
      loc =
        `<div class="si-sch-loc">` +
        pinSvg() +
        `<span class="si-sch-loc__text">${escapeHtml(L(ev.location))}</span>` +
        `</div>`;
    }

    let lead;
    if (canExpand && showChev && hasExtra) {
      const locSlot = loc ? `<div class="si-sch-card__locslot">${loc}</div>` : "";
      lead =
        `<div class="si-sch-card__lead si-sch-card__lead--expand">` +
        `<button type="button" class="si-sch-card__timebtn" aria-expanded="${ari}" aria-controls="${extraId}" data-sch-expand="1">` +
        `<span class="si-sch-card__time">${timeText}</span>` +
        `</button>` +
        `<div class="si-sch-card__topicswrap">` +
        `<div class="si-sch-card__topics">${topicsUl}</div>` +
        `</div>` +
        audience +
        locSlot +
        `<button type="button" class="si-sch-card__chevbtn" aria-expanded="${ari}" aria-controls="${extraId}" data-sch-expand="1" tabindex="-1">` +
        `<span class="si-sch-card__chev" aria-hidden="true">${chevronSvg()}</span>` +
        `</button>` +
        `</div>`;
    } else {
      const spacer = showChev
        ? `<span class="si-sch-card__chev si-sch-card__chev--ghost" aria-hidden="true">${chevronSvg()}</span>`
        : `<span class="si-sch-card__chevspacer" aria-hidden="true"></span>`;
      const head =
        `<div class="si-sch-card__headrow">` +
        `<span class="si-sch-card__time">${timeText}</span>` +
        spacer +
        `</div>`;
      lead =
        `<div class="si-sch-card__lead si-sch-card__lead--simple">` +
        head +
        `<div class="si-sch-card__topics">${topicsUl}</div>` +
        audience +
        loc +
        `</div>`;
    }

    let extra = "";
    if (hasExtra) {
      const lines = (ev.detailLines || [])
        .map((ln) => `<p class="si-sch-detail-line">${escapeHtml(L(ln))}</p>`)
        .join("");
      const tbl = ev.table ? tableHtml(ev.table) : "";
      const grid = groupMatrixHtml(ev.groupMatrix);
      extra = `<div class="si-sch-extra" id="${extraId}">` + lines + tbl + grid + `</div>`;
    }

    return (
      `<article class="${articleClass}" data-expandable="${canExpand}">` +
      `<div class="si-sch-card__inner">` +
      lead +
      extra +
      `</div></article>`
    );
  }

  function wireExpandToggles(root) {
    const tFn = window.SI_I18N && window.SI_I18N.t;

    root.querySelectorAll(".si-sch-card--detail .si-sch-card__lead--expand").forEach((lead) => {
      if (lead.dataset.bound === "1") return;
      lead.dataset.bound = "1";
      const card = lead.closest(".si-sch-card--detail");
      const timeBtn = lead.querySelector(".si-sch-card__timebtn");
      const chevBtn = lead.querySelector(".si-sch-card__chevbtn");
      if (!timeBtn || !card) return;

      const setAria = () => {
        if (!tFn) return;
        const open = timeBtn.getAttribute("aria-expanded") === "true";
        const lab = open ? tFn("schedule.collapse") : tFn("schedule.expand");
        timeBtn.setAttribute("aria-label", lab);
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
        // Make the whole header region clickable, but don't hijack real interactive controls.
        const interactive = e.target && e.target.closest && e.target.closest("a,button,input,textarea,select,label");
        if (interactive) return;
        flip();
      };

      timeBtn.addEventListener("click", flip);
      if (chevBtn) chevBtn.addEventListener("click", flip);
      lead.addEventListener("click", onLeadClick);
    });

    root.querySelectorAll(".si-sch-card__toggle").forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      const card = btn.closest(".si-sch-card--detail");
      const setAria = () => {
        if (!tFn) return;
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-label", open ? tFn("schedule.collapse") : tFn("schedule.expand"));
      };
      setAria();
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        const next = !open;
        btn.setAttribute("aria-expanded", String(next));
        if (card) {
          card.classList.toggle("is-expanded", next);
        }
        setAria();
      });
    });
  }

  function renderPanels(activeDays) {
    const host = document.getElementById("schedule-day-panels");
    if (!host) return;
    host.innerHTML = activeDays
      .map((d) => {
        const events = EVENTS[d.id] || [];
        const cards = events.map((ev, i) => cardHtml(ev, d.id + "-" + i)).join("");
        const hidden = d.id === currentDayId ? "" : " hidden";
        return `<section class="si-schedule-day" id="panel-${d.id}" data-day="${d.id}"${hidden}>${cards}</section>`;
      })
      .join("");

    wireExpandToggles(host);

    activeDays.forEach((d) => {
      const panel = document.getElementById("panel-" + d.id);
      if (!panel) return;
      if (d.id === currentDayId) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });

    const t = window.SI_I18N && window.SI_I18N.t;
    if (t) {
      host.querySelectorAll(".si-sch-table").forEach((tbl) => {
        tbl.setAttribute("aria-label", t("schedule.tableAria"));
      });
    }
  }

  function renderTabs(activeDays) {
    const tablist = document.getElementById("schedule-date-tabs");
    if (!tablist) return;
    tablist.innerHTML = activeDays
      .map((d) => {
        const active = d.id === currentDayId;
        const cls = "si-date-tab" + (active ? " is-active" : "");
        return (
          `<button type="button" class="${cls}" role="tab" aria-selected="${active}" aria-controls="panel-${d.id}" id="tab-${d.id}" data-day="${d.id}">` +
          `<span class="si-date-tab__month">${escapeHtml(L(d.month))}</span>` +
          `<span class="si-date-tab__day">${d.day}</span>` +
          `<span class="si-date-tab__dow">${escapeHtml(L(d.dow))}</span>` +
          `</button>`
        );
      })
      .join("");
  }

  function bindDateTabDelegation() {
    const tablist = document.getElementById("schedule-date-tabs");
    if (!tablist || tablist.dataset.delegation === "1") return;
    tablist.dataset.delegation = "1";
    tablist.addEventListener("click", (e) => {
      const tab = e.target && e.target.closest && e.target.closest(".si-date-tab");
      if (!tab) return;
      const days = getActiveDays();
      const fallback = days[0] && days[0].id ? days[0].id : "d1";
      currentDayId = tab.getAttribute("data-day") || fallback;
      tablist.querySelectorAll(".si-date-tab").forEach((t) => {
        const on = t.getAttribute("data-day") === currentDayId;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      days.forEach((d) => {
        const panel = document.getElementById("panel-" + d.id);
        if (!panel) return;
        if (d.id === currentDayId) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    });
  }

  function updateScopeLine() {
    const el = document.getElementById("schedule-scope");
    if (!el || !window.SI_I18N) return;
    let scope = null;
    try {
      scope = localStorage.getItem("si-scope");
    } catch {
      /* ignore */
    }
    const label = scope && window.SI_I18N.tScopeChip ? window.SI_I18N.tScopeChip(scope) : "";
    if (!scope || !label) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = label;
  }

  function fullRender() {
    if (SCHEDULE_ENTRIES_CACHE) {
      const next = buildEventsFromDbPayload({ entries: SCHEDULE_ENTRIES_CACHE });
      EVENTS_BASE = deepCloneEventsMap(next) || {};
      EVENTS = applyFrontPublishSlots(EVENTS_BASE);
    }
    const activeDays = getActiveDays();
    if (!activeDays.length) {
      currentDayId = "d1";
    } else if (!activeDays.some((d) => d.id === currentDayId)) {
      currentDayId = activeDays[0].id;
    }
    renderTabs(activeDays);
    renderPanels(activeDays);
    updateScopeLine();
  }

  let scheduleLangListenerBound = false;

  function refreshPublishLayer() {
    EVENTS = applyFrontPublishSlots(EVENTS_BASE);
    fullRender();
  }

  function applyEntriesSyncFromLocalStorage() {
    try {
      const raw = localStorage.getItem(ENTRIES_SYNC_KEY);
      if (!raw) return;
      const doc = JSON.parse(raw);
      if (!doc || !doc.entries || typeof doc.entries !== "object") return;
      SCHEDULE_ENTRIES_CACHE = doc.entries;
      const next = buildEventsFromDbPayload({ entries: SCHEDULE_ENTRIES_CACHE });
      const hasAny = Object.keys(next).some(function (id) {
        return next[id] && next[id].length;
      });
      if (hasAny) {
        EVENTS_BASE = deepCloneEventsMap(next) || {};
        EVENTS = applyFrontPublishSlots(EVENTS_BASE);
        fullRender();
      }
    } catch {
      /* ignore */
    }
  }

  let schedulePublishChannelBound = false;
  function bindSchedulePublishChannel() {
    if (schedulePublishChannelBound) return;
    schedulePublishChannelBound = true;
    try {
      const ch = new BroadcastChannel(PUBLISH_BC_NAME);
      ch.addEventListener("message", function (ev) {
        const typ = ev && ev.data && ev.data.type;
        if (typ === "si-schedule-entries-synced") {
          applyEntriesSyncFromLocalStorage();
          return;
        }
        refreshPublishLayer();
      });
    } catch {
      /* ignore */
    }
  }
  bindSchedulePublishChannel();

  window.__siScheduleInit = function () {
    bindDateTabDelegation();
    whenScheduleEventsReady().finally(function () {
      fullRender();
    });
    if (!scheduleLangListenerBound) {
      scheduleLangListenerBound = true;
      document.addEventListener("si-lang-applied", fullRender);
    }
  };

  /** Read-only hooks for schedule-db and tooling (do not mutate EVENTS in place). */
  window.__SI_SCHEDULE_SOURCE = {
    ALL_DAYS,
    SCOPE_DAY_IDS,
    dayIdsWithDataForScope,
    PUBLISH_STORE_KEY,
    PUBLISH_BC_NAME,
    ENTRIES_SYNC_KEY,
    ACTOR_NAME_KEY,
    get EVENTS() {
      return EVENTS;
    },
    cardHtml,
    formatScheduleTime,
    wireExpandToggles,
    mergeAdjacentMatrixBodyHtml,
    whenReady: whenScheduleEventsReady,
    refreshPublishLayer,
    applyEntriesSyncFromLocalStorage,
  };
})();
