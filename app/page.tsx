"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [plan, setPlan] = useState<any>(null);
  const [budget, setBudget] = useState(500);
  const [store, setStore] = useState("KIWI");
  const [loading, setLoading] = useState(false);

  const normalWeeklySpend = 900;

  useEffect(() => {
    generatePlan();
  }, [budget, store]);

  const generatePlan = () => {
    setLoading(true);
    setPlan(null);

    setTimeout(() => {
      const meals = [
        {
          name: "Pasta + kjøttdeig",
          items: [
            { name: "Kjøttdeig", price: 69 },
            { name: "First Price pasta", price: 14 },
            { name: "Tomatsaus", price: 22 },
          ],
        },
        {
          name: "Kylling + ris",
          items: [
            { name: "Kyllingfilet", price: 79 },
            { name: "Ris", price: 24 },
            { name: "Soyasaus", price: 18 },
          ],
        },
        {
          name: "Omelett",
          items: [
            { name: "Egg (12pk)", price: 36 },
            { name: "Norvegia", price: 45 },
            { name: "Melk", price: 19 },
          ],
        },
        {
          name: "Pølser + brød",
          items: [
            { name: "Gilde pølser", price: 39 },
            { name: "Brød", price: 27 },
          ],
        },
        {
          name: "Fiskekaker + poteter",
          items: [
            { name: "Fiskekaker", price: 49 },
            { name: "Poteter", price: 29 },
          ],
        },
        {
          name: "Grønnsakssuppe",
          items: [
            { name: "Grønnsaker", price: 35 },
            { name: "Kraft", price: 18 },
          ],
        },
      ];

      const storeMultiplier =
        store === "KIWI" ? 0.9 : store === "REMA 1000" ? 1 : 1.2;

      const shuffled = [...meals].sort(() => Math.random() - 0.5);

      let selectedMeals: any[] = [];
      let shoppingMap: any = {};
      let total = 0;

      for (let meal of shuffled) {
        let mealCost = meal.items.reduce(
          (sum: number, item: any) =>
            sum + item.price * storeMultiplier,
          0
        );

        if (total + mealCost <= budget) {
          selectedMeals.push(meal);

          meal.items.forEach((item: any) => {
            if (!shoppingMap[item.name]) {
              shoppingMap[item.name] = 0;
            }
            shoppingMap[item.name] += item.price * storeMultiplier;
          });

          total += mealCost;
        }
      }

      const savings = normalWeeklySpend - total;

      setPlan({
        meals: selectedMeals,
        shopping: shoppingMap,
        total: Math.round(total),
        savings: Math.round(savings),
      });

      setLoading(false);
    }, 600);
  };

  const shareResult = () => {
    const text = `Jeg spiser for ${plan.total} kr/uke 💰 Sparte ${plan.savings} kr 🇳🇴`;

    navigator.clipboard.writeText(text);
    alert("Kopiert! Del på Snap / TikTok 🔥");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8">

      <h1 className="text-4xl font-bold mb-1">Matbudsjettet</h1>

      <p className="text-gray-400 mb-6 text-center">
        Planlegg ukens mat billigere 🇳🇴
      </p>

      {/* STORE */}
      <div className="flex gap-2 mb-4">
        {["KIWI", "REMA 1000", "MENY"].map((s) => (
          <button
            key={s}
            onClick={() => setStore(s)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              store === s
                ? "bg-white text-black scale-105"
                : "bg-zinc-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* BUDGET */}
      <p className="mb-2 text-sm text-gray-300">
        Budsjett: {budget} kr / uke
      </p>

      <input
        type="range"
        min="200"
        max="1200"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-full max-w-md mb-6"
      />

      {/* BUTTON */}
      <button
        onClick={generatePlan}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold mb-6 active:scale-95 transition"
      >
        {plan ? "Ny plan 🔁" : "Generer plan"}
      </button>

      {/* LOADING */}
      {loading && (
        <div className="text-gray-400 animate-pulse">
          🤖 Lager handleliste...
        </div>
      )}

      {/* RESULT */}
      {plan && !loading && (
        <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md shadow-xl">

          <h2 className="text-lg mb-3">🍽 Måltider</h2>
          <ul className="mb-5 space-y-1 text-sm text-gray-200">
            {plan.meals.map((meal: any, i: number) => (
              <li key={i}>• {meal.name}</li>
            ))}
          </ul>

          <h2 className="text-lg mb-3">🛒 Handleliste</h2>
          <ul className="mb-5 space-y-1 text-sm text-gray-300">
            {Object.entries(plan.shopping).map(([name, price]: any, i) => (
              <li key={i}>
                • {name} — {Math.round(price)} kr
              </li>
            ))}
          </ul>

          <p className="text-2xl font-bold mb-2">
            💰 {plan.total} kr / uke
          </p>

          <p className="text-green-400 mb-5 font-medium">
            Sparer ca. {plan.savings} kr per uke
          </p>

          <button
            onClick={shareResult}
            className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold w-full active:scale-95 transition"
          >
            Del resultat 🚀
          </button>

          <div className="mt-6 bg-yellow-500 text-black p-4 rounded-xl text-sm font-medium">
            🔒 Premium kommer snart:  
            Eksakte priser + billigste butikk automatisk
          </div>

        </div>
      )}
    </main>
  );
}