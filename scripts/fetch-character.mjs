#!/usr/bin/env node
// Lee tu personaje de WoW: Forever desde la API de Battle.net y lo guarda en
// app/data/character.json (nivel, raza, equipo, profesiones, avatar).
//
// La API de Forever todavía no está documentada por Blizzard; esto usa lo que la
// comunidad confirmó: namespace profile-forever-{region}, personajes sin realm con
// slug "{name}-{surname}". Un personaje aparece recién desde nivel 10 y se
// actualiza cuando hacés logout.
//
// Necesita (GitHub → Settings → Secrets → Actions):
//   BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET  (develop.battle.net, gratis)
// El personaje se toma de app/config.json → character ("Nombre Apellido") y region.
// Sin credenciales o sin personaje configurado, no hace nada.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "app", "data", "character.json");

const ID = process.env.BLIZZARD_CLIENT_ID;
const SECRET = process.env.BLIZZARD_CLIENT_SECRET;

async function readJSON(file, fallback) {
  try { return JSON.parse(await readFile(file, "utf8")); } catch { return fallback; }
}

// Escribe solo si cambió algo más que la hora del chequeo (evita commits cada 15 min).
async function save(data) {
  const prev = await readJSON(OUT, null);
  const strip = (d) => JSON.stringify({ ...d, status: { ...(d?.status || {}), checkedAt: null } });
  if (prev && strip(prev) === strip(data)) return;
  await writeFile(OUT, JSON.stringify(data, null, 1));
}

const config = await readJSON(path.join(ROOT, "app", "config.json"), {});
const region = (config.region || "us").toLowerCase();
const character = String(config.character || "").trim();

if (!ID || !SECRET || !character) {
  console.log("Personaje: sin credenciales o sin personaje en app/config.json; salteado.");
  process.exit(0);
}

const slug = character.toLowerCase().normalize("NFC").replace(/\s+/g, "-");
const API = `https://${region}.api.blizzard.com`;
const NS = `profile-forever-${region}`;

async function token() {
  const res = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${ID}:${SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`OAuth ${res.status}: revisá BLIZZARD_CLIENT_ID / BLIZZARD_CLIENT_SECRET`);
  return (await res.json()).access_token;
}

async function get(tok, p) {
  const url = `${API}${p}${p.includes("?") ? "&" : "?"}namespace=${NS}&locale=en_US`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${p}`);
  return res.json();
}

const name = (x) => (x && typeof x === "object" ? x.name || x.type || "" : x || "");

function mapEquipment(eq) {
  return (eq?.equipped_items || []).map((it) => ({
    slot: it.slot?.type || "",
    slotName: name(it.slot),
    id: it.item?.id,
    name: name(it),
    quality: it.quality?.type || "",
    itemLevel: it.level?.value ?? it.item_level ?? null,
    requiredLevel: it.requirements?.level?.value ?? null,
    itemClass: name(it.item_subclass) || name(it.item_class),
    stats: (it.stats || []).map((s) => ({ type: s.type?.type, name: name(s.type), value: s.value })),
    spells: (it.spells || []).map((s) => s.description).filter(Boolean),
    weapon: it.weapon ? { dps: it.weapon.dps?.value ?? null, damage: it.weapon.damage?.display_string || "", speed: it.weapon.attack_speed?.display_string || "" } : null,
    enchant: (it.enchantments || []).map((e) => e.display_string).filter(Boolean)[0] || null,
  }));
}

function mapProfessions(pr) {
  const out = [];
  for (const group of ["primaries", "secondaries"]) {
    for (const p of pr?.[group] || []) {
      // Classic devuelve skill_points directo; retail los anida en tiers.
      const tier = p.tiers?.[p.tiers.length - 1];
      out.push({
        name: name(p.profession),
        kind: group === "primaries" ? "Primary" : "Secondary",
        skill: p.skill_points ?? tier?.skill_points ?? null,
        max: p.max_skill_points ?? tier?.max_skill_points ?? null,
      });
    }
  }
  return out;
}

try {
  const tok = await token();
  const base = `/profile/wow/character/${encodeURIComponent(slug)}`;
  const profile = await get(tok, base);
  if (!profile) {
    const prev = await readJSON(OUT, null);
    const status = { ok: false, reason: "not-found", checkedAt: new Date().toISOString() };
    await save({ ...(prev || {}), status });
    console.log(`Personaje ${slug}: 404 (aparece desde nivel 10 y después de hacer logout).`);
    process.exit(0);
  }
  const [equipment, professions, media] = await Promise.all([
    get(tok, `${base}/equipment`).catch(() => null),
    get(tok, `${base}/professions`).catch(() => null),
    get(tok, `${base}/character-media`).catch(() => null),
  ]);
  const asset = (k) => media?.assets?.find((a) => a.key === k)?.value || null;
  const data = {
    status: { ok: true, checkedAt: new Date().toISOString() },
    name: profile.name,
    surname: profile.surname || "",
    level: profile.level,
    race: name(profile.race),
    className: name(profile.character_class),
    spec: name(profile.active_spec),
    faction: profile.faction?.type || "",
    gender: profile.gender?.type || "",
    guild: name(profile.guild),
    ruleset: name(profile.ruleset),
    itemLevel: profile.equipped_item_level ?? profile.average_item_level ?? null,
    lastLogin: profile.last_login_timestamp ? new Date(profile.last_login_timestamp).toISOString() : null,
    avatar: asset("avatar"),
    render: asset("main-raw") || asset("main"),
    equipment: mapEquipment(equipment),
    professions: mapProfessions(professions),
    professionsAvailable: !!professions,
  };
  await save(data);
  console.log(`Personaje: ${data.name} ${data.surname} · nivel ${data.level} · ${data.equipment.length} items · ${data.professions.length} profesiones`);
} catch (e) {
  console.warn("Personaje: error", e.message);
  const prev = await readJSON(OUT, null);
  await save({ ...(prev || {}), status: { ok: false, reason: e.message, checkedAt: new Date().toISOString() } });
}
