# Forever Companion

App para el teléfono (PWA) pensada para un Priest que levelea en **World of Warcraft: Forever**:

- **Blue Tracker**: todos los posts del personal de Blizzard en las categorías de WoW: Forever del foro de US (inglés), con filtros (hotfixes, problemas conocidos, noticias oficiales, servidores, Priest), búsqueda, marcado de leídos y el texto completo del post dentro de la app. En los posts largos de hotfixes resalta las menciones a *Priest*.
- **Alertas push** al teléfono (con la app cerrada) vía [ntfy](https://ntfy.sh) cuando Blizzard publica algo importante o **edita** un post de hotfixes/known issues.
- **Noticias** de Forever (feed de Wowhead).
- **Professions**: guías por tramo para Enchanting, Tailoring, First Aid, Cooking y Fishing, con tu skill actual, próximos hitos (trainers, books, quests), dónde farmear cloth, qué da desencantar y link a la ruta exacta de Wowhead.
- **Tu personaje (opcional)**: leído de la API de Battle.net — level, raza, gear real con slots flojos y upgrades sugeridos, y skill de professions.
- **Asistente de Priest**: ponés tu nivel y raza y te muestra la rotación para ese tramo, próximos hitos (hechizos, respec, mazmorras), mazmorras para tu nivel y mejoras de equipo a buscar. Además: plan 1–60, prioridades de talentos, equipo de leveo con link a Wowhead, las 9 mazmorras nuevas, raciales del Priest y cambios vs Classic, con fuentes.
- Funciona offline (lo último descargado) y se instala en la pantalla de inicio.

## Cómo funciona

```
GitHub Actions (cada 15 min)
  └─ scripts/fetch-feeds.mjs
       ├─ foros Blizzard: /groups/blizzard-tracker/posts.json (US)
       │    filtrado a las categorías "Forever" + texto completo de cada post
       ├─ Wowhead: /news/rss/forever
       ├─ Battle.net API: tu personaje (si está configurado)
       ├─ guarda app/data/blues.json y app/data/news.json (commit)
       └─ si hay algo nuevo/editado e importante → push por ntfy
  └─ publica la carpeta app/ en GitHub Pages
```

No hay servidor propio ni costos: todo corre en GitHub (Actions + Pages) y ntfy.sh.

## Puesta en marcha (una sola vez, ~10 minutos)

1. **Llevar el código a `main`** (mergear la rama). Los cron de GitHub solo corren en la rama por defecto.
2. **Activar GitHub Pages**: *Settings → Pages → Build and deployment → Source: GitHub Actions*.
   - Si el repo es privado, Pages requiere un plan pago de GitHub; con el repo público funciona gratis.
3. **Alertas push**:
   1. Instalá **ntfy** en el teléfono ([Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) / [iPhone](https://apps.apple.com/app/ntfy/id1625396347)).
   2. Inventá un nombre de tema difícil de adivinar, p. ej. `forever-blues-8f3k2q` (quien conozca el nombre puede leerlo/escribirlo).
   3. En GitHub: *Settings → Secrets and variables → Actions → New repository secret* → nombre `NTFY_TOPIC`, valor = tu tema.
   4. En la app ntfy: *Suscribirse a un tema* → el mismo nombre.
4. **Primera corrida**: *Actions → "Blue tracker + publicar app" → Run workflow*. Al terminar, la app queda en `https://<tu-usuario>.github.io/<repo>/`.
5. **Instalar en el teléfono**: abrí esa URL → Android: menú ⋮ → *Instalar app*; iPhone: Compartir → *Agregar a inicio*.

### Conectar tu personaje (opcional)

1. Entrá a https://develop.battle.net/access/clients con tu cuenta de Battle.net → **Create Client** (nombre cualquiera; Redirect URL `https://localhost`).
2. Copiá el **Client ID** y el **Client Secret** como secretos del repo: `BLIZZARD_CLIENT_ID` y `BLIZZARD_CLIENT_SECRET`.
3. En [`app/config.json`](app/config.json) poné `"character": "Nombre Apellido"` (Forever no tiene realms: los personajes tienen nombre y apellido).

Blizzard publica el personaje recién desde level 10 y se actualiza cuando hacés logout. La API de Forever todavía no está documentada oficialmente, así que puede cambiar.

### Opciones (Settings → Secrets and variables → Actions → *Variables*)

| Variable | Default | Para qué |
|---|---|---|
| `NOTIFY_ALL` | `0` | `1` = push por cualquier post azul, no solo los importantes. |
| `APP_URL` | URL de Pages | Adónde lleva el toque en la notificación. |

"Importante" = hotfixes, problemas conocidos, notas de parche/desarrollo, servidores/colas/mantenimiento, noticias oficiales y cualquier post que mencione al Priest.

## Actualizar el contenido del Priest

Todo está en [`app/content/priest.js`](app/content/priest.js): hitos, plan, talentos, equipo, mazmorras, raciales y cambios. Lo que sale de guías de la beta tiene `verify: true` y la app lo muestra como **"a confirmar"**. Editás, hacés push a `main` y la app se republica sola.

## Desarrollo local

```bash
node scripts/fetch-feeds.mjs          # baja datos a app/data (Node 20+)
cd app && python3 -m http.server 8000 # abrir http://localhost:8000
```

Proyecto de fans, sin afiliación con Blizzard Entertainment.
