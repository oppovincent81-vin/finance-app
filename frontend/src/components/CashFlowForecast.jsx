import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import { Line } from 'react-chartjs-2';

export default function CashFlowForecast() {
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchCashflow();
  }, []);

  const fetchCashflow = async () => {
    try {
      const res = await dashboardApi.getCashflow(currentYear);
      setCashflow(res.data);
    } catch (error) {
      console.error('Error fetching cashflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: cashflow.map(c => c.month.slice(0, 3)),
    datasets: [
      {
        label: 'Income',
        data: cashflow.map(c => c.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: cashflow.map(c => c.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Net Cash Flow',
        data: cashflow.map(c => c.net),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  if (loading) return <div className="text-center py-10">Loading forecast...</div>;

  const averageIncome = cashflow.slice(0, 4).reduce((sum, c) => sum + c.income, 0) / 4;
  const averageExpenses = cashflow.slice(0, 4).reduce((sum, c) => sum + c.expenses, 0) / 4;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">12-Month Cash Flow Forecast</h1>
      
      <div className="card">
        <div className="h-96">
          <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500">Avg Monthly Income (4 months)</p>
          <p className="text-2xl font-bold text-green-600">${averageIncome.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Avg Monthly Expenses (4 months)</p>
          <p className="text-2xl font-bold text-red-600">${averageExpenses.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Projected Monthly Savings</p>
          <p className="text-2xl font-bold text-indigo-600">${(averageIncome - averageExpenses).toFixed(2)}</p>
        </div>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Income</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Cash Flow</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cashflow.map(c => (
              <tr key={c.month}>
                <td className="px-4 py-3 text-sm font-medium">{c.month}</td>
                <td className="px-4 py-3 text-sm text-right">${c.income.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">${c.expenses.toFixed(2)}</td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${c.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${c.net.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${c.net >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {c.net >= 0 ? 'Positive' : 'Negative'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}