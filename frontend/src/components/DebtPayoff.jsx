import React, { useState, useEffect } from 'react';
import { debtApi } from '../api';

export default function DebtPayoff() {
  const [debts, setDebts] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({ debt_name: '', current_balance: 0, interest_rate: 0.2499, minimum_payment: 0, your_payment: 0 });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await debtApi.getAll();
      setDebts(res.data.debts);
      setTotals(res.data.totals);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await debtApi.create(newDebt);
      setShowAddForm(false);
      setNewDebt({ debt_name: '', current_balance: 0, interest_rate: 0.2499, minimum_payment: 0, your_payment: 0 });
      fetchDebts();
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const debt = debts.find(d => d.id === id);
      await debtApi.update(id, { ...debt, [field]: parseFloat(value) });
      fetchDebts();
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading debt planner...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Debt Payoff Planner</h1>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">+ Add Debt</button>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debt Name</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Min Payment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Your Payment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Months to Payoff</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Interest</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payoff Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {debts.map(debt => (
              <tr key={debt.id}>
                <td className="px-4 py-3 text-sm font-medium">{debt.debt_name}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <input
                    type="number"
                    value={debt.current_balance}
                    onChange={(e) => handleUpdate(debt.id, 'current_balance', e.target.value)}
                    className="input w-24 text-right"
                    step="10"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-right">{(debt.interest_rate * 100).toFixed(2)}%</td>
                <td className="px-4 py-3 text-sm text-right">${debt.minimum_payment.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <input
                    type="number"
                    value={debt.your_payment}
                    onChange={(e) => handleUpdate(debt.id, 'your_payment', e.target.value)}
                    className="input w-24 text-right"
                    step="10"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-right">{debt.months_to_payoff}</td>
                <td className="px-4 py-3 text-sm text-right">${debt.total_interest.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{debt.payoff_date}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-3 text-sm font-bold">TOTAL</td>
              <td className="px-4 py-3 text-sm font-bold text-right">${totals.balance?.toFixed(2)}</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-sm font-bold text-right">${totals.minimum_payment?.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm font-bold text-right">${totals.monthly_payment?.toFixed(2)}</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Debt</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Debt Name" value={newDebt.debt_name} onChange={(e) => setNewDebt({ ...newDebt, debt_name: e.target.value })} className="input w-full" />
              <input type="number" placeholder="Current Balance" value={newDebt.current_balance} onChange={(e) => setNewDebt({ ...newDebt, current_balance: parseFloat(e.target.value) })} className="input w-full" />
              <input type="number" placeholder="Interest Rate (APR)" step="0.01" value={newDebt.interest_rate} onChange={(e) => setNewDebt({ ...newDebt, interest_rate: parseFloat(e.target.value) })} className="input w-full" />
              <input type="number" placeholder="Minimum Payment" value={newDebt.minimum_payment} onChange={(e) => setNewDebt({ ...newDebt, minimum_payment: parseFloat(e.target.value) })} className="input w-full" />
              <input type="number" placeholder="Your Payment" value={newDebt.your_payment} onChange={(e) => setNewDebt({ ...newDebt, your_payment: parseFloat(e.target.value) })} className="input w-full" />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAdd} className="btn-primary">Add Debt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}