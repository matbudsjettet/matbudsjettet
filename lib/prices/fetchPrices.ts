/**
 * Phase 1: Real grocery pricing using Firecrawl
 * 
 * Note: To run this test, you need to set the FIRECRAWL_API_KEY environment variable.
 * Example: FIRECRAWL_API_KEY="fc-..." npx tsx lib/prices/fetchPrices.ts
 */

export interface GroceryPriceMap {
  [key: string]: number;
}

export async function fetchPrices(): Promise<GroceryPriceMap> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing FIRECRAWL_API_KEY environment variable.");
  }

  // URLs from Kassal.app which tracks KIWI and REMA 1000 prices
  const urls = [
    "https://kassal.app/vare/5341-kjottdeig-av-storfe-og-svin-400g-first-price-7035620002157", // KIWI Kjøttdeig
    "https://kassal.app/vare/1054-kyllingfilet-700g-solvinge-7039611082531", // REMA 1000 Kyllingfilet
    "https://kassal.app/vare/5645-jasminris-1kg-first-price-7035620037142"  // KIWI Jasminris
  ];

  console.log(`Starting Firecrawl extraction for ${urls.length} products...`);

  const response = await fetch("https://api.firecrawl.dev/v1/extract", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      urls: urls,
      prompt: "Extract the grocery product name, its current price (as a number in NOK), and the price per unit (if available, e.g. 'kr 110,00 / kg'). Map each to a simple short ID: 'kjottdeig' for kjøttdeig, 'kyllingfilet' for kyllingfilet, and 'ris' for ris.",
      schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                shortId: { 
                  type: "string", 
                  description: "A short identifier: 'kjottdeig', 'kyllingfilet', or 'ris'" 
                },
                productName: { type: "string" },
                price: { type: "number" },
                pricePerUnit: { type: "string" }
              },
              required: ["shortId", "productName", "price"]
            }
          }
        },
        required: ["items"]
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firecrawl API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  // result.data should contain the extracted JSON based on the schema
  const extractedItems = result.data?.items || [];
  
  const priceMap: GroceryPriceMap = {};
  
  for (const item of extractedItems) {
    if (item.shortId && item.price !== undefined) {
      priceMap[item.shortId] = item.price;
      console.log(`Extracted: ${item.productName} -> ${item.price} kr (${item.pricePerUnit || 'N/A'})`);
    }
  }

  return priceMap;
}

// Test function
export async function runFetchTest() {
  try {
    console.log("=== Running Firecrawl Price Fetch Test ===");
    const prices = await fetchPrices();
    console.log("\nFinal Price Object:");
    console.log(JSON.stringify(prices, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Execute the test if this file is run directly (e.g., via tsx or ts-node)
if (require.main === module) {
  runFetchTest();
}
