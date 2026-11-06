// Professions en WoW: Forever: Enchanting, Tailoring, Fishing, Cooking, First Aid.
// Revisado: 7 nov 2026. Forever cambió bastante respecto de Classic (recipes nuevas,
// Healing Potions pasaron a First Aid, recipes que se ponen grises 25–35 puntos antes),
// así que las guías todavía no coinciden en las rutas exactas. Por eso acá van los
// tramos en los que coinciden y los números de cada craft quedan en la guía
// interactiva de Wowhead (que calcula desde tu skill actual).
// `verify: true` = las fuentes no coinciden; confirmalo en el juego.

export const PROF_UPDATED = "2026-11-07";

export const RANKS = [
  { name: "Apprentice", max: 75, req: "Cualquier nivel" },
  { name: "Journeyman", max: 150, req: "Skill 50 · nivel 10" },
  { name: "Expert", max: 225, req: "Skill 125 · nivel 20" },
  { name: "Artisan", max: 300, req: "Skill 200 · nivel 35" },
];

// Cloth por nivel de personaje: lo usan Tailoring y First Aid.
// Cae de humanoids de tu nivel; abajo, zonas típicas con muchos humanoids.
export const CLOTH = [
  { name: "Linen Cloth", lvl: [5, 15], zones: ["Westfall (Defias)", "Elwynn Forest", "Durotar", "Tirisfal Glades"] },
  { name: "Wool Cloth", lvl: [15, 25], zones: ["Redridge Mountains", "Hillsbrad Foothills", "Silverpine Forest", "Stonetalon Mountains"] },
  { name: "Silk Cloth", lvl: [25, 40], zones: ["Arathi Highlands", "Stranglethorn Vale", "Desolace", "Alterac Mountains"] },
  { name: "Mageweave Cloth", lvl: [35, 50], zones: ["Stranglethorn Vale", "Badlands", "Swamp of Sorrows", "Tanaris", "Feralas"] },
  { name: "Runecloth", lvl: [48, 60], zones: ["Winterspring", "Felwood", "Eastern Plaguelands", "Western Plaguelands", "Burning Steppes"] },
];

// Lo que sale de desencantar gear verde (uncommon) según su nivel de item.
export const DISENCHANT = [
  { lvl: [5, 25], dust: "Strange Dust", essence: "Lesser/Greater Magic Essence", shard: "Small/Large Glimmering Shard" },
  { lvl: [25, 35], dust: "Soul Dust", essence: "Lesser/Greater Astral Essence", shard: "Small/Large Glowing Shard" },
  { lvl: [35, 45], dust: "Vision Dust", essence: "Lesser/Greater Mystic Essence", shard: "Small/Large Radiant Shard" },
  { lvl: [45, 55], dust: "Dream Dust", essence: "Lesser/Greater Nether Essence", shard: "Small/Large Brilliant Shard" },
  { lvl: [55, 60], dust: "Illusion Dust", essence: "Lesser/Greater Eternal Essence", shard: "Large Brilliant Shard" },
];

export const PROFESSIONS = [
  {
    id: "enchanting", name: "Enchanting", kind: "Primary", color: "shadow",
    pitch: "Hacés tus propios wands (tu daño principal hasta el 40) y desencantás todo el gear verde que no usás.",
    wowhead: "https://www.wowhead.com/forever/profession-leveling-guides/enchanting",
    milestones: [
      { skill: 1, text: "Runed Copper Rod: Copper Rod (vendor) + Mote of Magic. Guardalo: lo vas a necesitar." },
      { skill: 10, text: "Lesser Magic Wand: primer wand para tu Priest." , verify: true },
      { skill: 70, text: "Greater Magic Wand: ~50% más DPS. Alternativa para subir 70–130 (Conquest Capped).", verify: true },
      { skill: 100, text: "Runed Silver Rod (100–112 según la guía). Necesario hasta ~155.", verify: true },
      { skill: 166, text: "Runed Golden Rod." , verify: true },
      { skill: 200, text: "Runed Truesilver Rod (200–220) y Artisan (nivel 35)." , verify: true },
      { skill: 295, text: "Último tramo: Enchant Cloak – Superior Defense (~40 Illusion Dust)." , verify: true },
      { skill: 300, text: "Enchanting Certification: 1000 Merchant's Favor, title account-wide." },
    ],
    brackets: [
      { from: 1, to: 75, what: "Runed Copper Rod → enchants de bracer y chest de Stamina (Minor/Inferior).", mats: "Strange Dust, Lesser Magic Essence" },
      { from: 75, to: 150, what: "Bracers/chest de Health/Stamina, Greater Magic Wand, Runed Silver Rod.", mats: "Strange Dust, Greater Magic Essence, Lesser Astral Essence" },
      { from: 150, to: 225, what: "Runed Golden Rod, enchants de bracer/cloak con Soul Dust y Vision Dust.", mats: "Soul Dust, Vision Dust, Astral/Mystic Essence" },
      { from: 225, to: 300, what: "Runed Truesilver Rod, enchants con Dream Dust y al final Illusion Dust.", mats: "Dream Dust, Illusion Dust, Nether/Eternal Essence" },
    ],
    tips: [
      "Desencantá todo verde que no uses: con Tailoring, los crafts verdes se vuelven mats gratis.",
      "Forever agregó ~63 formulas nuevas: staves (Glimmering Staff), wands (Brilliant Wand), enchants de bracers/gloves, off-hands y class relics. Mirá cuáles te sirven para el Priest.",
      "Los Rods se guardan en la bag: cada uno es reagent de los enchants siguientes.",
      "Ir subiendo Enchanting al ritmo del nivel de tu gear: los dust que necesitás salen de items de tu nivel.",
    ],
  },
  {
    id: "tailoring", name: "Tailoring", kind: "Primary", color: "holy",
    pitch: "Bags, gear de cloth para levear y crafts verdes que después desencantás.",
    wowhead: "https://www.wowhead.com/forever/profession-leveling-guides/tailoring",
    milestones: [
      { skill: 1, text: "Bolt of Linen Cloth (2 Linen Cloth c/u) hasta ~45." },
      { skill: 50, text: "Journeyman (nivel 10)." },
      { skill: 125, text: "Expert (nivel 20)." },
      { skill: 200, text: "Artisan (nivel 35, Artisan trainer)." },
      { skill: 272, text: "Después de ~272 las recipes dejan de dar skill seguro: seguí la ruta de Wowhead para el final." , verify: true },
    ],
    brackets: [
      { from: 1, to: 75, what: "Bolt of Linen Cloth y después recipes de Linen (Linen Bag te sirve).", mats: "Linen Cloth" },
      { from: 75, to: 150, what: "Bolt of Woolen Cloth y recipes de Wool.", mats: "Wool Cloth" },
      { from: 150, to: 225, what: "Bolt of Silk Cloth y recipes de Silk; al final Mageweave.", mats: "Silk Cloth, Mageweave Cloth" },
      { from: 225, to: 300, what: "Bolt of Runecloth y recipes de Runecloth (el final varía según la guía).", mats: "Mageweave Cloth, Runecloth" },
    ],
    totals: "Estimado de la ruta completa: ~65 Linen, ~135 Wool, ~680 Silk, ~1,580 Mageweave y ~2,305 Runecloth (Conquest Capped).",
    tips: [
      "En Forever las recipes se ponen grises 25–35 puntos antes que en Classic: calculá más crafts por tramo.",
      "No necesitás gathering: el cloth cae de humanoids. Matá humanoids de tu nivel mientras questeás.",
      "Bags de 6–8 slots temprano = muchísimo menos viaje a vendor.",
      "El Auction House suele tener cloth barato los primeros días: compará antes de farmear.",
    ],
  },
  {
    id: "first-aid", name: "First Aid", kind: "Secondary", color: "disc",
    pitch: "Bandages para curarte sin gastar mana y, nuevo en Forever, las Healing Potions.",
    wowhead: "https://www.wowhead.com/forever/profession-leveling-guides/first-aid",
    milestones: [
      { skill: 1, text: "Linen Bandage." },
      { skill: 40, text: "Heavy Linen Bandage." },
      { skill: 80, text: "Wool Bandage." },
      { skill: 115, text: "Heavy Wool Bandage." },
      { skill: 125, text: "Expert First Aid book (algunas guías dicen 150). No llegues a 150 sin tenerlo.", verify: true },
      { skill: 150, text: "Silk Bandage." },
      { skill: 180, text: "Heavy Silk Bandage." },
      { skill: 210, text: "Mageweave Bandage." },
      { skill: 225, text: "Quest Triage (nivel 35): Doctor Gustaf VanHowzen en Theramore (Alliance) / Doctor Gregory Victor en Hammerfall (Horde). Salvá 15 pacientes antes de que mueran 6; los Critically Injured primero." },
      { skill: 225, text: "225–240: Superior Healing Potion (requiere manual)." , verify: true },
      { skill: 240, text: "Heavy Mageweave Bandage (240–260)." },
      { skill: 260, text: "Runecloth Bandage (260–275)." },
      { skill: 275, text: "Major Healing Potion (275–300, requiere manual)." , verify: true },
      { skill: 290, text: "Heavy Runecloth Bandage (trainer sin confirmar)." , verify: true },
    ],
    brackets: [
      { from: 1, to: 75, what: "Linen y Heavy Linen Bandage.", mats: "Linen Cloth" },
      { from: 75, to: 150, what: "Wool y Heavy Wool Bandage. Conseguí el Expert book.", mats: "Wool Cloth" },
      { from: 150, to: 225, what: "Silk, Heavy Silk y Mageweave Bandage. Después Triage.", mats: "Silk Cloth, Mageweave Cloth" },
      { from: 225, to: 300, what: "Healing Potions + Heavy Mageweave y Runecloth Bandage.", mats: "Mageweave Cloth, Runecloth, reagents de potions" },
    ],
    tips: [
      "Comparte cloth con Tailoring. First Aid usa poco: subilo primero en cada tier de cloth y mandá el resto a Tailoring.",
      "Forever agregó curatives para Poison, Disease y Bleed: útiles en dungeons.",
      "Bandage + Power Word: Shield = cero downtime entre pulls aunque estés sin mana.",
    ],
  },
  {
    id: "cooking", name: "Cooking", kind: "Secondary", color: "holy",
    pitch: "Muchos Well Fed de Forever dan +5% de XP por kill: es experiencia gratis mientras leveás.",
    wowhead: "https://www.wowhead.com/forever/profession-leveling-guides/cooking",
    milestones: [
      { skill: 1, text: "Charred Wolf Meat (hasta ~44)." },
      { skill: 140, text: "Campfire mejorado: entran 5 objetos (el básico entra 3)." },
      { skill: 220, text: "Campfire de 10 objetos." },
      { skill: 275, text: "Mightfish Steak (275–300; se vende en el hub de cada facción)." , verify: true },
      { skill: 300, text: "Blueprint del Iron Oven: muchas recipes avanzadas lo necesitan." },
    ],
    brackets: [
      { from: 1, to: 75, what: "Charred Wolf Meat, después pescado chico (Brilliant Smallfish / Longjaw Mud Snapper).", mats: "Wolf Meat, pescado de tu Fishing" },
      { from: 75, to: 150, what: "Bristle Whisker Catfish, Lean Wolf Steak.", mats: "Catfish, Meat, Mild Spices" },
      { from: 150, to: 225, what: "Mithril Headed Trout y recipes de mid-level.", mats: "Pescado de Fishing, Hot Spices" },
      { from: 225, to: 300, what: "Filet of Redgill, Nightfin Soup, Poached Sunscale Salmon, Mightfish Steak.", mats: "Redgill, Nightfin, Sunscale Salmon, Mightfish" },
    ],
    tips: [
      "Muchas recipes no las enseña el trainer: comprá el recipe (vendor/drop/quest) antes de juntar ingredientes.",
      "Cociná lo que pescás: Fishing + Cooking se suben juntas casi sin gastar oro.",
      "Spices y Spring Water se compran en el Cooking Supplies vendor.",
      "Comé siempre food con +5% XP mientras questeás.",
    ],
  },
  {
    id: "fishing", name: "Fishing", kind: "Secondary", color: "disc",
    pitch: "Alimenta tu Cooking y tiene recipes nuevas de campsite en Forever.",
    wowhead: "https://www.wowhead.com/forever/profession-leveling-guides/fishing",
    milestones: [
      { skill: 20, text: "Recipe de campsite: Fish Bowl." },
      { skill: 50, text: "Journeyman (nivel 10)." },
      { skill: 125, text: "Expert book (algunas guías dicen 150).", verify: true },
      { skill: 140, text: "Recipe de campsite: Fishing Rack." },
      { skill: 225, text: "Artisan: quest 'Nat Pagle, Angler Extreme' en Dustwallow Marsh (nivel 35)." },
      { skill: 300, text: "Recipe de campsite: Fishing Hut." },
    ],
    brackets: [
      { from: 1, to: 75, what: "Zonas de inicio y capitales.", mats: "Shiny Bauble (lure)", zones: "Elwynn Forest, Dun Morogh, Teldrassil / Durotar, Mulgore, Tirisfal Glades" },
      { from: 75, to: 150, what: "Capitales y zonas 10–25.", mats: "Nightcrawlers", zones: "Stormwind, Orgrimmar, The Barrens, Darkshore, Loch Modan, Silverpine Forest, Westfall" },
      { from: 150, to: 225, what: "Pantanos y jungla.", mats: "Bright Baubles", zones: "Dustwallow Marsh, Stranglethorn Vale" },
      { from: 225, to: 300, what: "Endgame: necesitás skill efectivo +300 en algunas zonas (lures + bonus).", mats: "Aquadynamic Fish Attractor / Bright Baubles", zones: "Tanaris, Feralas, The Hinterlands, Un'Goro Crater, Felwood, Western Plaguelands" },
    ],
    tips: [
      "Siempre con lure puesto: sube el skill efectivo y pescás más rápido.",
      "Legacy perk Luremaster: 25% de chance de pescar un fish extra con lure activo.",
      "Subilo en ratos muertos (esperando grupo, al volver a la capital).",
    ],
  },
];

export const PROF_SOURCES = [
  { name: "Wowhead – Profession Leveling Guides (Forever)", url: "https://www.wowhead.com/forever/profession-leveling-guides" },
  { name: "Zockify – Professions changes (Forever)", url: "https://www.zockify.com/forever/professions/" },
  { name: "Conquest Capped – Professions (Forever)", url: "https://conquestcapped.com/guides/wow-forever/wow-forever-professions/" },
  { name: "Icy Veins – Enchanting Leveling (Forever)", url: "https://www.icy-veins.com/wow-forever/enchanting-leveling-guide" },
  { name: "Method – Tailoring (Forever)", url: "https://www.method.gg/wow-forever/tailoring-in-wow-forever-1-300-leveling-guide-and-trainers" },
];
