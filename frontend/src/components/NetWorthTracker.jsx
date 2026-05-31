import React, { useState, useEffect } from 'react';
import { netWorthApi } from '../api';
import { Line } from 'react-chartjs-2';

export default function NetWorthTracker() {
  const [netWorthData, setNetWorthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetWorth();
  }, []);

  const fetchNetWorth = async () => {
    try {
      const res = await netWorthApi.get();
      setNetWorthData(res.data);
    } catch (error) {
      console.error('Error fetching net worth:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading net worth...</div>;

  const chartData = {
    labels: netWorthData.history?.map(s => `${s.month} ${s.year}`) || [],
    datasets: [
      {
        label: 'Assets',
        data: netWorthData.history?.map(s => s.total_assets) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
      {
        label: 'Liabilities',
        data: netWorthData.history?.map(s => s.total_liabilities) || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Net Worth',
        data: netWorthData.history?.map(s => s.total_assets - s.total_liabilities) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Net Worth Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-2xl font-bold text-green-600">${netWorthData.current?.assets.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-600">${netWorthData.current?.liabilities.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Net Worth</p>
          <p className="text-2xl font-bold text-indigo-600">${netWorthData.current?.netWorth.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Historical Trend</h2>
        <div className="h-80">
          <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
        </div>
      </div>
    </div>
  );
}