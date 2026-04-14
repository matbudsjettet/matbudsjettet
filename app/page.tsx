function generatePlan(budget: number, store: Store): DayPlan[] {
  const multiplier = STORE_MULTIPLIER[store];

  // ✅ FIX: include idx here
  const adjustedMeals = MEAL_DB.map((meal, idx) => ({
    meal,
    adjustedPrice: Math.round(meal.price * multiplier),
    idx,
  }));

  const budgetTier =
    budget <= 500 ? "low" : budget <= 900 ? "mid" : budget <= 1200 ? "high" : "premium";

  const tagSequences: Record<string, Tag[]> = {
    low: ["billig", "vegetar", "billig", "billig", "vegetar", "billig", "protein"],
    mid: ["protein", "vegetar", "billig", "protein", "vegetar", "protein", "billig"],
    high: ["protein", "vegetar", "protein", "premium", "protein", "vegetar", "protein"],
    premium: ["premium", "protein", "vegetar", "premium", "protein", "premium", "vegetar"],
  };

  const tagSeq = tagSequences[budgetTier];

  const jitter = () => (Math.random() - 0.5) * 0.15;

  const usedIndices = new Set<number>();
  const selected: DayPlan[] = [];

  let remainingBudget = budget;

  for (let i = 0; i < 7; i++) {
    const daysLeft = 7 - i;
    const targetForThisDay = remainingBudget / daysLeft;
    const preferredTag = tagSeq[i];

    const candidates = adjustedMeals.filter((item) => {
      if (usedIndices.has(item.idx)) return false;
      const ratio = item.adjustedPrice / targetForThisDay;
      return ratio > 0.4 && ratio < 1.7;
    });

    const scored = candidates.map((item) => {
      const tagBonus = item.meal.tag === preferredTag ? 0 : 1;
      const priceScore = Math.abs(item.adjustedPrice / targetForThisDay - 1);
      return { ...item, score: tagBonus * 0.4 + priceScore + jitter() };
    });

    scored.sort((a, b) => a.score - b.score);

    let pick = scored[0];

    if (!pick) {
      const fallback = adjustedMeals
        .filter((item) => !usedIndices.has(item.idx))
        .sort(
          (a, b) =>
            Math.abs(a.adjustedPrice - targetForThisDay) -
            Math.abs(b.adjustedPrice - targetForThisDay)
        )[0];

      if (!fallback) break;
      pick = { ...fallback, score: 0 };
    }

    usedIndices.add(pick.idx);
    remainingBudget -= pick.adjustedPrice;

    selected.push({
      ...DAYS[i],
      meal: { ...pick.meal, price: pick.adjustedPrice },
    });
  }

  let total = selected.reduce((s, d) => s + d.meal.price, 0);
  const maxTotal = budget * 1.05;
  const minTotal = budget * 0.88;

  if (total > maxTotal) {
    let tries = 0;
    while (total > maxTotal && tries < 10) {
      tries++;
      const priciest = selected.reduce((max, d, i) =>
        d.meal.price > selected[max].meal.price ? i : max,
        0
      );

      const cheaperMeal = adjustedMeals
        .filter((item) => !usedIndices.has(item.idx)) // ✅ FIX
        .sort((a, b) => a.adjustedPrice - b.adjustedPrice)[0];

      if (!cheaperMeal) break;

      total -= selected[priciest].meal.price;
      total += cheaperMeal.adjustedPrice;

      selected[priciest] = {
        ...selected[priciest],
        meal: { ...cheaperMeal.meal, price: cheaperMeal.adjustedPrice },
      };

      usedIndices.add(cheaperMeal.idx);
    }
  }

  if (total < minTotal) {
    const cheapestIdx = selected.reduce((min, d, i) =>
      d.meal.price < selected[min].meal.price ? i : min,
      0
    );

    const pricierMeal = adjustedMeals
      .filter((item) => !usedIndices.has(item.idx)) // ✅ FIX
      .sort(
        (a, b) =>
          Math.abs(a.adjustedPrice - budget / 7) -
          Math.abs(b.adjustedPrice - budget / 7)
      )[0];

    if (pricierMeal) {
      selected[cheapestIdx] = {
        ...selected[cheapestIdx],
        meal: { ...pricierMeal.meal, price: pricierMeal.adjustedPrice },
      };
    }
  }

  return selected;
}