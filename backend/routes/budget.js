import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { month, year } = req.query;
  const db = getDb();
  
  // Get all budget categories
  db.all('SELECT * FROM budgets WHERE month = ? AND year = ?', [month, year], (err, budgets) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Get actual spending for each category
    const categories = budgets.map(b => b.category);
    const actualPromises = categories.map(category => {
      return new Promise((resolve) => {
        db.get(
          'SELECT SUM(outflow) as actual FROM transactions WHERE main_category = ? AND month = ? AND year = ? AND type != "Transfer" AND type != "Income"',
          [category, month, year],
          (err, row) => resolve({ category, actual: row?.actual || 0 })
        );
      });
    });
    
    Promise.all(actualPromises).then(actuals => {
      const result = budgets.map(budget => {
        const actual = actuals.find(a => a.category === budget.category)?.actual || 0;
        return {
          category: budget.category,
          budget: budget.amount,
          actual,
          variance: actual - budget.amount,
          status: actual > budget.amount ? 'Over' : 'Under'
        };
      });
      
      // Add total row
      const totalBudget = result.reduce((sum, r) => sum + r.budget, 0);
      const totalActual = result.reduce((sum, r) => sum + r.actual, 0);
      
      res.json({
        categories: result,
        total: {
          budget: totalBudget,
          actual: totalActual,
          variance: totalActual - totalBudget,
          status: totalActual > totalBudget ? 'Over' : 'Under'
        }
      });
    });
  });
});

router.put('/', (req, res) => {
  const { category, month, year, amount } = req.body;
  const db = getDb();
  
  db.run(
    'UPDATE budgets SET amount = ? WHERE category = ? AND month = ? AND year = ?',
    [amount, category, month, year],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

export default router;