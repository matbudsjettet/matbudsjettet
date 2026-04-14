"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Store = "KIWI" | "REMA 1000" | "MENY";
type Tag = "billig" | "protein" | "vegetar" | "premium";
type Tab = "ukeplan" | "handleliste" | "spartips";

interface Meal {
  name: string;
  price: number;
  tag: Tag;
  ingredients: { name: string; category: ShoppingCategory }[];
  emoji: string;
}

type ShoppingCategory = "Kjøtt & fisk" | "Meieri & egg" | "Grønnsaker & frukt" | "Tørrvarer & hermetikk" | "Annet";

interface DayPlan {
  day: string;
  dayShort: string;
  meal: Meal;
}

// ─── Meal Database ────────────────────────────────────────────────────────────

const MEAL_DB: Meal[] = [
  // Billig (42–70 kr)
  {
    name: "Pasta med tomatsaus",
    price: 55,
    tag: "billig",
    emoji: "🍝",
    ingredients: [
      { name: "Pasta 500g", category: "Tørrvarer & hermetikk" },
      { name: "Hermetiske tomater 2 boks", category: "Tørrvarer & hermetikk" },
      { name: "Hvitløk 1 hode", category: "Grønnsaker & frukt" },
      { name: "Løk 2 stk", category: "Grønnsaker & frukt" },
      { name: "Olivenolje", category: "Annet" },
    ],
  },
  {
    name: "Linsesuppe",
    price: 48,
    tag: "billig",
    emoji: "🥣",
    ingredients: [
      { name: "Røde linser 400g", category: "Tørrvarer & hermetikk" },
      { name: "Grønnsaksbuljong 2 terning", category: "Tørrvarer & hermetikk" },
      { name: "Gurkemeie", category: "Annet" },
      { name: "Ingefær fersk", category: "Grønnsaker & frukt" },
      { name: "Løk 2 stk", category: "Grønnsaker & frukt" },
    ],
  },
  {
    name: "Eggerøre med grovbrød",
    price: 42,
    tag: "billig",
    emoji: "🍳",
    ingredients: [
      { name: "Egg 6 stk", category: "Meieri & egg" },
      { name: "Smør 50g", category: "Meieri & egg" },
      { name: "Melk 1dl", category: "Meieri & egg" },
      { name: "Grovbrød 1 stk", category: "Tørrvarer & hermetikk" },
      { name: "Gressløk", category: "Grønnsaker & frukt" },
    ],
  },
  {
    name: "Kikerter og ris",
    price: 52,
    tag: "billig",
    emoji: "🫘",
    ingredients: [
      { name: "Kikerter 400g", category: "Tørrvarer & hermetikk" },
      { name: "Ris 250g", category: "Tørrvarer & hermetikk" },
      { name: "Cherrytomater 250g", category: "Grønnsaker & frukt" },
      { name: "Paprika 1 stk", category: "Grønnsaker & frukt" },
      { name: "Krydder (cumin, paprika)", category: "Annet" },
    ],
  },
  {
    name: "Potetsuppe med bacon",
    price: 62,
    tag: "billig",
    emoji: "🥔",
    ingredients: [
      { name: "Poteter 600g", category: "Grønnsaker & frukt" },
      { name: "Purre 1 stk", category: "Grønnsaker & frukt" },
      { name: "Buljong 2 terning", category: "Tørrvarer & hermetikk" },
      { name: "Fløte 1dl", category: "Meieri & egg" },
      { name: "Bacon 100g", category: "Kjøtt & fisk" },
    ],
  },
  {
    name: "Grønnkålsuppe",
    price: 65,
    tag: "vegetar",
    emoji: "🥗",
    ingredients: [
      { name: "Grønnkål 200g", category: "Grønnsaker & frukt" },
      { name: "Poteter 3 stk", category: "Grønnsaker & frukt" },
      { name: "Grønnsaksbuljong", category: "Tørrvarer & hermetikk" },
      { name: "Hvitløk 1 hode", category: "Grønnsaker & frukt" },
      { name: "Fløte 1dl", category: "Meieri & egg" },
    ],
  },

  // Mid-range (85–155 kr)
  {
    name: "Kyllinggryte med kokosmjølk",
    price: 118,
    tag: "protein",
    emoji: "🍗",
    ingredients: [
      { name: "Kyllingfilet 400g", category: "Kjøtt & fisk" },
      { name: "Kokosmjølk 400ml", category: "Tørrvarer & hermetikk" },
      { name: "Paprika 2 stk", category: "Grønnsaker & frukt" },
      { name: "Løk 1 stk", category: "Grønnsaker & frukt" },
      { name: "Ris 250g", category: "Tørrvarer & hermetikk" },
    ],
  },
  {
    name: "Tacos med kjøttdeig",
    price: 102,
    tag: "protein",
    emoji: "🌮",
    ingredients: [
      { name: "Kjøttdeig 400g", category: "Kjøtt & fisk" },
      { name: "Hvete-tortilla 6 stk", category: "Tørrvarer & hermetikk" },
      { name: "Rømme 200ml", category: "Meieri & egg" },
      { name: "Salsa 1 glass", category: "Tørrvarer & hermetikk" },
      { name: "Revet ost 150g", category: "Meieri & egg" },
    ],
  },
  {
    name: "Omelett med grønnsaker",
    price: 88,
    tag: "vegetar",
    emoji: "🥚",
    ingredients: [
      { name: "Egg 6 stk", category: "Meieri & egg" },
      { name: "Paprika 2 stk", category: "Grønnsaker & frukt" },
      { name: "Champignon 200g", category: "Grønnsaker & frukt" },
      { name: "Spinat 100g", category: "Grønnsaker & frukt" },
      { name: "Fetaost 100g", category: "Meieri & egg" },
    ],
  },
  {
    name: "Spaghetti Bolognese",
    price: 124,
    tag: "protein",
    emoji: "🍝",
    ingredients: [
      { name: "Kjøttdeig 500g", category: "Kjøtt & fisk" },
      { name: "Spaghetti 500g", category: "Tørrvarer & hermetikk" },
      { name: "Tomatsaus 500ml", category: "Tørrvarer & hermetikk" },
      { name: "Rødvin 1dl", category: "Annet" },
      { name: "Parmesan 50g", category: "Meieri & egg" },
    ],
  },
  {
    name: "Vegetarburger",
    price: 132,
    tag: "vegetar",
    emoji: "🍔",
    ingredients: [
      { name: "Vegetarburgere 4 stk", category: "Kjøtt & fisk" },
      { name: "Hamburgerbrød 4 stk", category: "Tørrvarer & hermetikk" },
      { name: "Salat 1 pose", category: "Grønnsaker & frukt" },
      { name: "Tomat 2 stk", category: "Grønnsaker & frukt" },
      { name: "Stekte løk (ferdig)", category: "Annet" },
    ],
  },
  {
    name: "Kyllingwok med risnudler",
    price: 138,
    tag: "protein",
    emoji: "🥡",
    ingredients: [
      { name: "Kyllingfilet 350g", category: "Kjøtt & fisk" },
      { name: "Wokgrønnsaker 400g", category: "Grønnsaker & frukt" },
      { name: "Soyasaus 3 ss", category: "Annet" },
      { name: "Sesamolje 1 ss", category: "Annet" },
      { name: "Risnudler 200g", category: "Tørrvarer & hermetikk" },
    ],
  },
  {
    name: "Fisketaco med torsk",
    price: 142,
    tag: "protein",
    emoji: "🌮",
    ingredients: [
      { name: "Torsk 400g", category: "Kjøtt & fisk" },
      { name: "Mais-tortilla 8 stk", category: "Tørrvarer & hermetikk" },
      { name: "Hodekål ¼ stk", category: "Grønnsaker & frukt" },
      { name: "Lime 2 stk", category: "Grønnsaker & frukt" },
      { name: "Rømme 200ml", category: "Meieri & egg" },
    ],
  },
  {
    name: "Blomkålcurry",
    price: 95,
    tag: "vegetar",
    emoji: "🥦",
    ingredients: [
      { name: "Blomkål 1 stk", category: "Grønnsaker & frukt" },
      { name: "Kikerter 400g", category: "Tørrvarer & hermetikk" },
      { name: "Kokosmjølk 400ml", category: "Tørrvarer & hermetikk" },
      { name: "Currypasta 2 ss", category: "Annet" },
      { name: "Ris 200g", category: "Tørrvarer & hermetikk" },
    ],
  },
  {
    name: "Laks med søtpotet",
    price: 148,
    tag: "protein",
    emoji: "🐟",
    ingredients: [
      { name: "Laksefilet 400g", category: "Kjøtt & fisk" },
      { name: "Søtpoteter 2 stk", category: "Grønnsaker & frukt" },
      { name: "Sitron 1 stk", category: "Grønnsaker & frukt" },
      { name: "Dill fersk", category: "Grønnsaker & frukt" },
      { name: "Smør 50g", category: "Meieri & egg" },
    ],
  },

  // Premium (160–260 kr)
  {
    name: "Indrefilet med asparges",
    price: 248,
    tag: "premium",
    emoji: "🥩",
    ingredients: [
      { name: "Indrefilet 400g", category: "Kjøtt & fisk" },
      { name: "Asparges 1 bunt", category: "Grønnsaker & frukt" },
      { name: "Smørblomst", category: "Meieri & egg" },
      { name: "Rødvinsaus (ferdig)", category: "Annet" },
      { name: "Poteter 500g", category: "Grønnsaker & frukt" },
    ],
  },
  {
    name: "Lammekoteletter",
    price: 218,
    tag: "premium",
    emoji: "🍖",
    ingredients: [
      { name: "Lammekoteletter 4 stk", category: "Kjøtt & fisk" },
      { name: "Rosmarin fersk", category: "Grønnsaker & frukt" },
      { name: "Hvitløk 1 hode", category: "Grønnsaker & frukt" },
      { name: "Rødvin 1dl", category: "Annet" },
      { name: "Ovnspoteter 600g", category: "Grønnsaker & frukt" },
    ],
  },
  {
    name: "Laks med hollandaise",
    price: 178,
    tag: "premium",
    emoji: "🐟",
    ingredients: [
      { name: "Laksefilet 500g", category: "Kjøtt & fisk" },
      { name: "Hollandaise (ferdig)", category: "Annet" },
      { name: "Brokkoli 1 stk", category: "Grønnsaker & frukt" },
      { name: "Dill fersk", category: "Grønnsaker & frukt" },
      { name: "Sitron 1 stk", category: "Grønnsaker & frukt" },
    ],
  },
  {
    name: "Scampi med linguine",
    price: 188,
    tag: "premium",
    emoji: "🍤",
    ingredients: [
      { name: "Scampi 300g", category: "Kjøtt & fisk" },
      { name: "Linguine 400g", category: "Tørrvarer & hermetikk" },
      { name: "Hvitvin 1dl", category: "Annet" },
      { name: "Hvitløk 1 hode", category: "Grønnsaker & frukt" },
      { name: "Persille fersk", category: "Grønnsaker & frukt" },
    ],
  },
  {
    name: "Gresskar-risotto",
    price: 165,
    tag: "vegetar",
    emoji: "🎃",
    ingredients: [
      { name: "Arborio-ris 300g", category: "Tørrvarer & hermetikk" },
      { name: "Gresskar 400g", category: "Grønnsaker & frukt" },
      { name: "Parmesan 80g", category: "Meieri & egg" },
      { name: "Hvitvin 1dl", category: "Annet" },
      { name: "Grønnsaksbuljong 1L", category: "Tørrvarer & hermetikk" },
    ],
  },
  {
    name: "Andebryst med appelsinglasur",
    price: 235,
    tag: "premium",
    emoji: "🦆",
    ingredients: [
      { name: "Andebryst 2 stk", category: "Kjøtt & fisk" },
      { name: "Appelsin 2 stk", category: "Grønnsaker & frukt" },
      { name: "Sellerirot 1 stk", category: "Grønnsaker & frukt" },
      { name: "Timian fersk", category: "Grønnsaker & frukt" },
      { name: "Valnøtter 50g", category: "Tørrvarer & hermetikk" },
    ],
  },
];

// ─── Store Multipliers ────────────────────────────────────────────────────────

const STORE_MULTIPLIER: Record<Store, number> = {
  KIWI: 0.88,
  "REMA 1000": 1.0,
  MENY: 1.22,
};

const STORE_COLORS: Record<Store, string> = {
  KIWI: "#e63c3c",
  "REMA 1000": "#e8a000",
  MENY: "#2563eb",
};

// ─── Plan Generation (strict budget algorithm) ────────────────────────────────

const DAYS = [
  { day: "Mandag", dayShort: "Man" },
  { day: "Tirsdag", dayShort: "Tir" },
  { day: "Onsdag", dayShort: "Ons" },
  { day: "Torsdag", dayShort: "Tor" },
  { day: "Fredag", dayShort: "Fre" },
  { day: "Lørdag", dayShort: "Lør" },
  { day: "Søndag", dayShort: "Søn" },
];

function generatePlan(budget: number, store: Store): DayPlan[] {
  const multiplier = STORE_MULTIPLIER[store];

  // Convert all meals to store-adjusted prices
  const adjustedMeals = MEAL_DB.map((meal) => ({
    meal,
    adjustedPrice: Math.round(meal.price * multiplier),
  }));

  // Budget tiers: determine the "quality level" of this budget
  // Low: ≤500, Mid: 500–900, High: 900–1200, Premium: >1200
  const budgetTier =
    budget <= 500 ? "low" : budget <= 900 ? "mid" : budget <= 1200 ? "high" : "premium";

  // Tag priority sequences by tier – ensures variety and realistic combinations
  const tagSequences: Record<string, Tag[]> = {
    low: ["billig", "vegetar", "billig", "billig", "vegetar", "billig", "protein"],
    mid: ["protein", "vegetar", "billig", "protein", "vegetar", "protein", "billig"],
    high: ["protein", "vegetar", "protein", "premium", "protein", "vegetar", "protein"],
    premium: ["premium", "protein", "vegetar", "premium", "protein", "premium", "vegetar"],
  };

  const tagSeq = tagSequences[budgetTier];

  // Greedy approach: build plan meal by meal, tracking remaining budget
  // Add small random jitter so "Ny plan" gives variation
  const jitter = () => (Math.random() - 0.5) * 0.15; // ±7.5%

  const usedIndices = new Set<number>();
  const selected: DayPlan[] = [];

  let remainingBudget = budget;

  for (let i = 0; i < 7; i++) {
    const daysLeft = 7 - i;
    const targetForThisDay = remainingBudget / daysLeft;
    const preferredTag = tagSeq[i];

    // Find candidates: prefer matching tag, price within budget and ±40% of daily target
    const candidates = adjustedMeals
      .map((m, idx) => ({ ...m, idx }))
      .filter(({ idx, adjustedPrice }) => {
        if (usedIndices.has(idx)) return false;
        if (adjustedPrice > remainingBudget) return false; // hard cap: never exceed remaining budget
        const ratio = adjustedPrice / targetForThisDay;
        return ratio > 0.4 && ratio < 1.7;
      });

    // Score candidates: reward tag match + price closeness (with jitter for variety)
    const scored = candidates.map(({ meal, adjustedPrice, idx }) => {
      const tagBonus = meal.tag === preferredTag ? 0 : 1;
      const priceScore = Math.abs(adjustedPrice / targetForThisDay - 1);
      return { meal, adjustedPrice, idx, score: tagBonus * 0.4 + priceScore + jitter() };
    });

    scored.sort((a, b) => a.score - b.score);

    // Pick best candidate
    let pick = scored[0];

    // Absolute fallback: closest price, any tag, not used
    if (!pick) {
      const fallback = adjustedMeals
        .map((m, idx) => ({ ...m, idx }))
        .filter(({ idx, adjustedPrice }) => !usedIndices.has(idx) && adjustedPrice <= remainingBudget)
        .sort((a, b) =>
          Math.abs(a.adjustedPrice - targetForThisDay) - Math.abs(b.adjustedPrice - targetForThisDay)
        )[0];
      if (!fallback) break;
      pick = { ...fallback, score: 0 };
    }

    usedIndices.add(pick.idx);
    remainingBudget -= pick.adjustedPrice;

    selected.push({
      ...DAYS[i],
      meal: { ...pick.meal, price: pick.adjustedPrice },
    });
  }

  // Final validation pass: if total is > 5% over budget, swap priciest non-locked meal
  // with a cheaper one to bring it within range
  let total = selected.reduce((s, d) => s + d.meal.price, 0);
  const maxTotal = budget * 1.0;
  const minTotal = budget * 0.88;

  if (total > maxTotal) {
    // Find the most expensive day and replace with cheapest unused meal
    let tries = 0;
    while (total > maxTotal && tries < 10) {
      tries++;
      const priciest = selected.reduce((max, d, i) =>
        d.meal.price > selected[max].meal.price ? i : max, 0);
      const cheaperMeal = adjustedMeals
        .map((m, idx) => ({ ...m, idx }))
        .filter(({ idx }) => !usedIndices.has(idx))
        .sort((a, b) => a.adjustedPrice - b.adjustedPrice)[0];
      if (!cheaperMeal) break;
      const removeIdx = adjustedMeals.findIndex(
        (m) => m.meal.name === selected[priciest].meal.name
      );
      if (removeIdx !== -1) {
        usedIndices.delete(removeIdx);
      }
      usedIndices.add(cheaperMeal.idx);
      total -= selected[priciest].meal.price;
      total += cheaperMeal.adjustedPrice;
      selected[priciest] = {
        ...selected[priciest],
        meal: { ...cheaperMeal.meal, price: cheaperMeal.adjustedPrice },
      };
    }
  }

  if (total < minTotal) {
    // Upgrade cheapest meal to something more expensive
    const cheapestIdx = selected.reduce((min, d, i) =>
      d.meal.price < selected[min].meal.price ? i : min, 0);
    const pricierMeal = adjustedMeals
      .map((m, idx) => ({ ...m, idx }))
      .filter(({ idx }) => !usedIndices.has(idx))
      .sort((a, b) => Math.abs(a.adjustedPrice - budget / 7) - Math.abs(b.adjustedPrice - budget / 7))[0];
    if (pricierMeal) {
      selected[cheapestIdx] = {
        ...selected[cheapestIdx],
        meal: { ...pricierMeal.meal, price: pricierMeal.adjustedPrice },
      };
    }
  }

  return selected;
}

// ─── Animated Number ──────────────────────────────────────────────────────────

function useAnimatedNumber(target: number, duration = 500) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const diff = target - from;
    if (Math.abs(diff) < 1) {
      setDisplay(target);
      return;
    }
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

// ─── Tag Badge ────────────────────────────────────────────────────────────────

const TAG_CONFIG: Record<Tag, { label: string; color: string; bg: string; border: string }> = {
  billig: { label: "Billig", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  protein: { label: "Protein", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  vegetar: { label: "Vegetar", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  premium: { label: "Premium", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
};

function TagBadge({ tag }: { tag: Tag }) {
  const cfg = TAG_CONFIG[tag];
  return (
    <span
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: "100px",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Premium Modal ────────────────────────────────────────────────────────────

function PremiumModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: "0 24px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "32px 28px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          border: "1px solid #d1d5db",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
        <p style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
          Matbudsjettet Pro
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.2 }}>
          Kommer snart
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
          Vi jobber med å hente live priser fra norske butikker. Du vil bli varslet når funksjonen er klar.
        </p>
        <button
          onClick={onClose}
          style={{
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 28px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Forstått 👍
        </button>
      </div>
    </div>
  );
}

// ─── Shopping category order ──────────────────────────────────────────────────

const CATEGORY_ORDER: ShoppingCategory[] = [
  "Kjøtt & fisk",
  "Meieri & egg",
  "Grønnsaker & frukt",
  "Tørrvarer & hermetikk",
  "Annet",
];

const CATEGORY_EMOJI: Record<ShoppingCategory, string> = {
  "Kjøtt & fisk": "🥩",
  "Meieri & egg": "🥛",
  "Grønnsaker & frukt": "🥦",
  "Tørrvarer & hermetikk": "🥫",
  "Annet": "🧂",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Matbudsjettet() {
  const [people, setPeople] = useState(1);
  const [store, setStore] = useState<Store>("REMA 1000");
  const [budget, setBudget] = useState(700);
  const [tab, setTab] = useState<Tab>("ukeplan");
  const [plan, setPlan] = useState<DayPlan[]>(() => generatePlan(700, "REMA 1000"));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const NORWEGIAN_AVG = 950;

  const totalCost = plan.reduce((sum, d) => sum + d.meal.price * people, 0);
  const pricePerPerson = Math.round(totalCost / people);
  const avgTotal = NORWEGIAN_AVG * people;
const savings = avgTotal - totalCost;
  const perDay = Math.round(totalCost / 7);

  const animatedTotal = useAnimatedNumber(totalCost);
  const animatedSavings = useAnimatedNumber(Math.abs(savings));
  const animatedPerDay = useAnimatedNumber(perDay);

  const regenerate = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPlan(generatePlan(budget, store));
      setCheckedItems(new Set());
      setIsLoading(false);
    }, 420);
  }, [budget, store]);

  useEffect(() => {
    setPlan(generatePlan(budget, store));
  }, [budget, store]);

  // Shopping list grouped by category
  const ingredientMap = new Map<string, { name: string; count: number; category: ShoppingCategory }>();
  plan.forEach((d) => {
    d.meal.ingredients.forEach(({ name, category }) => {
      const baseKey = name.toLowerCase();
      if (!ingredientMap.has(baseKey)) {
        ingredientMap.set(baseKey, { name, count: 1, category });
      } else {
        ingredientMap.get(baseKey)!.count++;
      }
    });
  });

  const shoppingItems = Array.from(ingredientMap.values());

  const groupedShopping = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: shoppingItems.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const totalShoppingItems = shoppingItems.length;
  const checkedCount = checkedItems.size;

  // Tips
  const tips = [
    savings < 0
      ? `⚠️ Du er ${Math.abs(savings)} kr over gjennomsnittet — prøv et lavere budsjett`
      : `✅ Du sparer ${savings} kr sammenlignet med norsk snitt (${NORWEGIAN_AVG} kr/uke)`,
    store === "MENY"
      ? `🏪 Bytt til KIWI og spar ytterligere ~${Math.round(totalCost * 0.28)} kr denne uken`
      : store === "REMA 1000"
      ? `🏪 Bytt til KIWI og spar ~${Math.round(totalCost * 0.12)} kr per uke`
      : "🏪 Du handler allerede på billigste alternativ — bra jobbet!",
    plan.some((d) => d.meal.tag === "premium")
      ? `💡 Erstatt ${plan.find((d) => d.meal.tag === "premium")?.meal.name} med kylling → spar ~${Math.round(
          (plan.find((d) => d.meal.tag === "premium")?.meal.price ?? 0) * 0.45
        )} kr`
      : "💡 Ingen premium-måltider i planen — perfekt budsjettbalanse!",
    "🥦 Vegetarmåltider er ~40% billigere — du har " +
      plan.filter((d) => d.meal.tag === "vegetar").length +
      " vegetarmåltider denne uken",
    "🛒 Kjøp basisvarer i bulk: pasta, ris, hermetikk — spar opp til 15% per handletur",
  ];

  const storeColor = STORE_COLORS[store];
  const sliderPct = ((budget - 200) / 1300) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        color: "#111827",
        fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
        padding: "0 0 120px 0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

        .store-btn {
          padding: 8px 20px;
          border-radius: 100px;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #6b7280;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .store-btn:hover { border-color: #d1d5db; color: #374151; background: #f9fafb; }
        .store-btn.active {
          background: var(--store-color, #e8a000);
          border-color: transparent;
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .tab-btn {
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .tab-btn:hover { color: #6b7280; }
        .tab-btn.active {
          background: #fff;
          color: #111827;
          border: 1px solid #d1d5db;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .preset-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #6b7280;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .preset-btn:hover { border-color: #d1d5db; color: #6b7280; }
        .preset-btn.active {
          border-color: #111827;
          background: #111827;
          color: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .day-card {
          border-radius: 16px;
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 18px;
          transition: all 0.2s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          border-color: #d1d5db;
        }

        .stat-card {
          border-radius: 16px;
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 20px 24px;
          flex: 1;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }

        .savings-card {
          border-radius: 16px;
          border: 1px solid #bbf7d0;
          background: linear-gradient(135deg, #f0fdf4 0%, #fff 100%);
          padding: 22px 24px;
          flex: 1.3;
          box-shadow: 0 2px 8px rgba(22,163,74,0.08);
          position: relative;
          overflow: hidden;
        }
        .savings-card::before {
          content: '';
          position: absolute;
          top: -20px;
          right: -20px;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .check-item:hover { background: #f9fafb; border-color: #d1d5db; }

        .cta-btn {
          padding: 13px 24px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .cta-primary {
          background: #111827;
          color: #fff;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .cta-primary:hover { background: #1f2937; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
        .cta-secondary {
          background: #fff;
          color: #6b7280;
          border: 1px solid #d1d5db;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .cta-secondary:hover { border-color: #d1d5db; color: #374151; }

        .slider-track {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .slider-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #111827;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(17,24,39,0.08), 0 2px 6px rgba(0,0,0,0.2);
          transition: box-shadow 0.2s ease;
        }
        .slider-track::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 7px rgba(17,24,39,0.08), 0 2px 10px rgba(0,0,0,0.25);
        }
        .slider-track::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #111827;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .tip-card {
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          background: #fff;
          font-size: 14px;
          line-height: 1.5;
          color: #4b5563;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .tip-card:hover { border-color: #d1d5db; color: #374151; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

        .locked-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px dashed #d1d5db;
          background: #f9fafb;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          user-select: none;
        }
        .locked-feature:hover { border-color: #6b7280; color: #6b7280; background: #f3f4f6; }

        .category-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0 6px;
          margin-top: 16px;
          margin-bottom: 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #f3f4f6;
        }
        .category-header:first-of-type { margin-top: 0; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .day-card { animation: fadeIn 0.3s ease both; }

        @media (max-width: 640px) {
          .stats-row { flex-direction: column !important; }
          .days-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .days-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}

      {/* ── Header ── */}
      <div
        style={{
          borderBottom: "1px solid #d1d5db",
          padding: "44px 24px 36px",
          maxWidth: 860,
          margin: "0 auto",
          background: "#f6f7fb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "100px",
              padding: "4px 14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" }}>
              Gratis · Beta
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
            Basert på gjennomsnittlige norske priser · Oppdatert 2026
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(26px, 5vw, 42px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 10,
            color: "#111827",
          }}
        >
          Spar penger på ukeshandelen 🇳🇴
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", fontWeight: 400, letterSpacing: "-0.01em" }}>
          Planlegg ukens middag og se nøyaktig hva du sparer
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Store */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Butikk
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
  {["KIWI", "REMA 1000", "MENY"].map((s) => (
    <button
      key={s}
      className={`store-btn ${store === s ? "active" : ""}`}
     style={{ "--store-color": STORE_COLORS[s as Store] } as React.CSSProperties}
onClick={() => setStore(s as Store)}    >
      {s}
    </button>
  ))}
</div>

{/* 👇👇👇 ADD EVERYTHING BELOW HERE 👇👇👇 */}

<div style={{ 
  marginTop: 12, 
  fontSize: 13, 
  color: "#6b7280",
  fontWeight: 500 
}}>
  👤 Planen er for {people} person{people > 1 ? "er" : ""}
</div>

<div style={{ display: "flex", gap: 8, marginTop: 8 }}>
  {[1, 2, 3, 4].map((p) => (
    <button
      key={p}
      onClick={() => setPeople(p)}
   style={{
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: people === p ? "#111827" : "#fff",
  color: people === p ? "#fff" : "#374151",
  cursor: "pointer", // ✅ ADD THIS COMMA

  transform: people === p ? "scale(1.05)" : "scale(1)",
  transition: "all 0.15s ease",
}}
    >
      {p}
    </button>
  ))}
</div>

<p style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
  🍽️ Alle priser er per middag
</p>
<p style={{ fontSize: 14, color: "#6b7280" }}>
  💰 {pricePerPerson} kr per person / uke
</p>

          {/* KIWI hack message */}
          {store === "KIWI" && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 10,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#15803d",
                fontWeight: 500,
              }}
            >
              <span>💡</span>
              <span>KIWI er i snitt 12–20% billigere enn andre norske dagligvarebutikker</span>
            </div>
          )}
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
              Ukebudsjett
            </p>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 22,
                fontWeight: 500,
                color: "#111827",
                letterSpacing: "-0.02em",
              }}
            >
              {budget} <span style={{ fontSize: 14, color: "#6b7280" }}>kr</span>
            </span>
          </div>

          <input
            type="range"
            min={200}
            max={1500}
            step={10}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="slider-track"
            style={{
              background: `linear-gradient(to right, #111827 0%, #111827 ${sliderPct}%, #d1d5db ${sliderPct}%, #d1d5db 100%)`,
              marginBottom: 14,
            }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[400, 700, 1000, 1400].map((p) => (
              <button
                key={p}
                className={`preset-btn ${budget === p ? "active" : ""}`}
                onClick={() => setBudget(p)}
              >
                {p} kr
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div
          className="stats-row"
          style={{ display: "flex", gap: 12, marginBottom: 28 }}
        >
          {/* SAVINGS — main focus */}
          <div
            className="savings-card"
            style={{
              borderColor: savings >= 0 ? "#bbf7d0" : "#fecaca",
              background: savings >= 0
                ? "linear-gradient(135deg, #f0fdf4 0%, #fff 100%)"
                : "linear-gradient(135deg, #fff5f5 0%, #fff 100%)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: savings >= 0 ? "#16a34a" : "#dc2626",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {savings >= 0 ? "✦ Du sparer" : "Over snitt"}
            </p>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 44,
                fontWeight: 500,
                letterSpacing: "-0.04em",
                color: savings >= 0 ? "#16a34a" : "#dc2626",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {savings >= 0 ? "+" : "-"}{animatedSavings}
              <span style={{ fontSize: 20, marginLeft: 4, opacity: 0.7 }}>kr</span>
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
  vs. norsk snitt {NORWEGIAN_AVG} kr per person ({NORWEGIAN_AVG * people} kr totalt)
</p>
          </div>

          {/* Total */}
          <div className="stat-card">
            <p style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
              Totalt
            </p>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: "#111827",
                lineHeight: 1,
              }}
            >
              {animatedTotal}
              <span style={{ fontSize: 16, color: "#6b7280", marginLeft: 4 }}>kr</span>
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>denne uken</p>
          </div>

          {/* Per day */}
          <div className="stat-card">
            <p style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
              Per dag
            </p>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: "#111827",
                lineHeight: 1,
              }}
            >
              {animatedPerDay}
              <span style={{ fontSize: 16, color: "#6b7280", marginLeft: 4 }}>kr</span>
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>per middag</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 24,
            padding: "4px",
            background: "#ececf0",
            borderRadius: 12,
            border: "1px solid #d1d5db",
            width: "fit-content",
          }}
        >
          {(["ukeplan", "handleliste", "spartips"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "ukeplan" ? "Ukeplan" : t === "handleliste" ? "Handleliste" : "Spartips"}
            </button>
          ))}
        </div>

        {/* ── Tab: Ukeplan ── */}
        {tab === "ukeplan" && (
          <div
            className="days-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {plan.map((dayPlan, i) => (
              <div
                key={dayPlan.day}
                className="day-card"
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  animationDelay: `${i * 40}ms`,
                  boxShadow:
                    hoveredDay === i
                      ? `0 0 0 2px ${storeColor}30, 0 8px 24px rgba(0,0,0,0.10)`
                      : "0 1px 4px rgba(0,0,0,0.05)",
                  borderColor: hoveredDay === i ? `${storeColor}60` : "#d1d5db",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {dayPlan.day}
                  </span>
                  <TagBadge tag={dayPlan.meal.tag} />
                </div>

                <div style={{ fontSize: 28, marginBottom: 8 }}>{dayPlan.meal.emoji}</div>

                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    lineHeight: 1.3,
                    marginBottom: 10,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {dayPlan.meal.name}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 20,
                      fontWeight: 500,
                      color: "#374151",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {dayPlan.meal.price}
                  </span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>kr</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Handleliste ── */}
        {tab === "handleliste" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                padding: "14px 18px",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                  Handleliste klar ✓
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {totalShoppingItems} varer · {checkedCount} lagt i kurven
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {checkedCount > 0 && (
                  <button
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: 7,
                      cursor: "pointer",
                      padding: "5px 12px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onClick={() => setCheckedItems(new Set())}
                  >
                    Nullstill
                  </button>
                )}
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "4px 10px",
                  }}
                >
                  {checkedCount}/{totalShoppingItems}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 4,
                background: "#f3f4f6",
                borderRadius: 2,
                marginBottom: 20,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${totalShoppingItems > 0 ? (checkedCount / totalShoppingItems) * 100 : 0}%`,
                  background: "#16a34a",
                  borderRadius: 2,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Locked premium feature */}
            <div
              className="locked-feature"
              onClick={() => setShowPremiumModal(true)}
              title="Kommende funksjon"
            >
              <span style={{ fontSize: 16 }}>🔒</span>
              <span>Se billigste butikk per vare</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#d97706",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "100px",
                  padding: "2px 8px",
                }}
              >
                Pro
              </span>
            </div>

            {/* Grouped shopping list */}
            <div style={{ marginTop: 16 }}>
              {groupedShopping.map(({ category, items }) => (
                <div key={category}>
                  <div className="category-header">
                    <span>{CATEGORY_EMOJI[category]}</span>
                    <span>{category}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        color: "#d1d5db",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontWeight: 400,
                      }}
                    >
                      {items.filter((it) => checkedItems.has(it.name)).length}/{items.length}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {items.map(({ name, count }) => {
                      const checked = checkedItems.has(name);
                      return (
                        <div
                          key={name}
                          className="check-item"
                          onClick={() => {
                            const next = new Set(checkedItems);
                            checked ? next.delete(name) : next.add(name);
                            setCheckedItems(next);
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              border: checked ? "none" : "1.5px solid #d1d5db",
                              background: checked ? "#16a34a" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "all 0.15s ease",
                            }}
                          >
                            {checked && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 14,
                              color: checked ? "#6b7280" : "#374151",
                              textDecoration: checked ? "line-through" : "none",
                              flex: 1,
                              transition: "all 0.15s ease",
                            }}
                          >
                            {name}
                          </span>
                          {count > 1 && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "#6b7280",
                                background: "#f3f4f6",
                                border: "1px solid #d1d5db",
                                borderRadius: "100px",
                                padding: "1px 8px",
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              ×{count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Spartips ── */}
        {tab === "spartips" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tips.map((tip, i) => (
              <div key={i} className="tip-card">
                {tip}
              </div>
            ))}

            {/* Savings summary card */}
            <div
              style={{
                marginTop: 8,
                padding: "22px 24px",
                borderRadius: 16,
                border: savings >= 0 ? "1px solid #bbf7d0" : "1px solid #fecaca",
                background: savings >= 0
                  ? "linear-gradient(135deg, #f0fdf4 0%, #fff 100%)"
                  : "linear-gradient(135deg, #fff5f5 0%, #fff 100%)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                Ukens sparmål
              </p>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 36,
                  fontWeight: 500,
                  color: savings >= 0 ? "#16a34a" : "#dc2626",
                  marginBottom: 6,
                  letterSpacing: "-0.03em",
                }}
              >
                {savings >= 0 ? `+${savings}` : savings} kr
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                {savings >= 0
                  ? `Det tilsvarer ${Math.round(savings / 50)} kopper kaffe eller ${Math.round(savings / 15)} brødskiver`
                  : "Reduser budsjettet eller bytt butikk for å spare mer"}
              </p>
            </div>

            {/* Locked premium feature */}
            <div
              className="locked-feature"
              onClick={() => setShowPremiumModal(true)}
            >
              <span style={{ fontSize: 16 }}>🔒</span>
              <span>Optimaliser handlelisten automatisk</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#d97706",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "100px",
                  padding: "2px 8px",
                }}
              >
                Pro
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Footer ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "14px 24px 20px",
          background: "linear-gradient(to top, rgba(246,247,251,0.97) 70%, transparent)",
          display: "flex",
          justifyContent: "center",
          gap: 10,
          zIndex: 100,
        }}
      >
        <button
          className="cta-btn cta-primary"
          onClick={regenerate}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.8 : 1, transition: "opacity 0.2s" }}
        >
          {isLoading ? "Beregner..." : "↻ Ny plan"}
        </button>
        <button
          className="cta-btn cta-secondary"
          onClick={() => {
            const text = `🇳🇴 Matbudsjettet — ${store}\n📅 Ukesplan: ${totalCost} kr${savings >= 0 ? ` · Sparer ${savings} kr` : ""}\n\nPrøv selv: matbudsjettet.no`;
            navigator.clipboard.writeText(text).catch(() => {});
            alert("Kopiert til utklippstavle! 📋");
          }}
        >
          Del plan
        </button>
      </div>
    </div>
  );
}
<div style={{ 
  maxWidth: 860, 
  margin: "80px auto 0", 
  padding: "0 24px",
  color: "#374151",
  lineHeight: 1.6
}}>
  <h2>Billig ukesmeny på budsjett – spar penger på mat i Norge</h2>

  <p>
    Med Matbudsjettet kan du enkelt lage en ukesmeny basert på budsjettet ditt. 
    Velg butikk, sett budsjett og få forslag til middager som holder deg innenfor rammen.
  </p>

  <p>
    Denne tjenesten fungerer som en enkel matbudsjett kalkulator hvor du kan planlegge middager 
    for hele uken og holde deg innenfor budsjettet ditt.
  </p>

  <h3>Hvordan spare penger på mat i Norge</h3>
  <ul>
    <li>Planlegg ukens middager på forhånd</li>
    <li>Velg rimelige butikker som KIWI eller REMA 1000</li>
    <li>Kjøp basisvarer som ris, pasta og hermetikk i bulk</li>
  </ul>

  <h3>Hva er et vanlig matbudsjett?</h3>
  <p>
    Gjennomsnittet i Norge ligger rundt 900–1000 kr per uke per person.
    Med riktig planlegging kan du spare flere hundre kroner hver uke.
  </p>

  <p>
    Prøv selv på matbudsjettet.no og se hvor mye du kan spare hver uke.
  </p>
</div>