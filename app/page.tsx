"use client";

import { useState } from "react";

type Store = "KIWI" | "REMA 1000" | "MENY";

const MEALS = [
  { name: "Pasta", price: 50 },
  { name: "Egg & bread", price: 40 },
  { name: "Chicken & rice", price: 90 },
  { name: "Soup", price: 60 },
  { name: "Taco", price: 120 },
  { name: "Burger", price: 140 },
];

export default function Page() {
  const [store, setStore] = useState<Store>("REMA 1000");
  const [budget, setBudget] = useState(700);

  const total = MEALS.reduce((sum, m) => sum + m.price, 0);

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      
      <h1 style={{ textAlign: "center" }}>
        Spar penger på mat 🇳🇴
      </h1>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        {(["KIWI", "REMA 1000", "MENY"] as Store[]).map((s) => (
          <button
            key={s}
            onClick={() => setStore(s)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid #ccc",
              background: store === s ? "black" : "white",
              color: store === s ? "white" : "black",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <p>Budsjett: {budget} kr</p>
        <input
          type="range"
          min={300}
          max={1500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ padding: 20, border: "1px solid #eee", borderRadius: 10, marginBottom: 20 }}>
        <strong>Total: {total} kr</strong>
        <div>≈ {Math.round((total / budget) * 100)}% av budsjett</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MEALS.map((meal, i) => (
          <div
            key={i}
            style={{
              padding: 15,
              border: "1px solid #eee",
              borderRadius: 10,
              background: "#fafafa",
            }}
          >
            {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"][i]} — {meal.name} ({meal.price} kr)
          </div>
        ))}
      </div>

    </div>
  );
}