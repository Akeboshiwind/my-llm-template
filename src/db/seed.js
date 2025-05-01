import db from "./db.js";
import setupDatabase from "./setup.js";

// Seed database with initial data
function seedDatabase() {
  console.log("Seeding database...");

  // Make sure tables exist
  setupDatabase();

  // Clear existing data
  db.run("DELETE FROM products");

  // Insert sample products
  const products = [
    {
      name: "Coding Mug",
      description: "A perfect mug for your late night coding sessions",
      price: 14.99,
    },
    {
      name: "Mechanical Keyboard",
      description: "Tactile keys for the ultimate typing experience",
      price: 129.99,
    },
    {
      name: "Ergonomic Mouse",
      description: "Comfortable mouse for all-day use",
      price: 49.99,
    },
  ];

  // Prepare the insert statement
  const insertProduct = db.prepare(
    "INSERT INTO products (name, description, price) VALUES (?, ?, ?)",
  );

  // Create a transaction function
  const insertProducts = db.transaction((productsToInsert) => {
    for (const product of productsToInsert) {
      insertProduct.run(product.name, product.description, product.price);
    }
    return productsToInsert.length;
  });

  // Execute the transaction
  const insertedCount = insertProducts(products);
  console.log(`Inserted ${insertedCount} products using transaction`);

  // Verify data was inserted
  const dbCount = db
    .query("SELECT COUNT(*) as count FROM products")
    .get().count;
  console.log(`Database seeded with ${dbCount} sample products!`);

  // Show the products
  const products_in_db = db.query("SELECT * FROM products").all();
  console.log("Products in database:", products_in_db);
}

// Run seeder if this file is executed directly
if (import.meta.main) {
  console.log("Running seed as main module");
  try {
    seedDatabase();
    console.log("Database seeding completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

export default seedDatabase;
