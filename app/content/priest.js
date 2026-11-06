// Contenido curado sobre el Priest en WoW: Forever.
// Convención de idioma: la interfaz y las explicaciones van en español, pero todo
// lo que es del juego (spells, talents, items, zones, dungeons, specs) va en inglés,
// tal como aparece con el cliente en inglés.
// Revisado: 7 nov 2026 (el juego salió el 4 nov 2026). Lo que viene de guías de la
// beta va con `verify: true` y la app lo muestra como "a confirmar".

export const PRIEST_UPDATED = "2026-11-07";

export const SOURCES = {
  blizzDeepDive: { name: "Blizzard – Class Deep Dive: Priest y Warrior", url: "https://news.blizzard.com/en-us/article/24301514/world-of-warcraft-forever-class-deep-dives-priest-and-warrior" },
  blizzDungeons: { name: "Blizzard – New Dungeons of Forever", url: "https://news.blizzard.com/en-us/article/24301455/explore-the-new-dungeons-of-world-of-warcraft-forever" },
  maxroll: { name: "Maxroll – Priest Leveling (Forever)", url: "https://maxroll.gg/wow-forever/class-guides/priest-leveling-guide" },
  icyShadow: { name: "Icy Veins – Shadow Priest Leveling (Forever)", url: "https://www.icy-veins.com/wow-forever/shadow-priest-leveling" },
  icyDisc: { name: "Icy Veins – Discipline Priest Leveling (Forever)", url: "https://www.icy-veins.com/wow-forever/discipline-priest-leveling" },
  icyHoly: { name: "Icy Veins – Holy Priest Leveling (Forever)", url: "https://www.icy-veins.com/wow-forever/holy-priest-leveling" },
  icyRotation: { name: "Icy Veins – Shadow Priest Rotation (Forever)", url: "https://www.icy-veins.com/wow-forever/shadow-priest-ranged-dps-pve-rotation-cooldowns-abilities" },
  method: { name: "Method – Priest Leveling & Talents (Forever)", url: "https://www.method.gg/wow-forever/wow-forever-priest-leveling-guide-and-talents" },
  mobaToleduck: { name: "Mobalytics – Priest 1-60 (Toleduck)", url: "https://mobalytics.gg/wow-forever/classes/toleduck-priest-leveling-guide" },
  mobaKargoz: { name: "Mobalytics – Shadow 1-60 (Kargoz)", url: "https://mobalytics.gg/wow-forever/profile/kargoz/classes/1-60-shadow-priest-leveling-guide-wands-talents-rotation-tips-and-tricks" },
  blizzWatchRacials: { name: "Blizzard Watch – Priest Racials", url: "https://blizzardwatch.com/2026/10/09/every-priest-racial-ability-wow-forever/" },
  timesaver: { name: "Timesaver – Shadow Leveling Gear 10-60", url: "https://timesaver.gg/tools/wow-forever/leveling-gear/priest/shadow" },
  wowheadTalents: { name: "Wowhead – Talent Calculator (Forever)", url: "https://www.wowhead.com/forever/talent-calc/priest" },
  conquestWands: { name: "Conquest Capped – Priest Leveling (wands)", url: "https://conquestcapped.com/guides/wow-forever/wow-forever-priest-leveling/" },
};

// Cambios clave respecto de Classic.
export const CHANGES = [
  { title: "Fear Ward y Devouring Plague para todos", body: "Dejan de ser racials: todos los Priest los aprenden en nivel 20.", src: "blizzDeepDive" },
  { title: "Divine Spirit baseline en nivel 30", body: "Ya no es un talent: lo aprende cualquier Priest en 30 (junto con Shadow Protection).", src: "blizzDeepDive" },
  { title: "Shadow Word: Death (nivel 32)", body: "Nuevo spell baseline. Daño Shadow instantáneo, 15 s de cooldown. Si el target sobrevive, recibís ~10% de tu vida máxima de backlash: usalo para rematar.", src: "blizzDeepDive" },
  { title: "Penance (talent de Discipline)", body: "Un solo channel que cura a un aliado o le hace daño a un enemigo. Es el gran motivo para levear como Discipline.", src: "blizzDeepDive" },
  { title: "Shadowform rehecho", body: "Cuesta mucho menos mana. Según las guías: −50% costo de mana de spells Shadow, +100% de bonus de daño crítico, +10% de daño Shadow y −15% de daño físico recibido.", src: "conquestWands", verify: true },
  { title: "Racials rediseñados", body: "Cada raza tiene 2 spells propios (niveles 10 y 20, por quest). Los Gnome Priest reciben spells nuevos.", src: "blizzWatchRacials" },
  { title: "Power Word: Shield", body: "Ahora se puede pisar un shield existente con uno de rank igual o mayor (notas de lanzamiento, 4 nov).", src: "blizzDeepDive" },
  { title: "Los wands ya no escalan con spell power", body: "Desde la beta del 24 sep. Para wandear priorizá Spirit/Intellect (mana) y el DPS del wand en sí.", src: "conquestWands", verify: true },
  { title: "Talents: 51 puntos al 60", body: "21 puntos al nivel 30, 51 al 60. El respec se hace en el class trainer de una capital.", src: "maxroll" },
  { title: "Dual Spec", body: "Las guías lo ubican en nivel 40 (Blizzard habló de bajarlo a 30). Precio sin confirmar (se reportan 10 g y 50 g).", src: "maxroll", verify: true },
];

// Racial spells del Priest. faction: A = Alliance, H = Horde.
export const RACIALS = [
  { race: "Human", faction: "A", spells: [
    { lvl: 10, name: "Divine Grace", desc: "Cura a un aliado por debajo de 50% de vida y le saca Weakened Soul (cooldown largo; las fuentes dicen 5 o 10 min)." },
    { lvl: 20, name: "Feedback", desc: "Instant, 3 min de cooldown. Prácticamente sin cambios." },
  ] },
  { race: "Dwarf", faction: "A", spells: [
    { lvl: 10, name: "Desperate Prayer", desc: "Self-heal instantáneo de emergencia." },
    { lvl: 20, name: "Chastise", desc: "Daño Holy + root de ~2 s. Solo Humanoids, muy poca threat." },
  ] },
  { race: "Night Elf", faction: "A", spells: [
    { lvl: 10, name: "Starshards", desc: "Mucho más daño que en Classic, ahora con 30 s de cooldown." },
    { lvl: 20, name: "Elune's Grace", desc: "−50% de chance de que te peguen melee/ranged por 15 s o hasta 3 misses." },
  ] },
  { race: "Gnome", faction: "A", spells: [
    { lvl: 10, name: "Confounding Flash", desc: "Confunde hasta 5 enemigos a 8 yd por 3 s (se rompe con daño). 2 min de cooldown." },
    { lvl: 20, name: "Contingency Plan", desc: "Ward sobre un aliado por 30 s: si baja de 35% de vida, recibe un absorb y un heal over time." },
  ] },
  { race: "Undead", faction: "H", spells: [
    { lvl: 10, name: "Touch of Weakness", desc: "El próximo golpe melee que recibís debilita al atacante." },
    { lvl: 20, name: "Dark Sacrifice", desc: "Convierte vida en mana (+Spirit) durante 15 s. Excelente para wandear sin parar." },
  ] },
  { race: "Troll", faction: "H", spells: [
    { lvl: 10, name: "Hex of Weakness", desc: "Baja el melee attack power del target y el healing que recibe (−20%) por 2 min." },
    { lvl: 20, name: "Shadowguard", desc: "3 cargas que le pegan Shadow damage a quien te ataque, sin threat. Dura 10 min." },
  ] },
];
export const RACIALS_VERIFY = true; // números de la beta, pueden haber cambiado

// Hitos por nivel. type: spell | talent | dungeon | gear | system
export const MILESTONES = [
  { lvl: 4, type: "spell", title: "Shadow Word: Pain", desc: "Tu DoT principal durante todo el leveo." },
  { lvl: 5, type: "gear", title: "Primer wand", desc: "Lesser Magic Wand (Enchanting) o del Auction House. Los wands son tu mejor daño hasta el 40." },
  { lvl: 6, type: "spell", title: "Power Word: Shield", desc: "Shield antes de cada pull = casi cero downtime." },
  { lvl: 10, type: "spell", title: "Mind Blast + primer racial", desc: "Hacé la quest de tu class trainer para el primer racial spell." },
  { lvl: 10, type: "talent", title: "Primer talent: Wand Specialization", desc: "5/5 primero. Después Spirit Tap." },
  { lvl: 13, type: "gear", title: "Greater Magic Wand", desc: "~50% más DPS que el Lesser. Enchanting o Auction House." },
  { lvl: 13, type: "dungeon", title: "Hall of Thanes disponible", desc: "Dungeon nueva bajo Ironforge (13–18)." },
  { lvl: 15, type: "dungeon", title: "Ruins of Lordaeron disponible", desc: "Dungeon nueva sobre Undercity (15–20)." },
  { lvl: 20, type: "spell", title: "Fear Ward, Devouring Plague y segundo racial", desc: "Ahora son para todas las razas. Quest del segundo racial." },
  { lvl: 24, type: "dungeon", title: "Excavation Site disponible", desc: "Wetlands (24–29)." },
  { lvl: 27, type: "gear", title: "Wand of Mana Concentration", desc: "De Arcanic Enigma en City of Dalaran (según Method).", verify: true },
  { lvl: 28, type: "dungeon", title: "City of Dalaran disponible", desc: "Alterac Mountains (28–33)." },
  { lvl: 30, type: "spell", title: "Divine Spirit y Shadow Protection", desc: "Divine Spirit ya es baseline." },
  { lvl: 30, type: "talent", title: "¿Respec a Discipline por Penance?", desc: "Entre 30 y 37 las guías sugieren ir profundo en Discipline para Penance, dejando 5 en Spirit Tap.", verify: true },
  { lvl: 32, type: "spell", title: "Shadow Word: Death", desc: "Remate instant. Ojo con el backlash si el target sobrevive." },
  { lvl: 35, type: "dungeon", title: "The Drowned City disponible", desc: "Costa de Stranglethorn Vale (35–40)." },
  { lvl: 40, type: "talent", title: "Respec a Shadow → Shadowform", desc: "El gran salto de poder. Si tenés Dual Spec, dejá Discipline/Holy como segunda spec para healear dungeons." },
  { lvl: 40, type: "system", title: "Dual Spec + mount", desc: "Juntá oro desde antes: respec, Dual Spec y mount caen juntos.", verify: true },
  { lvl: 40, type: "dungeon", title: "Krol'dok Stronghold disponible", desc: "Riverglades (40–45)." },
  { lvl: 40, type: "gear", title: "Wands de Shadow damage", desc: "En Shadowform el wand pasa a ser secundario; si usás, que sea de Shadow." },
  { lvl: 45, type: "talent", title: "Power Infusion (si sos Disc)", desc: "Capstone de Discipline para la spec de grupo.", verify: true },
  { lvl: 48, type: "dungeon", title: "Alcaz Prison disponible", desc: "Alcaz Island, Dustwallow Marsh (48–53)." },
  { lvl: 55, type: "dungeon", title: "Blackmaw Hold disponible", desc: "Azshara (55–60)." },
  { lvl: 58, type: "dungeon", title: "Shaper's Terrace disponible", desc: "Un'Goro Crater (58–60)." },
  { lvl: 60, type: "system", title: "Level cap", desc: "51 puntos de talents. Hora de armar el pre-raid BiS." },
];

// Plan de leveo por tramos.
export const PLAN = [
  {
    from: 1, to: 9, spec: "Sin talents", color: "holy",
    summary: "Smite + Shadow Word: Pain, y wand desde el 5.",
    rotation: ["Power Word: Shield (desde el 6) antes del pull", "Shadow Word: Pain", "Smite o Mind Blast (10)", "Rematar con el wand para ahorrar mana"],
    tips: ["Tailoring + Enchanting te dan bags, gear de cloth y wands propios.", "No dejes de comprar los ranks nuevos en el trainer."],
  },
  {
    from: 10, to: 39, spec: "Discipline / wand", color: "disc",
    summary: "Wand Specialization 5/5 → Spirit Tap 5/5 → profundizar Discipline hacia Penance.",
    rotation: ["Power Word: Shield", "Shadow Word: Pain", "Mind Blast", "Wand hasta que muera", "Penance para burst o heal de emergencia (cuando lo tengas)"],
    tips: [
      "Spirit Tap te devuelve mana al matar: encadená pulls sin sentarte.",
      "Si vas a hacer mucha dungeon/grupo, podés demorar Spirit Tap y llegar antes a Penance.",
      "Las dungeons nuevas (Hall of Thanes, Ruins of Lordaeron) dan muy buen gear temprano.",
    ],
  },
  {
    from: 40, to: 60, spec: "Shadow (Shadowform)", color: "shadow",
    summary: "Respec profundo a Shadow. Blackout > Shadow Focus para levear.",
    rotation: ["Power Word: Shield", "Shadow Word: Pain", "Devouring Plague (si está libre)", "Mind Blast en cooldown", "Mind Flay de filler", "Shadow Word: Death para rematar"],
    tips: [
      "Varios mobs: Shadow Word: Pain en cada uno (Shadow no tiene AoE real).",
      "Dejá Discipline/Holy en la Dual Spec para healear dungeons: siempre hay grupo para healer.",
      "Antes del 40 algunas guías ofrecen Shadow desde el 10, pero la mayoría lo marca como no recomendado.",
    ],
  },
];

// Talents: prioridades (los árboles de Forever cambiaron; para el detalle punto
// por punto, la calculadora de Wowhead).
export const TALENTS = [
  {
    name: "Leveling Discipline (10–39)", color: "disc", spec: "Discipline",
    steps: [
      { pts: "5", name: "Wand Specialization", why: "Tu wand es tu daño principal hasta el 40." },
      { pts: "5", name: "Spirit Tap (Shadow)", why: "Regenera mana al matar: menos downtime." },
      { pts: "resto", name: "Discipline hacia Penance (≈30–37)", why: "Penance = daño + heal de emergencia. Muy fuerte." },
      { pts: "45", name: "Power Infusion", why: "Capstone de Discipline (si seguís Disc).", verify: true },
    ],
  },
  {
    name: "Leveling Shadow (40–60)", color: "shadow", spec: "Shadow",
    steps: [
      { pts: "5", name: "Spirit Tap", why: "Sigue siendo la base de tu economía de mana." },
      { pts: "—", name: "Blackout (antes que Shadow Focus)", why: "Stuns aleatorios > hit extra para levear (Icy Veins)." },
      { pts: "—", name: "Mind Flay", why: "Tu filler principal; también slowea." },
      { pts: "—", name: "Shadowform", why: "El objetivo del respec del 40." },
      { pts: "resto", name: "Discipline (Meditation)", why: "Mana regen y Penance según lo que quede." },
    ],
  },
  {
    name: "Dungeon healer", color: "holy", spec: "Group",
    steps: [
      { pts: "—", name: "Discipline", why: "Maxroll recomienda quedarse en Disc si leveás healeando dungeons." },
      { pts: "—", name: "Holy + Holy Nova", why: "Holy Nova es tu único AoE como Holy (Icy Veins)." },
    ],
  },
];

// Gear por tramo. f: A / H / both. slot: slot de la API de Blizzard (para
// compararlo con lo que tenés puesto); null si no está confirmado.
export const GEAR = [
  { lvl: 5, name: "Lesser Magic Wand", type: "Wand", slot: "RANGED", f: "both", source: "Enchanting (o Auction House)", src: "method" },
  { lvl: 13, name: "Greater Magic Wand", type: "Wand", slot: "RANGED", f: "both", source: "Enchanting (o Auction House)", src: "method" },
  { lvl: 13, name: "Deepblaze", type: "Wand", slot: "RANGED", f: "A", source: "Quest 'Old Ironforge Incursion' (Hall of Thanes)", src: "mobaToleduck" },
  { lvl: 15, name: "Golemheart Stave", type: "Staff", slot: "MAIN_HAND", f: "both", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Fang of Magmatus", type: "Weapon", slot: "MAIN_HAND", f: "both", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Robes of the Disgraced Thane", type: "Chest", slot: "CHEST", f: "both", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Ephemeral Choker", type: "Neck", slot: "NECK", f: "both", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Aetherwisp Bracers", type: "Wrist", slot: "WRIST", f: "both", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 17, name: "Gnarled Necromancer's Staff", type: "Staff", slot: "MAIN_HAND", f: "H", source: "Quest 'The Wrath of Rath'mael' (Ruins of Lordaeron). +26 spell power", src: "icyShadow" },
  { lvl: 17, name: "Slain Baron's Signet", type: "Ring", slot: "FINGER", f: "H", source: "Quest de Ruins of Lordaeron", src: "icyHoly" },
  { lvl: 17, name: "Leftover Abomination Skin", type: "Armor", slot: null, f: "both", source: "Ruins of Lordaeron", src: "maxroll" },
  { lvl: 17, name: "Tuskwrap Belt", type: "Waist", slot: "WAIST", f: "both", source: "Ruins of Lordaeron", src: "maxroll" },
  { lvl: 17, name: "Rotmender's Treads", type: "Feet", slot: "FEET", f: "both", source: "Ruins of Lordaeron", src: "maxroll" },
  { lvl: 18, name: "Crescent Staff", type: "Staff", slot: "MAIN_HAND", f: "H", source: "Wailing Caverns (quest)", src: "icyShadow" },
  { lvl: 18, name: "Cookie's Stirring Rod", type: "Wand", slot: "RANGED", f: "both", source: "The Deadmines", src: "mobaToleduck" },
  { lvl: 19, name: "Charred Wand", type: "Wand", slot: "RANGED", f: "both", source: "Ver guía de Method", src: "method", verify: true },
  { lvl: 22, name: "Robes of Arugal", type: "Chest", slot: "CHEST", f: "both", source: "Shadowfang Keep", src: "icyShadow" },
  { lvl: 24, name: "Cursed Eye of Paleth", type: "Accessory", slot: null, f: "A", source: "Quest en Wetlands", src: "icyShadow" },
  { lvl: 27, name: "Wand of Mana Concentration", type: "Wand", slot: "RANGED", f: "both", source: "Arcanic Enigma – City of Dalaran", src: "method", verify: true },
  { lvl: 30, name: "Staff of the Shade", type: "Staff", slot: "MAIN_HAND", f: "both", source: "Razorfen Kraul", src: "icyShadow" },
  { lvl: 30, name: "Wind Spirit Staff", type: "Staff", slot: "MAIN_HAND", f: "both", source: "Ver guía", src: "timesaver", verify: true },
  { lvl: 30, name: "Filigreed Shadow Circlet", type: "Head", slot: "HEAD", f: "both", source: "Ver guía", src: "timesaver", verify: true },
];
export const GEAR_NOTE = "Lista inicial armada con las guías de la semana de lanzamiento. Para 30–60 nivel por nivel, la mejor referencia hoy es la tool de Timesaver (link abajo). Cada item abre la búsqueda en Wowhead Forever para ver stats y drop.";

// Dungeons: las 9 nuevas (tabla oficial de Blizzard) + clásicas útiles.
export const DUNGEONS = [
  { name: "Hall of Thanes", min: 13, max: 18, zone: "Dun Morogh (bajo Ironforge)", isNew: true },
  { name: "Ruins of Lordaeron", min: 15, max: 20, zone: "Tirisfal Glades (sobre Undercity)", isNew: true },
  { name: "Excavation Site", min: 24, max: 29, zone: "Wetlands", isNew: true },
  { name: "City of Dalaran", min: 28, max: 33, zone: "Alterac Mountains", isNew: true },
  { name: "The Drowned City", min: 35, max: 40, zone: "Costa de Stranglethorn Vale", isNew: true },
  { name: "Krol'dok Stronghold", min: 40, max: 45, zone: "Riverglades", isNew: true },
  { name: "Alcaz Prison", min: 48, max: 53, zone: "Alcaz Island, Dustwallow Marsh", isNew: true },
  { name: "Blackmaw Hold", min: 55, max: 60, zone: "Azshara", isNew: true },
  { name: "Shaper's Terrace", min: 58, max: 60, zone: "Un'Goro Crater", isNew: true },
  { name: "Ragefire Chasm", min: 13, max: 18, zone: "Orgrimmar", classic: true },
  { name: "Wailing Caverns", min: 17, max: 24, zone: "The Barrens", classic: true },
  { name: "The Deadmines", min: 17, max: 26, zone: "Westfall", classic: true },
  { name: "Shadowfang Keep", min: 22, max: 30, zone: "Silverpine Forest", classic: true },
  { name: "Blackfathom Deeps", min: 24, max: 32, zone: "Ashenvale", classic: true },
  { name: "Razorfen Kraul", min: 30, max: 40, zone: "The Barrens", classic: true },
  { name: "Scarlet Monastery", min: 30, max: 45, zone: "Tirisfal Glades", classic: true },
  { name: "Uldaman", min: 41, max: 51, zone: "Badlands", classic: true },
  { name: "Zul'Farrak", min: 44, max: 54, zone: "Tanaris", classic: true },
  { name: "Maraudon", min: 46, max: 55, zone: "Desolace", classic: true },
  { name: "Sunken Temple", min: 50, max: 60, zone: "Swamp of Sorrows", classic: true },
  { name: "Blackrock Depths", min: 52, max: 60, zone: "Blackrock Mountain", classic: true },
];

export const LINKS = [
  SOURCES.maxroll, SOURCES.icyShadow, SOURCES.icyDisc, SOURCES.icyHoly, SOURCES.method,
  SOURCES.mobaToleduck, SOURCES.mobaKargoz, SOURCES.timesaver, SOURCES.wowheadTalents,
  SOURCES.blizzDeepDive, SOURCES.blizzDungeons, SOURCES.blizzWatchRacials,
];

export const wowheadSearch = (name) => `https://www.wowhead.com/forever/search?q=${encodeURIComponent(name)}`;
