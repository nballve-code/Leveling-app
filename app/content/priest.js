// Contenido curado sobre el Priest en WoW: Forever.
// Revisado: 6 nov 2026 (el juego salió el 4 nov 2026). Mucho de esto viene de
// guías escritas durante la beta: cuando algo no está confirmado, va marcado
// con `verify: true` y la app lo muestra como "A confirmar".
// Para actualizar: editá este archivo y hacé push; la app lo toma sola.

export const PRIEST_UPDATED = "2026-11-06";

export const SOURCES = {
  blizzDeepDive: { name: "Blizzard – Class Deep Dive: Priest y Warrior", url: "https://news.blizzard.com/en-us/article/24301514/world-of-warcraft-forever-class-deep-dives-priest-and-warrior" },
  blizzDungeons: { name: "Blizzard – Las nuevas mazmorras de Forever", url: "https://news.blizzard.com/en-us/article/24301455/explore-the-new-dungeons-of-world-of-warcraft-forever" },
  maxroll: { name: "Maxroll – Priest Leveling (Forever)", url: "https://maxroll.gg/wow-forever/class-guides/priest-leveling-guide" },
  icyShadow: { name: "Icy Veins – Shadow Priest Leveling (Forever)", url: "https://www.icy-veins.com/wow-forever/shadow-priest-leveling" },
  icyDisc: { name: "Icy Veins – Discipline Priest Leveling (Forever)", url: "https://www.icy-veins.com/wow-forever/discipline-priest-leveling" },
  icyHoly: { name: "Icy Veins – Holy Priest Leveling (Forever)", url: "https://www.icy-veins.com/wow-forever/holy-priest-leveling" },
  icyRotation: { name: "Icy Veins – Shadow Priest Rotación (Forever)", url: "https://www.icy-veins.com/wow-forever/shadow-priest-ranged-dps-pve-rotation-cooldowns-abilities" },
  method: { name: "Method – Priest Leveling & Talents (Forever)", url: "https://www.method.gg/wow-forever/wow-forever-priest-leveling-guide-and-talents" },
  mobaToleduck: { name: "Mobalytics – Priest 1-60 (Toleduck)", url: "https://mobalytics.gg/wow-forever/classes/toleduck-priest-leveling-guide" },
  mobaKargoz: { name: "Mobalytics – Shadow 1-60 (Kargoz)", url: "https://mobalytics.gg/wow-forever/profile/kargoz/classes/1-60-shadow-priest-leveling-guide-wands-talents-rotation-tips-and-tricks" },
  blizzWatchRacials: { name: "Blizzard Watch – Raciales del Priest", url: "https://blizzardwatch.com/2026/10/09/every-priest-racial-ability-wow-forever/" },
  timesaver: { name: "Timesaver – Equipo de leveo Shadow 10-60", url: "https://timesaver.gg/tools/wow-forever/leveling-gear/priest/shadow" },
  wowheadTalents: { name: "Wowhead – Calculadora de talentos (Forever)", url: "https://www.wowhead.com/forever/talent-calc/priest" },
  conquestWands: { name: "Conquest Capped – Priest leveling (wands)", url: "https://conquestcapped.com/guides/wow-forever/wow-forever-priest-leveling/" },
};

// Cambios clave respecto de Classic.
export const CHANGES = [
  { title: "Fear Ward y Devouring Plague para todos", body: "Dejan de ser raciales: todos los Priest los aprenden en nivel 20.", src: "blizzDeepDive" },
  { title: "Divine Spirit base en nivel 30", body: "Ya no es un talento: lo aprende cualquier Priest en 30 (junto con Shadow Protection).", src: "blizzDeepDive" },
  { title: "Shadow Word: Death (nivel 32)", body: "Nuevo hechizo base. Daño de Sombras instantáneo, 15 s de CD. Si el objetivo sobrevive, recibís un rebote de ~10% de tu vida máxima: usalo para rematar.", src: "blizzDeepDive" },
  { title: "Penance (talento de Disciplina)", body: "Canalización única que cura a un aliado o daña a un enemigo. Es el gran motivo para levear como Disciplina.", src: "blizzDeepDive" },
  { title: "Shadowform rehecha", body: "Cuesta mucho menos maná. Según las guías: −50% costo de maná de hechizos de Sombras, +100% bonus de daño crítico, +10% daño de Sombras y −15% daño físico recibido.", src: "conquestWands", verify: true },
  { title: "Raciales rediseñadas", body: "Cada raza tiene 2 hechizos propios (niveles 10 y 20, por misión). Los Gnome Priest reciben hechizos nuevos.", src: "blizzWatchRacials" },
  { title: "Power Word: Shield", body: "Ahora se puede reemplazar un escudo existente con uno de rango igual o superior (notas de lanzamiento, 4 nov).", src: "blizzDeepDive" },
  { title: "Las varitas ya no escalan con poder de hechizo", body: "Desde la beta del 24 sep. Para varitear, priorizá Espíritu/Intelecto (maná) y la DPS de la varita en sí.", src: "conquestWands", verify: true },
  { title: "Talentos: 51 puntos al 60", body: "21 puntos al nivel 30, 51 al 60. La respec se hace en el entrenador de clase de una capital.", src: "maxroll" },
  { title: "Dual spec", body: "Las guías lo ubican en nivel 40 (Blizzard habló de bajarlo a 30). Precio sin confirmar (se reportan 10 g y 50 g).", src: "maxroll", verify: true },
];

// Hechizos raciales del Priest. faction: A = Alianza, H = Horda.
export const RACIALS = [
  { race: "Human", raceEs: "Humano", faction: "A", spells: [
    { lvl: 10, name: "Divine Grace", desc: "Cura a un aliado por debajo de 50% de vida y le quita Weakened Soul (CD largo; las fuentes dicen 5 o 10 min)." },
    { lvl: 20, name: "Feedback", desc: "Instantáneo, 3 min de CD. Prácticamente sin cambios." },
  ] },
  { race: "Dwarf", raceEs: "Enano", faction: "A", spells: [
    { lvl: 10, name: "Desperate Prayer", desc: "Autocuración instantánea de emergencia." },
    { lvl: 20, name: "Chastise", desc: "Daño Sagrado + inmoviliza ~2 s. Solo humanoides, muy poca amenaza." },
  ] },
  { race: "Night Elf", raceEs: "Elfo de la noche", faction: "A", spells: [
    { lvl: 10, name: "Starshards", desc: "Mucho más daño que en Classic, ahora con 30 s de CD." },
    { lvl: 20, name: "Elune's Grace", desc: "−50% probabilidad de que te peguen cuerpo a cuerpo/a distancia por 15 s o hasta 3 fallos." },
  ] },
  { race: "Gnome", raceEs: "Gnomo", faction: "A", spells: [
    { lvl: 10, name: "Confounding Flash", desc: "Confunde hasta 5 enemigos a 8 m por 3 s (se rompe con daño). 2 min de CD." },
    { lvl: 20, name: "Contingency Plan", desc: "Protección sobre un aliado por 30 s: si baja de 35% de vida, recibe un escudo y curación en el tiempo." },
  ] },
  { race: "Undead", raceEs: "No-muerto", faction: "H", spells: [
    { lvl: 10, name: "Touch of Weakness", desc: "El próximo golpe cuerpo a cuerpo que recibís debilita al atacante." },
    { lvl: 20, name: "Dark Sacrifice", desc: "Convierte vida en maná (+Espíritu) durante 15 s. Excelente para varitear sin parar." },
  ] },
  { race: "Troll", raceEs: "Trol", faction: "H", spells: [
    { lvl: 10, name: "Hex of Weakness", desc: "Reduce el poder de ataque cuerpo a cuerpo del objetivo y la curación que recibe (−20%) por 2 min." },
    { lvl: 20, name: "Shadowguard", desc: "3 cargas que golpean con Sombras a quien te ataque, sin generar amenaza. Dura 10 min." },
  ] },
];
export const RACIALS_VERIFY = true; // números de la beta, pueden haber cambiado

// Hitos por nivel: hechizos, talentos, mazmorras y compras.
// type: spell | talent | dungeon | gear | system
export const MILESTONES = [
  { lvl: 4, type: "spell", title: "Shadow Word: Pain", desc: "Tu DoT principal durante todo el leveo." },
  { lvl: 5, type: "gear", title: "Primera varita", desc: "Lesser Magic Wand (Encantamiento) o comprala en la casa de subastas. Las varitas son tu mejor daño hasta el 40." },
  { lvl: 6, type: "spell", title: "Power Word: Shield", desc: "Escudo antes de cada pull = casi cero tiempo de descanso." },
  { lvl: 10, type: "spell", title: "Mind Blast + 1ª racial", desc: "Hacé la misión de tu entrenador para el primer hechizo racial." },
  { lvl: 10, type: "talent", title: "Primer talento: Wand Specialization", desc: "5/5 primero. Después Spirit Tap." },
  { lvl: 13, type: "gear", title: "Greater Magic Wand", desc: "~50% más DPS que la Lesser. Encantamiento o subasta." },
  { lvl: 13, type: "dungeon", title: "Hall of Thanes disponible", desc: "Nueva mazmorra bajo Forjaz (13–18)." },
  { lvl: 15, type: "dungeon", title: "Ruins of Lordaeron disponible", desc: "Nueva mazmorra sobre Entrañas (15–20)." },
  { lvl: 20, type: "spell", title: "Fear Ward, Devouring Plague y 2ª racial", desc: "Ahora son para todas las razas. Misión de la segunda racial." },
  { lvl: 24, type: "dungeon", title: "Excavation Site disponible", desc: "Humedales (24–29)." },
  { lvl: 27, type: "gear", title: "Wand of Mana Concentration", desc: "De Arcanic Enigma en City of Dalaran (según Method).", verify: true },
  { lvl: 28, type: "dungeon", title: "City of Dalaran disponible", desc: "Montañas de Alterac (28–33)." },
  { lvl: 30, type: "spell", title: "Divine Spirit y Shadow Protection", desc: "Divine Spirit ya es hechizo base." },
  { lvl: 30, type: "talent", title: "¿Respec a Disciplina por Penance?", desc: "Entre 30 y 37 las guías sugieren ir profundo en Disciplina para Penance, dejando 5 en Spirit Tap.", verify: true },
  { lvl: 32, type: "spell", title: "Shadow Word: Death", desc: "Remate instantáneo. Ojo con el rebote si el objetivo sobrevive." },
  { lvl: 35, type: "dungeon", title: "The Drowned City disponible", desc: "Costa de Tuercespina (35–40)." },
  { lvl: 40, type: "talent", title: "Respec a Sombras → Shadowform", desc: "El gran salto de poder. Si tenés dual spec, dejá Disciplina/Sagrado como segunda spec para curar mazmorras." },
  { lvl: 40, type: "system", title: "Dual spec + montura", desc: "Juntá oro desde antes: respec, dual spec y montura caen juntos.", verify: true },
  { lvl: 40, type: "dungeon", title: "Krol'dok Stronghold disponible", desc: "Riverglades (40–45)." },
  { lvl: 40, type: "gear", title: "Varitas de daño de Sombras", desc: "En Shadowform la varita pasa a ser secundaria; si usás, que sea de Sombras." },
  { lvl: 45, type: "talent", title: "Power Infusion (si sos Disc)", desc: "Capstone de Disciplina para la spec de grupo.", verify: true },
  { lvl: 48, type: "dungeon", title: "Alcaz Prison disponible", desc: "Isla de Alcaz, Marjal Revolcafango (48–53)." },
  { lvl: 55, type: "dungeon", title: "Blackmaw Hold disponible", desc: "Azshara (55–60)." },
  { lvl: 58, type: "dungeon", title: "Shaper's Terrace disponible", desc: "Cráter de Un'Goro (58–60)." },
  { lvl: 60, type: "system", title: "Nivel máximo", desc: "51 puntos de talento. Hora de armar el pre-raid." },
];

// Plan de leveo por tramos.
export const PLAN = [
  {
    from: 1, to: 9, spec: "Sin talentos", color: "holy",
    summary: "Smite + Shadow Word: Pain, y varita desde el 5.",
    rotation: ["Power Word: Shield (desde el 6) antes del pull", "Shadow Word: Pain", "Smite o Mind Blast (10)", "Rematar con la varita para ahorrar maná"],
    tips: ["Aprendé Sastrería + Encantamiento: te dan bolsas, ropa y varitas propias.", "No dejes de comprar rangos nuevos en el entrenador."],
  },
  {
    from: 10, to: 39, spec: "Disciplina / varita", color: "disc",
    summary: "Wand Specialization 5/5 → Spirit Tap 5/5 → profundizar Disciplina hacia Penance.",
    rotation: ["Power Word: Shield", "Shadow Word: Pain", "Mind Blast", "Varita hasta que muera", "Penance para ráfaga o cura de emergencia (cuando lo tengas)"],
    tips: [
      "Spirit Tap te devuelve maná al matar: encadená pulls sin sentarte.",
      "Si vas a hacer mucha mazmorra/grupo, podés demorar Spirit Tap y llegar antes a Penance.",
      "Las mazmorras nuevas (Hall of Thanes, Ruins of Lordaeron) dan muy buen equipo temprano.",
    ],
  },
  {
    from: 40, to: 60, spec: "Sombras (Shadowform)", color: "shadow",
    summary: "Respec profundo a Sombras. Blackout > Shadow Focus para levear.",
    rotation: ["Power Word: Shield", "Shadow Word: Pain", "Devouring Plague (si está libre)", "Mind Blast en CD", "Mind Flay de relleno", "Shadow Word: Death para rematar"],
    tips: [
      "Varios enemigos: Shadow Word: Pain en cada uno (Sombras no tiene AoE real).",
      "Dejá Disciplina/Sagrado en la dual spec para curar mazmorras: siempre hay grupo para healer.",
      "Antes de 40 algunas guías ofrecen Sombras desde el 10, pero la mayoría lo marca como no recomendado.",
    ],
  },
];

// Talentos: prioridades (los árboles de Forever cambiaron; para el detalle punto
// por punto usá la calculadora de Wowhead).
export const TALENTS = [
  {
    name: "Leveo Disciplina (10–39)", color: "disc",
    steps: [
      { pts: "5", name: "Wand Specialization", why: "Tu varita es tu daño principal hasta el 40." },
      { pts: "5", name: "Spirit Tap (Sombras)", why: "Regenera maná al matar: menos descanso." },
      { pts: "resto", name: "Disciplina hacia Penance (≈30–37)", why: "Penance = daño + curación de emergencia. Muy fuerte." },
      { pts: "45", name: "Power Infusion", why: "Capstone de Disciplina (si seguís Disc).", verify: true },
    ],
  },
  {
    name: "Leveo Sombras (40–60)", color: "shadow",
    steps: [
      { pts: "5", name: "Spirit Tap", why: "Sigue siendo la base de tu economía de maná." },
      { pts: "—", name: "Blackout (antes que Shadow Focus)", why: "Aturdimientos aleatorios > golpe extra para levear (Icy Veins)." },
      { pts: "—", name: "Mind Flay", why: "Tu relleno principal; también ralentiza." },
      { pts: "—", name: "Shadowform", why: "Objetivo de la respec del 40." },
      { pts: "resto", name: "Disciplina/Meditación", why: "Regeneración de maná y Penance según lo que quede." },
    ],
  },
  {
    name: "Healer de mazmorras", color: "holy",
    steps: [
      { pts: "—", name: "Disciplina", why: "Maxroll recomienda quedarse en Disc si levelás curando mazmorras." },
      { pts: "—", name: "Sagrado + Holy Nova", why: "Holy Nova es tu única fuente de AoE como Sagrado (Icy Veins)." },
    ],
  },
];

// Equipo por tramo. f: A / H / ambos. type: wand | weapon | armor | jewelry
export const GEAR = [
  { lvl: 5, name: "Lesser Magic Wand", type: "wand", f: "ambos", source: "Encantamiento (o subasta)", src: "method" },
  { lvl: 13, name: "Greater Magic Wand", type: "wand", f: "ambos", source: "Encantamiento (o subasta)", src: "method" },
  { lvl: 13, name: "Deepblaze", type: "wand", f: "A", source: "Misión de mazmorra 'Old Ironforge Incursion' (Hall of Thanes)", src: "mobaToleduck" },
  { lvl: 15, name: "Golemheart Stave", type: "weapon", f: "ambos", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Fang of Magmatus", type: "weapon", f: "ambos", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Robes of the Disgraced Thane", type: "armor", f: "ambos", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Ephemeral Choker", type: "jewelry", f: "ambos", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 15, name: "Aetherwisp Bracers", type: "armor", f: "ambos", source: "Hall of Thanes", src: "maxroll" },
  { lvl: 17, name: "Gnarled Necromancer's Staff", type: "weapon", f: "H", source: "Misión 'The Wrath of Rath'mael' (Ruins of Lordaeron). +26 poder con hechizos", src: "icyShadow" },
  { lvl: 17, name: "Slain Baron's Signet", type: "jewelry", f: "H", source: "Misión de Ruins of Lordaeron", src: "icyHoly" },
  { lvl: 17, name: "Leftover Abomination Skin", type: "armor", f: "ambos", source: "Ruins of Lordaeron", src: "maxroll" },
  { lvl: 17, name: "Tuskwrap Belt", type: "armor", f: "ambos", source: "Ruins of Lordaeron", src: "maxroll" },
  { lvl: 17, name: "Rotmender's Treads", type: "armor", f: "ambos", source: "Ruins of Lordaeron", src: "maxroll" },
  { lvl: 18, name: "Crescent Staff", type: "weapon", f: "H", source: "Wailing Caverns (misión)", src: "icyShadow" },
  { lvl: 18, name: "Cookie's Stirring Rod", type: "wand", f: "ambos", source: "The Deadmines", src: "mobaToleduck" },
  { lvl: 19, name: "Charred Wand", type: "wand", f: "ambos", source: "Ver guía de Method", src: "method", verify: true },
  { lvl: 22, name: "Robes of Arugal", type: "armor", f: "ambos", source: "Shadowfang Keep", src: "icyShadow" },
  { lvl: 24, name: "Cursed Eye of Paleth", type: "jewelry", f: "A", source: "Misión en los Humedales", src: "icyShadow" },
  { lvl: 27, name: "Wand of Mana Concentration", type: "wand", f: "ambos", source: "Arcanic Enigma – City of Dalaran", src: "method", verify: true },
  { lvl: 30, name: "Staff of the Shade", type: "weapon", f: "ambos", source: "Razorfen Kraul", src: "icyShadow" },
  { lvl: 30, name: "Wind Spirit Staff", type: "weapon", f: "ambos", source: "Ver guía", src: "timesaver", verify: true },
  { lvl: 30, name: "Filigreed Shadow Circlet", type: "armor", f: "ambos", source: "Ver guía", src: "timesaver", verify: true },
];
export const GEAR_NOTE = "Lista inicial armada con las guías publicadas en la semana de lanzamiento. Para 30–60 nivel por nivel, la mejor referencia hoy es la herramienta de Timesaver (enlazada abajo). Cada ítem abre la búsqueda en Wowhead Forever para ver estadísticas y de dónde cae.";

// Mazmorras: las 9 nuevas (tabla oficial de Blizzard) + clásicas útiles.
export const DUNGEONS = [
  { name: "Hall of Thanes", min: 13, max: 18, zone: "Dun Morogh (bajo Forjaz)", isNew: true },
  { name: "Ruins of Lordaeron", min: 15, max: 20, zone: "Claros de Tirisfal (sobre Entrañas)", isNew: true },
  { name: "Excavation Site", min: 24, max: 29, zone: "Humedales", isNew: true },
  { name: "City of Dalaran", min: 28, max: 33, zone: "Montañas de Alterac", isNew: true },
  { name: "The Drowned City", min: 35, max: 40, zone: "Costa de Tuercespina", isNew: true },
  { name: "Krol'dok Stronghold", min: 40, max: 45, zone: "Riverglades", isNew: true },
  { name: "Alcaz Prison", min: 48, max: 53, zone: "Isla de Alcaz, Marjal Revolcafango", isNew: true },
  { name: "Blackmaw Hold", min: 55, max: 60, zone: "Azshara", isNew: true },
  { name: "Shaper's Terrace", min: 58, max: 60, zone: "Cráter de Un'Goro", isNew: true },
  { name: "Ragefire Chasm", min: 13, max: 18, zone: "Orgrimmar", classic: true },
  { name: "Wailing Caverns", min: 17, max: 24, zone: "Los Baldíos", classic: true },
  { name: "The Deadmines", min: 17, max: 26, zone: "Páramos de Poniente", classic: true },
  { name: "Shadowfang Keep", min: 22, max: 30, zone: "Bosque de Argénteos", classic: true },
  { name: "Blackfathom Deeps", min: 24, max: 32, zone: "Vallefresno", classic: true },
  { name: "Razorfen Kraul", min: 30, max: 40, zone: "Los Baldíos", classic: true },
  { name: "Scarlet Monastery", min: 30, max: 45, zone: "Claros de Tirisfal", classic: true },
  { name: "Uldaman", min: 41, max: 51, zone: "Tierras Inhóspitas", classic: true },
  { name: "Zul'Farrak", min: 44, max: 54, zone: "Tanaris", classic: true },
  { name: "Maraudon", min: 46, max: 55, zone: "Desolace", classic: true },
  { name: "Sunken Temple", min: 50, max: 60, zone: "Pantano de las Penas", classic: true },
  { name: "Blackrock Depths", min: 52, max: 60, zone: "Montaña Roca Negra", classic: true },
];

export const PROFESSIONS = [
  { name: "Sastrería", why: "Bolsas de 6–8 casillas, ropa de tela para levear y equipo propio para Priest." },
  { name: "Encantamiento", why: "Fabricás tus propias varitas (Lesser al 5, Greater al 13) y desencantás lo que no usás." },
];

export const LINKS = [
  SOURCES.maxroll, SOURCES.icyShadow, SOURCES.icyDisc, SOURCES.icyHoly, SOURCES.method,
  SOURCES.mobaToleduck, SOURCES.mobaKargoz, SOURCES.timesaver, SOURCES.wowheadTalents,
  SOURCES.blizzDeepDive, SOURCES.blizzDungeons, SOURCES.blizzWatchRacials,
];

export const wowheadSearch = (name) => `https://www.wowhead.com/forever/search?q=${encodeURIComponent(name)}`;
