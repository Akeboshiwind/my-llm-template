import { Hono } from "hono";
import db from "../db/db.js";

const api = new Hono();

// Simple JSON response endpoint
api.get("/hello", (c) => {
  return c.json({
    message: "Hello from the API!",
    time: new Date().toISOString(),
  });
});

// Database query endpoint
api.get("/products", (c) => {
  try {
    const products = db.query("SELECT * FROM products").all();
    return c.json({ products });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

export default api;
