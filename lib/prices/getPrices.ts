export interface GroceryPriceMap {
  [key: string]: number;
}

export async function getPrices(): Promise<GroceryPriceMap> {
  const apiKey = process.env.KASSAL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing KASSAL_API_KEY environment variable. Please set it before running this script.");
  }

  // Hardcoded search queries
  const queries = [
    { id: "kjottdeig", query: "kjøttdeig" },
    { id: "kyllingfilet", query: "kyllingfilet" },
    { id: "ris", query: "jasminris" },
    { id: "pasta", query: "spaghetti" }
  ];

  const priceMap: GroceryPriceMap = {};

  for (const item of queries) {
    try {
      // Fetching from Kassal.app API (v1 products search)
      const response = await fetch(`https://kassal.app/api/v1/products?search=${encodeURIComponent(item.query)}&size=1`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${item.query}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const product = data.data?.[0]; // Extract the first product from the results

      if (product) {
        const price = product.current_price?.price;
        const productName = product.name;
        const storeName = product.store?.name || "Unknown Store";

        if (price !== undefined) {
          priceMap[item.id] = price;
          console.log(`Extracted: ${productName} (fra ${storeName}) -> ${price} kr`);
        }
      } else {
        console.log(`No results found for query: ${item.query}`);
      }
    } catch (error) {
      console.error(`Error fetching ${item.query}:`, error);
    }
  }

  return priceMap;
}

export async function runPriceTest() {
  try {
    console.log("=== Running Kassal.app API Price Test ===");
    const prices = await getPrices();
    console.log("\nFinal Price Object:");
    console.log(JSON.stringify(prices, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Execute the test if this file is run directly (e.g., via tsx or ts-node)
if (typeof require !== 'undefined' && require.main === module) {
  runPriceTest();
}
