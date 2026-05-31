import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, 'finance.db'));

db.pragma('foreign_keys = ON');

// Create tables (if not exist)
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    merchant TEXT,
    raw_description TEXT,
    main_category TEXT,
    subcategory TEXT,
    type TEXT,
    inflow REAL,
    outflow REAL,
    account TEXT,
    payment_method TEXT,
    status TEXT,
    month TEXT,
    year INTEGER,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    month TEXT,
    year INTEGER,
    amount REAL
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    balance REAL,
    credit_limit REAL
  );
`);

// Insert sample data for May 2026 if empty
const row = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE month = 'May' AND year = 2026").get();
if (row.count === 0) {
  const insert = db.prepare(`
    INSERT INTO transactions (date, merchant, main_category, type, inflow, outflow, month, year, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run('2026-05-01', 'Employer Inc.', 'Income', 'Income', 3500, 0, 'May', 2026, 'Approved');
  insert.run('2026-05-03', 'Supermarket', 'Groceries', 'Variable Expense', 0, 85.50, 'May', 2026, 'Approved');
  insert.run('2026-05-05', 'Netflix', 'Subscriptions', 'Fixed Expense', 0, 15.99, 'May', 2026, 'Approved');
  console.log('Added sample transactions for May 2026');
}

// Insert default budgets if missing
const budgetRow = db.prepare("SELECT COUNT(*) as count FROM budgets WHERE month = 'May' AND year = 2026").get();
if (budgetRow.count === 0) {
  const insertBudget = db.prepare("INSERT INTO budgets (category, month, year, amount) VALUES (?, ?, ?, ?)");
  const categories = ['Groceries', 'Dining', 'Transportation', 'Shopping', 'Subscriptions', 'Entertainment', 'Health & Wellness'];
  for (const cat of categories) {
    insertBudget.run(cat, 'May', 2026, 200);
  }
  console.log('Added default budgets for May 2026');
}

console.log('Database ready (better-sqlite3)');
export function getDb() { return db; }