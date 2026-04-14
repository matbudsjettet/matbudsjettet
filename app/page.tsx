"use client";

import { useState, useEffect } from "react";

type Meal = {
  day: string;
  name: string;
  price: number;
};

export default function Home() {
  const [budget, setBudget] = useState(500);
  const [store, setStore] = useState("KIWI");
  const [plan, setPlan] = useState<{ meals: Meal[]; total: number; savings: number } | null>(null);
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
      const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

      // 🔥 REALISTIC BASE DATA
      const mealDatabase = [
        { name: "Havregrøt", base: 15 },
        { name: "Pasta + saus", base: 30 },
        { name: "Pølser + brød", base: 40 },
        { name: "Omelett", base: 35 },
        { name: "Kylling + ris", base: 65 },
        { name: "Taco", base: 75 },
        { name: "Fiskekaker + poteter", base: 70 },
        { name: "Laks + ris", base: 95 },
        { name: "Biff + poteter", base: 120 },
      ];

      // 🔥 STORE PRICE MULTIPLIER
      const storeMultiplier =
        store === "KIWI" ? 0.9 :
        store === "REMA 1000" ? 1 :
        1.25; // MENY expensive

      // 🔥 BUDGET TARGET PER MEAL
      const targetPerMeal = budget / 7;

      const meals: Meal[] = days.map((day) => {
        // pick meal closest to budget target
        const sorted = mealDatabase.sort((a, b) =>
          Math.abs(a.base - targetPerMeal) - Math.abs(b.base - targetPerMeal)
        );

        const chosen = sorted[Math.floor(Math.random() * 3)];

        const price = Math.round(chosen.base * storeMultiplier);

        return {
          day,
          name: chosen.name,
          price,
        };
      });

      const total = meals.reduce((sum, m) => sum + m.price, 0);

      setPlan({
        meals,
        total,
        savings: Math.max(0, normalWeeklySpend - total),
      });

      setLoading(false);
    }, 300);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2 text-center">
        Matprisene i Norge er galne 🇳🇴
      </h1>
      <p className="text-gray-400 mb-4">
        Vi hjelper deg spise bra for mindre
      </p>

      {isPremium && (
        <div className="text-yellow-400 mb-4">⭐ Premium aktiv</div>
      )}

      {/* STORE SELECT */}
      <div className="flex gap-2 mb-4">
        {["KIWI", "REMA 1000", "MENY"].map((s) => (
          <button
            key={s}
            onClick={() => setStore(s)}
            className={`px-4 py-2 rounded-full ${
              store === s ? "bg-white text-black" : "bg-gray-800"
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
        max="1500"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-72 mb-6"
      />

      {/* BUTTON */}
      <button
        onClick={generatePlan}
        className="bg-white text-black px-6 py-3 rounded-lg mb-6"
      >
        Ny plan 🔄
      </button>

      {loading && <p>Lager plan...</p>}

      {plan && (
        <>
          {/* TOTAL */}
          <div className="text-center mb-6">
            <p className="text-gray-400">Estimert ukeskost</p>
            <h2 className="text-4xl font-bold">{plan.total} kr</h2>

            <p className="text-green-400 mt-2">
              Du sparer {plan.savings} kr 🎉
            </p>
          </div>

          {/* MEALS */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {plan.meals.map((meal, i) => (
              <div key={i} className="bg-gray-900 p-4 rounded-xl">
                <p className="text-gray-400 text-sm">{meal.day}</p>
                <h3 className="font-semibold">{meal.name}</h3>
                <p className="text-gray-400 text-sm">{meal.price} kr</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PREMIUM */}
      {!isPremium && (
        <div className="mt-8 bg-yellow-500 text-black p-4 rounded-xl text-center">
          🔒 Premium: billigste butikk + smart handleliste
          <button
            onClick={() => setIsPremium(true)}
            className="block mt-3 bg-black text-white px-4 py-2 rounded-lg"
          >
            Unlock Premium
          </button>
        </div>
      )}

      {/* SHARE */}
      <button className="fixed bottom-6 bg-green-500 text-black px-6 py-3 rounded-full">
        Del resultat 🚀
      </button>
    </main>
  );
}