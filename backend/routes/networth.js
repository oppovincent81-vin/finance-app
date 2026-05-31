import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  
  db.all('SELECT name, type, balance FROM accounts', (err, accounts) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let assets = 0;
    let liabilities = 0;
    
    for (const acc of accounts) {
      if (acc.type === 'Credit Card') {
        liabilities += Math.abs(acc.balance);
      } else {
        assets += acc.balance;
      }
    }
    
    const netWorth = assets - liabilities;
    
    // Get historical snapshots
    db.all('SELECT * FROM net_worth_snapshots ORDER BY year, month_index', (err, snapshots) => {
      res.json({
        current: { assets, liabilities, netWorth },
        history: snapshots
      });
    });
  });
});

router.post('/snapshot', (req, res) => {
  const { month, year, assets, liabilities } = req.body;
  const db = getDb();
  
  db.run(
    'INSERT INTO net_worth_snapshots (month, year, total_assets, total_liabilities) VALUES (?, ?, ?, ?)',
    [month, year, assets, liabilities],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

export default router;