// API integration tests for the search endpoint

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Hono } from "hono";
import { createSimpleSearchIndex, simpleSearch, generateBasicExplanation } from "../services/simple-vector-store";

// Mock products for testing
const testProducts = [
  { id: 1, name: "Coding Mug", description: "A perfect mug for your late night coding sessions", price: 14.99, created_at: "2023-01-01" },
  { id: 2, name: "Mechanical Keyboard", description: "Tactile keys for the ultimate typing experience", price: 129.99, created_at: "2023-01-02" },
  { id: 3, name: "Ergonomic Mouse", description: "Comfortable mouse for all-day use", price: 49.99, created_at: "2023-01-03" }
];

// For Bun tests, we'll use a direct approach instead of mocking
// We'll create our own test app with the search endpoint

describe("Search API Endpoint", () => {
  // Create a test Hono app
  const app = new Hono();
  const searchIndex = createSimpleSearchIndex(testProducts);
  
  // Setup a test endpoint that replicates our actual API implementation
  app.post("/api/quick-search", async (c) => {
    try {
      const body = await c.req.json();
      const { query } = body;
      
      if (!query || typeof query !== "string") {
        return c.json({ error: "Query is required" }, 400);
      }
      
      // Use simple search function
      const results = simpleSearch(searchIndex, query);
      
      // Generate a basic explanation
      const explanation = generateBasicExplanation(query, results);
      
      return c.json({
        query,
        explanation,
        products: results.map(r => r.product)
      });
    } catch (error) {
      return c.json({ error: "Failed to process search" }, 500);
    }
  });
  
  test("should return matching products for valid query", async () => {
    const req = new Request("http://localhost/api/quick-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "ergonomic" })
    });
    
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toHaveProperty("products");
    expect(data).toHaveProperty("explanation");
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe("Ergonomic Mouse");
  });
  
  test("should handle queries with no matching products", async () => {
    const req = new Request("http://localhost/api/quick-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "nonexistent product" })
    });
    
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.products).toHaveLength(0);
    expect(data.explanation).toContain("No products found");
  });
  
  test("should return 400 for missing query", async () => {
    const req = new Request("http://localhost/api/quick-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // Missing query
    });
    
    const res = await app.fetch(req);
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty("error");
  });
});