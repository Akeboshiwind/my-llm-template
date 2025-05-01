import { config } from "dotenv";

// Load environment variables
config();

// Validate critical environment variables
if (process.env.PORT && isNaN(Number(process.env.PORT))) {
  throw new Error("PORT environment variable must be a number");
}

// Process and export configuration settings
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const dbPath = process.env.DB_PATH || "./data/database.sqlite";

export default {
  port,
  dbPath,
};

