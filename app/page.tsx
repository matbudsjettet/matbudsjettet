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
  ingredients: string[];
  emoji: string;
}

interface DayPlan {
  day: string;
  dayShort: string;
  meal: Meal;
}

// ─── Meal Database ────────────────────────────────────────────────────────────

const MEAL_DB: Meal[] = [
  // Billig (50–90 kr)
  { name: "Pasta med tomatsaus", price: 55, tag: "billig", emoji: "🍝", ingredients: ["Pasta 500g", "Hermetiske tomater 2x", "Hvitløk", "Løk", "Olivenolje"] },
  { name: "Linsesuppe", price: 48, tag: "billig", emoji: "🥣", ingredients: ["Røde linser 400g", "Buljong", "Gurkemeie", "Ingefær", "Løk"] },
  { name: "Eggerøre med brød", price: 42, tag: "billig", emoji: "🍳", ingredients: ["Egg 6stk", "Smør", "Melk", "Grovbrød", "Gressløk"] },
  { name: "Bønner og ris", price: 52, tag: "billig", emoji: "🫘", ingredients: ["Kikerter 400g", "Ris 250g", "Tomater", "Paprika", "Krydder"] },
  { name: "Grønnkålsuppe", price: 58, tag: "vegetar", emoji: "🥗", ingredients: ["Grønnkål", "Poteter 3stk", "Buljong", "Hvitløk", "Fløte"] },
  { name: "Potetsuppe", price: 62, tag: "billig", emoji: "🥔", ingredients: ["Poteter 600g", "Purre", "Buljong", "Fløte 1dl", "Bacon 100g"] },

  // Mid-range (90–160 kr)
  { name: "Kyllinggryte", price: 118, tag: "protein", emoji: "🍗", ingredients: ["Kyllingfilet 400g", "Kokosmjølk", "Paprika", "Løk", "Ris 250g"] },
  { name: "Tortilla med kjøttdeig", price: 102, tag: "protein", emoji: "🌮", ingredients: ["Kjøttdeig 400g", "Tortilla 6stk", "Rømme", "Salsa", "Ost revet"] },
  { name: "Omelett med grønnsaker", price: 88, tag: "vegetar", emoji: "🥚", ingredients: ["Egg 6stk", "Paprika", "Champignon", "Spinat", "Fetaost 100g"] },
  { name: "Laks med søtpotet", price: 148, tag: "protein", emoji: "🐟", ingredients: ["Laksefilet 400g", "Søtpoteter 2stk", "Sitron", "Dill", "Smør"] },
  { name: "Spaghetti Bolognese", price: 124, tag: "protein", emoji: "🍝", ingredients: ["Kjøttdeig 500g", "Spaghetti", "Tomatsaus", "Rødvin 1dl", "Parmesan"] },
  { name: "Vegetarburger", price: 132, tag: "vegetar", emoji: "🍔", ingredients: ["Vegetarburgere 4stk", "Hamburgerbrød 4stk", "Salat", "Tomat", "Stekte løk"] },
  { name: "Kyllingwok", price: 138, tag: "protein", emoji: "🥡", ingredients: ["Kylling 350g", "Wokgrønnsaker", "Soyasaus", "Sesamolje", "Risnudler"] },
  { name: "Fisketaco", price: 142, tag: "protein", emoji: "🌮", ingredients: ["Torsk 400g", "Mais-tortilla 8stk", "Kål", "Lime", "Rømme"] },
  { name: "Blomkålcurry", price: 95, tag: "vegetar", emoji: "🥦", ingredients: ["Blomkål", "Kikerter 400g", "Kokosmjølk", "Currypasta", "Ris 200g"] },

  // Premium (160–260 kr)
  { name: "Indrefilet med asparges", price: 248, tag: "premium", emoji: "🥩", ingredients: ["Indrefilet 400g", "Asparges", "Smørblomst", "Rødvinsaus", "Poteter"] },
  { name: "Hummerbisque", price: 195, tag: "premium", emoji: "🦞", ingredients: ["Hummerbase", "Fløte 2dl", "Cognac", "Sjalottløk", "Estragon"] },
  { name: "Lammekoteletter", price: 218, tag: "premium", emoji: "🍖", ingredients: ["Lammekoteletter 4stk", "Rosmarin", "Hvitløk", "Rødvin", "Ovnspoteter"] },
  { name: "Laks med hollandaise", price: 178, tag: "premium", emoji: "🐟", ingredients: ["Laks 500g", "Hollandaise", "Dampet brokkoli", "Dill", "Sitron"] },
  { name: "Scampi med pasta", price: 188, tag: "premium", emoji: "🍤", ingredients: ["Scampi 300g", "Linguine", "Hvitvin", "Hvitløk", "Persille"] },
  { name: "Andebryst", price: 235, tag: "premium", emoji: "🦆", ingredients: ["Andebryst 2stk", "Appelsinglasur", "Sellerirot", "Timian", "Valnøtter"] },
  { name: "Gresskar-risotto", price: 165, tag: "vegetar", emoji: "🎃", ingredients: ["Arborio-ris", "Gresskar", "Parmesan", "Hvitvin", "Buljong"] },
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
  MENY: "#2b6cb0",
};

// ─── Plan Generation ──────────────────────────────────────────────────────────

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
  const targetPerDay = budget / 7;

  // Sort meals by closeness to target per day (using base prices)
  const scored = MEAL_DB.map((meal) => ({
    meal,
    adjustedPrice: Math.round(meal.price * multiplier),
    distance: Math.abs(meal.price - targetPerDay),
  })).sort((a, b) => a.distance - b.distance);

  // Select 7 meals: pick from top candidates with some variety
  const selected: DayPlan[] = [];
  const usedIndices = new Set<number>();

  // Ensure tag diversity
  const tagOrder: Tag[] = ["protein", "vegetar", "protein", "billig", "protein", "vegetar", "premium"];

  for (let i = 0; i < 7; i++) {
    const preferredTag = tagOrder[i];
    const dayTarget = targetPerDay;

    // Try to find a meal with preferred tag and close to budget
    let best = scored.find(
      (s, idx) =>
        !usedIndices.has(idx) &&
        s.meal.tag === preferredTag &&
        Math.abs(s.meal.price - dayTarget) < dayTarget * 0.5
    );

    // Fallback: closest to budget regardless of tag
    if (!best) {
      best = scored.find((_, idx) => !usedIndices.has(idx));
    }

    if (best) {
      const idx = scored.indexOf(best);
      usedIndices.add(idx);
      selected.push({
        ...DAYS[i],
        meal: { ...best.meal, price: best.adjustedPrice },
      });
    }
  }

  return selected;
}

// ─── Animated Number ──────────────────────────────────────────────────────────

function useAnimatedNumber(target: number, duration = 400) {
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

const TAG_CONFIG: Record<Tag, { label: string; color: string; bg: string }> = {
  billig: { label: "Billig", color: "#86efac", bg: "rgba(134,239,172,0.12)" },
  protein: { label: "Protein", color: "#93c5fd", bg: "rgba(147,197,253,0.12)" },
  vegetar: { label: "Vegetar", color: "#6ee7b7", bg: "rgba(110,231,183,0.12)" },
  premium: { label: "Premium", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
};

function TagBadge({ tag }: { tag: Tag }) {
  const cfg = TAG_CONFIG[tag];
  return (
    <span
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}22`,
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: "100px",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Matbudsjettet() {
  const [store, setStore] = useState<Store>("REMA 1000");
  const [budget, setBudget] = useState(700);
  const [tab, setTab] = useState<Tab>("ukeplan");
  const [plan, setPlan] = useState<DayPlan[]>(() => generatePlan(700, "REMA 1000"));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const NORWEGIAN_AVG = 950;

  const totalCost = plan.reduce((sum, d) => sum + d.meal.price, 0);
  const savings = NORWEGIAN_AVG - totalCost;
  const perDay = Math.round(totalCost / 7);

  const animatedTotal = useAnimatedNumber(totalCost);
  const animatedSavings = useAnimatedNumber(Math.abs(savings));
  const animatedPerDay = useAnimatedNumber(perDay);

  const regenerate = useCallback(() => {
    setPlan(generatePlan(budget, store));
    setCheckedItems(new Set());
  }, [budget, store]);

  useEffect(() => {
    setPlan(generatePlan(budget, store));
  }, [budget, store]);

  // Aggregate ingredients for shopping list
  const allIngredients = plan.flatMap((d) =>
    d.meal.ingredients.map((ing) => ({ ing, day: d.dayShort, meal: d.meal.name }))
  );
  const ingredientMap = new Map<string, string[]>();
  allIngredients.forEach(({ ing, day }) => {
    const key = ing.split(" ")[0];
    if (!ingredientMap.has(key)) ingredientMap.set(key, []);
    ingredientMap.get(key)!.push(ing);
  });
  const shoppingList = Array.from(ingredientMap.entries()).map(([, items]) => ({
    item: items[0],
    count: items.length,
  }));

  // Saving tips
  const tips = [
    savings < 0
      ? `⚠️ Du er ${Math.abs(savings)} kr over gjennomsnittet — prøv et lavere budsjett`
      : `✅ Du sparer ${savings} kr vs. norsk snitt (${NORWEGIAN_AVG} kr/uke)`,
    store === "MENY"
      ? `🏪 Bytt til KIWI og spar ytterligere ~${Math.round(totalCost * 0.28)} kr denne uken`
      : store === "REMA 1000"
      ? `🏪 Bytt til KIWI og spar ~${Math.round(totalCost * 0.12)} kr`
      : "🏪 Du handler allerede på billigste alternativ — bra!",
    plan.some((d) => d.meal.tag === "premium")
      ? `💡 Erstatt ${plan.find((d) => d.meal.tag === "premium")?.meal.name} med kylling → spar ~${Math.round(
          (plan.find((d) => d.meal.tag === "premium")?.meal.price ?? 0) * 0.45
        )} kr`
      : "💡 Ingen premium-måltider i planen — perfekt budsjettbalanse!",
    "🥦 Vegetarmåltider er ~40% billigere — du har " +
      plan.filter((d) => d.meal.tag === "vegetar").length +
      " denne uken",
    "🛒 Kjøp basisvarer i bulk: pasta, ris, hermetikk — spar opp til 15%",
  ];

  const storeColor = STORE_COLORS[store];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e8e8f0",
        fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
        padding: "0 0 120px 0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 2px; }

        .store-btn {
          padding: 8px 20px;
          border-radius: 100px;
          border: 1px solid #2a2a3a;
          background: transparent;
          color: #888;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .store-btn:hover { border-color: #3a3a4a; color: #ccc; }
        .store-btn.active {
          background: var(--store-color, #e8a000);
          border-color: transparent;
          color: #fff;
          font-weight: 600;
        }

        .tab-btn {
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #555;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .tab-btn:hover { color: #999; }
        .tab-btn.active {
          background: #1a1a2e;
          color: #e8e8f0;
          border: 1px solid #2a2a3a;
        }

        .preset-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #2a2a3a;
          background: transparent;
          color: #666;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .preset-btn:hover { border-color: #3a3a4a; color: #aaa; }
        .preset-btn.active {
          border-color: #4a4a6a;
          background: #1a1a2e;
          color: #e8e8f0;
        }

        .day-card {
          border-radius: 14px;
          border: 1px solid #1e1e2e;
          background: #0e0e1a;
          padding: 18px;
          transition: all 0.25s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .day-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          opacity: 0;
          transition: opacity 0.25s ease;
          background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%);
        }
        .day-card:hover { border-color: #2a2a3a; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .day-card:hover::before { opacity: 1; }

        .stat-card {
          border-radius: 16px;
          border: 1px solid #1e1e2e;
          background: #0e0e1a;
          padding: 20px 24px;
          flex: 1;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .check-item:hover { background: #0e0e1a; border-color: #1e1e2e; }

        .cta-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .cta-primary {
          background: #fff;
          color: #0a0a0f;
          border: none;
        }
        .cta-primary:hover { background: #e8e8f0; transform: translateY(-1px); }
        .cta-secondary {
          background: transparent;
          color: #888;
          border: 1px solid #2a2a3a;
        }
        .cta-secondary:hover { border-color: #3a3a4a; color: #ccc; }

        .slider-track {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 3px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .slider-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.5);
          transition: box-shadow 0.2s ease;
        }
        .slider-track::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(255,255,255,0.08), 0 2px 12px rgba(0,0,0,0.6);
        }
        .slider-track::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        .glow-number {
          text-shadow: 0 0 40px currentColor;
        }

        .tip-card {
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #1e1e2e;
          background: #0e0e1a;
          font-size: 14px;
          line-height: 1.5;
          color: #aaa;
          transition: all 0.2s;
        }
        .tip-card:hover { border-color: #2a2a3a; color: #ccc; }

        @media (max-width: 640px) {
          .stats-row { flex-direction: column !important; }
          .days-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .days-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          borderBottom: "1px solid #14141f",
          padding: "48px 24px 40px",
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#0e0e1a",
            border: "1px solid #1e1e2e",
            borderRadius: "100px",
            padding: "4px 14px",
            marginBottom: 24,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#555", letterSpacing: "0.05em", fontWeight: 500 }}>
            BETA · Norsk matplanlegger
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 12,
            color: "#f0f0fa",
          }}
        >
          Matprisene i Norge er galne 🇳🇴
        </h1>
        <p style={{ fontSize: 16, color: "#555", fontWeight: 400, letterSpacing: "-0.01em" }}>
          Vi hjelper deg spise bra for mindre
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px 0" }}>

        {/* Store */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>
            Butikk
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["KIWI", "REMA 1000", "MENY"] as Store[]).map((s) => (
              <button
                key={s}
                className={`store-btn ${store === s ? "active" : ""}`}
                style={{ "--store-color": STORE_COLORS[s] } as React.CSSProperties}
                onClick={() => setStore(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
              Ukebudsjett
            </p>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 22,
                fontWeight: 500,
                color: "#f0f0fa",
                letterSpacing: "-0.02em",
              }}
            >
              {budget} <span style={{ fontSize: 14, color: "#555" }}>kr</span>
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
              background: `linear-gradient(to right, ${storeColor} 0%, ${storeColor} ${((budget - 200) / 1300) * 100}%, #1e1e2e ${((budget - 200) / 1300) * 100}%, #1e1e2e 100%)`,
              marginBottom: 14,
            }}
          />

          <div style={{ display: "flex", gap: 8 }}>
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
        <div className="stats-row" style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {/* Total */}
          <div className="stat-card" style={{ border: `1px solid ${savings >= 0 ? "#1e2e1e" : "#2e1e1e"}` }}>
            <p style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
              Total uke
            </p>
            <div
              className="glow-number"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: savings >= 0 ? "#f0f0fa" : "#f87171",
              }}
            >
              {animatedTotal}
              <span style={{ fontSize: 18, color: "#444", marginLeft: 4 }}>kr</span>
            </div>
          </div>

          {/* Per day */}
          <div className="stat-card">
            <p style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
              Per dag
            </p>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: "#e8e8f0",
              }}
            >
              {animatedPerDay}
              <span style={{ fontSize: 18, color: "#444", marginLeft: 4 }}>kr</span>
            </div>
          </div>

          {/* Savings */}
          <div className="stat-card" style={{ border: `1px solid ${savings >= 0 ? "#1e2e1e" : "#2e1e1e"}` }}>
            <p style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
              {savings >= 0 ? "Du sparer" : "Over snitt"}
            </p>
            <div
              className="glow-number"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: savings >= 0 ? "#4ade80" : "#f87171",
              }}
            >
              {savings >= 0 ? "+" : "-"}{animatedSavings}
              <span style={{ fontSize: 18, color: "#444", marginLeft: 4 }}>kr</span>
            </div>
            <p style={{ fontSize: 11, color: "#333", marginTop: 6 }}>vs. snitt {NORWEGIAN_AVG} kr/uke</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 24,
            padding: "4px",
            background: "#06060e",
            borderRadius: 12,
            border: "1px solid #14141f",
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
                  boxShadow: hoveredDay === i ? `0 0 0 1px ${storeColor}22, 0 8px 32px rgba(0,0,0,0.5)` : undefined,
                  borderColor: hoveredDay === i ? `${storeColor}44` : "#1e1e2e",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
                    {dayPlan.day}
                  </span>
                  <TagBadge tag={dayPlan.meal.tag} />
                </div>

                <div style={{ fontSize: 28, marginBottom: 8 }}>{dayPlan.meal.emoji}</div>

                <p style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.3, marginBottom: 10, letterSpacing: "-0.01em" }}>
                  {dayPlan.meal.name}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 20,
                      fontWeight: 500,
                      color: "#f0f0fa",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {dayPlan.meal.price}
                  </span>
                  <span style={{ fontSize: 12, color: "#444" }}>kr</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Handleliste ── */}
        {tab === "handleliste" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#555" }}>
                {shoppingList.length} varer · {checkedItems.size} kjøpt
              </p>
              {checkedItems.size > 0 && (
                <button
                  style={{ fontSize: 12, color: "#555", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setCheckedItems(new Set())}
                >
                  Nullstill
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {shoppingList.map(({ item, count }) => {
                const checked = checkedItems.has(item);
                return (
                  <div
                    key={item}
                    className="check-item"
                    onClick={() => {
                      const next = new Set(checkedItems);
                      checked ? next.delete(item) : next.add(item);
                      setCheckedItems(next);
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: checked ? "none" : "1px solid #2a2a3a",
                        background: checked ? storeColor : "transparent",
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
                        color: checked ? "#333" : "#ccc",
                        textDecoration: checked ? "line-through" : "none",
                        flex: 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {item}
                    </span>
                    {count > 1 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#444",
                          background: "#1a1a2e",
                          border: "1px solid #2a2a3a",
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
        )}

        {/* ── Tab: Spartips ── */}
        {tab === "spartips" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tips.map((tip, i) => (
              <div key={i} className="tip-card">
                {tip}
              </div>
            ))}

            <div
              style={{
                marginTop: 8,
                padding: "20px 20px",
                borderRadius: 14,
                border: "1px solid #1e2e1e",
                background: "linear-gradient(135deg, #0a1a0a 0%, #0e0e1a 100%)",
              }}
            >
              <p style={{ fontSize: 12, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
                Ukens sparmål
              </p>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 28,
                  fontWeight: 500,
                  color: "#4ade80",
                  marginBottom: 4,
                  textShadow: "0 0 30px #4ade8066",
                }}
              >
                {savings >= 0 ? `+${savings}` : savings} kr
              </div>
              <p style={{ fontSize: 13, color: "#555" }}>
                {savings >= 0
                  ? `Det tilsvarer ${Math.round(savings / 50)} kopper kaffe eller ${Math.round(savings / 15)} brødskiver`
                  : "Reduser budsjettet eller bytt butikk for å spare mer"}
              </p>
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
          padding: "16px 24px",
          background: "linear-gradient(to top, #0a0a0f 60%, transparent)",
          display: "flex",
          justifyContent: "center",
          gap: 10,
          zIndex: 100,
        }}
      >
        <button className="cta-btn cta-primary" onClick={regenerate}>
          ↻ Ny plan
        </button>
        <button
          className="cta-btn cta-secondary"
          onClick={() => {
            const text = `🇳🇴 Matbudsjettet — ${store}\n📅 Ukesplan: ${totalCost} kr (${savings >= 0 ? `sparer ${savings} kr` : `${Math.abs(savings)} kr over snitt`})\n\nPrøv selv: matbudsjettet.no`;
            navigator.clipboard.writeText(text).catch(() => {});
            alert("Kopiert til utklippstavle! 📋");
          }}
        >
          Del resultat
        </button>
      </div>
    </div>
  );
}