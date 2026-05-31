export function calculateMonthlyTotals(transactions) {
  let income = 0;
  let expenses = 0;
  
  for (const t of transactions) {
    if (t.type === 'Income') {
      income += t.inflow || 0;
    } else if (t.type !== 'Transfer') {
      expenses += t.outflow || 0;
    }
  }
  
  return { income, expenses, net: income - expenses };
}

export function calculateSavingsRate(income, expenses) {
  if (income === 0) return 0;
  return (income - expenses) / income;
}

export function calculateBudgetLeft(income, expenses) {
  return income - expenses;
}

export function calculateNetWorth(assets, liabilities) {
  return assets - liabilities;
}

export function calculateFinancialHealthScore(metrics) {
  // Savings rate score (max 25 points at >=20%)
  const savingsRateScore = Math.min(25, Math.max(0, Math.round(metrics.savingsRate * 125)));
  
  // Debt-to-income score (max 25 points)
  const dtiScore = metrics.income > 0 
    ? Math.min(25, Math.max(0, Math.round(25 - (metrics.debt / metrics.income) * 50)))
    : 0;
  
  // Expense control (max 20 points)
  const expenseRatio = metrics.expenses / (metrics.income || 1);
  const expenseScore = Math.min(20, Math.max(0, Math.round(20 * (1 - expenseRatio))));
  
  // Subscription load (max 10 points)
  const subscriptionRatio = metrics.subscriptions / (metrics.income || 1);
  const subscriptionScore = Math.min(10, Math.max(0, Math.round(10 - subscriptionRatio * 100)));
  
  // Emergency fund score (max 10 points)
  const emergencyScore = Math.min(10, Math.round(10 * (metrics.emergencyFund / metrics.emergencyGoal)));
  
  // Investment activity (10 points if any)
  const investmentScore = metrics.hasInvestments ? 10 : 0;
  
  const total = savingsRateScore + dtiScore + expenseScore + subscriptionScore + emergencyScore + investmentScore;
  
  return {
    total,
    components: {
      savingsRate: savingsRateScore,
      debtToIncome: dtiScore,
      expenseControl: expenseScore,
      subscriptionLoad: subscriptionScore,
      emergencyFund: emergencyScore,
      investmentActivity: investmentScore
    },
    rating: total >= 90 ? 'Excellent' : total >= 75 ? 'Good' : total >= 60 ? 'Fair' : 'Needs Attention'
  };
}

export function calculateDebtPayoffMonths(balance, rate, payment) {
  if (balance <= 0) return 0;
  const monthlyRate = rate / 12;
  if (payment <= balance * monthlyRate) return Infinity;
  return Math.ceil(Math.log(payment / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate));
}

export function calculateTotalInterest(balance, rate, payment, months) {
  if (balance <= 0) return 0;
  let remaining = balance;
  let totalInterest = 0;
  const monthlyRate = rate / 12;
  
  for (let i = 0; i < months; i++) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - payment;
    if (remaining <= 0) break;
  }
  
  return totalInterest;
}