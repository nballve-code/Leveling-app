import {
  PRIEST_UPDATED, SOURCES, CHANGES, RACIALS, RACIALS_VERIFY, MILESTONES, PLAN, TALENTS,
  GEAR, GEAR_NOTE, DUNGEONS, LINKS, wowheadSearch,
} from "./content/priest.js";
import { PROF_UPDATED, RANKS, CLOTH, DISENCHANT, PROFESSIONS, PROF_SOURCES } from "./content/professions.js";

// Idioma: la interfaz va en español; todo lo que es del juego (spells, items,
// zones, dungeons, professions, tags del foro) queda en inglés.

// ---------------------------------------------------------------- estado

const LS = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* modo privado */ }
  },
};

const DEFAULT_SETTINGS = { level: 1, race: "", faction: "", inAppNotify: false, ntfyTopic: "", profSkills: {} };
const settings = { ...DEFAULT_SETTINGS, ...LS.get("settings", {}) };
settings.profSkills = settings.profSkills || {};
delete settings.regions; // versiones anteriores tenían filtro de región
const saveSettings = () => LS.set("settings", settings);

let readIds = new Set(LS.get("readIds", []));
const saveRead = () => LS.set("readIds", [...readIds].slice(-1500));

const state = {
  blues: [],
  news: [],
  character: null,
  generatedAt: null,
  filter: LS.get("blueFilter", "important"),
  query: "",
  priestTab: "plan",
};

const TAG_LABEL = {
  hotfix: "Hotfix", "known-issues": "Known Issues", "patch-notes": "Patch Notes", servers: "Servers",
  news: "Blizzard News", priest: "Priest", reply: "Reply",
};
const FILTERS = [
  ["important", "Importantes"], ["all", "Todos"], ["hotfix", "Hotfixes"], ["known-issues", "Known Issues"],
  ["news", "News"], ["patch-notes", "Patch Notes"], ["priest", "Priest"], ["reply", "Replies"],
];
const SLOT_LABEL = {
  HEAD: "Head", NECK: "Neck", SHOULDER: "Shoulder", BACK: "Back", CHEST: "Chest", SHIRT: "Shirt", TABARD: "Tabard",
  WRIST: "Wrist", HANDS: "Hands", WAIST: "Waist", LEGS: "Legs", FEET: "Feet", FINGER_1: "Finger", FINGER_2: "Finger",
  TRINKET_1: "Trinket", TRINKET_2: "Trinket", MAIN_HAND: "Main Hand", OFF_HAND: "Off Hand", RANGED: "Ranged (Wand)",
};
const GEAR_SLOTS = ["HEAD", "NECK", "SHOULDER", "BACK", "CHEST", "WRIST", "HANDS", "WAIST", "LEGS", "FEET", "FINGER_1", "FINGER_2", "TRINKET_1", "TRINKET_2", "MAIN_HAND", "OFF_HAND", "RANGED"];
const QUALITY_COLOR = { POOR: "#9d9d9d", COMMON: "#e8e8e8", UNCOMMON: "#1eff00", RARE: "#4a9cff", EPIC: "#b048f8", LEGENDARY: "#ff8000" };

// ---------------------------------------------------------------- utilidades

const $view = document.getElementById("view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const safeUrl = (u) => (/^https:\/\//i.test(String(u || "")) ? String(u) : "#");
const ext = (url, label) => `<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "recién";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 7) return `hace ${Math.floor(s / 86400)} d`;
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// Sanitizador del HTML de los foros: solo etiquetas de texto conocidas, links e
// imágenes https. Todo lo demás se descarta.
const ALLOWED = new Set(["P", "BR", "HR", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "U", "H1", "H2", "H3", "H4", "H5", "BLOCKQUOTE", "A", "IMG", "CODE", "PRE", "SPAN", "DIV", "TABLE", "THEAD", "TBODY", "TR", "TD", "TH", "ASIDE", "DETAILS", "SUMMARY"]);
function sanitize(html, base) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const out = document.createElement("div");
  const walk = (src, dst) => {
    for (const node of src.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) { dst.appendChild(document.createTextNode(node.textContent)); continue; }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = node.tagName;
      if (!ALLOWED.has(tag)) { if (!["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG", "NOSCRIPT"].includes(tag)) walk(node, dst); continue; }
      if (tag === "A" && node.classList.contains("anchor")) continue;
      const el = document.createElement(tag);
      if (tag === "A") {
        let href = node.getAttribute("href") || "";
        if (href.startsWith("/")) href = new URL(href, base).href;
        if (/^https:\/\//i.test(href)) { el.href = href; el.target = "_blank"; el.rel = "noopener noreferrer"; }
      }
      if (tag === "IMG") {
        let src = node.getAttribute("src") || "";
        if (src.startsWith("//")) src = `https:${src}`;
        if (!/^https:\/\//i.test(src) || node.classList.contains("emoji")) continue;
        el.src = src; el.loading = "lazy"; el.alt = node.getAttribute("alt") || "";
      }
      walk(node, el);
      dst.appendChild(el);
    }
  };
  walk(doc.body.firstChild, out);
  return out;
}

// ---------------------------------------------------------------- personaje

const charOk = () => !!(state.character && state.character.status?.ok && state.character.level);
const level = () => (charOk() ? state.character.level : settings.level);
const race = () => (charOk() ? state.character.race : settings.race);
const faction = () => {
  if (charOk() && state.character.faction) return state.character.faction === "ALLIANCE" ? "A" : state.character.faction === "HORDE" ? "H" : "";
  return settings.faction || RACIALS.find((r) => r.race === settings.race)?.faction || "";
};

function profSkill(prof) {
  const fromApi = charOk() ? state.character.professions?.find((p) => p.name?.toLowerCase() === prof.name.toLowerCase()) : null;
  if (fromApi && fromApi.skill != null) return { skill: fromApi.skill, max: fromApi.max, auto: true };
  const v = settings.profSkills[prof.id];
  return { skill: Number.isFinite(v) ? v : 1, max: null, auto: false };
}

function levelBracket(lvl) {
  return PLAN.find((p) => lvl >= p.from && lvl <= p.to) || PLAN[0];
}

function isUnread(p) { return !readIds.has(p.id) && !readIds.has(`${p.id}@${p.updatedAt || ""}`); }
function markRead(p) { readIds.add(p.id); if (p.updatedAt) readIds.add(`${p.id}@${p.updatedAt}`); saveRead(); updateBadge(); }

const visibleBlues = () => state.blues.filter((p) => p.region === "us");

function updateBadge() {
  const n = visibleBlues().filter((p) => p.important && isUnread(p)).length;
  const b = document.getElementById("badge");
  b.hidden = n === 0;
  b.textContent = n > 99 ? "99+" : String(n);
  try { if (n && navigator.setAppBadge) navigator.setAppBadge(n); else if (navigator.clearAppBadge) navigator.clearAppBadge(); } catch { /* no soportado */ }
}

// ---------------------------------------------------------------- datos

async function loadData({ silent = false } = {}) {
  const btn = document.getElementById("refresh");
  btn.classList.add("spin");
  const getJSON = (u) => fetch(`${u}?t=${Date.now()}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  try {
    const [b, n, c] = await Promise.all([getJSON("data/blues.json"), getJSON("data/news.json"), getJSON("data/character.json")]);
    if (!b) throw new Error("sin datos");
    const prevIds = new Set(state.blues.map((p) => `${p.id}@${p.updatedAt || ""}`));
    const hadData = state.blues.length > 0;
    state.blues = b.posts || [];
    state.news = n?.items || [];
    state.character = c;
    state.generatedAt = b.generatedAt || n?.generatedAt;

    // Primera vez que se abre la app: todo lo existente cuenta como leído.
    if (!LS.get("baselineDone", false)) {
      state.blues.forEach((p) => { readIds.add(p.id); if (p.updatedAt) readIds.add(`${p.id}@${p.updatedAt}`); });
      saveRead();
      LS.set("baselineDone", true);
    }

    if (hadData) {
      const fresh = visibleBlues().filter((p) => p.important && !prevIds.has(`${p.id}@${p.updatedAt || ""}`) && isUnread(p));
      if (fresh.length) {
        if (!silent || document.visibilityState === "visible") toast(`${fresh.length} blue post${fresh.length > 1 ? "s" : ""} nuevo${fresh.length > 1 ? "s" : ""}`);
        notifyLocal(fresh);
      }
    }
    document.getElementById("updated").textContent = state.generatedAt ? `Novedades ${timeAgo(state.generatedAt)}` : "Sin datos todavía";
    updateBadge();
    render();
  } catch (e) {
    document.getElementById("updated").textContent = "Sin conexión · mostrando lo guardado";
    if (!silent) toast("No se pudo actualizar");
  } finally {
    btn.classList.remove("spin");
  }
}

async function notifyLocal(posts) {
  if (!settings.inAppNotify || !("Notification" in window) || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker?.getRegistration();
  for (const p of posts.slice(0, 3)) {
    const opts = { body: p.excerpt || "", tag: p.id, icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { url: `#post/${encodeURIComponent(p.id)}` } };
    if (reg) reg.showNotification(`${p.author}: ${p.title}`, opts);
    else new Notification(`${p.author}: ${p.title}`, opts);
  }
}

// ---------------------------------------------------------------- piezas

function postCard(p) {
  const tags = p.tags.filter((t) => t !== "reply" || p.tags.length === 1);
  return `
    <a class="card post ${isUnread(p) ? "unread" : ""} ${p.tags.includes("priest") ? "priest" : ""}" href="#post/${encodeURIComponent(p.id)}">
      <div class="who">
        <span class="author">${esc(p.author)}</span>
        <span class="role">${esc(p.authorTitle || "Blizzard")}</span>
        <span class="role">· ${esc(timeAgo(p.createdAt))}</span>
      </div>
      <div class="title">${esc(p.title)}</div>
      <div class="excerpt">${esc(p.excerpt)}</div>
      <div class="meta">
        ${p.updated ? `<span class="tag updated">Updated</span>` : ""}
        ${tags.map((t) => `<span class="tag ${esc(t)}">${esc(TAG_LABEL[t] || t)}</span>`).join("")}
      </div>
    </a>`;
}

function newsCard(n) {
  return `
    <a class="card news" href="${esc(safeUrl(n.url))}" target="_blank" rel="noopener noreferrer">
      ${n.image ? `<img src="${esc(safeUrl(n.image))}" alt="" loading="lazy">` : `<img alt="">`}
      <div>
        <div class="title">${esc(n.title)}</div>
        <div class="summary">${esc(n.summary)}</div>
        <div class="small muted" style="margin-top:4px">${esc(n.source)} · ${esc(timeAgo(n.createdAt))}</div>
      </div>
    </a>`;
}

const MS_TYPE = { spell: "Spell", talent: "Talents", dungeon: "Dungeon", gear: "Gear", system: "Sistema" };
function milestoneRow(m, lvl) {
  return `
    <div class="ms">
      <div class="ms-lvl ${m.lvl === lvl ? "now" : ""}">${m.lvl}</div>
      <div>
        <div class="ms-type">${esc(MS_TYPE[m.type])}${m.verify ? ` · <span style="color:#ffd38a">a confirmar</span>` : ""}</div>
        <div class="ms-title">${esc(m.title)}</div>
        <div class="small muted">${esc(m.desc)}</div>
      </div>
    </div>`;
}

const facTag = (f) => (f === "A" || f === "H" ? `<span class="fac ${f}">${f === "A" ? "Alliance" : "Horde"}</span>` : "");

function gearRow(g) {
  const src = SOURCES[g.src];
  const near = Math.abs(g.lvl - level()) <= 4;
  return `<tr class="${near ? "hl" : ""}">
    <td class="lv">${g.lvl}</td>
    <td><a class="item-link" href="${esc(wowheadSearch(g.name))}" target="_blank" rel="noopener noreferrer">${esc(g.name)}</a>${facTag(g.f)}
      ${g.verify ? `<span class="tag verify" style="margin-left:4px">a confirmar</span>` : ""}
      <div class="small muted">${esc(g.source)}${src ? ` · ${ext(src.url, "fuente")}` : ""}</div></td>
    <td class="small muted">${esc(g.type)}</td>
  </tr>`;
}

// --- equipo real (Battle.net API)

function slotKey(s) { return s === "FINGER_1" || s === "FINGER_2" ? "FINGER" : s === "TRINKET_1" || s === "TRINKET_2" ? "TRINKET" : s; }

function weakSlots(char) {
  const lvl = char.level;
  const bySlot = new Map((char.equipment || []).map((i) => [i.slot, i]));
  const twoHand = /staff|two-hand|polearm/i.test(bySlot.get("MAIN_HAND")?.itemClass || "");
  const out = [];
  for (const s of GEAR_SLOTS) {
    if (s === "OFF_HAND" && twoHand) continue;
    const it = bySlot.get(s);
    if (!it) { out.push({ slot: s, why: "Vacío", score: 100 }); continue; }
    if (it.quality === "POOR" || it.quality === "COMMON") { out.push({ slot: s, item: it, why: `${it.quality === "POOR" ? "Poor" : "Common"} quality`, score: 60 }); continue; }
    if (it.requiredLevel != null && lvl - it.requiredLevel >= 10) out.push({ slot: s, item: it, why: `Required level ${it.requiredLevel} (${lvl - it.requiredLevel} niveles atrás)`, score: 30 + (lvl - it.requiredLevel) });
  }
  return out.sort((a, b) => b.score - a.score);
}

function upgradesFor(char) {
  const lvl = char.level;
  const equippedNames = new Set((char.equipment || []).map((i) => i.name));
  const f = faction();
  return GEAR.filter((g) => g.slot && g.lvl <= lvl + 4 && g.lvl >= lvl - 8 && !equippedNames.has(g.name) && (g.f === "both" || !f || g.f === f))
    .map((g) => {
      const current = (char.equipment || []).filter((i) => i.name && slotKey(i.slot) === g.slot);
      return { g, current };
    })
    // No recomendar algo de menor level que lo que ya tenés puesto (verde o mejor).
    .filter(({ g, current }) => !current.length || current.some((i) => ["POOR", "COMMON"].includes(i.quality) || (i.requiredLevel ?? 0) < g.lvl));
}

function itemLine(it) {
  if (!it) return `<span class="muted">—</span>`;
  const color = QUALITY_COLOR[it.quality] || "var(--text)";
  return `<a class="item-link" style="color:${color}" href="${esc(wowheadSearch(it.name))}" target="_blank" rel="noopener noreferrer">${esc(it.name)}</a>`;
}

function characterCard(compact) {
  const c = state.character;
  if (!charOk()) return "";
  return `
    <div class="char">
      ${c.avatar ? `<img src="${esc(safeUrl(c.avatar))}" alt="" width="52" height="52">` : `<div class="char-ph"></div>`}
      <div>
        <div class="char-name">${esc(c.name)} ${esc(c.surname)}</div>
        <div class="small muted">Level ${esc(c.level)} ${esc(c.race)} ${esc(c.className)}${c.guild ? ` · &lt;${esc(c.guild)}&gt;` : ""}</div>
        ${compact ? "" : `<div class="small muted">${c.itemLevel ? `Item level ${esc(c.itemLevel)} · ` : ""}sincronizado ${esc(timeAgo(c.status.checkedAt))}</div>`}
      </div>
    </div>`;
}

// ---------------------------------------------------------------- vistas

function viewHome() {
  const lvl = level();
  const br = levelBracket(lvl);
  const upcoming = MILESTONES.filter((m) => m.lvl >= lvl).slice(0, 4);
  const dungeons = DUNGEONS.filter((d) => lvl >= d.min - 1 && lvl <= d.max).sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).slice(0, 4);
  const blues = visibleBlues().filter((p) => p.important).slice(0, 4);
  const racial = RACIALS.find((r) => r.race === race());
  const nextRacial = racial?.spells.find((s) => s.lvl >= lvl);
  const synced = charOk();
  const weak = synced ? weakSlots(state.character).slice(0, 3) : [];
  const gear = synced ? [] : GEAR.filter((g) => g.lvl <= lvl + 3 && g.lvl >= lvl - 6 && (g.f === "both" || !faction() || g.f === faction())).slice(0, 5);
  const profs = PROFESSIONS.map((p) => ({ p, s: profSkill(p) }));

  return `
    <section class="section hero">
      ${synced ? characterCard(true) : ""}
      <div class="hero-top" style="${synced ? "margin-top:12px" : ""}">
        <div>
          ${synced ? "" : `<h1>Tu Priest</h1>`}
          <div class="small muted">${racial ? esc(racial.race) : synced ? "" : "Elegí tu raza en Ajustes"} ${racial ? "·" : ""} <span class="spec-pill c-${br.color}">${esc(br.spec)}</span></div>
        </div>
        ${synced ? `<div class="level-num">${lvl}<small>level</small></div>` : `
        <div class="level-ctl">
          <button data-lvl="-1" aria-label="Bajar nivel">−</button>
          <div class="level-num">${lvl}<small>level</small></div>
          <button data-lvl="1" aria-label="Subir nivel">+</button>
        </div>`}
      </div>
      <div class="xpbar"><i style="width:${Math.round((lvl / 60) * 100)}%"></i></div>
      <div class="small muted">${esc(br.summary)}</div>
      <ol class="rot small">${br.rotation.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
      ${nextRacial ? `<div class="small" style="margin-top:10px">Racial: <b>${esc(nextRacial.name)}</b> en level ${nextRacial.lvl}</div>` : ""}
    </section>

    <section class="section">
      <div class="section-head"><h2>Próximos hitos</h2><a href="#priest/plan">Plan completo</a></div>
      <div class="card">${upcoming.length ? upcoming.map((m) => milestoneRow(m, lvl)).join("") : `<div class="muted">¡Llegaste al 60! Mirá el gear y las dungeons de level cap.</div>`}</div>
    </section>

    ${synced && weak.length ? `
    <section class="section">
      <div class="section-head"><h2>Slots para mejorar</h2><a href="#priest/gear">Tu gear</a></div>
      <div class="card"><table class="table"><tbody>
        ${weak.map((w) => `<tr><td><b>${esc(SLOT_LABEL[w.slot])}</b><div class="small muted">${esc(w.why)}</div></td><td>${itemLine(w.item)}</td></tr>`).join("")}
      </tbody></table></div>
    </section>` : ""}

    ${dungeons.length ? `
    <section class="section">
      <div class="section-head"><h2>Dungeons para tu level</h2><a href="#priest/dungeons">Todas</a></div>
      <div class="card">
        <table class="table"><tbody>
          ${dungeons.map((d) => `<tr><td><b>${esc(d.name)}</b>${d.isNew ? ` <span class="tag patch-notes">New</span>` : ""}<div class="small muted">${esc(d.zone)}</div></td><td class="lv">${d.min}–${d.max}</td></tr>`).join("")}
        </tbody></table>
      </div>
    </section>` : ""}

    ${gear.length ? `
    <section class="section">
      <div class="section-head"><h2>Upgrades a buscar</h2><a href="#priest/gear">Lista completa</a></div>
      <div class="card"><table class="table"><tbody>${gear.map(gearRow).join("")}</tbody></table></div>
    </section>` : ""}

    <section class="section">
      <div class="section-head"><h2>Professions</h2><a href="#professions">Ver guías</a></div>
      <div class="card">${profs.map(({ p, s }) => profBar(p, s, true)).join("")}</div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Últimos blue posts</h2><a href="#blues">Ver todos</a></div>
      <div class="stack">${blues.length ? blues.map(postCard).join("") : `<div class="card empty">Todavía no hay posts. Tocá actualizar.</div>`}</div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Noticias</h2><a href="#news">Ver todas</a></div>
      <div class="stack">${state.news.slice(0, 3).map(newsCard).join("") || `<div class="card empty">Sin noticias por ahora.</div>`}</div>
    </section>`;
}

function viewBlues() {
  const q = state.query.trim().toLowerCase();
  const list = visibleBlues().filter((p) => {
    if (state.filter === "important" && !p.important) return false;
    if (!["all", "important"].includes(state.filter) && !p.tags.includes(state.filter)) return false;
    if (q && !`${p.title} ${p.author} ${p.text || p.excerpt}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const unread = list.filter(isUnread).length;
  return `
    <section class="section">
      <div class="section-head"><h2>Blue Tracker</h2>${unread ? `<a href="#" id="markall">Marcar ${unread} como leídos</a>` : ""}</div>
      <input class="search" id="q" type="search" placeholder="Buscar (ej: priest, hotfix, queue…)" value="${esc(state.query)}">
      <div class="chips" style="margin-top:10px">
        ${FILTERS.map(([k, l]) => `<button class="chip ${state.filter === k ? "on" : ""}" data-filter="${k}">${l}</button>`).join("")}
      </div>
      <div class="small muted" style="margin-top:6px">Foros oficiales de US (inglés).</div>
    </section>
    <div class="stack" id="bluelist">${list.length ? list.slice(0, 120).map(postCard).join("") : `<div class="card empty">Nada con ese filtro.</div>`}</div>`;
}

function viewPost(id) {
  const p = state.blues.find((x) => x.id === id);
  if (!p) return `<a class="back" href="#blues">‹ Volver</a><div class="card empty">No encontré ese post (puede haberse archivado).</div>`;
  markRead(p);
  return `
    <a class="back" href="#blues">‹ Volver</a>
    <article class="card">
      <div class="post">
        <div class="who"><span class="author">${esc(p.author)}</span><span class="role">${esc(p.authorTitle || "Blizzard")}</span></div>
        <h2 style="margin:8px 0 4px;color:var(--text);font-family:Inter,sans-serif;font-size:1.15rem">${esc(p.title)}</h2>
        <div class="small muted">${esc(new Date(p.createdAt).toLocaleString("es-AR"))} · ${esc(p.category)}
          ${p.updatedAt && p.updatedAt !== p.createdAt ? ` · editado ${esc(timeAgo(p.updatedAt))}` : ""}</div>
        <div class="meta">${p.tags.map((t) => `<span class="tag ${esc(t)}">${esc(TAG_LABEL[t] || t)}</span>`).join("")}</div>
      </div>
      <hr style="border:0;border-top:1px solid var(--border);margin:14px 0">
      <div class="post-body" id="postbody"></div>
      <div style="margin-top:16px"><a class="btn ghost" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">Abrir en el foro de Blizzard</a></div>
    </article>`;
}

function afterPost(id) {
  const p = state.blues.find((x) => x.id === id);
  const box = document.getElementById("postbody");
  if (!p || !box) return;
  if (p.html) {
    const node = sanitize(p.html, p.url);
    // Resalta menciones a Priest para encontrarlas rápido en hotfixes largos.
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const hits = [];
    while (walker.nextNode()) if (/\bpriest/i.test(walker.currentNode.textContent)) hits.push(walker.currentNode);
    const blocks = new Set(hits.map((t) => t.parentElement?.closest("li, p")).filter(Boolean));
    for (const el of blocks) el.innerHTML = el.innerHTML.replace(/\b(Priests?)\b/gi, "<mark>$1</mark>");
    box.appendChild(node);
  } else {
    box.textContent = p.text || p.excerpt || "";
  }
}

function viewNews() {
  return `
    <section class="section">
      <div class="section-head"><h2>Noticias de Forever</h2><span class="small muted">vía Wowhead</span></div>
      <div class="stack">${state.news.map(newsCard).join("") || `<div class="card empty">Sin noticias por ahora.</div>`}</div>
    </section>`;
}

const PRIEST_TABS = [
  ["plan", "Leveling 1–60"], ["gear", "Gear"], ["talents", "Talents"], ["dungeons", "Dungeons"],
  ["racials", "Racials"], ["changes", "Cambios"], ["links", "Guías"],
];

function viewGear() {
  const lvl = level();
  const f = faction();
  let mine = "";
  if (charOk()) {
    const c = state.character;
    const weak = new Map(weakSlots(c).map((w) => [w.slot, w]));
    const bySlot = new Map((c.equipment || []).map((i) => [i.slot, i]));
    const ups = upgradesFor(c);
    mine = `
      <div class="card">${characterCard(false)}</div>
      ${ups.length ? `<div class="card"><h3 style="margin-bottom:6px">Upgrades recomendados para tu level</h3>
        <table class="table"><tbody>${ups.map(({ g, current }) => `<tr>
          <td><a class="item-link" href="${esc(wowheadSearch(g.name))}" target="_blank" rel="noopener noreferrer">${esc(g.name)}</a>${facTag(g.f)}
            <div class="small muted">${esc(g.source)}</div>
            <div class="small">Tenés: ${current.length ? current.map(itemLine).join(", ") : `<span class="muted">nada</span>`}</div></td>
          <td class="small muted">${esc(g.type)}<div class="lv">${g.lvl}</div></td></tr>`).join("")}</tbody></table></div>` : ""}
      <div class="card"><h3 style="margin-bottom:6px">Tu gear</h3>
        <table class="table"><tbody>
          ${GEAR_SLOTS.map((s) => {
            const it = bySlot.get(s);
            const w = weak.get(s);
            if (!it && s === "OFF_HAND" && !w) return "";
            const stats = it ? [...(it.weapon?.dps ? [`${it.weapon.dps.toFixed ? it.weapon.dps.toFixed(1) : it.weapon.dps} DPS`] : []), ...it.stats.map((x) => `+${x.value} ${x.name}`), ...(it.enchant ? [it.enchant] : [])].join(" · ") : "";
            return `<tr class="${w ? "hl" : ""}"><td style="width:92px"><b class="small">${esc(SLOT_LABEL[s])}</b>${w ? `<div class="small" style="color:#ffd38a">${esc(w.why)}</div>` : ""}</td>
              <td>${itemLine(it)}${it?.itemLevel ? `<span class="small muted"> · ilvl ${esc(it.itemLevel)}</span>` : ""}${stats ? `<div class="small muted">${esc(stats)}</div>` : ""}</td></tr>`;
          }).join("")}
        </tbody></table></div>`;
  } else {
    mine = `<div class="card notice small"><b>Conectá tu personaje</b> y acá vas a ver tu gear real, los slots más flojos y qué upgrades te sirven. Ver <a href="#settings">Ajustes</a>.</div>`;
  }
  const list = GEAR.filter((g) => !f || g.f === "both" || g.f === f);
  return `${mine}
    <div class="card small muted">${esc(GEAR_NOTE)}</div>
    <div class="card"><table class="table"><thead><tr><th>Lv</th><th>Item</th><th>Slot</th></tr></thead><tbody>${list.map(gearRow).join("")}</tbody></table></div>
    <div class="card"><a class="btn ghost" href="${SOURCES.timesaver.url}" target="_blank" rel="noopener noreferrer">Gear level por level (Timesaver)</a></div>`;
}

function viewPriest(tab) {
  state.priestTab = tab || state.priestTab;
  const t = state.priestTab;
  const lvl = level();
  let body = "";

  if (t === "plan") {
    body = PLAN.map((p) => `
      <div class="card" style="${lvl >= p.from && lvl <= p.to ? "border-color:var(--gold)" : ""}">
        <div class="row between wrap"><h3>Levels ${p.from}–${p.to}</h3><span class="spec-pill c-${p.color}">${esc(p.spec)}</span></div>
        <p class="muted small" style="margin:6px 0 0">${esc(p.summary)}</p>
        <div class="small" style="margin-top:10px;font-weight:700">Rotation</div>
        <ol class="rot small">${p.rotation.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
        <ul class="tips small">${p.tips.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>`).join("") + `
      <div class="section-head" style="margin-top:22px"><h2>Todos los hitos</h2></div>
      <div class="card">${MILESTONES.map((m) => milestoneRow(m, lvl)).join("")}</div>`;
  }

  if (t === "gear") body = viewGear();

  if (t === "talents") {
    body = `<div class="card notice small"><b>Ojo:</b> los talent trees de Forever cambiaron respecto de Classic. Acá van las prioridades en las que coinciden las guías; para el reparto exacto punto por punto usá el ${ext(SOURCES.wowheadTalents.url, "Talent Calculator de Wowhead")}.</div>` +
      TALENTS.map((tr) => `
      <div class="card">
        <div class="row between"><h3>${esc(tr.name)}</h3><span class="spec-pill c-${tr.color}">${esc(tr.spec)}</span></div>
        <div style="margin-top:8px">${tr.steps.map((s) => `
          <div class="step"><div class="pts">${esc(s.pts)}</div><div><b>${esc(s.name)}</b>${s.verify ? ` <span class="tag verify">a confirmar</span>` : ""}<div class="small muted">${esc(s.why)}</div></div></div>`).join("")}
        </div>
      </div>`).join("");
  }

  if (t === "dungeons") {
    const row = (d) => `<tr class="${lvl >= d.min && lvl <= d.max ? "hl" : lvl > d.max ? "dim" : ""}"><td><b>${esc(d.name)}</b><div class="small muted">${esc(d.zone)}</div></td><td class="lv">${d.min}–${d.max}</td></tr>`;
    body = `
      <div class="card"><h3 style="margin-bottom:6px">Nuevas en Forever</h3>
        <table class="table"><tbody>${DUNGEONS.filter((d) => d.isNew).map(row).join("")}</tbody></table>
        <div class="small muted" style="margin-top:8px">Rangos oficiales de ${ext(SOURCES.blizzDungeons.url, "Blizzard")}.</div></div>
      <div class="card"><h3 style="margin-bottom:6px">Classic</h3>
        <table class="table"><tbody>${DUNGEONS.filter((d) => d.classic).map(row).join("")}</tbody></table>
        <div class="small muted" style="margin-top:8px">Rangos aproximados de Classic; en Forever pueden variar.</div></div>`;
  }

  if (t === "racials") {
    body = (RACIALS_VERIFY ? `<div class="card notice small"><b>Datos de beta:</b> nombres confirmados, pero números y cooldowns pueden haber cambiado al lanzamiento.</div>` : "") +
      RACIALS.map((r) => `
      <div class="card" style="${r.race === race() ? "border-color:var(--gold)" : ""}">
        <div class="row between"><h3>${esc(r.race)}</h3>${facTag(r.faction)}</div>
        ${r.spells.map((s) => `<div class="step"><div class="pts">${s.lvl}</div><div><a class="item-link" href="${esc(wowheadSearch(s.name))}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a><div class="small muted">${esc(s.desc)}</div></div></div>`).join("")}
      </div>`).join("") + `<div class="small muted">Fuente: ${ext(SOURCES.blizzWatchRacials.url, SOURCES.blizzWatchRacials.name)}</div>`;
  }

  if (t === "changes") {
    body = CHANGES.map((c) => `
      <div class="card"><div class="row between"><b>${esc(c.title)}</b>${c.verify ? `<span class="tag verify">a confirmar</span>` : ""}</div>
        <div class="small muted" style="margin-top:4px">${esc(c.body)}</div>
        <div class="small" style="margin-top:6px">${ext(SOURCES[c.src].url, SOURCES[c.src].name)}</div></div>`).join("") +
      `<div class="card small">Los cambios nuevos del Priest aparecen en <a href="#blues" data-go-priest>Blues → Priest</a> apenas Blizzard los publica.</div>`;
  }

  if (t === "links") {
    body = `<div class="card">${LINKS.map((l) => `<div style="padding:8px 0;border-bottom:1px solid var(--border)">${ext(l.url, l.name)}</div>`).join("")}</div>`;
  }

  return `
    <div class="section-head"><h2>Priest · Forever</h2><span class="small muted">revisado ${esc(PRIEST_UPDATED)}</span></div>
    <div class="seg">${PRIEST_TABS.map(([k, l]) => `<a class="chip ${t === k ? "on" : ""}" href="#priest/${k}" style="text-decoration:none">${l}</a>`).join("")}</div>
    <div class="stack">${body}</div>`;
}

// ---------------------------------------------------------------- professions

function rankFor(skill) { return RANKS.find((r) => skill < r.max) || RANKS[RANKS.length - 1]; }

function profBar(p, s, link) {
  const rank = rankFor(s.skill);
  return `
    <a class="prof-row" href="#professions/${p.id}" ${link ? "" : 'style="pointer-events:none"'}>
      <div class="row between"><b>${esc(p.name)}</b><span class="small muted">${esc(s.skill)}/${esc(s.max || rank.max)} · ${esc(rank.name)}${s.auto ? " · sync" : ""}</span></div>
      <div class="xpbar slim"><i class="c-${p.color}-bg" style="width:${Math.min(100, Math.round((s.skill / 300) * 100))}%"></i></div>
    </a>`;
}

function viewProfessions(id) {
  const lvl = level();
  if (id) {
    const p = PROFESSIONS.find((x) => x.id === id);
    if (!p) return `<a class="back" href="#professions">‹ Volver</a>`;
    const s = profSkill(p);
    const br = p.brackets.find((b) => s.skill >= b.from && s.skill < b.to) || p.brackets[p.brackets.length - 1];
    const next = p.milestones.filter((m) => m.skill > s.skill).slice(0, 3);
    const usesCloth = p.id === "tailoring" || p.id === "first-aid";
    const cloth = CLOTH.filter((c) => lvl >= c.lvl[0] - 3 && lvl <= c.lvl[1] + 5);
    const de = DISENCHANT.filter((d) => lvl >= d.lvl[0] - 5);
    return `
      <a class="back" href="#professions">‹ Professions</a>
      <div class="card hero">
        <div class="row between"><h1 style="font-size:1.25rem">${esc(p.name)}</h1><span class="tag">${esc(p.kind)}</span></div>
        <div class="small muted" style="margin-top:4px">${esc(p.pitch)}</div>
        <div class="row" style="margin-top:12px;gap:8px">
          ${s.auto ? `<div class="level-num">${s.skill}<small>skill · sync</small></div>` : `
          <div class="level-ctl">
            <button data-skill="-5" aria-label="Bajar skill">−</button>
            <input class="skill-input" id="skill" type="number" inputmode="numeric" min="1" max="300" value="${s.skill}" aria-label="Skill actual">
            <button data-skill="5" aria-label="Subir skill">+</button>
          </div>`}
          <div class="small muted">${esc(rankFor(s.skill).name)} (hasta ${rankFor(s.skill).max})</div>
        </div>
        <div class="xpbar"><i style="width:${Math.min(100, Math.round((s.skill / 300) * 100))}%"></i></div>
      </div>

      <div class="card" style="border-color:var(--gold)">
        <div class="ms-type">Ahora · ${br.from}–${br.to}</div>
        <div style="font-weight:600;margin:4px 0">${esc(br.what)}</div>
        <div class="small muted">Mats: ${esc(br.mats)}</div>
        ${br.zones ? `<div class="small" style="margin-top:6px">Zones: ${esc(br.zones)}</div>` : ""}
        <div style="margin-top:12px"><a class="btn" href="${esc(p.wowhead)}" target="_blank" rel="noopener noreferrer">Ruta exacta desde tu skill (Wowhead)</a></div>
      </div>

      ${next.length ? `<div class="card"><h3 style="margin-bottom:8px">Próximo</h3>${next.map((m) => `
        <div class="step"><div class="pts">${m.skill}</div><div class="small">${esc(m.text)}${m.verify ? ` <span class="tag verify">a confirmar</span>` : ""}</div></div>`).join("")}</div>` : ""}

      ${(() => {
        const cur = rankFor(s.skill);
        const nx = RANKS[RANKS.indexOf(cur) + 1];
        if (!nx || s.skill < cur.max - 25) return "";
        const needLvl = Number((nx.req.match(/nivel (\d+)/) || [])[1] || 0);
        return `<div class="card small">Tu cap es ${cur.max}: para seguir necesitás <b>${esc(nx.name)}</b> (${esc(nx.req)}).${lvl < needLvl ? ` <span style="color:#ffd38a">Te falta level.</span>` : ""}</div>`;
      })()}

      ${usesCloth ? `<div class="card"><h3 style="margin-bottom:6px">Dónde farmear cloth (para tu level)</h3>
        <table class="table"><tbody>${(cloth.length ? cloth : CLOTH).map((c) => `<tr><td><b>${esc(c.name)}</b><div class="small muted">${esc(c.zones.join(", "))}</div></td><td class="lv">${c.lvl[0]}–${c.lvl[1]}</td></tr>`).join("")}</tbody></table>
        <div class="small muted" style="margin-top:6px">Cae de humanoids de ese level. Tailoring y First Aid comparten cloth.</div></div>` : ""}

      ${p.id === "enchanting" ? `<div class="card"><h3 style="margin-bottom:6px">Qué te da desencantar (por level del item)</h3>
        <table class="table"><tbody>${de.map((d) => `<tr><td class="lv">${d.lvl[0]}–${d.lvl[1]}</td><td class="small"><b>${esc(d.dust)}</b><div class="muted">${esc(d.essence)} · ${esc(d.shard)}</div></td></tr>`).join("")}</tbody></table></div>` : ""}

      ${p.totals ? `<div class="card small muted">${esc(p.totals)}</div>` : ""}

      <div class="card"><h3 style="margin-bottom:6px">Tips</h3><ul class="tips small" style="color:var(--text)">${p.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>

      <div class="card"><h3 style="margin-bottom:6px">Todos los tramos</h3>
        ${p.brackets.map((b) => `<div class="step"><div class="pts">${b.from}–${b.to}</div><div class="small">${esc(b.what)}<div class="muted">${esc(b.mats)}${b.zones ? ` · ${esc(b.zones)}` : ""}</div></div></div>`).join("")}
        <h3 style="margin:14px 0 6px">Todos los hitos</h3>
        ${p.milestones.map((m) => `<div class="step"><div class="pts">${m.skill}</div><div class="small">${esc(m.text)}${m.verify ? ` <span class="tag verify">a confirmar</span>` : ""}</div></div>`).join("")}
      </div>`;
  }

  const synced = charOk() && state.character.professionsAvailable;
  return `
    <div class="section-head"><h2>Professions</h2><span class="small muted">revisado ${esc(PROF_UPDATED)}</span></div>
    <div class="card small muted">${synced ? "Tu skill se sincroniza solo desde tu personaje." : "Tocá una profession y cargá tu skill actual: la guía te muestra qué hacer desde ahí."} Las rutas exactas varían entre guías porque Forever cambió muchas recipes; el botón de Wowhead calcula la ruta desde tu skill.</div>
    <div class="card">${PROFESSIONS.map((p) => profBar(p, profSkill(p), true)).join("")}</div>
    <div class="card"><h3 style="margin-bottom:6px">Cómo combinarlas</h3>
      <ul class="tips small" style="color:var(--text)">
        <li><b>Tailoring + Enchanting:</b> crafteás verdes de Tailoring, los desencantás y con eso subís Enchanting.</li>
        <li><b>Tailoring + First Aid:</b> comparten cloth. First Aid usa poco: subilo primero en cada tier de cloth.</li>
        <li><b>Fishing + Cooking:</b> cociná lo que pescás; y comé food con +5% XP por kill mientras leveás.</li>
        <li><b>Enchanting para el Priest:</b> tus propios wands (Lesser/Greater Magic Wand) y las formulas nuevas de staves y wands.</li>
      </ul></div>
    <div class="card"><h3 style="margin-bottom:6px">Guías</h3>${PROF_SOURCES.map((l) => `<div style="padding:6px 0">${ext(l.url, l.name)}</div>`).join("")}</div>`;
}

// ---------------------------------------------------------------- ajustes

function viewSettings() {
  const notifSupported = "Notification" in window;
  const perm = notifSupported ? Notification.permission : "unsupported";
  const topic = settings.ntfyTopic.trim();
  const c = state.character;
  const charStatus = !c
    ? `<div class="small muted">No conectado. Para que la app lea tu personaje solo (level, gear y professions) hay que configurar la API de Battle.net una vez: pedímelo y te guío.</div>`
    : c.status?.ok
      ? `${characterCard(false)}`
      : `<div class="small" style="color:#ffd38a">No se pudo leer el personaje (${esc(c.status?.reason === "not-found" ? "Blizzard todavía no lo publica: aparece desde level 10 y después de hacer logout" : c.status?.reason || "error")}). Último intento ${esc(timeAgo(c.status?.checkedAt))}.</div>`;
  return `
    <section class="section">
      <h2 style="margin-bottom:10px">Tu personaje</h2>
      <div class="card">${charStatus}</div>
      ${charOk() ? "" : `
      <div class="card" style="margin-top:10px">
        <div class="small muted" style="margin-bottom:8px">Mientras tanto, cargalo a mano:</div>
        <label class="field"><span>Level</span><input type="number" id="s-level" min="1" max="60" value="${settings.level}"></label>
        <label class="field"><span>Race</span>
          <select id="s-race"><option value="">—</option>${RACIALS.map((r) => `<option value="${r.race}" ${settings.race === r.race ? "selected" : ""}>${esc(r.race)}</option>`).join("")}</select>
        </label>
      </div>`}
    </section>

    <section class="section">
      <h2 style="margin-bottom:10px">Alertas</h2>
      <div class="card stack">
        <div><b>Push con la app cerrada</b>
          <div class="small muted">Un robot revisa los foros de Blizzard (US) cada ~15 minutos y te manda un push vía ${ext("https://ntfy.sh", "ntfy")} cuando hay Hotfixes, Known Issues, Blizzard News, temas de Servers o algo del Priest.</div>
          <label class="field" style="margin-top:8px"><span>Tu tema de ntfy (para el atajo)</span><input type="text" id="s-topic" placeholder="forever-blues-…" value="${esc(topic)}" autocomplete="off" autocapitalize="off"></label>
          ${topic ? `<a class="btn ghost" href="https://ntfy.sh/${encodeURIComponent(topic)}" target="_blank" rel="noopener noreferrer">Abrir el tema en ntfy</a>` : ""}
        </div>
        <hr style="border:0;border-top:1px solid var(--border)">
        <div><b>Avisos mientras la app está abierta</b>
          <div class="small muted">Revisa cada 5 minutos y muestra una notificación del sistema.</div>
          <label class="switch"><span>Activar</span><input type="checkbox" id="s-inapp" ${settings.inAppNotify && perm === "granted" ? "checked" : ""} ${notifSupported ? "" : "disabled"}></label>
          ${perm === "denied" ? `<div class="small" style="color:var(--danger)">Bloqueaste las notificaciones para este sitio; habilitalas en el navegador.</div>` : ""}
        </div>
      </div>
    </section>

    <section class="section">
      <h2 style="margin-bottom:10px">Instalar en el teléfono</h2>
      <div class="card small">
        <p style="margin-top:0"><b>Android (Chrome):</b> menú ⋮ → <i>Instalar app</i>.</p>
        <p style="margin-bottom:0"><b>iPhone (Safari):</b> Compartir → <i>Agregar a inicio</i>.</p>
      </div>
    </section>
    <div class="small muted" style="text-align:center">Proyecto de fans, sin afiliación con Blizzard Entertainment.</div>`;
}

// ---------------------------------------------------------------- router

function setActiveTab(name) {
  document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("active", a.dataset.tab === name));
  document.getElementById("settings-btn").classList.toggle("on", name === "settings");
}

function render() {
  const hash = decodeURIComponent(location.hash.slice(1) || "home");
  const route = hash.split("/")[0];
  const arg = hash.split("/").slice(1).join("/");
  let html = "";
  let tab = route;
  switch (route) {
    case "blues": html = viewBlues(); break;
    case "post": html = viewPost(arg); tab = "blues"; break;
    case "news": html = viewNews(); break;
    case "priest": html = viewPriest(arg); break;
    case "professions": html = viewProfessions(arg); break;
    case "settings": html = viewSettings(); break;
    default: html = viewHome(); tab = "home";
  }
  $view.innerHTML = html;
  setActiveTab(tab);
  if (route === "post") afterPost(arg);
  bind(route, arg);
}

function bind(route, arg) {
  $view.querySelectorAll("[data-lvl]").forEach((b) => b.addEventListener("click", () => {
    settings.level = Math.min(60, Math.max(1, settings.level + Number(b.dataset.lvl)));
    saveSettings();
    render();
  }));

  if (route === "professions" && arg) {
    const setSkill = (v) => {
      settings.profSkills[arg] = Math.min(300, Math.max(1, Math.round(v) || 1));
      saveSettings();
      render();
    };
    $view.querySelectorAll("[data-skill]").forEach((b) => b.addEventListener("click", () => setSkill((settings.profSkills[arg] || 1) + Number(b.dataset.skill))));
    document.getElementById("skill")?.addEventListener("change", (e) => setSkill(Number(e.target.value)));
  }

  if (route === "blues") {
    const q = document.getElementById("q");
    q.addEventListener("input", () => {
      state.query = q.value;
      const pos = q.selectionStart;
      render();
      const nq = document.getElementById("q");
      nq.focus();
      nq.setSelectionRange(pos, pos);
    });
    $view.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
      state.filter = b.dataset.filter;
      LS.set("blueFilter", state.filter);
      render();
    }));
    document.getElementById("markall")?.addEventListener("click", (e) => {
      e.preventDefault();
      visibleBlues().forEach((p) => { readIds.add(p.id); if (p.updatedAt) readIds.add(`${p.id}@${p.updatedAt}`); });
      saveRead();
      updateBadge();
      render();
    });
  }

  $view.querySelector("[data-go-priest]")?.addEventListener("click", () => { state.filter = "priest"; LS.set("blueFilter", "priest"); });

  if (route === "settings") {
    document.getElementById("s-level")?.addEventListener("change", (e) => {
      settings.level = Math.min(60, Math.max(1, Number(e.target.value) || 1));
      saveSettings();
    });
    document.getElementById("s-race")?.addEventListener("change", (e) => {
      settings.race = e.target.value;
      settings.faction = RACIALS.find((r) => r.race === settings.race)?.faction || "";
      saveSettings();
      toast("Guardado");
    });
    document.getElementById("s-topic").addEventListener("change", (e) => {
      settings.ntfyTopic = e.target.value.trim();
      saveSettings();
      render();
    });
    document.getElementById("s-inapp")?.addEventListener("change", async (e) => {
      if (e.target.checked) {
        const p = await Notification.requestPermission();
        settings.inAppNotify = p === "granted";
        toast(p === "granted" ? "Listo: te aviso mientras la app esté abierta" : "Sin permiso para notificar");
      } else {
        settings.inAppNotify = false;
      }
      saveSettings();
      render();
    });
  }
}

window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
document.getElementById("refresh").addEventListener("click", () => loadData());
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") loadData({ silent: true }); });
setInterval(() => loadData({ silent: true }), 5 * 60 * 1000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
  navigator.serviceWorker.addEventListener("message", (e) => { if (e.data?.url) location.hash = e.data.url; });
}

saveSettings();
render();
loadData({ silent: true });
