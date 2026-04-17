import { NextResponse } from "next/server";
import { getPrices, type GroceryPriceMap } from "../../../lib/prices/getPrices";

let cachedPrices: GroceryPriceMap | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  const now = Date.now();

  if (cachedPrices && now - lastFetchTime < CACHE_DURATION_MS) {
    console.log("Serving prices from memory cache");
    return NextResponse.json({ prices: cachedPrices });
  }

  try {
    console.log("Fetching fresh prices from Kassal.app API...");
    const prices = await getPrices();
    
    cachedPrices = prices;
    lastFetchTime = now;
    
    return NextResponse.json({ prices });
  } catch (error) {
    console.error("API Route Error fetching prices:", error);
    
    // Fallback to stale cache if available, otherwise return empty object
    return NextResponse.json(
      { 
        prices: cachedPrices || {}, 
        error: "Failed to fetch fresh prices, using fallback" 
      },
      { status: cachedPrices ? 200 : 500 }
    );
  }
}
