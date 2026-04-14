"use client";

import { useState, useEffect } from "react";

const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export default function Home() {
  const [plan, setPlan] = useState<any>(null);
  const [budget, setBudget] = useState(500);
  const [store, setStore] = useState("KIWI");
  const [loading, setLoading] = useState(false);

  const normalWeeklySpend = 900;

  // 🔥 LOAD SAVED PREFS
  useEffect(() => {
    const savedBudget = localStorage.getItem("budget");
    const savedStore = localStorage.getItem("store");

    if (savedBudget) setBudget(Number(savedBudget));
    if (savedStore) setStore(savedStore);
  }, []);

  // 🔥 SAVE PREFS
  useEffect(() => {
    localStorage.setItem("budget", String(budget));
    localStorage.setItem("store", store);
  }, [budget, store]);

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
          price: 60,
          items: ["Kjøttdeig", "Pasta", "Tomatsaus"],
        },
        {
          name: "Kylling + ris",
          price: 65,
          items: ["Kylling", "Ris", "Soyasaus"],
        },
        {
          name: "Omelett",
          price: 45,
          items: ["Egg", "Ost", "Melk"],
        },
        {
          name: "Taco",
          price: 70,
          items: ["Tacokit", "Kjøttdeig"],
        },
        {
          name: "Pølser + brød",
          price: 50,
          items: ["Pølser", "Brød"],
        },
        {
          name: "Fiskekaker + poteter",
          price: 65,
          items: ["Fiskekaker", "Poteter"],
        },
        {
          name: "Grønnsakssuppe",
          price: 40,
          items: ["Grønnsaker", "Kraft"],
        },
      ];

      const storeMultiplier =
        store === "KIWI" ? 0.9 : store === "REMA 1000" ? 1 : 1.2;

      let weekPlan: any[] = [];
      let total = 0;

      for (let i = 0; i < 7; i++) {
        const meal = meals[Math.floor(Math.random() * meals.length)];
        const price = Math.round(meal.price * storeMultiplier);

        weekPlan.push({
          day: days[i],
          ...meal,
          price,
        });

        total += price;
      }

      setPlan({
        weekPlan,
        total,
        savings: Math.max(0, normalWeeklySpend - total),
      });

      setLoading(false);
    }, 600);
  };

  const shareResult = () => {
    const text = `💸 Jeg brukte kun ${plan.total} kr på mat denne uka 🇳🇴

🔥 Sparte ${plan.savings} kr

Klarer du slå meg?

👉 matbudsjettet.vercel.app`;

    navigator.clipboard.writeText(text);
    alert("Kopiert! 🚀");
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center">

      {/* HEADLINE */}
      <h1 className="text-3xl font-bold text-center mb-2">
        Matprisene i Norge er galne 🇳🇴
      </h1>
      <p className="text-gray-400 text-center mb-6">
        Vi hjelper deg spise bra for mindre
      </p>

      {/* STORE */}
      <div className="flex gap-2 mb-4">
        {["KIWI", "REMA 1000", "MENY"].map((s) => (
          <button
            key={s}
            onClick={() => setStore(s)}
            className={`px-3 py-1 rounded-full text-sm ${
              store === s
                ? "bg-white text-black"
                : "bg-gray-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* BUDGET */}
      <p className="mb-1 text-sm">Budsjett: {budget} kr</p>
      <input
        type="range"
        min="200"
        max="1000"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-full max-w-md mb-4"
      />

      <button
        onClick={generatePlan}
        className="bg-white text-black px-5 py-2 rounded-xl mb-6"
      >
        Ny plan 🔁
      </button>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400 animate-pulse">
          ⚡ Lager billig plan...
        </p>
      )}

      {/* RESULT */}
      {plan && !loading && (
        <div className="w-full max-w-md">

          {/* BIG NUMBER */}
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">
              Estimert ukeskost
            </p>
            <p className="text-4xl font-bold">
              {plan.total} kr
            </p>
            <p className="text-green-400 text-sm">
              Sparte {plan.savings} kr
            </p>
          </div>

          {/* WEEK PLAN */}
          <div className="grid grid-cols-2 gap-3">
            {plan.weekPlan.map((day: any, i: number) => (
              <div
                key={i}
                className="bg-gray-900 p-3 rounded-xl"
              >
                <p className="text-xs text-gray-400">
                  {day.day}
                </p>
                <p className="font-semibold text-sm">
                  {day.name}
                </p>
                <p className="text-xs text-gray-500">
                  {day.price} kr
                </p>
              </div>
            ))}
          </div>

          {/* SHARE */}
          <button
            onClick={shareResult}
            className="bg-green-500 w-full mt-4 py-3 rounded-xl text-black"
          >
            Del resultat 🚀
          </button>
        </div>
      )}
    </main>
  );
}