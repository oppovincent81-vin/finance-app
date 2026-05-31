import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import ImportCenter from './components/ImportCenter';
import BudgetVsActual from './components/BudgetVsActual';
import NetWorthTracker from './components/NetWorthTracker';
import FinancialHealth from './components/FinancialHealth';
import DebtPayoff from './components/DebtPayoff';
import SavingsGoals from './components/SavingsGoals';
import CashFlowForecast from './components/CashFlowForecast';

function Layout({ children }) {
  const [currentMonth] = React.useState(new Date().toLocaleString('default', { month: 'long' }));
  const [currentYear] = React.useState(new Date().getFullYear());
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '💰' },
    { path: '/import', label: 'Import Center', icon: '📥' },
    { path: '/budget', label: 'Budget vs Actual', icon: '📉' },
    { path: '/networth', label: 'Net Worth', icon: '📈' },
    { path: '/health', label: 'Financial Health', icon: '🏥' },
    { path: '/debt', label: 'Debt Payoff', icon: '💳' },
    { path: '/savings', label: 'Savings Goals', icon: '🎯' },
    { path: '/forecast', label: 'Cash Flow Forecast', icon: '🔮' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">💰 FinanceTracker</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="inline-flex items-center px-3 pt-1 text-sm font-medium text-gray-700 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-500"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{currentMonth} {currentYear}</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/import" element={<ImportCenter />} />
          <Route path="/budget" element={<BudgetVsActual />} />
          <Route path="/networth" element={<NetWorthTracker />} />
          <Route path="/health" element={<FinancialHealth />} />
          <Route path="/debt" element={<DebtPayoff />} />
          <Route path="/savings" element={<SavingsGoals />} />
          <Route path="/forecast" element={<CashFlowForecast />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;