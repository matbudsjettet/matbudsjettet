export const STORE_MULTIPLIERS: Record<string, number> = {
  KIWI: 0.97,
  REMA1000: 1.0,
  MENY: 1.12,
};

export const HOUSEHOLD_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.9,
  3: 2.7,
  4: 3.4,
};

export const NORWEGIAN_WEEKLY_BENCHMARK = 1200;

export const DAY_NAMES = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];

export const CATEGORY_DISPLAY: Record<string, string> = {
  "kjøtt-og-fisk": "Kjøtt og fisk",
  "meieri-og-egg": "Meieri og egg",
  "frukt-og-grønt": "Frukt og grønt",
  tørrvarer: "Tørrvarer",
  "sauser-og-krydder": "Sauser og krydder",
  diverse: "Diverse",
};

export const CATEGORY_ORDER = [
  "kjøtt-og-fisk",
  "meieri-og-egg",
  "frukt-og-grønt",
  "tørrvarer",
  "sauser-og-krydder",
  "diverse",
];

export const CATEGORY_EMOJI: Record<string, string> = {
  "kjøtt-og-fisk": "🥩",
  "meieri-og-egg": "🥛",
  "frukt-og-grønt": "🥦",
  tørrvarer: "🌾",
  "sauser-og-krydder": "🧂",
  diverse: "🛒",
};

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  pricePerUnit: number;
}

export interface Meal {
  id: string;
  name: string;
  basePricePerPerson: number;
  category: string;
  budgetTier: "lav" | "middels" | "høy";
  tags: string[];
  cookTimeMinutes: number;
  difficulty: "enkel" | "middels" | "vanskelig";
  ingredients: Ingredient[];
}

export const MEALS: Meal[] = [
  {
    id: "pasta-bolognese",
    name: "Pasta bolognese",
    basePricePerPerson: 38,
    category: "kjøtt",
    budgetTier: "lav",
    tags: ["Budsjett", "Familie"],
    cookTimeMinutes: 30,
    difficulty: "enkel",
    ingredients: [
      { name: "Kjøttdeig", quantity: 150, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.089 },
      { name: "Spaghetti", quantity: 100, unit: "g", category: "tørrvarer", pricePerUnit: 0.032 },
      { name: "Hermetiske tomater", quantity: 0.5, unit: "boks", category: "sauser-og-krydder", pricePerUnit: 14 },
      { name: "Løk", quantity: 1, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 4 },
      { name: "Hvitløk", quantity: 2, unit: "fedd", category: "sauser-og-krydder", pricePerUnit: 1 },
    ],
  },
  {
    id: "bønnesuppe",
    name: "Bønnesuppe med brød",
    basePricePerPerson: 28,
    category: "vegetar",
    budgetTier: "lav",
    tags: ["Budsjett", "Vegetar"],
    cookTimeMinutes: 25,
    difficulty: "enkel",
    ingredients: [
      { name: "Hermetiske bønner", quantity: 1, unit: "boks", category: "tørrvarer", pricePerUnit: 18 },
      { name: "Gulrot", quantity: 2, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 3 },
      { name: "Selleri", quantity: 2, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 4 },
      { name: "Grovbrød", quantity: 0.5, unit: "stk", category: "diverse", pricePerUnit: 35 },
      { name: "Grønnsakkraft", quantity: 1, unit: "l", category: "sauser-og-krydder", pricePerUnit: 12 },
    ],
  },
  {
    id: "eggerøre-potet",
    name: "Eggerøre med potet og løk",
    basePricePerPerson: 25,
    category: "vegetar",
    budgetTier: "lav",
    tags: ["Budsjett", "Vegetar"],
    cookTimeMinutes: 20,
    difficulty: "enkel",
    ingredients: [
      { name: "Egg", quantity: 3, unit: "stk", category: "meieri-og-egg", pricePerUnit: 4 },
      { name: "Potet", quantity: 300, unit: "g", category: "frukt-og-grønt", pricePerUnit: 0.025 },
      { name: "Løk", quantity: 1, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 4 },
      { name: "Smør", quantity: 20, unit: "g", category: "meieri-og-egg", pricePerUnit: 0.18 },
    ],
  },
  {
    id: "linsesuppe",
    name: "Linsesuppe",
    basePricePerPerson: 22,
    category: "vegetar",
    budgetTier: "lav",
    tags: ["Budsjett", "Vegetar", "Protein"],
    cookTimeMinutes: 30,
    difficulty: "enkel",
    ingredients: [
      { name: "Røde linser", quantity: 100, unit: "g", category: "tørrvarer", pricePerUnit: 0.05 },
      { name: "Gulrot", quantity: 2, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 3 },
      { name: "Løk", quantity: 1, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 4 },
      { name: "Kokosmelk", quantity: 0.5, unit: "boks", category: "sauser-og-krydder", pricePerUnit: 16 },
      { name: "Karrypulver", quantity: 1, unit: "ts", category: "sauser-og-krydder", pricePerUnit: 1 },
    ],
  },
  {
    id: "kylling-ris",
    name: "Kyllingfilet med ris og salat",
    basePricePerPerson: 58,
    category: "fjærkre",
    budgetTier: "middels",
    tags: ["Protein", "Familie"],
    cookTimeMinutes: 35,
    difficulty: "enkel",
    ingredients: [
      { name: "Kyllingfilet", quantity: 200, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.19 },
      { name: "Ris", quantity: 100, unit: "g", category: "tørrvarer", pricePerUnit: 0.028 },
      { name: "Salat", quantity: 0.5, unit: "pose", category: "frukt-og-grønt", pricePerUnit: 25 },
      { name: "Tomat", quantity: 2, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 5 },
      { name: "Agurk", quantity: 0.5, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 8 },
    ],
  },
  {
    id: "laksepasta",
    name: "Laksepasta med fløtesaus",
    basePricePerPerson: 72,
    category: "fisk",
    budgetTier: "middels",
    tags: ["Protein", "Familie"],
    cookTimeMinutes: 25,
    difficulty: "enkel",
    ingredients: [
      { name: "Laksefilet", quantity: 200, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.25 },
      { name: "Pasta", quantity: 100, unit: "g", category: "tørrvarer", pricePerUnit: 0.03 },
      { name: "Fløte", quantity: 1, unit: "dl", category: "meieri-og-egg", pricePerUnit: 8 },
      { name: "Parmesan", quantity: 30, unit: "g", category: "meieri-og-egg", pricePerUnit: 0.38 },
      { name: "Sitron", quantity: 0.5, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 5 },
    ],
  },
  {
    id: "taco-fredag",
    name: "Taco med kjøttdeig",
    basePricePerPerson: 62,
    category: "kjøtt",
    budgetTier: "middels",
    tags: ["Familie", "Budsjett"],
    cookTimeMinutes: 30,
    difficulty: "enkel",
    ingredients: [
      { name: "Kjøttdeig", quantity: 200, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.089 },
      { name: "Tacoskjell", quantity: 3, unit: "stk", category: "tørrvarer", pricePerUnit: 4 },
      { name: "Rømme", quantity: 0.5, unit: "dl", category: "meieri-og-egg", pricePerUnit: 10 },
      { name: "Salsa", quantity: 0.5, unit: "glass", category: "sauser-og-krydder", pricePerUnit: 20 },
      { name: "Ost (revet)", quantity: 50, unit: "g", category: "meieri-og-egg", pricePerUnit: 0.24 },
      { name: "Isbergsalat", quantity: 0.25, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 18 },
    ],
  },
  {
    id: "torsk-potet",
    name: "Torsk med poteter og gulrøtter",
    basePricePerPerson: 68,
    category: "fisk",
    budgetTier: "middels",
    tags: ["Protein", "Familie"],
    cookTimeMinutes: 35,
    difficulty: "middels",
    ingredients: [
      { name: "Torsk (filet)", quantity: 200, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.22 },
      { name: "Potet", quantity: 300, unit: "g", category: "frukt-og-grønt", pricePerUnit: 0.025 },
      { name: "Gulrot", quantity: 2, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 3 },
      { name: "Smør", quantity: 30, unit: "g", category: "meieri-og-egg", pricePerUnit: 0.18 },
      { name: "Sitron", quantity: 0.5, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 5 },
    ],
  },
  {
    id: "kyllingsuppe",
    name: "Kyllingsuppe med nudler",
    basePricePerPerson: 52,
    category: "fjærkre",
    budgetTier: "middels",
    tags: ["Familie", "Budsjett"],
    cookTimeMinutes: 40,
    difficulty: "enkel",
    ingredients: [
      { name: "Kyllinglår", quantity: 250, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.12 },
      { name: "Nudler", quantity: 80, unit: "g", category: "tørrvarer", pricePerUnit: 0.04 },
      { name: "Gulrot", quantity: 2, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 3 },
      { name: "Purre", quantity: 1, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 8 },
      { name: "Kyllingkraft", quantity: 1, unit: "l", category: "sauser-og-krydder", pricePerUnit: 15 },
    ],
  },
  {
    id: "laks-asparges",
    name: "Laks med asparges og hollandaise",
    basePricePerPerson: 110,
    category: "fisk",
    budgetTier: "høy",
    tags: ["Premium", "Protein"],
    cookTimeMinutes: 30,
    difficulty: "middels",
    ingredients: [
      { name: "Laksefilet (fersk)", quantity: 250, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.28 },
      { name: "Asparges", quantity: 200, unit: "g", category: "frukt-og-grønt", pricePerUnit: 0.22 },
      { name: "Hollandaisesaus", quantity: 1, unit: "pose", category: "sauser-og-krydder", pricePerUnit: 32 },
      { name: "Sitron", quantity: 1, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 5 },
      { name: "Potet (baby)", quantity: 200, unit: "g", category: "frukt-og-grønt", pricePerUnit: 0.06 },
    ],
  },
  {
    id: "indrefilet",
    name: "Indrefilet med ovnspoteter",
    basePricePerPerson: 145,
    category: "kjøtt",
    budgetTier: "høy",
    tags: ["Premium", "Protein"],
    cookTimeMinutes: 45,
    difficulty: "middels",
    ingredients: [
      { name: "Indrefilet (storfe)", quantity: 200, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.52 },
      { name: "Potet", quantity: 300, unit: "g", category: "frukt-og-grønt", pricePerUnit: 0.025 },
      { name: "Rosmarinkvist", quantity: 2, unit: "stk", category: "sauser-og-krydder", pricePerUnit: 3 },
      { name: "Smør", quantity: 40, unit: "g", category: "meieri-og-egg", pricePerUnit: 0.18 },
      { name: "Hvitløk", quantity: 3, unit: "fedd", category: "sauser-og-krydder", pricePerUnit: 1 },
    ],
  },
  {
    id: "reker-lompe",
    name: "Reker med lompe og majones",
    basePricePerPerson: 135,
    category: "fisk",
    budgetTier: "høy",
    tags: ["Premium", "Familie"],
    cookTimeMinutes: 10,
    difficulty: "enkel",
    ingredients: [
      { name: "Reker (fersk/tint)", quantity: 300, unit: "g", category: "kjøtt-og-fisk", pricePerUnit: 0.29 },
      { name: "Lompe", quantity: 3, unit: "stk", category: "tørrvarer", pricePerUnit: 5 },
      { name: "Majones", quantity: 2, unit: "ss", category: "sauser-og-krydder", pricePerUnit: 3 },
      { name: "Sitron", quantity: 1, unit: "stk", category: "frukt-og-grønt", pricePerUnit: 5 },
      { name: "Dill", quantity: 1, unit: "kvist", category: "sauser-og-krydder", pricePerUnit: 4 },
    ],
  },
];
