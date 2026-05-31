import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM savings_goals', (err, goals) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const enhanced = goals.map(g => ({
      ...g,
      remaining: g.target_amount - g.current_saved,
      progress: g.current_saved / g.target_amount,
      status: g.current_saved >= g.target_amount ? 'Complete' : 'On Track'
    }));
    
    res.json(enhanced);
  });
});

router.post('/', (req, res) => {
  const { goal_name, target_amount, current_saved, monthly_goal, target_date } = req.body;
  const db = getDb();
  
  db.run(
    'INSERT INTO savings_goals (goal_name, target_amount, current_saved, monthly_goal, target_date) VALUES (?, ?, ?, ?, ?)',
    [goal_name, target_amount, current_saved, monthly_goal, target_date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const { current_saved } = req.body;
  const db = getDb();
  
  db.run(
    'UPDATE savings_goals SET current_saved = ? WHERE id = ?',
    [current_saved, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

export default router;