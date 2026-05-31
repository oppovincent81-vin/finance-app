import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, [filterMonth, filterYear]);

  const fetchTransactions = async () => {
    try {
      const res = await transactionsApi.getAll({ month: filterMonth, year: filterYear });
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setEditForm({
      main_category: tx.main_category || '',
      subcategory: tx.subcategory || '',
      notes: tx.notes || ''
    });
  };

  const handleSave = async (id) => {
    try {
      await transactionsApi.update(id, editForm);
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsApi.delete(id);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const categories = [
    'Groceries', 'Dining', 'Transportation', 'Shopping', 'Subscriptions', 
    'Entertainment', 'Health & Wellness', 'Financial', 'Family & Personal'
  ];

  if (loading) return <div className="text-center py-10">Loading transactions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex space-x-2">
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="input"
          >
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subcategory</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{tx.date}</td>
                <td className="px-4 py-3 text-sm font-medium">{tx.merchant}</td>
                <td className="px-4 py-3 text-sm">
                  {editingId === tx.id ? (
                    <select
                      value={editForm.main_category}
                      onChange={(e) => setEditForm({ ...editForm, main_category: e.target.value })}
                      className="input py-1 text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{tx.main_category || 'Uncategorized'}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{tx.subcategory || '-'}</td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${tx.outflow > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.outflow > 0 ? `-$${tx.outflow.toFixed(2)}` : `+$${tx.inflow.toFixed(2)}`}
                </td>
                <td className="px-4 py-3 text-center">
                  {editingId === tx.id ? (
                    <button onClick={() => handleSave(tx.id)} className="text-green-600 hover:text-green-800 mr-2">Save</button>
                  ) : (
                    <button onClick={() => handleEdit(tx)} className="text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                  )}
                  <button onClick={() => handleDelete(tx.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}