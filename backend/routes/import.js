import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { getDb } from '../database.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const results = [];
  const stream = Readable.from(req.file.buffer.toString());
  
  stream
    .pipe(csv({ headers: false })) // No headers in your file
    .on('data', (row) => {
      // Your CSV has 4 columns: Date, RawDescription, Merchant, Amount
      const columns = Object.values(row);
      if (columns.length < 4) return;
      
      const dateStr = columns[0];
      const rawDescription = columns[1];
      const merchant = columns[2];
      let amountStr = columns[3];
      
      // Parse amount: remove $, commas, convert to number
      let amount = parseFloat(amountStr.replace(/[$,]/g, ''));
      if (isNaN(amount)) return;
      
      // Determine inflow/outflow: positive = inflow, negative = outflow
      const inflow = amount > 0 ? amount : 0;
      const outflow = amount < 0 ? Math.abs(amount) : 0;
      
      // Parse date (mm/dd/yyyy)
      let date;
      try {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[0] - 1, parts[1]);
        } else {
          date = new Date(dateStr);
        }
      } catch(e) {
        date = new Date();
      }
      
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      
      results.push({
        date: date.toISOString().split('T')[0],
        merchant: merchant,
        raw_description: rawDescription,
        inflow,
        outflow,
        account: 'Chase Checking', // default account
        month,
        year,
        status: 'Ready to Import'
      });
    })
    .on('end', async () => {
      const db = getDb();
      const stmt = db.prepare(`
        INSERT INTO transactions (date, merchant, raw_description, inflow, outflow, account, status, month, year, duplicate_check)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let imported = 0;
      const errors = [];
      
      for (const t of results) {
        // Check for duplicate (same date, merchant, amount)
        const duplicateCheck = db.prepare(`
          SELECT COUNT(*) as count FROM transactions 
          WHERE date = ? AND merchant = ? AND ABS(outflow - ?) < 0.01
        `).get(t.date, t.merchant, t.outflow);
        
        const isDuplicate = duplicateCheck.count > 0;
        
        try {
          stmt.run(t.date, t.merchant, t.raw_description, t.inflow, t.outflow, t.account, t.status, t.month, t.year, isDuplicate ? 'Duplicate' : 'Unique');
          imported++;
        } catch (err) {
          errors.push({ row: t, error: err.message });
        }
      }
      
      res.json({ 
        message: `Imported ${imported} transactions`, 
        imported,
        errors: errors.length ? errors : undefined
      });
    });
});

router.post('/categorize', (req, res) => {
  const db = getDb();
  
  // Simple categorization rules based on merchant name
  const categorize = (merchant, description) => {
    const text = (merchant + ' ' + description).toLowerCase();
    
    if (text.includes('payroll') || text.includes('citrin cooperman')) {
      return { main_category: 'Income', subcategory: 'Payroll', type: 'Income' };
    }
    if (text.includes('transfer') || text.includes('zelle') || text.includes('venmo')) {
      return { main_category: 'Transfer', subcategory: 'Internal Transfer', type: 'Transfer' };
    }
    if (text.includes('shoprite') || text.includes('stop & shop') || text.includes('aldi') || text.includes('trader joe') || text.includes('whole foods')) {
      return { main_category: 'Groceries', subcategory: 'In-Store', type: 'Variable Expense' };
    }
    if (text.includes('uber') || text.includes('lyft') || text.includes('mta')) {
      return { main_category: 'Transportation', subcategory: 'Rideshare', type: 'Variable Expense' };
    }
    if (text.includes('spotify') || text.includes('netflix') || text.includes('hulu') || text.includes('apple') || text.includes('peacock')) {
      return { main_category: 'Subscriptions', subcategory: 'Entertainment', type: 'Fixed Expense' };
    }
    if (text.includes('amazon') || text.includes('target') || text.includes('tj maxx') || text.includes('marshalls')) {
      return { main_category: 'Shopping', subcategory: 'Online', type: 'Variable Expense' };
    }
    if (text.includes('chick-fil-a') || text.includes('starbucks') || text.includes('dining')) {
      return { main_category: 'Dining', subcategory: 'Fast Food', type: 'Variable Expense' };
    }
    if (text.includes('fidelity') || text.includes('capital one') || text.includes('chase credit')) {
      return { main_category: 'Financial', subcategory: 'Investing', type: 'Transfer' };
    }
    if (text.includes('interest')) {
      return { main_category: 'Income', subcategory: 'Interest', type: 'Income' };
    }
    
    return { main_category: 'Uncategorized', subcategory: 'Other', type: 'Variable Expense' };
  };
  
  try {
    const transactions = db.prepare(`SELECT id, merchant, raw_description FROM transactions WHERE status = 'Ready to Import' AND (main_category IS NULL OR main_category = '')`).all();
    
    let updated = 0;
    for (const tx of transactions) {
      const cats = categorize(tx.merchant, tx.raw_description);
      const stmt = db.prepare(`UPDATE transactions SET main_category = ?, subcategory = ?, type = ? WHERE id = ?`);
      stmt.run(cats.main_category, cats.subcategory, cats.type, tx.id);
      updated++;
    }
    
    res.json({ message: `Categorized ${updated} transactions`, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;