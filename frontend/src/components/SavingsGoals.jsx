import React, { useState, useEffect } from 'react';
import { savingsApi } from '../api';

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ goal_name: '', target_amount: 0, current_saved: 0, monthly_goal: 0, target_date: '' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await savingsApi.getAll();
      setGoals(res.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await savingsApi.create(newGoal);
      setShowAddForm(false);
      setNewGoal({ goal_name: '', target_amount: 0, current_saved: 0, monthly_goal: 0, target_date: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleUpdate = async (id, current_saved) => {
    try {
      await savingsApi.update(id, { current_saved });
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading savings goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">+ Add Goal</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{goal.goal_name}</h3>
                <p className="text-sm text-gray-500">Target: ${goal.target_amount.toFixed(2)} by {goal.target_date}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${goal.status === 'Complete' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {goal.status}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>${goal.current_saved.toFixed(2)} / ${goal.target_amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${goal.progress * 100}%` }}></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <p>Remaining: <span className="font-medium">${goal.remaining.toFixed(2)}</span></p>
                <p>Monthly goal: ${goal.monthly_goal.toFixed(2)}</p>
              </div>
              <button onClick={() => {
                const newAmount = prompt('Enter current saved amount:', goal.current_saved);
                if (newAmount !== null) handleUpdate(goal.id, parseFloat(newAmount));
              }} className="text-indigo-600 hover:text-indigo-800 text-sm">Update</button>
            </div>
          </div>
        ))}
      </div>
      
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add Savings Goal</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Goal Name" value={newGoal.goal_name} onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })} className="input w-full" />
              <input type="number" placeholder="Target Amount" value={newGoal.target_amount} onChange={(e) => setNewGoal({ ...newGoal, target_amount: parseFloat(e.target.value) })} className="input w-full" />
              <input type="number" placeholder="Current Saved" value={newGoal.current_saved} onChange={(e) => setNewGoal({ ...newGoal, current_saved: parseFloat(e.target.value) })} className="input w-full" />
              <input type="number" placeholder="Monthly Goal" value={newGoal.monthly_goal} onChange={(e) => setNewGoal({ ...newGoal, monthly_goal: parseFloat(e.target.value) })} className="input w-full" />
              <input type="date" placeholder="Target Date" value={newGoal.target_date} onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })} className="input w-full" />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAdd} className="btn-primary">Add Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}