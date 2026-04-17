"use client";

import { useReducer, useEffect, useState } from "react";
import { buildAll, formatKr, type Config, type MealPlan, type ShoppingList, type SavingsTip, type PlannedMeal } from "./logic";

// ─── State ────────────────────────────────────────────────────────────────────

const initialConfig: Config = { store: "REMA1000", householdSize: 2, weeklyBudget: 1000 };

type Tab = "home" | "detail";

interface State {
  config: Config;
  plan: MealPlan;
  shoppingList: ShoppingList;
  savingsTips: SavingsTip[];
  activeTab: Tab;
  selectedMeal: PlannedMeal | null;
}

type Action =
  | { type: "SET_STORE"; store: string }
  | { type: "SET_HOUSEHOLD"; size: number }
  | { type: "SET_BUDGET"; amount: number }
  | { type: "SET_TAB"; tab: Tab }
  | { type: "SELECT_MEAL"; meal: PlannedMeal | null }
  | { type: "SET_ALL"; data: Omit<State, "config" | "activeTab" | "selectedMeal"> };

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
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "SELECT_MEAL":
      return { ...state, selectedMeal: action.meal, activeTab: action.meal ? "detail" : "home" };
    default:
      return state;
  }
}

// ─── 2030 UI Components ───────────────────────────────────────────────────────

const IMAGES: Record<string, string> = {
  kjøtt: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
  fisk: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
  vegetar: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
  fjærkre: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
};

function MealCanvas3D({ mealName, category }: { mealName: string; category: string }) {
  const imgUrl = IMAGES[category] || IMAGES["vegetar"];
  
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 animate-float transition-transform duration-1000 ease-out hover:rotate-y-12 hover:-rotate-x-12 cursor-grab active:cursor-grabbing">
        {/* Deep drop shadow simulating 3D presence */}
        <div className="absolute inset-0 bg-black blur-3xl translate-y-16 scale-90 opacity-80" />
        {/* Rendered Food Image (Acting as 2.5D Model) */}
        <img 
          src={imgUrl} 
          alt={mealName} 
          className="relative w-full h-full object-cover rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10"
          style={{ filter: "contrast(1.1) saturate(1.2)" }} 
        />
        {/* Gloss overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-50 mix-blend-overlay pointer-events-none" />
      </div>
    </div>
  );
}

function CategoryToken3D({ label, active }: { label: string, active?: boolean }) {
  return (
    <div className={`px-6 py-3 rounded-full border backdrop-blur-md whitespace-nowrap transition-all duration-300 cursor-pointer
      ${active 
        ? "bg-white/10 border-brand text-brand shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
        : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="text-xs tracking-widest uppercase">{label}</span>
    </div>
  );
}

function GlassMealCard({ pm, onClick }: { pm: PlannedMeal, onClick: () => void }) {
  const imgUrl = IMAGES[pm.meal.category] || IMAGES["vegetar"];

  return (
    <div 
      onClick={onClick}
      className="group relative w-full rounded-[2rem] overflow-hidden glass-panel transition-all duration-500 hover:scale-[1.02] cursor-pointer"
    >
      <div className="h-72 w-full relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-10" />
         <img 
            src={imgUrl} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:rotate-2"
            alt={pm.meal.name}
         />
      </div>
      <div className="relative z-20 -mt-20 p-6 flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{pm.dayName}</p>
        <h3 className="text-2xl font-light text-foreground tracking-tight leading-snug">{pm.meal.name}</h3>
        
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
           <span className="text-xs text-white/40 tracking-wider uppercase">{pm.meal.cookTimeMinutes} min • {pm.meal.difficulty}</span>
           <span className="text-brand font-medium tracking-wide">{formatKr(pm.finalPrice)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screens ─────────────────────────────────────────────────────────────

function HomeView({ state, dispatch }: { state: State, dispatch: React.Dispatch<Action> }) {
  const featuredMeal = state.plan.meals[0];
  const categories = ["Alle", "Kjøtt", "Fisk", "Vegetar", "Fjærkre"];

  return (
    <div className="min-h-screen pb-32">
      {/* Hero 3D Section */}
      <section className="relative w-full h-[70vh] flex flex-col items-center justify-center pt-20 overflow-hidden">
        {/* Cinematic Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
        
        {featuredMeal ? (
          <>
            <div className="z-10 mt-10">
               <MealCanvas3D mealName={featuredMeal.meal.name} category={featuredMeal.meal.category} />
            </div>
            <div className="absolute bottom-12 z-20 flex flex-col items-center text-center px-6">
              <span className="text-brand text-xs tracking-[0.3em] uppercase mb-4">Ukesmenyens Høydepunkt</span>
              <h1 className="text-4xl sm:text-6xl font-grotesk font-light tracking-tighter text-white mb-2">{featuredMeal.meal.name}</h1>
              <p className="text-white/40 text-sm tracking-wide">En filmatisk matopplevelse hjemme.</p>
            </div>
          </>
        ) : (
          <div className="animate-pulse w-64 h-64 bg-white/5 rounded-full" />
        )}
      </section>

      {/* Category Strip */}
      <section className="px-6 sm:px-12 py-8 flex gap-4 overflow-x-auto no-scrollbar border-y border-white/5 mt-10">
        {categories.map((cat, i) => (
          <CategoryToken3D key={cat} label={cat} active={i === 0} />
        ))}
      </section>

      {/* Feed */}
      <section className="px-6 sm:px-12 pt-12">
        <h2 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-8 ml-2">Uken Din</h2>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {state.plan.meals.map(pm => (
            <div key={pm.meal.id} className="break-inside-avoid">
               <GlassMealCard pm={pm} onClick={() => dispatch({ type: "SELECT_MEAL", meal: pm })} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailView({ meal, dispatch }: { meal: PlannedMeal, dispatch: React.Dispatch<Action> }) {
  const imgUrl = IMAGES[meal.meal.category] || IMAGES["vegetar"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image Parallax Blur */}
      <div className="absolute inset-0 z-0">
        <img src={imgUrl} className="w-full h-[60vh] object-cover opacity-20" style={{ filter: "blur(60px)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      {/* Header */}
      <div className="relative z-20 p-6 flex justify-between items-center">
        <button 
          onClick={() => dispatch({ type: "SELECT_MEAL", meal: null })}
          className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white/70 hover:text-white hover:scale-105 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      {/* 3D Hero */}
      <div className="relative z-10 h-[50vh] flex items-center justify-center -mt-10">
        <MealCanvas3D mealName={meal.meal.name} category={meal.meal.category} />
      </div>

      {/* Glass Detail Panel */}
      <div className="relative z-20 glass-panel rounded-t-[3rem] min-h-[50vh] px-8 pt-12 pb-32 border-b-0">
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />
        
        <p className="text-brand text-xs tracking-[0.3em] uppercase mb-4">{meal.dayName}</p>
        <h1 className="text-4xl sm:text-5xl font-grotesk font-light tracking-tighter text-white mb-6 leading-tight">
          {meal.meal.name}
        </h1>
        
        <div className="flex gap-6 border-y border-white/5 py-6 mb-8">
           <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Tid</span>
              <span className="text-lg text-white/90">{meal.meal.cookTimeMinutes} min</span>
           </div>
           <div className="w-px bg-white/5" />
           <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Vanskelighet</span>
              <span className="text-lg text-white/90 capitalize">{meal.meal.difficulty}</span>
           </div>
           <div className="w-px bg-white/5" />
           <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Pris</span>
              <span className="text-lg text-brand">{formatKr(meal.finalPrice)}</span>
           </div>
        </div>

        <div>
           <h3 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-6">Ingredienser</h3>
           <ul className="space-y-4">
              {meal.meal.ingredients.map(ing => (
                 <li key={ing.name} className="flex justify-between items-center text-sm">
                    <span className="text-white/70">{ing.name}</span>
                    <span className="text-white/40">{ing.quantity} {ing.unit}</span>
                 </li>
              ))}
           </ul>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-background via-background/80 to-transparent">
         <button className="w-full glass-panel !bg-brand/10 !border-brand/30 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:!bg-brand/20 active:scale-[0.98]">
            <span className="text-brand font-medium tracking-widest uppercase text-sm">Bestill Ingredienser</span>
         </button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [state, dispatch] = useReducer(reducer, {
    config: initialConfig,
    activeTab: "home",
    selectedMeal: null,
    plan: { meals: [], weeklyTotal: 0, staticWeeklyTotal: 0, totalSavings: 0, perDayAverage: 0, budgetDelta: 0, benchmarkDelta: 0, store: initialConfig.store, householdSize: initialConfig.householdSize, weeklyBudget: initialConfig.weeklyBudget },
    shoppingList: { groups: [], totalItems: 0, checkedItems: 0 },
    savingsTips: [],
  });

  useEffect(() => {
    buildAll(state.config).then((data) => dispatch({ type: "SET_ALL", data }));
  }, [state.config]);

  // Luxury Top Nav (Glass)
  const NavBar = () => (
    <nav className="fixed top-0 w-full z-50 glass-panel !border-x-0 !border-t-0 rounded-none px-6 py-4 flex justify-between items-center">
      <div className="text-white font-grotesk tracking-tighter text-lg">Matbudsjettet<span className="text-brand">.</span></div>
      <div className="flex gap-4">
         <div className="text-xs tracking-widest text-white/40 uppercase">{formatKr(state.config.weeklyBudget)}</div>
      </div>
    </nav>
  );

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand/30">
      {state.activeTab === "home" && <NavBar />}
      
      {state.activeTab === "home" ? (
        <HomeView state={state} dispatch={dispatch} />
      ) : (
        state.selectedMeal && <DetailView meal={state.selectedMeal} dispatch={dispatch} />
      )}
    </div>
  );
}
