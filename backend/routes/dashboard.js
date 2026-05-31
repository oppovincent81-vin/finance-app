import express from 'express';
import { getDb } from '../database.js';
import { calculateMonthlyTotals, calculateSavingsRate, calculateBudgetLeft } from '../utils/calculations.js';

const router = express.Router();

router.get('/summary', (req, res) => {
  const { month, year } = req.query;
  const db = getDb();
  
  // Get income and expenses for the month
  const incomeQuery = `SELECT SUM(inflow) as total FROM transactions WHERE month = ? AND year = ? AND type = 'Income'`;
  const expenseQuery = `SELECT SUM(outflow) as total FROM transactions WHERE month = ? AND year = ? AND type != 'Transfer' AND type != 'Income'`;
  
  db.get(incomeQuery, [month, year], (err, incomeRow) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get(expenseQuery, [month, year], (err, expenseRow) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const income = incomeRow?.total || 0;
      const expenses = expenseRow?.total || 0;
      const savings = income - expenses;
      const savingsRate = income > 0 ? savings / income : 0;
      
      // Get top spending categories
      const topCategoriesQuery = `
        SELECT main_category, SUM(outflow) as amount 
        FROM transactions 
        WHERE month = ? AND year = ? AND type != 'Transfer' AND type != 'Income'
        GROUP BY main_category 
        ORDER BY amount DESC 
        LIMIT 5
      `;
      
      db.all(topCategoriesQuery, [month, year], (err, categories) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Get recent transactions
        const recentQuery = `
          SELECT * FROM transactions 
          WHERE month = ? AND year = ? 
          ORDER BY date DESC 
          LIMIT 10
        `;
        
        db.all(recentQuery, [month, year], (err, recent) => {
          if (err) return res.status(500).json({ error: err.message });
          
          res.json({
            income,
            expenses,
            savings,
            savingsRate,
            topSpendingCategories: categories,
            recentTransactions: recent,
            month,
            year
          });
        });
      });
    });
  });
});

router.get('/cashflow', (req, res) => {
  const { year } = req.query;
  const db = getDb();
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const results = [];
  
  let completed = 0;
  months.forEach(month => {
    const incomeQuery = `SELECT SUM(inflow) as income FROM transactions WHERE month = ? AND year = ? AND type = 'Income'`;
    const expenseQuery = `SELECT SUM(outflow) as expenses FROM transactions WHERE month = ? AND year = ? AND type != 'Transfer' AND type != 'Income'`;
    
    db.get(incomeQuery, [month, year], (err, incomeRow) => {
      db.get(expenseQuery, [month, year], (err, expenseRow) => {
        const income = incomeRow?.income || 0;
        const expenses = expenseRow?.expenses || 0;
        results.push({ month, income, expenses, net: income - expenses });
        completed++;
        
        if (completed === months.length) {
          res.json(results);
        }
      });
    });
  });
});

export default router;