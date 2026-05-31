import express from 'express';
import { getDb } from '../database.js';
import { calculateDebtPayoffMonths, calculateTotalInterest } from '../utils/calculations.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM debt_payoffs', (err, debts) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const enhanced = debts.map(d => {
      const months = calculateDebtPayoffMonths(d.current_balance, d.interest_rate, d.your_payment);
      const totalInterest = months !== Infinity ? calculateTotalInterest(d.current_balance, d.interest_rate, d.your_payment, months) : 0;
      const payoffDate = months !== Infinity && months > 0 ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000) : null;
      
      return {
        ...d,
        months_to_payoff: months === Infinity ? '∞' : months,
        total_interest: totalInterest,
        payoff_date: payoffDate ? payoffDate.toISOString().split('T')[0] : 'Unknown'
      };
    });
    
    const totalBalance = debts.reduce((sum, d) => sum + d.current_balance, 0);
    const totalMonthly = debts.reduce((sum, d) => sum + d.your_payment, 0);
    
    res.json({
      debts: enhanced,
      totals: {
        balance: totalBalance,
        monthly_payment: totalMonthly
      }
    });
  });
});

router.post('/', (req, res) => {
  const { debt_name, current_balance, interest_rate, minimum_payment, your_payment } = req.body;
  const db = getDb();
  
  db.run(
    'INSERT INTO debt_payoffs (debt_name, current_balance, interest_rate, minimum_payment, your_payment) VALUES (?, ?, ?, ?, ?)',
    [debt_name, current_balance, interest_rate, minimum_payment, your_payment],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const { current_balance, your_payment } = req.body;
  const db = getDb();
  
  db.run(
    'UPDATE debt_payoffs SET current_balance = ?, your_payment = ? WHERE id = ?',
    [current_balance, your_payment, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

export default router;