import { Hono } from "hono";
import { Context } from "hono";
import { serveStatic } from "hono/bun";
import config from "./config.ts";

// Import routes
import apiRoutes from "./routes/api.ts";

const app = new Hono();
const port = config.port;

// Serve static files from public directory with correct MIME types
app.use("/*", serveStatic({ root: "./src/public" }));

// API routes
app.route("/api", apiRoutes);

// Catch-all route for SPA navigation
app.get("*", (c: Context) => c.redirect("/"));

console.log(`Server running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};