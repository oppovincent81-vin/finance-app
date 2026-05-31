import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for month/year selection
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2025, 2026, 2027];

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, cashflowRes] = await Promise.all([
        dashboardApi.getSummary(selectedMonth, selectedYear),
        dashboardApi.getCashflow(selectedYear)
      ]);
      setSummary(summaryRes.data);
      setCashflow(cashflowRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  const spendingData = {
    labels: summary.topSpendingCategories?.map(c => c.main_category) || [],
    datasets: [{
      label: 'Spending',
      data: summary.topSpendingCategories?.map(c => c.amount) || [],
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'],
      borderRadius: 8,
    }]
  };

  const cashflowData = {
    labels: cashflow.map(c => c.month.slice(0, 3)),
    datasets: [
      {
        label: 'Income',
        data: cashflow.map(c => c.income),
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: cashflow.map(c => c.expenses),
        backgroundColor: '#ef4444',
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header with Month/Year Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input py-2 px-3 rounded-lg border border-gray-300 bg-white"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input py-2 px-3 rounded-lg border border-gray-300 bg-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold">${(summary.income - summary.expenses).toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-2xl font-bold text-green-600">${summary.income.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-2xl font-bold text-red-600">${summary.expenses.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Savings Rate</p>
          <p className="text-2xl font-bold">{(summary.savingsRate * 100).toFixed(1)}%</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Top Spending Categories</h2>
          <div className="h-64">
            {summary.topSpendingCategories?.length > 0 ? (
              <Doughnut data={spendingData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p className="text-gray-500 text-center mt-20">No spending data for this period</p>
            )}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Monthly Cash Flow</h2>
          <div className="h-64">
            <Bar data={cashflowData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.recentTransactions?.slice(0, 10).map(tx => (
                <tr key={tx.id}>
                  <td className="px-4 py-2 text-sm">{tx.date}</td>
                  <td className="px-4 py-2 text-sm">{tx.merchant}</td>
                  <td className="px-4 py-2 text-sm">{tx.main_category || 'Uncategorized'}</td>
                  <td className={`px-4 py-2 text-sm text-right ${tx.outflow > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.outflow > 0 ? `-$${tx.outflow.toFixed(2)}` : `+$${tx.inflow.toFixed(2)}`}
                  </td>
                </tr>
              ))}
              {(!summary.recentTransactions || summary.recentTransactions.length === 0) && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">No transactions for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}