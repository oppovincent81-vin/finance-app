import express from 'express';
import cors from 'cors';
import { getDb } from './database.js';
import importRouter from './routes/import.js';

const app = express();

app.use(cors());
app.use(express.json());

const db = getDb();

// ---------- Dashboard ----------
app.get('/api/dashboard/summary', (req, res) => {
  const { month, year } = req.query;
  try {
    const incomeRow = db.prepare(`SELECT SUM(inflow) as total FROM transactions WHERE month = ? AND year = ? AND type = 'Income'`).get(month, year);
    const expenseRow = db.prepare(`SELECT SUM(outflow) as total FROM transactions WHERE month = ? AND year = ? AND type NOT IN ('Income','Transfer')`).get(month, year);
    const income = incomeRow?.total || 0;
    const expenses = expenseRow?.total || 0;
    const savings = income - expenses;
    const savingsRate = income ? savings / income : 0;

    const topCategories = db.prepare(`
      SELECT main_category, SUM(outflow) as amount
      FROM transactions
      WHERE month = ? AND year = ? AND type NOT IN ('Income','Transfer')
      GROUP BY main_category
      ORDER BY amount DESC
      LIMIT 5
    `).all(month, year);

    const recent = db.prepare(`
      SELECT * FROM transactions WHERE month = ? AND year = ? ORDER BY date DESC LIMIT 10
    `).all(month, year);

    res.json({ income, expenses, savings, savingsRate, topSpendingCategories: topCategories, recentTransactions: recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/cashflow', (req, res) => {
  const { year } = req.query;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const result = [];
  for (const month of months) {
    const income = db.prepare(`SELECT SUM(inflow) as total FROM transactions WHERE month = ? AND year = ? AND type = 'Income'`).get(month, year)?.total || 0;
    const expenses = db.prepare(`SELECT SUM(outflow) as total FROM transactions WHERE month = ? AND year = ? AND type NOT IN ('Income','Transfer')`).get(month, year)?.total || 0;
    result.push({ month, income, expenses, net: income - expenses });
  }
  res.json(result);
});

// ---------- Transactions ----------
app.get('/api/transactions', (req, res) => {
  const { month, year } = req.query;
  const rows = db.prepare(`SELECT * FROM transactions WHERE month = ? AND year = ? ORDER BY date DESC`).all(month, year);
  res.json(rows);
});

app.post('/api/transactions', (req, res) => {
  const { date, merchant, main_category, subcategory, type, inflow, outflow, month, year, account, notes } = req.body;
  const stmt = db.prepare(`
    INSERT INTO transactions (date, merchant, main_category, subcategory, type, inflow, outflow, month, year, account, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
  `);
  const info = stmt.run(date, merchant, main_category, subcategory, type, inflow || 0, outflow || 0, month, year, account || 'Chase', notes);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/transactions/:id', (req, res) => {
  const { main_category, subcategory, notes } = req.body;
  const stmt = db.prepare(`UPDATE transactions SET main_category = ?, subcategory = ?, notes = ? WHERE id = ?`);
  const info = stmt.run(main_category, subcategory, notes, req.params.id);
  res.json({ updated: info.changes });
});

app.delete('/api/transactions/:id', (req, res) => {
  const stmt = db.prepare(`DELETE FROM transactions WHERE id = ?`);
  const info = stmt.run(req.params.id);
  res.json({ deleted: info.changes });
});

// ---------- Budget ----------
app.get('/api/budget', (req, res) => {
  const { month, year } = req.query;
  const budgets = db.prepare(`SELECT * FROM budgets WHERE month = ? AND year = ?`).all(month, year);
  const result = [];
  let totalBudget = 0, totalActual = 0;
  for (const budget of budgets) {
    const actualRow = db.prepare(`SELECT SUM(outflow) as actual FROM transactions WHERE main_category = ? AND month = ? AND year = ? AND type NOT IN ('Income','Transfer')`).get(budget.category, month, year);
    const actual = actualRow?.actual || 0;
    totalBudget += budget.amount;
    totalActual += actual;
    result.push({ category: budget.category, budget: budget.amount, actual, variance: actual - budget.amount, status: actual > budget.amount ? 'Over' : 'Under' });
  }
  res.json({ categories: result, total: { budget: totalBudget, actual: totalActual, variance: totalActual - totalBudget } });
});

app.put('/api/budget', (req, res) => {
  const { category, month, year, amount } = req.body;
  const stmt = db.prepare(`UPDATE budgets SET amount = ? WHERE category = ? AND month = ? AND year = ?`);
  const info = stmt.run(amount, category, month, year);
  res.json({ updated: info.changes });
});

// ---------- Net Worth ----------
app.get('/api/networth', (req, res) => {
  const assets = db.prepare(`SELECT SUM(balance) as total FROM accounts WHERE type != 'Credit Card'`).get()?.total || 0;
  const liabilities = db.prepare(`SELECT SUM(balance) as total FROM accounts WHERE type = 'Credit Card'`).get()?.total || 0;
  res.json({ current: { assets, liabilities, netWorth: assets + liabilities }, history: [] });
});

// ---------- Financial Health ----------
app.get('/api/financial/health', (req, res) => {
  const { month, year } = req.query;
  const income = db.prepare(`SELECT SUM(inflow) as total FROM transactions WHERE month = ? AND year = ? AND type = 'Income'`).get(month, year)?.total || 0;
  const expenses = db.prepare(`SELECT SUM(outflow) as total FROM transactions WHERE month = ? AND year = ? AND type NOT IN ('Income','Transfer')`).get(month, year)?.total || 0;
  const savingsRate = income ? (income - expenses) / income : 0;
  const savingsRateScore = Math.min(25, Math.max(0, Math.round(savingsRate * 125)));
  const totalScore = savingsRateScore + 50;
  const rating = totalScore >= 90 ? 'Excellent' : totalScore >= 75 ? 'Good' : totalScore >= 60 ? 'Fair' : 'Needs Attention';
  res.json({ total: totalScore, rating, components: { savingsRate: savingsRateScore, debtToIncome: 20, expenseControl: 15, subscriptionLoad: 8, emergencyFund: 5, investmentActivity: 2 } });
});

// ---------- Savings Goals (mock) ----------
app.get('/api/savings', (req, res) => {
  res.json([
    { id: 1, goal_name: 'Emergency Fund', target_amount: 10000, current_saved: 4200, remaining: 5800, progress: 0.42, status: 'On Track', monthly_goal: 500, target_date: '2026-12-31' }
  ]);
});

// ---------- Debt Payoff (mock) ----------
app.get('/api/debt', (req, res) => {
  res.json({ debts: [], totals: { balance: 0, monthly_payment: 0 } });
});

// ---------- Import ----------
app.use('/api/import', importRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
