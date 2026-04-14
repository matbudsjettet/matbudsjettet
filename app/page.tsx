"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [budget, setBudget] = useState(500);
  const [store, setStore] = useState("KIWI");
  const [plan, setPlan] = useState<any>(null);
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
        { day: "Man", name: "Grønnsakssuppe", price: 36 },
        { day: "Tir", name: "Pølser + brød", price: 45 },
        { day: "Ons", name: "Taco", price: 63 },
        { day: "Tor", name: "Grønnsakssuppe", price: 36 },
        { day: "Fre", name: "Kylling + ris", price: 59 },
        { day: "Lør", name: "Fiskekaker + poteter", price: 59 },
        { day: "Søn", name: "Pølser + brød", price: 45 },
      ];

      const total = meals.reduce((sum, m) => sum + m.price, 0);

      setPlan({ meals, total });
      setLoading(false);
    }, 500);
  };

  const overBudget = plan ? plan.total - budget : 0;
  const savingsVsNormal = plan ? normalWeeklySpend - plan.total : 0;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2 text-center">
        Matprisene i Norge er galne 🇳🇴
      </h1>

      <p className="text-gray-400 mb-4 text-center">
        Vi hjelper deg spise bra for mindre
      </p>

      {isPremium && (
        <p className="text-yellow-400 text-sm mb-4">
          ⭐ Premium aktiv
        </p>
      )}

      {/* STORE PICKER */}
      <div className="flex gap-3 mb-4">
        {["KIWI", "REMA 1000", "MENY"].map((s) => (
          <button
            key={s}
            onClick={() => setStore(s)}
            className={`px-4 py-2 rounded-full transition ${
              store === s ? "bg-white text-black" : "bg-gray-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* BUDGET */}
      <p className="mb-2">Budsjett: {budget} kr</p>

      <input
        type="range"
        min="200"
        max="1500"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-full max-w-md mb-6"
      />

      {/* GENERATE */}
      <button
        onClick={generatePlan}
        className="bg-white text-black px-6 py-3 rounded-lg mb-6 hover:scale-105 transition"
      >
        {loading ? "Lager plan..." : "Ny plan 🔄"}
      </button>

      {/* RESULT */}
      {plan && (
        <div className="w-full max-w-md">

          {/* TOTAL */}
          <div className="text-center mb-6">
            <p className="text-gray-400">Estimert ukeskost</p>

            <h2 className="text-4xl font-bold">{plan.total} kr</h2>

            {/* BUDGET STATUS */}
            {plan.total <= budget ? (
              <p className="text-green-400 mt-2">
                Du sparer {budget - plan.total} kr 🎉
              </p>
            ) : (
              <p className="text-red-400 mt-2">
                Du er {overBudget} kr over budsjett ⚠️
              </p>
            )}

            {/* VS NORMAL */}
            <p className="text-gray-500 text-sm mt-1">
              {savingsVsNormal > 0
                ? `Sparer ${savingsVsNormal} kr vs gjennomsnitt`
                : `Bruker ${Math.abs(savingsVsNormal)} kr mer enn snitt`}
            </p>
          </div>

          {/* MEAL CARDS */}
          <div className="grid grid-cols-2 gap-3">
            {plan.meals.map((meal: any, i: number) => (
              <div key={i} className="bg-gray-900 p-4 rounded-xl">
                <p className="text-gray-400 text-sm">{meal.day}</p>
                <p className="font-semibold">{meal.name}</p>
                <p className="text-gray-300 text-sm">{meal.price} kr</p>
              </div>
            ))}
          </div>

          {/* PREMIUM */}
          <div className="mt-6">
            {!isPremium ? (
              <div className="bg-yellow-400 text-black p-4 rounded-xl text-sm">
                🔒 Premium: Se billigste butikk + smartere handleliste
                <button
                  onClick={() => setIsPremium(true)}
                  className="mt-3 w-full bg-black text-white py-2 rounded-lg"
                >
                  Unlock Premium 🚀
                </button>
              </div>
            ) : (
              <div className="bg-green-600 p-4 rounded-xl text-sm">
                ✅ Beste butikk denne uka: <b>{store}</b>
                <p className="mt-1 text-green-100">
                  Basert på prisene for denne planen
                </p>
              </div>
            )}
          </div>

          {/* SHARE */}
          <button className="mt-6 w-full bg-green-500 text-black py-3 rounded-lg font-semibold hover:scale-105 transition">
            Del resultat 🚀
          </button>

        </div>
      )}
    </main>
  );
}