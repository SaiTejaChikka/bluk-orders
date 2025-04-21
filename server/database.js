import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Create a new database or load existing one
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT NOT NULL,
        unit TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_price REAL NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id)
      );
    `);

    // Insert initial product data
    db.run(`
      INSERT OR IGNORE INTO products (id, name, price, image, unit) VALUES
        (1, 'Fresh Tomatoes', 2.99, 'https://images.unsplash.com/photo-1546470427-1ec0a5a0c423', 'kg'),
        (2, 'Organic Potatoes', 1.99, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655', 'kg'),
        (3, 'Green Apples', 3.99, 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2', 'kg'),
        (4, 'Fresh Carrots', 1.49, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37', 'kg'),
        (5, 'Red Onions', 1.79, 'https://images.unsplash.com/photo-1618512496248-a01f6a44c5e8', 'kg'),
        (6, 'Sweet Oranges', 4.99, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b', 'kg'),
        (7, 'Fresh Cucumbers', 2.49, 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e', 'kg'),
        (8, 'Ripe Bananas', 2.29, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224', 'kg'),
        (9, 'Bell Peppers', 3.49, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83', 'kg'),
        (10, 'Fresh Broccoli', 2.99, 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc', 'kg'),
        (11, 'Sweet Strawberries', 5.99, 'https://images.unsplash.com/photo-1518635017498-87f514b751ba', 'kg'),
        (12, 'Fresh Lettuce', 1.99, 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1', 'piece')
    `);

    // Save the database to disk
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }

  return db;
}

// Initialize database
const database = await initDatabase();

// Save database before exit
process.on('exit', () => {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
});

export default database;