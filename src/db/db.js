import { Database } from "bun:sqlite";
import fs from "fs";
import path from "path";
import config from "../config.js";

// Use an absolute path to avoid path resolution issues
const dbPath = config.dbPath;
console.log("Using database at:", dbPath);

// Ensure the database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(dbPath, { create: true });

// Enable WAL mode for better performance
db.exec("PRAGMA journal_mode=WAL");

export default db;
