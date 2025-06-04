import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./shared/schema";
import ws from "ws";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

// Check for database connection string
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// Initialize the connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  try {
    console.log("Creating database tables...");
    
    // Drop old tables if they exist (for clean restart)
    console.log("Dropping existing tables...");
    
    // Create tables in order of dependencies
    console.log("Creating users table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    
    console.log("Creating stores table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        phone TEXT,
        open_time TEXT,
        close_time TEXT
      )
    `);
    
    console.log("Creating categories table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
    
    console.log("Creating sales table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        item_name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        regular_price NUMERIC NOT NULL,
        sale_price NUMERIC NOT NULL,
        end_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Creating products table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Creating product_prices table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_prices (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        price NUMERIC NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Creating spreadsheet_imports table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS spreadsheet_imports (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        week_of TIMESTAMP NOT NULL,
        imported_at TIMESTAMP DEFAULT NOW(),
        processed_items INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
      )
    `);
    
    console.log("Database setup complete!");
    
    // Create default categories
    console.log("Adding default categories...");
    const defaultCategories = [
      "Grocery", "Produce", "Dairy", "Meat", "Bakery", "Frozen Foods", 
      "Household", "Electronics", "Clothing", "Other"
    ];
    
    for (const category of defaultCategories) {
      await pool.query(`
        INSERT INTO categories (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
      `, [category]);
    }
    
    console.log("Default categories added.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

main();