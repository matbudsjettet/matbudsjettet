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
    const baseMeals = [
      { name: "Havregrøt", base: 15 },
      { name: "Pasta + saus", base: 25 },
      { name: "Pølser + brød", base: 35 },
      { name: "Omelett", base: 30 },
      { name: "Kylling + ris", base: 55 },
      { name: "Taco", base: 65 },
      { name: "Fiskekaker", base: 60 },
      { name: "Laks", base: 90 },
      { name: "Biff", base: 120 },
    ];

    const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

    // 🔥 KEY PART — scaling factor
    const scale = budget / 500; 
    // 500 = "normal budget baseline"

    const meals = days.map((day, i) => {
      const meal = baseMeals[Math.floor(Math.random() * baseMeals.length)];

      const price = Math.round(meal.base * scale);

      return {
        day,
        name: meal.name,
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
};const scale = Math.max(0.6, Math.min(2, budget / 500));