import db from "./db.js";

// Create products table
function setupDatabase() {
  console.log("Setting up database...");

  try {
    // Create products table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verify table was created
    const tables = db
      .query('SELECT name FROM sqlite_master WHERE type="table"')
      .all();
    console.log("Database tables:", tables);

    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (import.meta.main) {
  console.log("Running as main module");
  try {
    setupDatabase();
    console.log("Database setup completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error setting up database:", err);
    process.exit(1);
  }
}

export default setupDatabase;
