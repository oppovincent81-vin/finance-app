import React, { useState, useEffect } from 'react';
import { budgetApi } from '../api';

export default function BudgetVsActual() {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await budgetApi.get(currentMonth, currentYear);
      setBudgetData(res.data);
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (category, amount) => {
    try {
      await budgetApi.update(category, currentMonth, currentYear, amount);
      fetchBudget();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading budget...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budget vs Actual</h1>
      <p className="text-sm text-gray-500">Green = under budget, Red = over budget</p>
      
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {budgetData.categories?.map(cat => (
              <tr key={cat.category}>
                <td className="px-4 py-3 text-sm font-medium">{cat.category}</td>
                <td className="px-4 py-3 text-sm text-right">
                  {editingCategory === cat.category ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="input w-24 text-right"
                      step="10"
                    />
                  ) : (
                    <span>${cat.budget.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">${cat.actual.toFixed(2)}</td>
                <td className={`px-4 py-3 text-sm text-right ${cat.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${cat.variance.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  {editingCategory === cat.category ? (
                    <button onClick={() => handleUpdateBudget(cat.category, parseFloat(editAmount))} className="text-green-600 hover:text-green-800">Save</button>
                  ) : (
                    <button onClick={() => { setEditingCategory(cat.category); setEditAmount(cat.budget); }} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                  )}
                  <span className={`ml-2 inline-block w-3 h-3 rounded-full ${cat.status === 'Under' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-3 text-sm font-bold">TOTAL</td>
              <td className="px-4 py-3 text-sm font-bold text-right">${budgetData.total?.budget.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm font-bold text-right">${budgetData.total?.actual.toFixed(2)}</td>
              <td className={`px-4 py-3 text-sm font-bold text-right ${budgetData.total?.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${budgetData.total?.variance.toFixed(2)}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}