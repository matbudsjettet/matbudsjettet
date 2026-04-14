"use client";

import { useState, useEffect } from "react";

type Meal = {
  name: string;
  price: number;
  ingredients: string[];
  tag: string;
};

export default function Home() {
  const [budget, setBudget] = useState(700);
  const [store, setStore] = useState("KIWI");
  const [activeTab, setActiveTab] = useState("plan");
  const [meals, setMeals] = useState<any[]>([]);

  const normalWeeklySpend = 950;

  const mealDatabase: Meal[] = [
    { name: "Havregrøt", price: 15, ingredients: ["Havregryn", "Melk"], tag: "Enkel" },
    { name: "Pasta + saus", price: 30, ingredients: ["Pasta", "Tomatsaus"], tag: "Enkel" },
    { name: "Pølser + brød", price: 40, ingredients: ["Pølser", "Brød"], tag: "Enkel" },
    { name: "Omelett", price: 35, ingredients: ["Egg", "Ost"], tag: "Protein" },
    { name: "Kylling + ris", price: 65, ingredients: ["Kylling", "Ris"], tag: "Protein" },
    { name: "Taco", price: 75, ingredients: ["Kjøttdeig", "Lefser"], tag: "Favoritt" },
    { name: "Fiskekaker", price: 70, ingredients: ["Fiskekaker", "Poteter"], tag: "Protein" },
    { name: "Linsesuppe", price: 40, ingredients: ["Linser", "Grønnsaker"], tag: "Vegetar" },
    { name: "Laks + ris", price: 95, ingredients: ["Laks", "Ris"], tag: "Premium" },
    { name: "Biff + poteter", price: 120, ingredients: ["Biff", "Poteter"], tag: "Premium" },
  ];

  const generatePlan = () => {
    const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
    const targetPerDay = budget / 7;

    const storeMultiplier =
      store === "KIWI" ? 0.9 :
      store === "REMA 1000" ? 1 :
      1.25;

    const selected = days.map((day) => {
      const sorted = mealDatabase.sort(
        (a, b) =>
          Math.abs(a.price - targetPerDay) -
          Math.abs(b.price - targetPerDay)
      );

      const meal = sorted[Math.floor(Math.random() * 3)];

      return {
        day,
        ...meal,
        price: Math.round(meal.price * storeMultiplier),
      };
    });

    setMeals(selected);
  };

  useEffect(() => {
    generatePlan();
  }, [budget, store]);

  const total = meals.reduce((sum, m) => sum + m.price, 0);
  const perDay = Math.round(total / 7);
  const savings = Math.max(0, normalWeeklySpend - total);

  const groceryList = Array.from(
    new Set(meals.flatMap((m) => m.ingredients))
  );

  return (
    <main className="min-h-screen bg-white text-black px-4 py-8 max-w-xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold text-center">
        Matprisene i Norge er galne 🇳🇴
      </h1>
      <p className="text-center text-gray-500 mb-6">
        Vi hjelper deg spise bra for mindre
      </p>

      {/* STORE */}
      <div className="flex gap-2 justify-center mb-4">
        {["KIWI", "REMA 1000", "MENY"].map((s) => (
          <button
            key={s}
            onClick={() => setStore(s)}
            className={`px-3 py-1 rounded-full ${
              store === s ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* BUDGET PRESETS */}
      <div className="flex gap-2 justify-center mb-4">
        {[400, 700, 1000, 1400].map((b) => (
          <button
            key={b}
            onClick={() => setBudget(b)}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            {b} kr
          </button>
        ))}
      </div>

      {/* SLIDER */}
      <input
        type="range"
        min="200"
        max="1500"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-full mb-4"
      />

      <p className="text-center mb-4">Budsjett: {budget} kr</p>

      {/* STATS */}
      <div className="grid grid-cols-3 text-center mb-6">
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-bold">{total} kr</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Per dag</p>
          <p className="font-bold">{perDay} kr</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sparer</p>
          <p className="font-bold text-green-600">{savings} kr</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-6">
        {[
          { id: "plan", label: "Ukeplan" },
          { id: "list", label: "Handleliste" },
          { id: "tips", label: "Spartips" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-1 ${
              activeTab === tab.id
                ? "border-b-2 border-black"
                : "text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PLAN */}
      {activeTab === "plan" && (
        <div className="grid grid-cols-2 gap-3">
          {meals.map((m, i) => (
            <div key={i} className="border p-3 rounded-lg">
              <p className="text-sm text-gray-500">{m.day}</p>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-gray-500">{m.price} kr</p>
              <p className="text-xs mt-1">{m.tag}</p>
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {activeTab === "list" && (
        <ul className="space-y-2">
          {groceryList.map((item, i) => (
            <li key={i} className="border p-2 rounded">
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* TIPS */}
      {activeTab === "tips" && (
        <div className="space-y-3 text-sm">
          <p>🛒 Handle på KIWI for lavest pris</p>
          <p>🥩 Bytt biff med kylling for å spare 30%</p>
          <p>🥦 Velg vegetar 2x i uka for lavere kost</p>
          <p>📦 Kjøp First Price varer</p>
        </div>
      )}
    </main>
  );
}