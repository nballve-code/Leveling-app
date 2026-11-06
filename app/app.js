import {
  PRIEST_UPDATED, SOURCES, CHANGES, RACIALS, RACIALS_VERIFY, MILESTONES, PLAN, TALENTS,
  GEAR, GEAR_NOTE, DUNGEONS, PROFESSIONS, LINKS, wowheadSearch,
} from "./content/priest.js";

// ---------------------------------------------------------------- estado

const LS = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* modo privado */ }
  },
};

const DEFAULT_SETTINGS = { level: 1, race: "", faction: "", regions: ["us", "latam"], inAppNotify: false, ntfyTopic: "" };
const settings = { ...DEFAULT_SETTINGS, ...LS.get("settings", {}) };
const saveSettings = () => LS.set("settings", settings);

let readIds = new Set(LS.get("readIds", []));
const saveRead = () => LS.set("readIds", [...readIds].slice(-1500));

const state = {
  blues: [],
  news: [],
  generatedAt: null,
  filter: LS.get("blueFilter", "important"),
  query: "",
  priestTab: "plan",
};

const REGION_LABEL = { us: "US", eu: "EU", latam: "LatAm" };
const TAG_LABEL = {
  hotfix: "Hotfix", "known-issues": "Problemas conocidos", "patch-notes": "Notas", servers: "Servidores",
  news: "Noticia oficial", priest: "Priest", reply: "Respuesta",
};
const FILTERS = [
  ["important", "Importantes"], ["all", "Todos"], ["hotfix", "Hotfixes"], ["known-issues", "Problemas"],
  ["news", "Noticias"], ["patch-notes", "Notas"], ["priest", "Priest"], ["reply", "Respuestas"],
];

// ---------------------------------------------------------------- utilidades

const $view = document.getElementById("view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const safeUrl = (u) => (/^https:\/\//i.test(String(u || "")) ? String(u) : "#");

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

// Sanitizador de HTML de los foros: solo deja etiquetas de texto conocidas,
// links https y las imágenes https. Todo lo demás se descarta.
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

function levelBracket(level) {
  return PLAN.find((p) => level >= p.from && level <= p.to) || PLAN[0];
}

function isUnread(p) { return !readIds.has(p.id) && !readIds.has(`${p.id}@${p.updatedAt || ""}`); }
function markRead(p) { readIds.add(p.id); if (p.updatedAt) readIds.add(`${p.id}@${p.updatedAt}`); saveRead(); updateBadge(); }

function visibleBlues() {
  return state.blues.filter((p) => settings.regions.includes(p.region));
}

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
  try {
    const [b, n] = await Promise.all([
      fetch(`data/blues.json?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`data/news.json?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
    ]);
    const prevIds = new Set(state.blues.map((p) => `${p.id}@${p.updatedAt || ""}`));
    const hadData = state.blues.length > 0;
    state.blues = b.posts || [];
    state.news = n.items || [];
    state.generatedAt = b.generatedAt || n.generatedAt;

    // Primera vez que se abre la app: todo lo existente cuenta como leído.
    if (!LS.get("baselineDone", false)) {
      state.blues.forEach((p) => { readIds.add(p.id); if (p.updatedAt) readIds.add(`${p.id}@${p.updatedAt}`); });
      saveRead();
      LS.set("baselineDone", true);
    }

    if (hadData) {
      const fresh = visibleBlues().filter((p) => p.important && !prevIds.has(`${p.id}@${p.updatedAt || ""}`) && isUnread(p));
      if (fresh.length) {
        if (!silent || document.visibilityState === "visible") toast(`${fresh.length} post${fresh.length > 1 ? "s" : ""} azul${fresh.length > 1 ? "es" : ""} nuevo${fresh.length > 1 ? "s" : ""}`);
        notifyLocal(fresh);
      }
    }
    document.getElementById("updated").textContent = state.generatedAt ? `Datos ${timeAgo(state.generatedAt)}` : "Sin datos todavía";
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

// ---------------------------------------------------------------- vistas

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
        <span class="tag">${esc(REGION_LABEL[p.region] || p.region)}</span>
        ${p.updated ? `<span class="tag updated">Actualizado</span>` : ""}
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

function milestoneRow(m, level) {
  const typeLabel = { spell: "Hechizo", talent: "Talentos", dungeon: "Mazmorra", gear: "Equipo", system: "Sistema" }[m.type];
  return `
    <div class="ms">
      <div class="ms-lvl ${m.lvl === level ? "now" : ""}">${m.lvl}</div>
      <div>
        <div class="ms-type">${esc(typeLabel)}${m.verify ? ` · <span style="color:#ffd38a">a confirmar</span>` : ""}</div>
        <div class="ms-title">${esc(m.title)}</div>
        <div class="small muted">${esc(m.desc)}</div>
      </div>
    </div>`;
}

function viewHome() {
  const lvl = settings.level;
  const br = levelBracket(lvl);
  const upcoming = MILESTONES.filter((m) => m.lvl >= lvl).slice(0, 4);
  const dungeons = DUNGEONS.filter((d) => lvl >= d.min - 1 && lvl <= d.max).sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).slice(0, 4);
  const gear = GEAR.filter((g) => g.lvl <= lvl + 3 && g.lvl >= lvl - 6 && (!settings.faction || g.f === "ambos" || g.f === settings.faction)).slice(0, 5);
  const blues = visibleBlues().filter((p) => p.important).slice(0, 4);
  const racial = RACIALS.find((r) => r.race === settings.race);
  const nextRacial = racial?.spells.find((s) => s.lvl >= lvl);

  return `
    <section class="section hero">
      <div class="hero-top">
        <div>
          <h1>Tu Priest</h1>
          <div class="small muted">${racial ? esc(racial.raceEs) : "Elegí tu raza en Ajustes"} · <span class="spec-pill c-${br.color}">${esc(br.spec)}</span></div>
        </div>
        <div class="level-ctl">
          <button data-lvl="-1" aria-label="Bajar nivel">−</button>
          <div class="level-num">${lvl}<small>nivel</small></div>
          <button data-lvl="1" aria-label="Subir nivel">+</button>
        </div>
      </div>
      <div class="xpbar"><i style="width:${Math.round((lvl / 60) * 100)}%"></i></div>
      <div class="small muted">${esc(br.summary)}</div>
      <ol class="rot small">${br.rotation.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
      ${nextRacial ? `<div class="small" style="margin-top:10px">Racial: <b>${esc(nextRacial.name)}</b> en nivel ${nextRacial.lvl}</div>` : ""}
    </section>

    <section class="section">
      <div class="section-head"><h2>Próximos hitos</h2><a href="#priest/plan">Plan completo</a></div>
      <div class="card">${upcoming.length ? upcoming.map((m) => milestoneRow(m, lvl)).join("") : `<div class="muted">¡Llegaste al 60! Mirá el equipo y las mazmorras de nivel máximo.</div>`}</div>
    </section>

    ${dungeons.length ? `
    <section class="section">
      <div class="section-head"><h2>Mazmorras para tu nivel</h2><a href="#priest/dungeons">Todas</a></div>
      <div class="card">
        <table class="table"><tbody>
          ${dungeons.map((d) => `<tr><td><b>${esc(d.name)}</b>${d.isNew ? ` <span class="tag patch-notes">Nueva</span>` : ""}<div class="small muted">${esc(d.zone)}</div></td><td class="lv">${d.min}–${d.max}</td></tr>`).join("")}
        </tbody></table>
      </div>
    </section>` : ""}

    ${gear.length ? `
    <section class="section">
      <div class="section-head"><h2>Mejoras a buscar</h2><a href="#priest/gear">Lista completa</a></div>
      <div class="card">
        <table class="table"><tbody>${gear.map(gearRow).join("")}</tbody></table>
      </div>
    </section>` : ""}

    <section class="section">
      <div class="section-head"><h2>Últimos azules</h2><a href="#blues">Ver todos</a></div>
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
      <input class="search" id="q" type="search" placeholder="Buscar (ej: priest, hotfix, cola…)" value="${esc(state.query)}">
      <div class="chips" style="margin-top:10px">
        ${FILTERS.map(([k, l]) => `<button class="chip ${state.filter === k ? "on" : ""}" data-filter="${k}">${l}</button>`).join("")}
      </div>
      <div class="small muted" style="margin-top:6px">Regiones: ${settings.regions.map((r) => REGION_LABEL[r]).join(", ")} · <a href="#settings">cambiar</a></div>
    </section>
    <div class="stack" id="bluelist">${list.length ? list.slice(0, 120).map(postCard).join("") : `<div class="card empty">Nada con ese filtro.</div>`}</div>`;
}

function viewPost(id) {
  const p = state.blues.find((x) => x.id === id);
  if (!p) return `<a class="back" href="#blues">‹ Volver</a><div class="card empty">No encontré ese post (puede haberse archivado). </div>`;
  markRead(p);
  return `
    <a class="back" href="#blues">‹ Volver</a>
    <article class="card">
      <div class="post">
        <div class="who"><span class="author">${esc(p.author)}</span><span class="role">${esc(p.authorTitle || "Blizzard")}</span></div>
        <h2 style="margin:8px 0 4px;color:var(--text);font-family:Inter,sans-serif;font-size:1.15rem">${esc(p.title)}</h2>
        <div class="small muted">${esc(new Date(p.createdAt).toLocaleString("es-AR"))} · ${esc(p.category)} · ${esc(REGION_LABEL[p.region])}
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
    const base = p.url;
    const node = sanitize(p.html, base);
    // Resalta menciones a Priest para encontrarlas rápido en hotfixes largos.
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const hits = [];
    while (walker.nextNode()) if (/\b(priest|sacerdote)/i.test(walker.currentNode.textContent)) hits.push(walker.currentNode);
    const blocks = new Set(hits.map((t) => t.parentElement?.closest("li, p")).filter(Boolean));
    for (const el of blocks) el.innerHTML = el.innerHTML.replace(/\b(Priests?|Sacerdotes?)\b/gi, "<mark>$1</mark>");
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

function gearRow(g) {
  const src = SOURCES[g.src];
  const near = Math.abs(g.lvl - settings.level) <= 4;
  return `<tr class="${near ? "hl" : ""}">
    <td class="lv">${g.lvl}</td>
    <td><a class="item-link" href="${esc(wowheadSearch(g.name))}" target="_blank" rel="noopener noreferrer">${esc(g.name)}</a>${g.f !== "ambos" ? `<span class="fac ${g.f}">${g.f === "A" ? "Alianza" : "Horda"}</span>` : ""}
      ${g.verify ? `<span class="tag verify" style="margin-left:4px">a confirmar</span>` : ""}
      <div class="small muted">${esc(g.source)}${src ? ` · <a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">fuente</a>` : ""}</div></td>
    <td class="small muted">${esc({ wand: "Varita", weapon: "Arma", armor: "Armadura", jewelry: "Abalorio" }[g.type])}</td>
  </tr>`;
}

const PRIEST_TABS = [
  ["plan", "Plan 1–60"], ["talents", "Talentos"], ["gear", "Equipo"], ["dungeons", "Mazmorras"],
  ["racials", "Raciales"], ["changes", "Cambios"], ["links", "Guías"],
];

function viewPriest(tab) {
  state.priestTab = tab || state.priestTab;
  const t = state.priestTab;
  const lvl = settings.level;
  let body = "";

  if (t === "plan") {
    body = PLAN.map((p) => `
      <div class="card" style="${lvl >= p.from && lvl <= p.to ? "border-color:var(--gold)" : ""}">
        <div class="row between wrap"><h3>Niveles ${p.from}–${p.to}</h3><span class="spec-pill c-${p.color}">${esc(p.spec)}</span></div>
        <p class="muted small" style="margin:6px 0 0">${esc(p.summary)}</p>
        <div class="small" style="margin-top:10px;font-weight:700">Rotación</div>
        <ol class="rot small">${p.rotation.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
        <ul class="tips small">${p.tips.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>`).join("") + `
      <div class="section-head" style="margin-top:22px"><h2>Todos los hitos</h2></div>
      <div class="card">${MILESTONES.map((m) => milestoneRow(m, lvl)).join("")}</div>
      <div class="section-head" style="margin-top:22px"><h2>Profesiones</h2></div>
      <div class="card">${PROFESSIONS.map((p) => `<div style="margin-bottom:8px"><b>${esc(p.name)}</b><div class="small muted">${esc(p.why)}</div></div>`).join("")}</div>`;
  }

  if (t === "talents") {
    body = `<div class="card notice small"><b>Ojo:</b> los árboles de Forever cambiaron respecto de Classic. Acá van las prioridades en las que coinciden las guías; para el reparto exacto punto por punto usá la <a href="${SOURCES.wowheadTalents.url}" target="_blank" rel="noopener noreferrer">calculadora de Wowhead</a>.</div>` +
      TALENTS.map((tr) => `
      <div class="card">
        <div class="row between"><h3>${esc(tr.name)}</h3><span class="spec-pill c-${tr.color}">${tr.color === "shadow" ? "Sombras" : tr.color === "disc" ? "Disciplina" : "Grupo"}</span></div>
        <div style="margin-top:8px">${tr.steps.map((s) => `
          <div class="step"><div class="pts">${esc(s.pts)}</div><div><b>${esc(s.name)}</b>${s.verify ? ` <span class="tag verify">a confirmar</span>` : ""}<div class="small muted">${esc(s.why)}</div></div></div>`).join("")}
        </div>
      </div>`).join("");
  }

  if (t === "gear") {
    const f = settings.faction;
    const list = GEAR.filter((g) => !f || g.f === "ambos" || g.f === f);
    body = `<div class="card small muted">${esc(GEAR_NOTE)}</div>
      <div class="card"><table class="table"><thead><tr><th>Nv</th><th>Ítem</th><th>Tipo</th></tr></thead><tbody>${list.map(gearRow).join("")}</tbody></table></div>
      <div class="card"><a class="btn ghost" href="${SOURCES.timesaver.url}" target="_blank" rel="noopener noreferrer">Equipo nivel por nivel (Timesaver)</a></div>`;
  }

  if (t === "dungeons") {
    const row = (d) => `<tr class="${lvl >= d.min && lvl <= d.max ? "hl" : lvl > d.max ? "dim" : ""}"><td><b>${esc(d.name)}</b><div class="small muted">${esc(d.zone)}</div></td><td class="lv">${d.min}–${d.max}</td></tr>`;
    body = `
      <div class="card"><h3 style="margin-bottom:6px">Nuevas en Forever</h3>
        <table class="table"><tbody>${DUNGEONS.filter((d) => d.isNew).map(row).join("")}</tbody></table>
        <div class="small muted" style="margin-top:8px">Rangos oficiales de <a href="${SOURCES.blizzDungeons.url}" target="_blank" rel="noopener noreferrer">Blizzard</a>.</div></div>
      <div class="card"><h3 style="margin-bottom:6px">Clásicas</h3>
        <table class="table"><tbody>${DUNGEONS.filter((d) => d.classic).map(row).join("")}</tbody></table>
        <div class="small muted" style="margin-top:8px">Rangos aproximados de Classic; en Forever pueden variar.</div></div>`;
  }

  if (t === "racials") {
    body = (RACIALS_VERIFY ? `<div class="card notice small"><b>Datos de beta:</b> nombres confirmados, pero números y cooldowns pueden haber cambiado al lanzamiento.</div>` : "") +
      RACIALS.map((r) => `
      <div class="card" style="${r.race === settings.race ? "border-color:var(--gold)" : ""}">
        <div class="row between"><h3>${esc(r.raceEs)} <span class="small muted">(${esc(r.race)})</span></h3><span class="fac ${r.faction}">${r.faction === "A" ? "Alianza" : "Horda"}</span></div>
        ${r.spells.map((s) => `<div class="step"><div class="pts">${s.lvl}</div><div><a class="item-link" href="${esc(wowheadSearch(s.name))}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a><div class="small muted">${esc(s.desc)}</div></div></div>`).join("")}
      </div>`).join("") + `<div class="small muted">Fuente: <a href="${SOURCES.blizzWatchRacials.url}" target="_blank" rel="noopener noreferrer">${esc(SOURCES.blizzWatchRacials.name)}</a></div>`;
  }

  if (t === "changes") {
    body = CHANGES.map((c) => `
      <div class="card"><div class="row between"><b>${esc(c.title)}</b>${c.verify ? `<span class="tag verify">a confirmar</span>` : ""}</div>
        <div class="small muted" style="margin-top:4px">${esc(c.body)}</div>
        <div class="small" style="margin-top:6px"><a href="${esc(SOURCES[c.src].url)}" target="_blank" rel="noopener noreferrer">${esc(SOURCES[c.src].name)}</a></div></div>`).join("") +
      `<div class="card small">Los cambios nuevos del Priest aparecen en <a href="#blues" data-go-priest>Azules → Priest</a> apenas Blizzard los publica.</div>`;
  }

  if (t === "links") {
    body = `<div class="card">${LINKS.map((l) => `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.name)}</a></div>`).join("")}</div>`;
  }

  return `
    <div class="section-head"><h2>Priest · Forever</h2><span class="small muted">revisado ${esc(PRIEST_UPDATED)}</span></div>
    <div class="seg">${PRIEST_TABS.map(([k, l]) => `<a class="chip ${t === k ? "on" : ""}" href="#priest/${k}" style="text-decoration:none">${l}</a>`).join("")}</div>
    <div class="stack">${body}</div>`;
}

function viewSettings() {
  const notifSupported = "Notification" in window;
  const perm = notifSupported ? Notification.permission : "unsupported";
  const topic = settings.ntfyTopic.trim();
  return `
    <section class="section">
      <h2 style="margin-bottom:10px">Tu personaje</h2>
      <div class="card">
        <label class="field"><span>Nivel</span><input type="number" id="s-level" min="1" max="60" value="${settings.level}"></label>
        <label class="field"><span>Raza</span>
          <select id="s-race"><option value="">—</option>${RACIALS.map((r) => `<option value="${r.race}" ${settings.race === r.race ? "selected" : ""}>${esc(r.raceEs)}</option>`).join("")}</select>
        </label>
        <div class="small muted">La facción se deduce de la raza y filtra ítems de misiones de Alianza/Horda.</div>
      </div>
    </section>

    <section class="section">
      <h2 style="margin-bottom:10px">Blue Tracker</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:4px">Regiones a mostrar</div>
        ${Object.entries(REGION_LABEL).map(([k, l]) => `<label class="switch"><span>${l} ${k === "latam" ? "(foro en español)" : k === "us" ? "(América, inglés)" : "(Europa)"}</span><input type="checkbox" data-region="${k}" ${settings.regions.includes(k) ? "checked" : ""}></label>`).join("")}
      </div>
    </section>

    <section class="section">
      <h2 style="margin-bottom:10px">Alertas</h2>
      <div class="card stack">
        <div><b>Push con la app cerrada (recomendado)</b>
          <div class="small muted">Un robot revisa los foros de Blizzard cada ~15 minutos y te manda un push vía <a href="https://ntfy.sh" target="_blank" rel="noopener noreferrer">ntfy</a> (gratis, Android/iPhone) cuando hay hotfixes, problemas conocidos, noticias oficiales, temas de servidores o algo del Priest.</div>
          <ol class="small" style="padding-left:18px;margin:8px 0">
            <li>Instalá la app <b>ntfy</b> en el teléfono.</li>
            <li>Suscribite al tema que configuraste en el repo (secreto <code>NTFY_TOPIC</code>).</li>
          </ol>
          <label class="field"><span>Tu tema de ntfy (para el atajo)</span><input type="text" id="s-topic" placeholder="ej: forever-blues-xxxxxx" value="${esc(topic)}" autocomplete="off" autocapitalize="off"></label>
          ${topic ? `<a class="btn ghost" href="https://ntfy.sh/${encodeURIComponent(topic)}" target="_blank" rel="noopener noreferrer">Abrir el tema en ntfy</a>` : ""}
        </div>
        <hr style="border:0;border-top:1px solid var(--border)">
        <div><b>Avisos mientras la app está abierta</b>
          <div class="small muted">Revisa cada 5 minutos y muestra una notificación del sistema.</div>
          <label class="switch"><span>Activar</span><input type="checkbox" id="s-inapp" ${settings.inAppNotify && perm === "granted" ? "checked" : ""} ${notifSupported ? "" : "disabled"}></label>
          ${perm === "denied" ? `<div class="small" style="color:var(--danger)">Bloqueaste las notificaciones para este sitio; habilitalas en el navegador.</div>` : ""}
          ${!notifSupported ? `<div class="small muted">En iPhone primero agregá la app a la pantalla de inicio.</div>` : ""}
        </div>
      </div>
    </section>

    <section class="section">
      <h2 style="margin-bottom:10px">Instalar en el teléfono</h2>
      <div class="card small">
        <p style="margin-top:0"><b>Android (Chrome):</b> menú ⋮ → <i>Instalar app</i> / <i>Agregar a pantalla de inicio</i>.</p>
        <p style="margin-bottom:0"><b>iPhone (Safari):</b> botón Compartir → <i>Agregar a inicio</i>.</p>
      </div>
    </section>
    <div class="small muted" style="text-align:center">Proyecto de fans, sin afiliación con Blizzard Entertainment.</div>`;
}

// ---------------------------------------------------------------- router

function setActiveTab(name) {
  document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("active", a.dataset.tab === name));
}

function render() {
  const hash = decodeURIComponent(location.hash.slice(1) || "home");
  const [route, arg] = [hash.split("/")[0], hash.split("/").slice(1).join("/")];
  let html = "";
  let tab = route;
  switch (route) {
    case "blues": html = viewBlues(); break;
    case "post": html = viewPost(arg); tab = "blues"; break;
    case "news": html = viewNews(); break;
    case "priest": html = viewPriest(arg); break;
    case "settings": html = viewSettings(); break;
    default: html = viewHome(); tab = "home";
  }
  $view.innerHTML = html;
  setActiveTab(tab);
  if (route === "post") afterPost(arg);
  bind(route);
}

function bind(route) {
  $view.querySelectorAll("[data-lvl]").forEach((b) => b.addEventListener("click", () => {
    settings.level = Math.min(60, Math.max(1, settings.level + Number(b.dataset.lvl)));
    saveSettings();
    render();
  }));

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
    document.getElementById("s-level").addEventListener("change", (e) => {
      settings.level = Math.min(60, Math.max(1, Number(e.target.value) || 1));
      saveSettings();
    });
    document.getElementById("s-race").addEventListener("change", (e) => {
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
    $view.querySelectorAll("[data-region]").forEach((c) => c.addEventListener("change", () => {
      const r = c.dataset.region;
      settings.regions = c.checked ? [...new Set([...settings.regions, r])] : settings.regions.filter((x) => x !== r);
      saveSettings();
      updateBadge();
    }));
    document.getElementById("s-inapp")?.addEventListener("change", async (e) => {
      if (e.target.checked) {
        const p = await Notification.requestPermission();
        settings.inAppNotify = p === "granted";
        if (p !== "granted") toast("Sin permiso para notificar");
        else toast("Listo: te aviso mientras la app esté abierta");
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

render();
loadData({ silent: true });
