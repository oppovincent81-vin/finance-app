import express from 'express';
import { getDb } from '../database.js';
import { calculateFinancialHealthScore } from '../utils/calculations.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const { month, year } = req.query;
  const db = getDb();
  
  // Get monthly income and expenses
  db.get(
    'SELECT SUM(inflow) as income FROM transactions WHERE month = ? AND year = ? AND type = "Income"',
    [month, year],
    (err, incomeRow) => {
      const income = incomeRow?.income || 0;
      
      db.get(
        'SELECT SUM(outflow) as expenses FROM transactions WHERE month = ? AND year = ? AND type != "Transfer" AND type != "Income"',
        [month, year],
        (err, expenseRow) => {
          const expenses = expenseRow?.expenses || 0;
          const savingsRate = income > 0 ? (income - expenses) / income : 0;
          
          // Get total credit card debt
          db.all('SELECT balance FROM accounts WHERE type = "Credit Card"', (err, accounts) => {
            const creditDebt = accounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
            const debtToIncomeRatio = income > 0 ? creditDebt / income : 0;
            
            // Get subscription total
            db.get('SELECT SUM(monthly_cost) as total FROM subscriptions WHERE status = "Active"', (err, subRow) => {
              const subscriptions = subRow?.total || 0;
              
              // Get emergency fund goal and current
              db.get('SELECT value FROM settings WHERE key = "emergency_fund_goal"', (err, goalRow) => {
                const emergencyGoal = goalRow?.value ? parseFloat(goalRow.value) : 10000;
                db.get('SELECT balance FROM accounts WHERE name = "Ally Savings"', (err, savingsRow) => {
                  const emergencyFund = savingsRow?.balance || 0;
                  
                  // Check if any investment transactions exist
                  db.get(
                    'SELECT COUNT(*) as count FROM transactions WHERE type = "Investments" AND month = ? AND year = ?',
                    [month, year],
                    (err, investRow) => {
                      const hasInvestments = (investRow?.count || 0) > 0;
                      
                      const score = calculateFinancialHealthScore({
                        savingsRate,
                        income,
                        debt: creditDebt,
                        expenses,
                        subscriptions,
                        emergencyFund,
                        emergencyGoal,
                        hasInvestments
                      });
                      
                      res.json(score);
                    }
                  );
                });
              });
            });
          });
        }
      );
    }
  );
});

export default router;