import { Hono } from "hono";
import { Context } from "hono";
import db from "../db/db.ts";
import { 
  createSimpleSearchIndex, 
  simpleSearch, 
  generateBasicExplanation,
  type Product 
} from "../services/simple-vector-store.ts";

const api = new Hono();

// Simple JSON response endpoint
api.get("/hello", (c: Context) => {
  return c.json({
    message: "Hello from the API!",
    time: new Date().toISOString(),
  });
});

// Database query endpoint
api.get("/products", (c: Context) => {
  try {
    const products = db.query("SELECT * FROM products").all() as Product[];
    return c.json({ products });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// Search index for products (initialized when first needed)
let searchIndex: any[] = [];

// Helper function to ensure search index is initialized
function getSearchIndex() {
  if (searchIndex.length === 0) {
    const products = db.query("SELECT * FROM products").all() as Product[];
    searchIndex = createSimpleSearchIndex(products);
  }
  return searchIndex;
}

// Product search endpoint
api.post("/quick-search", async (c: Context) => {
  try {
    const body = await c.req.json();
    const { query } = body;
    
    if (!query || typeof query !== "string") {
      return c.json({ error: "Query is required" }, 400);
    }
    
    // Use simple search function
    const index = getSearchIndex();
    const results = simpleSearch(index, query);
    
    // Generate a basic explanation
    const explanation = generateBasicExplanation(query, results);
    
    return c.json({
      query,
      explanation,
      products: results.map(r => r.product)
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ error: "Failed to process search" }, 500);
  }
});

export default api;