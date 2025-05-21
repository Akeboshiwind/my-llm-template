import { Hono } from "hono";
import { Context } from "hono";
import db from "../db/db.ts";

// Define product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
}

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

export default api;