"use client";

import { useState, useEffect } from "react";

type Store = "KIWI" | "REMA 1000" | "MENY";

const STORE_MULTIPLIER: Record<Store, number> = {
  KIWI: 0.85,
  "REMA 1000": 1,
  MENY: 1.25,
};

const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const MEALS = [
  { name: "Pasta", base: 50 },
  { name: "Egg & brød", base: 40 },
  { name: "Ris & bønner", base: 55 },
  { name: "Kylling & ris", base: 90 },
  { name: "Taco", base: 120 },
  { name: "Laks", base: 160 },
  { name: "Biff", base: 220 },
  { name: "Burger", base: 140 },
  { name: "Suppe", base: 60 },
];

function generatePlan(budget: number, store: Store) {
  const multiplier = STORE_MULTIPLIER[store];
  const target = budget / 7;

  let total = 0;
  const plan = [];

  for (let i = 0; i < 7; i++) {
    const remainingDays = 7 - i;
    const remainingBudget = budget - total;
    const maxPerDay = remainingBudget / remainingDays;

    let pool = MEALS.filter(
      (m) => m.base * multiplier <= maxPerDay * 1.3
    );

    if (pool.length === 0) pool = MEALS;

    const meal = pool[Math.floor(Math.random() * pool.length)];
    const price = Math.round(meal.base * multiplier);

    total += price;

    plan.push({
      day: DAYS[i],
      name: meal.name,
      price,
    });
  }

  return plan;
}

export default function App() {
  const [store, setStore] = useState<Store>("REMA 1000");
  const [budget, setBudget] = useState(700);
  const [plan, setPlan] = useState(generatePlan(700, "REMA 1000"));

  useEffect(() => {
    setPlan(generatePlan(budget, store));
  }, [budget, store]);

  const total = plan.reduce((sum, d) => sum + d.price, 0);

  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>
          Spar penger på mat 🇳🇴
        </h1>

        {/* STORE */}
        <div style={{ marginTop: 20 }}>
          {(["KIWI", "REMA 1000", "MENY"] as Store[]).map((s) => (
            <button
              key={s}
              onClick={() => setStore(s)}
              style={{
                marginRight: 8,
                padding: "8px 16px",
                borderRadius: 20,
                border: "1px solid #ddd",
                background: store === s ? "#111" : "#fff",
                color: store === s ? "#fff" : "#000",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* BUDGET */}
        <div style={{ marginTop: 20 }}>
          <p>Budsjett: {budget} kr</p>
          <input
            type="range"
            min={200}
            max={1500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* TOTAL */}
        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            marginTop: 20,
            border: "1px solid #eee",
          }}
        >
          <h2>Total: {total} kr</h2>
          <p style={{ color: "#666" }}>
            ≈ {Math.round((total / budget) * 100)}% av budsjett
          </p>
        </div>

        {/* PLAN */}
        <div style={{ marginTop: 20 }}>
          {plan.map((d, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: 16,
                marginBottom: 10,
                borderRadius: 10,
                border: "1px solid #eee",
              }}
            >
              <b>{d.day}</b> — {d.name} ({d.price} kr)
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <button
          onClick={() => setPlan(generatePlan(budget, store))}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#111",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Ny plan
        </button>

      </div>
    </div>
  );
}