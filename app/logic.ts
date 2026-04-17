import {
  MEALS,
  STORE_MULTIPLIERS,
  HOUSEHOLD_MULTIPLIERS,
  NORWEGIAN_WEEKLY_BENCHMARK,
  DAY_NAMES,
  CATEGORY_ORDER,
  CATEGORY_DISPLAY,
  CATEGORY_EMOJI,
} from "./data";

export interface Config {
  store: string;
  householdSize: number;
  weeklyBudget: number;
}

export interface PlannedMeal {
  meal: (typeof MEALS)[number];
  finalPrice: number;
  dayOfWeek: number;
  dayName: string;
}

export interface MealPlan {
  meals: PlannedMeal[];
  weeklyTotal: number;
  perDayAverage: number;
  budgetDelta: number;
  benchmarkDelta: number;
  store: string;
  householdSize: number;
  weeklyBudget: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  totalQuantity: number;
  unit: string;
  category: string;
  estimatedPrice: number;
  checked: boolean;
}

export interface ShoppingGroup {
  category: string;
  displayName: string;
  emoji: string;
  items: ShoppingItem[];
}

export interface ShoppingList {
  groups: ShoppingGroup[];
  totalItems: number;
  checkedItems: number;
}

export interface SavingsTip {
  id: string;
  title: string;
  description: string;
  savingsKr: number;
  type: string;
}

export function formatKr(amount: number): string {
  return (
    new Intl.NumberFormat("nb-NO", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Math.round(amount)) + " kr"
  );
}

export async function generateMealPlan(config: Config): Promise<MealPlan> {
  const sm = STORE_MULTIPLIERS[config.store];
  const hm = HOUSEHOLD_MULTIPLIERS[config.householdSize];
  const bpp = config.weeklyBudget / config.householdSize;
  const tier = bpp < 250 ? "lav" : bpp < 450 ? "middels" : "høy";
  const preferred = MEALS.filter((m) => m.budgetTier === tier);
  const fallback = MEALS.filter((m) => m.budgetTier !== tier);
  const pool = [...preferred, ...fallback];
  const selected: (typeof MEALS)[number][] = [];
  const usedIds = new Set<string>();
  for (const meal of pool) {
    if (selected.length === 7) break;
    if (!usedIds.has(meal.id)) {
      selected.push(meal);
      usedIds.add(meal.id);
    }
  }

  let fetchedPrices: Record<string, number> = {};
  try {
    const res = await fetch("/api/prices");
    if (res.ok) {
      const data = await res.json();
      fetchedPrices = data.prices || {};
    } else {
      console.error("Failed to fetch prices:", res.status);
    }
  } catch (err) {
    console.error("Failed to fetch prices:", err);
  }

  const priceMap: Record<string, number> = {
    "kjøttdeig": fetchedPrices["kjottdeig"],
    "kyllingfilet": fetchedPrices["kyllingfilet"],
    "ris": fetchedPrices["ris"],
  };

  const plannedMeals: PlannedMeal[] = selected.map((meal, i) => {
    let realCost = 0;
    const ingredients = meal.ingredients.map(ing => {
      const fallbackPrice = ing.pricePerUnit;
      const key = ing.name.toLowerCase();
      const unitPrice = priceMap[key] || fallbackPrice;
      realCost += unitPrice * ing.quantity;
      return { ...ing, pricePerUnit: unitPrice };
    });

    const finalPrice = Math.round(realCost * sm * hm);
    console.log(`Final meal price using real data for ${meal.name}: ${finalPrice} kr`);

    return {
      meal: { ...meal, ingredients },
      finalPrice,
      dayOfWeek: i,
      dayName: DAY_NAMES[i],
    };
  });
  const weeklyTotal = plannedMeals.reduce((s, m) => s + m.finalPrice, 0);
  return {
    meals: plannedMeals,
    weeklyTotal,
    perDayAverage: Math.round(weeklyTotal / 7),
    budgetDelta: weeklyTotal - config.weeklyBudget,
    benchmarkDelta:
      weeklyTotal - NORWEGIAN_WEEKLY_BENCHMARK * config.householdSize,
    store: config.store,
    householdSize: config.householdSize,
    weeklyBudget: config.weeklyBudget,
  };
}

export function generateShoppingList(plan: MealPlan): ShoppingList {
  const hm = HOUSEHOLD_MULTIPLIERS[plan.householdSize];
  const itemMap = new Map<string, ShoppingItem>();
  for (const pm of plan.meals) {
    for (const ing of pm.meal.ingredients) {
      const key = ing.name.toLowerCase();
      if (itemMap.has(key)) {
        const e = itemMap.get(key)!;
        e.totalQuantity += ing.quantity * hm;
        e.estimatedPrice += ing.quantity * ing.pricePerUnit * hm;
      } else {
        itemMap.set(key, {
          id: key,
          name: ing.name,
          totalQuantity: Math.round(ing.quantity * hm * 10) / 10,
          unit: ing.unit,
          category: ing.category,
          estimatedPrice: Math.round(ing.quantity * ing.pricePerUnit * hm),
          checked: false,
        });
      }
    }
  }
  const groups: ShoppingGroup[] = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    displayName: CATEGORY_DISPLAY[cat],
    emoji: CATEGORY_EMOJI[cat],
    items: Array.from(itemMap.values()).filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);
  const allItems = groups.flatMap((g) => g.items);
  return {
    groups,
    totalItems: allItems.length,
    checkedItems: allItems.filter((i) => i.checked).length,
  };
}

export function generateSavingsTips(
  plan: MealPlan,
  config: Config
): SavingsTip[] {
  const tips: SavingsTip[] = [];
  if (config.store === "MENY") {
    const s = Math.round(
      plan.weeklyTotal * (1 - STORE_MULTIPLIERS.KIWI / STORE_MULTIPLIERS.MENY)
    );
    tips.push({
      id: "bytt-butikk-kiwi",
      title: "Handler du på KIWI i stedet?",
      description: `Samme plan på KIWI koster ca. ${s} kr mindre denne uken.`,
      savingsKr: s,
      type: "bytte-butikk",
    });
  } else if (config.store === "REMA1000") {
    const s = Math.round(plan.weeklyTotal * (1 - STORE_MULTIPLIERS.KIWI));
    tips.push({
      id: "bytt-butikk-kiwi",
      title: "Handler du på KIWI i stedet?",
      description: `Ukeplanen koster ca. ${s} kr mindre på KIWI.`,
      savingsKr: s,
      type: "bytte-butikk",
    });
  }
  const pm = plan.meals.find((m) => m.meal.budgetTier === "høy");
  if (pm) {
    const cm = MEALS.find(
      (m) => m.budgetTier === "lav" && m.category === pm.meal.category
    );
    if (cm) {
      const s = Math.round(
        (pm.meal.basePricePerPerson - cm.basePricePerPerson) *
          STORE_MULTIPLIERS[config.store] *
          HOUSEHOLD_MULTIPLIERS[config.householdSize]
      );
      if (s > 0)
        tips.push({
          id: "bytt-rett-" + pm.meal.id,
          title: `Bytt ${pm.meal.name}`,
          description: `Bytter du ${pm.dayName}s ${pm.meal.name} med ${cm.name}, sparer du ca. ${s} kr.`,
          savingsKr: s,
          type: "bytte-rett",
        });
    }
  }
  const hasPasta = plan.meals.some((m) =>
    m.meal.ingredients.some(
      (i) =>
        i.name.toLowerCase().includes("pasta") ||
        i.name.toLowerCase().includes("spaghetti")
    )
  );
  if (hasPasta)
    tips.push({
      id: "bulk-pasta",
      title: "Kjøp pasta i storpakke",
      description:
        "Pasta i 1 kg-pakke er ca. 40% billigere per 100 g enn småpakker.",
      savingsKr: 18,
      type: "bulk",
    });
  const hasFisk = plan.meals.some((m) => m.meal.category === "fisk");
  if (hasFisk)
    tips.push({
      id: "sesong-torsk",
      title: "Torsk er i sesong nå",
      description:
        "Fersk norsk torsk er rimeligere og bedre enn fryst om vinteren.",
      savingsKr: 25,
      type: "sesong",
    });
  return tips;
}

export async function buildAll(config: Config) {
  const plan = await generateMealPlan(config);
  return {
    plan,
    shoppingList: generateShoppingList(plan),
    savingsTips: generateSavingsTips(plan, config),
  };
}
