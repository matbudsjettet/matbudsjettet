"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [plan, setPlan] = useState<any>(null);
  const [budget, setBudget] = useState(500);
  const [store, setStore] = useState("KIWI");
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

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
          name: "Taco",
          items: [
            { name: "Tacokit", price: 49 },
            { name: "Kjøttdeig", price: 69 },
          ],
        },
        {
          name: "Pølser + brød",
          items: [
            { name: "Pølser", price: 36 },
            { name: "Brød", price: 27 },
          ],
        },
      ];

      const storeMultiplier =
        store === "KIWI" ? 0.9 : store === "REMA 1000" ? 1 : 1.2;

      let selectedMeals: any[] = [];
      let shopping: any = {};
      let total = 0;

      for (let meal of meals.sort(() => 0.5 - Math.random())) {
        let mealTotal =
          meal.items.reduce(
            (sum: number, item: any) => sum + item.price,
            0
          ) * storeMultiplier;

        if (total + mealTotal <= budget) {
          selectedMeals.push(meal);

          meal.items.forEach((item: any) => {
            if (!shopping[item.name]) {
              shopping[item.name] = Math.round(
                item.price * storeMultiplier
              );
            }
          });

          total += mealTotal;
        }
      }

      setPlan({
        meals: selectedMeals,
        shopping,
        total: Math.round(total),
        savings: Math.max(0, normalWeeklySpend - total),
        cheapestMeal: selectedMeals[0],
      });

      setLoading(false);
    }, 800);
  };

  const shareResult = () => {
    const text = `💸 I spent ONLY ${plan.total} kr on food this week 🇳🇴

🔥 Saved ${plan.savings} kr

Can you beat me?

👉 matbudsjettet.app`;

    navigator.clipboard.writeText(text);
    alert("Copied! Post it 🚀");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-2">Matbudsjettet</h1>
      <p className="text-gray-400 mb-4">
        Hvor billig kan du spise i Norge? 🇳🇴
      </p>

      {/* STORE SELECTOR */}
      <div className="flex gap-2 mb-4">
        {["KIWI", "REMA 1000", "MENY"].map((s) => (
          <button
            key={s}
            onClick={() => setStore(s)}
            className={`px-4 py-2 rounded-full ${
              store === s
                ? "bg-white text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* BUDGET */}
      <p className="mb-2">Budsjett: {budget} kr / uke</p>
      <input
        type="range"
        min="200"
        max="1000"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-full max-w-md mb-6"
      />

      {/* GENERATE BUTTON */}
      <button
        onClick={generatePlan}
        className="bg-white text-black px-6 py-3 rounded-xl mb-6 hover:scale-105 transition"
      >
        Generate plan 🔁
      </button>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400 animate-pulse">
          ⚡ Finner billigste måltider...
        </p>
      )}

      {/* RESULT */}
      {plan && !loading && (
        <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-lg">

          {/* DAILY HOOK */}
          <p className="text-green-400 mb-2">
            🔥 Billigste måltid i dag:
          </p>
          <p className="font-bold mb-4">
            {plan.cheapestMeal?.name}
          </p>

          {/* LOSS TRIGGER */}
          <p className="text-red-400 text-sm mb-4">
            ⚠️ Du overbetaler ca {plan.savings} kr hver uke
          </p>

          {/* MEALS */}
          <h2 className="text-lg font-semibold mb-2">🍽 Måltider</h2>
          <ul className="mb-4">
            {plan.meals.map((meal: any, i: number) => (
              <li key={i}>• {meal.name}</li>
            ))}
          </ul>

          {/* SHOPPING */}
          <h2 className="text-lg font-semibold mb-2">🛒 Handleliste</h2>
          <ul className="mb-4">
            {Object.entries(plan.shopping).map(([name, price]: any) => (
              <li key={name}>
                • {name} — {price} kr
              </li>
            ))}
          </ul>

          {/* TOTAL */}
          <p className="text-2xl font-bold mb-2">
            💰 {plan.total} kr / uke
          </p>

          {/* SAVINGS */}
          <p className="text-green-400 mb-4">
            🔥 Sparte {plan.savings} kr denne uka
          </p>

          {/* SHARE */}
          <button
            onClick={shareResult}
            className="bg-green-500 w-full text-black py-3 rounded-xl hover:scale-105 transition mb-3"
          >
            Del resultat 🚀
          </button>

          {/* PREMIUM BLOCK */}
          {!isPremium ? (
            <div className="bg-yellow-500 text-black p-4 rounded-xl text-sm">
              🔒 Premium: Se billigste butikk + eksakt handleliste
              <button
                onClick={() => setIsPremium(true)}
                className="bg-black text-white w-full mt-3 py-2 rounded-lg"
              >
                Unlock Premium 🔓
              </button>
            </div>
          ) : (
            <div className="bg-green-600 p-4 rounded-xl text-sm">
              ✅ Beste butikk denne uka: {store}
              <p className="mt-2">
                👉 Gå hit og kjøp eksakt denne handlelisten
              </p>
            </div>
          )}
        </div>
      )}

      {/* STICKY CTA */}
      <button
        onClick={generatePlan}
        className="fixed bottom-6 bg-white text-black px-6 py-3 rounded-full shadow-lg hover:scale-110 transition"
      >
        🔁 Ny plan
      </button>
    </main>
  );
}