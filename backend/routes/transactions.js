import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

// Get all transactions with optional filters
router.get('/', (req, res) => {
  const { month, year, category } = req.query;
  const db = getDb();
  let query = 'SELECT * FROM transactions';
  const params = [];
  const conditions = [];
  
  if (month) {
    conditions.push('month = ?');
    params.push(month);
  }
  if (year) {
    conditions.push('year = ?');
    params.push(year);
  }
  if (category) {
    conditions.push('main_category = ?');
    params.push(category);
  }
  
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add single transaction
router.post('/', (req, res) => {
  const { date, merchant, raw_description, main_category, subcategory, type, inflow, outflow, account, payment_method, status, month, year, notes } = req.body;
  const db = getDb();
  
  db.run(
    `INSERT INTO transactions (date, merchant, raw_description, main_category, subcategory, type, inflow, outflow, account, payment_method, status, month, year, duplicate_check, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [date, merchant, raw_description, main_category, subcategory, type, inflow || 0, outflow || 0, account, payment_method, status || 'Approved', month, year, 'Unique', notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Update transaction
router.put('/:id', (req, res) => {
  const { main_category, subcategory, type, notes } = req.body;
  const db = getDb();
  
  db.run(
    'UPDATE transactions SET main_category = ?, subcategory = ?, type = ?, notes = ? WHERE id = ?',
    [main_category, subcategory, type, notes, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Delete transaction
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM transactions WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

export default router;