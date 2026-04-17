"use client";

import { useReducer, useEffect } from "react";
import { buildAll, formatKr, type Config, type MealPlan, type ShoppingList, type SavingsTip, type PlannedMeal } from "./logic";

// ─── State ────────────────────────────────────────────────────────────────────

const initialConfig: Config = { store: "REMA1000", householdSize: 2, weeklyBudget: 1000 };

type Tab = "ukeplan" | "handleliste" | "spartips";

interface State {
  config: Config;
  plan: MealPlan;
  shoppingList: ShoppingList;
  savingsTips: SavingsTip[];
  activeTab: Tab;
}

type Action =
  | { type: "SET_STORE"; store: string }
  | { type: "SET_HOUSEHOLD"; size: number }
  | { type: "SET_BUDGET"; amount: number }
  | { type: "TOGGLE_ITEM"; itemId: string }
  | { type: "SET_TAB"; tab: Tab }
  | { type: "SET_ALL"; data: Omit<State, "config" | "activeTab"> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ALL":
      return { ...state, ...action.data };
    case "SET_STORE":
      return { ...state, config: { ...state.config, store: action.store } };
    case "SET_HOUSEHOLD":
      return { ...state, config: { ...state.config, householdSize: action.size } };
    case "SET_BUDGET":
      return { ...state, config: { ...state.config, weeklyBudget: action.amount } };
    case "TOGGLE_ITEM": {
      const groups = state.shoppingList.groups.map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.id === action.itemId ? { ...item, checked: !item.checked } : item
        ),
      }));
      const allItems = groups.flatMap((g) => g.items);
      return {
        ...state,
        shoppingList: {
          groups,
          totalItems: allItems.length,
          checkedItems: allItems.filter((i) => i.checked).length,
        },
      };
    }
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  kjøtt: "bg-red-100 text-red-700",
  fisk: "bg-blue-100 text-blue-700",
  vegetar: "bg-green-100 text-green-700",
  fjærkre: "bg-amber-100 text-amber-700",
};

const CATEGORY_ACCENT: Record<string, string> = {
  kjøtt: "bg-red-400",
  fisk: "bg-blue-400",
  vegetar: "bg-green-500",
  fjærkre: "bg-amber-400",
};

const TIP_ICONS: Record<string, string> = {
  "bytte-butikk": "🏪",
  "bytte-rett": "🔄",
  bulk: "📦",
  sesong: "🌿",
};

function difficultyDots(d: string) {
  const n = d === "enkel" ? 1 : d === "middels" ? 2 : 3;
  return (
    <span className="flex items-center gap-1" aria-label={`Vanskelighetsgrad: ${d}`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= n ? "bg-stone-500" : "bg-stone-200"}`}
        />
      ))}
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  const isPremium = label === "Premium";
  const isBudget = label === "Budsjett" || label === "Vegetar";
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border
        ${isPremium ? "bg-amber-50 text-amber-600 border-amber-200" : ""}
        ${isBudget ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
        ${!isPremium && !isBudget ? "bg-stone-100 text-stone-500 border-stone-200" : ""}
      `}
    >
      {label}
    </span>
  );
}

function MealCard({ pm }: { pm: PlannedMeal }) {
  const { meal, finalPrice, dayName } = pm;
  const accent = CATEGORY_ACCENT[meal.category] ?? "bg-stone-300";
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <div className={`h-1 w-full ${accent}`} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
              {dayName}
            </p>
            <p className="text-[15px] font-semibold text-stone-800 leading-snug">
              {meal.name}
            </p>
          </div>
          <p className="text-lg font-bold text-stone-800 tabular-nums whitespace-nowrap">
            Ca. {formatKr(finalPrice)}
          </p>
        </div>
        <div className="flex items-center gap-3 text-stone-400 text-xs">
          <span>⏱ {meal.cookTimeMinutes} min</span>
          {difficultyDots(meal.difficulty)}
          <span
            className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[meal.category] ?? "bg-stone-100 text-stone-500"}`}
          >
            {meal.category}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {meal.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryGrid({ plan }: { plan: MealPlan }) {
  const delta = plan.budgetDelta;
  const bench = plan.benchmarkDelta;
  const cards = [
    {
      label: "Denne uken",
      value: formatKr(plan.weeklyTotal),
      sub: plan.totalSavings > 0 ? `Du sparer ${formatKr(plan.totalSavings)}` : `Totalt: ${formatKr(plan.weeklyTotal)}`,
      positive: plan.totalSavings > 0 ? true : null,
    },
    {
      label: "Mot budsjett",
      value:
        (delta < 0 ? "−" : "+") +
        formatKr(Math.abs(delta)).replace(" kr", "") +
        " kr",
      sub: delta < 0 ? "under budsjett" : "over budsjett",
      positive: delta < 0,
    },
    {
      label: "Norsk snitt",
      value: formatKr(Math.abs(bench)),
      sub: bench < 0 ? "billigere enn snittet" : "dyrere enn snittet",
      positive: bench < 0,
    },
    {
      label: "Antall middager",
      value: `${plan.meals.length}`,
      sub: "denne uken",
      positive: null,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-2xl border p-4 flex flex-col gap-1
            ${c.positive === true ? "bg-emerald-50 border-emerald-100" : ""}
            ${c.positive === false ? "bg-red-50 border-red-100" : ""}
            ${c.positive === null ? "bg-stone-50 border-stone-100" : ""}
          `}
        >
          <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
            {c.label}
          </p>
          <p
            className={`text-xl font-bold leading-tight tabular-nums
              ${c.positive === true ? "text-emerald-700" : ""}
              ${c.positive === false ? "text-red-600" : ""}
              ${c.positive === null ? "text-stone-800" : ""}
            `}
          >
            {c.value}
          </p>
          <p className="text-xs text-stone-400">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

function ConfigCard({
  config,
  dispatch,
}: {
  config: Config;
  dispatch: React.Dispatch<Action>;
}) {
  const stores = [
    { id: "KIWI", label: "KIWI" },
    { id: "REMA1000", label: "REMA 1000" },
    { id: "MENY", label: "MENY" },
  ];
  const quickBudgets = [700, 1000, 1400, 2000];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col gap-5">
      {/* Store */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
          🏪 Butikk
        </p>
        <div className="flex gap-2">
          {stores.map((s) => (
            <button
              key={s.id}
              onClick={() => dispatch({ type: "SET_STORE", store: s.id })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer
                ${config.store === s.id
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                  : "bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Household */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
          👥 Husstandsstørrelse
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: "SET_HOUSEHOLD", size: n })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer
                ${config.householdSize === n
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                  : "bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
            >
              {n}p
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            💰 Ukebudsjett
          </p>
          <p className="text-base font-bold text-emerald-700 tabular-nums">
            {formatKr(config.weeklyBudget)}
          </p>
        </div>
        <input
          type="range"
          min={400}
          max={3000}
          step={50}
          value={config.weeklyBudget}
          onChange={(e) =>
            dispatch({ type: "SET_BUDGET", amount: parseInt(e.target.value) })
          }
          className="w-full accent-emerald-600 h-1.5 rounded-full"
          aria-label="Ukebudsjett"
        />
        <div className="flex gap-2 mt-3">
          {quickBudgets.map((b) => (
            <button
              key={b}
              onClick={() => dispatch({ type: "SET_BUDGET", amount: b })}
              className={`flex-1 py-1.5 rounded-lg text-xs border transition-all cursor-pointer
                ${config.weeklyBudget === b
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold"
                  : "bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300"
                }`}
            >
              {b} kr
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function UkeplanTab({ plan }: { plan: MealPlan }) {
  return (
    <div className="flex flex-col gap-3 p-4 pb-8">
      {plan.meals.map((pm) => (
        <MealCard key={pm.meal.id} pm={pm} />
      ))}
    </div>
  );
}

function HandlelisterTab({
  shoppingList,
  dispatch,
}: {
  shoppingList: ShoppingList;
  dispatch: React.Dispatch<Action>;
}) {
  const { groups, totalItems, checkedItems } = shoppingList;
  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  const allDone = checkedItems === totalItems && totalItems > 0;

  return (
    <div className="p-4 pb-8 flex flex-col gap-4">
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-stone-700">Handleprogresjon</p>
          <p className={`text-sm font-semibold ${allDone ? "text-emerald-600" : "text-stone-400"}`}>
            {allDone ? "✓ Ferdig!" : `${checkedItems} av ${totalItems}`}
          </p>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-emerald-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct > 0 && !allDone && (
          <p className="text-xs text-stone-400 mt-1.5 text-right">{pct}%</p>
        )}
      </div>

      {/* Groups */}
      {groups.map((g) => (
        <div
          key={g.category}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
        >
          <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-100 flex items-center gap-2">
            <span>{g.emoji}</span>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {g.displayName}
            </p>
          </div>
          {g.items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => dispatch({ type: "TOGGLE_ITEM", itemId: item.id })}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer
                ${idx < g.items.length - 1 ? "border-b border-stone-50" : ""}
                ${item.checked ? "bg-stone-50" : "bg-white hover:bg-stone-50"}
              `}
            >
              {/* Checkbox */}
              <span
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
                  ${item.checked ? "bg-emerald-500 border-emerald-500" : "border-stone-300"}`}
                aria-hidden="true"
              >
                {item.checked && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors ${item.checked ? "text-stone-400 line-through" : "text-stone-700"}`}
                >
                  {item.name}
                </p>
                <p className="text-xs text-stone-400">
                  {Math.round(item.totalQuantity * 10) / 10} {item.unit}
                </p>
              </div>
              <p className="text-xs text-stone-400 tabular-nums">
                ~{formatKr(item.estimatedPrice)}
              </p>
            </button>
          ))}
        </div>
      ))}

      {/* Upsell */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-700 mb-1">
          ✦ Matbudsjettet Premium
        </p>
        <p className="text-sm text-amber-600 leading-relaxed">
          Få prissammenligning på tvers av butikker, kaloriinnhold og automatisk
          handleliste til din favorittapp.
        </p>
      </div>
    </div>
  );
}

function SpartipsTab({ savingsTips }: { savingsTips: SavingsTip[] }) {
  const total = savingsTips.reduce((s, t) => s + t.savingsKr, 0);
  return (
    <div className="p-4 pb-8 flex flex-col gap-3">
      {/* Total savings banner */}
      <div className="bg-emerald-600 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">
          Ukens sparepotensial
        </p>
        <p className="text-4xl font-bold tabular-nums">{formatKr(total)}</p>
        <p className="text-sm opacity-75 mt-1">
          {savingsTips.length} tips tilgjengelig
        </p>
      </div>

      {savingsTips.length === 0 && (
        <p className="text-stone-400 text-sm text-center py-8">
          Ingen spartips for denne konfigurasjonen.
        </p>
      )}

      {savingsTips.map((tip) => (
        <div
          key={tip.id}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-3 items-start"
        >
          <span className="text-2xl leading-none mt-0.5">
            {TIP_ICONS[tip.type] ?? "💡"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 mb-1">
              {tip.title}
            </p>
            <p className="text-sm text-stone-500 leading-relaxed">
              {tip.description}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 flex-shrink-0">
            <p className="text-sm font-bold text-emerald-700 tabular-nums whitespace-nowrap">
              −{formatKr(tip.savingsKr)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "ukeplan", label: "Ukeplan" },
  { id: "handleliste", label: "Handleliste" },
  { id: "spartips", label: "Spartips" },
];

export default function Page() {
  const [state, dispatch] = useReducer(reducer, {
    config: initialConfig,
    activeTab: "ukeplan",
    plan: { meals: [], weeklyTotal: 0, staticWeeklyTotal: 0, totalSavings: 0, perDayAverage: 0, budgetDelta: 0, benchmarkDelta: 0, store: initialConfig.store, householdSize: initialConfig.householdSize, weeklyBudget: initialConfig.weeklyBudget },
    shoppingList: { groups: [], totalItems: 0, checkedItems: 0 },
    savingsTips: [],
  });

  useEffect(() => {
    buildAll(state.config).then((data) => dispatch({ type: "SET_ALL", data }));
  }, [state.config]);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-4 pt-8 pb-5">
        <div className="inline-flex items-center bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-4">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Gratis beta
          </span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 leading-tight mb-2">
          Spar penger på<br />ukeshandelen
        </h1>
        <p className="text-sm text-stone-400 leading-relaxed mb-5">
          Planlegg middager, få handleliste og se hva du faktisk sparer.
        </p>
        <ConfigCard config={state.config} dispatch={dispatch} />
        <div className="mt-4">
          <SummaryGrid plan={state.plan} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100 flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => dispatch({ type: "SET_TAB", tab: t.id })}
            className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer
              ${state.activeTab === t.id
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {state.activeTab === "ukeplan" && <UkeplanTab plan={state.plan} />}
      {state.activeTab === "handleliste" && (
        <HandlelisterTab shoppingList={state.shoppingList} dispatch={dispatch} />
      )}
      {state.activeTab === "spartips" && (
        <SpartipsTab savingsTips={state.savingsTips} />
      )}
    </div>
  );
}
