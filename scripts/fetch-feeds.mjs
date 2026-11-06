#!/usr/bin/env node
// Descarga los posts "azules" (personal de Blizzard) de WoW: Forever desde los
// foros oficiales (Discourse) y las noticias de Wowhead, los guarda como JSON
// estático para la app y avisa por ntfy cuando aparece algo nuevo.
//
// Sin dependencias: Node 20+ (fetch nativo).
//
// Variables de entorno opcionales:
//   NTFY_TOPIC      tema de ntfy.sh al que mandar las alertas (si falta, no avisa)
//   NTFY_SERVER     servidor ntfy (default https://ntfy.sh)
//   NOTIFY_REGIONS  regiones que disparan alertas, separadas por coma (default "us")
//   NOTIFY_ALL      "1" para avisar de cualquier post azul, no solo los importantes
//   APP_URL         URL pública de la app, para que la alerta abra la app
//   DATA_DIR        carpeta de salida (default app/data)

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "app", "data");
const UA = "ForeverCompanion/1.0 (+https://github.com/nballve-code/leveling-app)";
const MAX_BLUES = 400;
const MAX_NEWS = 80;
const MAX_DETAIL_FETCHES = 40;
const REFRESH_DAYS = 14; // re-chequear ediciones de hotfixes/known issues recientes

// Solo el foro de US (inglés): ahí juega el usuario y así no se duplican las
// noticias en inglés y en español.
const REGIONS = [
  { id: "us", label: "US", base: "https://us.forums.blizzard.com/en/wow" },
];
const REGION_IDS = new Set(REGIONS.map((r) => r.id));

const NOTIFY_REGIONS = (process.env.NOTIFY_REGIONS || "us").split(",").map((s) => s.trim());
const NOTIFY_ALL = process.env.NOTIFY_ALL === "1";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (res.status === 429) {
        await sleep(3000 * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await sleep(1000 * (i + 1));
    }
  }
  throw lastErr;
}

async function getText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

async function readJSON(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

// ---------- Clasificación ----------

function classify(p) {
  const t = `${p.title}`.toLowerCase();
  const tags = [];
  if (/hotfix/.test(t)) tags.push("hotfix");
  if (/known issues|problemas conocidos/.test(t)) tags.push("known-issues");
  if (/patch notes|notas del parche|development notes|notas de desarrollo|update notes/.test(t)) tags.push("patch-notes");
  if (/maintenance|mantenimiento|downtime|realm|reino|server|servidor|queue|cola/.test(t)) tags.push("servers");
  if (p.username === "BlizzardEntertainment" || p.username === "BlizzardEntretenimiento") tags.push("news");
  if (/\bpriest|sacerdote|shadowform|penance|penitencia|power word|palabra de poder|smite|mind flay/i.test(`${p.title} ${p.text || ""}`)) tags.push("priest");
  if (tags.length === 0 || (p.postNumber > 1 && !tags.includes("news"))) tags.push("reply");
  return tags;
}

function isImportant(tags) {
  return tags.some((t) => ["hotfix", "known-issues", "patch-notes", "servers", "news", "priest"].includes(t));
}

function htmlToText(html) {
  // Dos pasadas: el RSS trae HTML escapado dentro de la descripción.
  return stripOnce(stripOnce(html));
}

function stripOnce(html) {
  return String(html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h\d|div|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

// ---------- Foros de Blizzard ----------

async function foreverCategoryIds(region) {
  const data = await getJSON(`${region.base}/categories.json?include_subcategories=true`);
  const ids = new Map();
  for (const c of data.category_list.categories) {
    for (const s of [c, ...(c.subcategory_list || [])]) {
      if (/forever/i.test(decodeURIComponent(s.slug)) || /forever/i.test(s.name)) ids.set(s.id, s.name);
    }
  }
  return ids;
}

async function fetchRegion(region, knownIds, pages) {
  const cats = await foreverCategoryIds(region);
  const out = [];
  let before = null;
  for (let page = 0; page < pages; page++) {
    const url = `${region.base}/groups/blizzard-tracker/posts.json${before ? `?before=${encodeURIComponent(before)}` : ""}`;
    const data = await getJSON(url);
    const posts = data.posts || [];
    if (posts.length === 0) break;
    for (const p of posts) {
      const inForeverCat = cats.has(p.category_id);
      const mentionsForever = /forever/i.test(`${p.topic_title} ${p.excerpt || ""}`);
      if (!inForeverCat && !mentionsForever) continue;
      out.push({
        id: `${region.id}-${p.id}`,
        postId: p.id,
        region: region.id,
        title: p.topic_title,
        url: `${region.base}${p.url}`,
        topicId: p.topic_id,
        postNumber: p.post_number,
        category: cats.get(p.category_id) || "General",
        author: p.name || p.username,
        username: p.username,
        authorTitle: p.user_title || "",
        createdAt: p.created_at,
        excerpt: htmlToText(p.excerpt).slice(0, 400),
      });
    }
    before = posts[posts.length - 1].created_at;
    // Si toda la página ya era conocida, no hace falta seguir paginando.
    if (posts.every((p) => knownIds.has(`${region.id}-${p.id}`))) break;
    await sleep(500);
  }
  return out;
}

async function fetchDetail(region, postId) {
  const d = await getJSON(`${region.base}/posts/${postId}.json`);
  return { html: d.cooked || "", updatedAt: d.updated_at || d.created_at };
}

// ---------- Wowhead ----------

function parseRss(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  const pick = (block, tag) => {
    const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(block);
    if (!r) return "";
    return r[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();
  };
  while ((m = re.exec(xml))) {
    const b = m[1];
    const img = /<media:content[^>]*url="([^"]+)"/.exec(b);
    const link = htmlToText(pick(b, "link"));
    if (!/^https:\/\//.test(link)) continue;
    items.push({
      id: pick(b, "guid") || link,
      title: htmlToText(pick(b, "title")),
      url: link,
      summary: htmlToText(pick(b, "description")).replace(/Continue reading »/g, "").trim().slice(0, 400),
      image: img && /^https:\/\//.test(img[1]) ? img[1] : null,
      createdAt: new Date(pick(b, "pubDate")).toISOString(),
      source: "Wowhead",
    });
  }
  return items;
}

// ---------- Notificaciones ----------

async function notify(post) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  const server = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(/\/$/, "");
  const tagEmoji = post.tags.includes("hotfix")
    ? "wrench"
    : post.tags.includes("known-issues")
      ? "warning"
      : post.tags.includes("priest")
        ? "sparkles"
        : "large_blue_circle";
  const prefix = post.updated ? "[Actualizado] " : "";
  const body = (post.text || post.excerpt || "").slice(0, 300);
  const appUrl = process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, "")}/#post/${encodeURIComponent(post.id)}` : post.url;
  try {
    // Publicación JSON: evita problemas de acentos en headers.
    const res = await fetch(`${server}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        title: `${prefix}${post.author}: ${post.title}`.slice(0, 250),
        message: body || post.title,
        tags: [tagEmoji, post.region],
        priority: post.tags.includes("priest") || post.tags.includes("servers") ? 4 : 3,
        click: appUrl,
        actions: [{ action: "view", label: "Ver en el foro", url: post.url }],
      }),
    });
    if (!res.ok) console.warn("ntfy respondió", res.status);
  } catch (e) {
    console.warn("ntfy falló:", e.message);
  }
}

// ---------- Main ----------

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  const bluesFile = path.join(DATA_DIR, "blues.json");
  const newsFile = path.join(DATA_DIR, "news.json");
  const prev = await readJSON(bluesFile, { posts: [] });
  const firstRun = prev.posts.length === 0;
  const byId = new Map(prev.posts.filter((p) => REGION_IDS.has(p.region)).map((p) => [p.id, p]));
  // IDs vistos alguna vez (incluye duplicados descartados), para no re-avisar.
  const knownIds = new Set([...byId.keys(), ...(prev.seen || [])]);
  const toNotify = [];
  const errors = [];
  let detailBudget = firstRun ? 260 : MAX_DETAIL_FETCHES;

  for (const region of REGIONS) {
    let fresh = [];
    try {
      fresh = await fetchRegion(region, knownIds, firstRun ? 6 : 3);
    } catch (e) {
      errors.push(`${region.id}: ${e.message}`);
      continue;
    }
    for (const p of fresh) {
      const old = byId.get(p.id);
      const recent = Date.now() - new Date(p.createdAt).getTime() < REFRESH_DAYS * 864e5;
      const living = /hotfix|known issues|problemas conocidos|development notes|notas/i.test(p.title);
      const needsDetail = !old || !old.html || (living && recent);
      let merged = { ...old, ...p };
      if (needsDetail && detailBudget > 0) {
        detailBudget--;
        try {
          const d = await fetchDetail(region, p.postId);
          const changed = old && old.updatedAt && d.updatedAt !== old.updatedAt && old.html !== d.html;
          merged = { ...merged, html: d.html, text: htmlToText(d.html).slice(0, 1200), updatedAt: d.updatedAt };
          if (changed) merged.updated = true;
          await sleep(300);
        } catch (e) {
          errors.push(`detalle ${p.id}: ${e.message}`);
        }
      }
      merged.tags = classify(merged);
      merged.important = isImportant(merged.tags);
      byId.set(p.id, merged);

      const isNew = !old && !knownIds.has(p.id);
      const isUpdate = old && merged.updated && merged.updatedAt !== old.updatedAt;
      if (!firstRun && (isNew || isUpdate) && NOTIFY_REGIONS.includes(region.id) && (NOTIFY_ALL || merged.important)) {
        toNotify.push(merged);
      }
    }
    await sleep(500);
  }

  // Blizzard a veces publica la misma noticia en dos categorías: dejamos una sola.
  const dedupe = new Map();
  for (const p of [...byId.values()].sort((a, b) => (a.category === "General") - (b.category === "General"))) {
    const key = `${p.region}|${p.username}|${p.title}|${p.postNumber}`;
    if (!dedupe.has(key)) dedupe.set(key, p);
  }
  const posts = [...dedupe.values()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_BLUES);

  // News de Wowhead
  let news = (await readJSON(newsFile, { items: [] })).items;
  try {
    const items = parseRss(await getText("https://www.wowhead.com/news/rss/forever"));
    const seen = new Map(news.map((n) => [n.id, n]));
    for (const it of items) seen.set(it.id, { ...seen.get(it.id), ...it });
    news = [...seen.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, MAX_NEWS);
  } catch (e) {
    errors.push(`wowhead: ${e.message}`);
  }

  const generatedAt = new Date().toISOString();
  const bluesChanged = JSON.stringify(posts) !== JSON.stringify(prev.posts) || !prev.seen;
  if (bluesChanged || firstRun) {
    const seen = [...new Set([...knownIds, ...byId.keys()])].slice(-3000);
    await writeFile(bluesFile, JSON.stringify({ generatedAt, errors, posts, seen }, null, 1));
  }
  await writeFile(newsFile, JSON.stringify({ generatedAt, items: news }, null, 1));
  await writeFile(path.join(DATA_DIR, "status.json"), JSON.stringify({ generatedAt, errors, blues: posts.length, news: news.length }, null, 1));

  // Avisar en orden cronológico, máximo 8 por corrida para no spamear.
  for (const p of toNotify.reverse().slice(-8)) await notify(p);

  // Prueba manual desde Actions → Run workflow → "Mandar push de prueba".
  if (process.env.TEST_PUSH === "1" || process.env.TEST_PUSH === "true") {
    const latest = posts.find((p) => p.important && NOTIFY_REGIONS.includes(p.region)) || posts[0];
    if (latest) await notify({ ...latest, title: `[Prueba] ${latest.title}` });
    console.log(process.env.NTFY_TOPIC ? "Push de prueba enviado" : "Falta el secreto NTFY_TOPIC: no se envió nada");
  }

  console.log(`Azules: ${posts.length} (nuevos/actualizados a notificar: ${toNotify.length}) · Noticias: ${news.length}`);
  if (errors.length) console.warn("Errores:", errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
