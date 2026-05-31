import React, { useState, useEffect } from 'react';
import { financialApi } from '../api';

export default function FinancialHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await financialApi.getHealth(currentMonth, currentYear);
      setHealth(res.data);
    } catch (error) {
      console.error('Error fetching health score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    switch(rating) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  if (loading) return <div className="text-center py-10">Calculating health score...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Health Score</h1>
      
      <div className="card text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-indigo-100 mb-4">
          <span className="text-4xl font-bold text-indigo-600">{health.total}/100</span>
        </div>
        <h2 className={`text-2xl font-bold ${getRatingColor(health.rating)}`}>{health.rating}</h2>
        <p className="text-gray-500 mt-2">Based on your live transaction data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(health.components || {}).map(([key, value]) => (
          <div key={key} className="card">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-lg font-bold">{value}/25</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(value / 25) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card">
        <h3 className="font-semibold mb-2">Score Guide</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>🌟 90-100: Excellent - Outstanding financial habits</li>
          <li>✅ 75-89: Good - On the right track</li>
          <li>⚠️ 60-74: Fair - Some areas need improvement</li>
          <li>🔴 &lt;60: Needs Attention - Review your spending and savings</li>
        </ul>
      </div>
    </div>
  );
}