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
      let meals;

      // 🔻 LOW BUDGET
      if (budget < 400) {
        meals = [
          { day: "Man", name: "Havregrøt", price: 15 },
          { day: "Tir", name: "Pølser + brød", price: 35 },
          { day: "Ons", name: "Pasta", price: 25 },
          { day: "Tor", name: "Egg + brød", price: 20 },
          { day: "Fre", name: "Ris + soyasaus", price: 18 },
          { day: "Lør", name: "Nudler", price: 15 },
          { day: "Søn", name: "Pasta", price: 25 },
        ];
      }

      // 🔻 MID BUDGET
      else if (budget < 800) {
        meals = [
          { day: "Man", name: "Grønnsakssuppe", price: 36 },
          { day: "Tir", name: "Pølser + brød", price: 45 },
          { day: "Ons", name: "Taco", price: 63 },
          { day: "Tor", name: "Omelett", price: 40 },
          { day: "Fre", name: "Kylling + ris", price: 59 },
          { day: "Lør", name: "Fiskekaker + poteter", price: 59 },
          { day: "Søn", name: "Pasta + kjøttdeig", price: 65 },
        ];
      }

      // 🔻 HIGH BUDGET
      else {
        meals = [
          { day: "Man", name: "Laks + ris", price: 95 },
          { day: "Tir", name: "Biff + poteter", price: 120 },
          { day: "Ons", name: "Kyllingfilet + grønnsaker", price: 85 },
          { day: "Tor", name: "Taco (premium)", price: 90 },
          { day: "Fre", name: "Sushi hjemme", price: 110 },
          { day: "Lør", name: "Burger + fries", price: 100 },
          { day: "Søn", name: "Laks igjen", price: 95 },
        ];
      }

      const total = meals.reduce((sum, m) => sum + m.price, 0);

      setPlan({
        meals,
        total,
        savings: Math.max(0, normalWeeklySpend - total),
      });

      setLoading(false);
    }, 400);
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

      {/* PREMIUM STATUS */}
      {isPremium && (
        <div className="text-yellow-400 mb-4">⭐ Premium aktiv</div>
      )}

      {/* STORE SELECTOR */}
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

      {/* RESULT */}
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

          {/* MEAL GRID */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {plan.meals.map((meal: any, i: number) => (
              <div
                key={i}
                className="bg-gray-900 p-4 rounded-xl shadow"
              >
                <p className="text-gray-400 text-sm">{meal.day}</p>
                <h3 className="font-semibold">{meal.name}</h3>
                <p className="text-gray-400 text-sm">{meal.price} kr</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PREMIUM BLOCK */}
      {!isPremium && (
        <div className="mt-8 bg-yellow-500 text-black p-4 rounded-xl text-center">
          🔒 Premium: Få billigste butikk + eksakt handleliste
          <button
            onClick={() => setIsPremium(true)}
            className="block mt-3 bg-black text-white px-4 py-2 rounded-lg"
          >
            Unlock Premium
          </button>
        </div>
      )}

      {/* SHARE CTA */}
      <button className="fixed bottom-6 bg-green-500 text-black px-6 py-3 rounded-full">
        Del resultat 🚀
      </button>
    </main>
  );
}