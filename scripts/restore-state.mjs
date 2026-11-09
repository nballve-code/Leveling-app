#!/usr/bin/env node
// Trae los datos de la última corrida desde el sitio ya publicado (GitHub Pages)
// en lugar de guardarlos con commits en el repo. Así el robot no escribe nada en
// GitHub salvo cuando hay que republicar la página.
//
// Deja una copia en $RUNNER_TEMP/prev para que el workflow compare y solo
// publique si algo cambió.

import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const APP_URL = (process.env.APP_URL || "").replace(/\/?$/, "/");
const DATA = path.join(process.cwd(), "app", "data");
const PREV = path.join(process.env.RUNNER_TEMP || "/tmp", "prev");
const FILES = ["blues.json", "news.json", "character.json"];

await mkdir(PREV, { recursive: true });

for (const f of FILES) {
  const local = path.join(DATA, f);
  try {
    if (!APP_URL.startsWith("https://")) throw new Error("sin APP_URL");
    const res = await fetch(`${APP_URL}data/${f}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    JSON.parse(text); // solo aceptamos JSON válido
    await writeFile(local, text);
    console.log(`${f}: restaurado del sitio publicado`);
  } catch (e) {
    console.log(`${f}: uso la copia del repo (${e.message})`);
  }
  // Copia para comparar después (si el archivo no existe, queda vacía).
  await copyFile(local, path.join(PREV, f)).catch(() => writeFile(path.join(PREV, f), ""));
}
