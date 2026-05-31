import React, { useState } from 'react';
import { importApi } from '../api';

export default function ImportCenter() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [categorizing, setCategorizing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await importApi.uploadCSV(file);
      setResult({ success: true, message: `Imported ${res.data.imported} transactions` });
      setFile(null);
    } catch (error) {
      setResult({ success: false, message: 'Error importing file' });
    } finally {
      setUploading(false);
    }
  };

  const handleCategorize = async () => {
    setCategorizing(true);
    try {
      const res = await importApi.categorize();
      setResult({ success: true, message: `Categorized ${res.data.categorized} transactions` });
    } catch (error) {
      setResult({ success: false, message: 'Error categorizing' });
    } finally {
      setCategorizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Import Center</h1>
      
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">CSV Import</h2>
        <p className="text-sm text-gray-500 mb-4">Upload your bank CSV export. The system will auto-categorize based on keyword rules.</p>
        
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload & Import'}
          </button>
          <button onClick={handleCategorize} disabled={categorizing} className="btn-secondary">
            {categorizing ? 'Categorizing...' : 'Run Auto-Categorization'}
          </button>
        </div>
        
        {result && (
          <div className={`mt-4 p-3 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {result.message}
          </div>
        )}
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Export a CSV from your bank (Chase, Capital One, etc.)</li>
          <li>Click "Choose File" and select your CSV</li>
          <li>Click "Upload & Import" to add transactions</li>
          <li>Run "Auto-Categorization" to apply keyword-based category rules</li>
          <li>Review and fix any incorrect categories in the Transactions page</li>
        </ol>
      </div>
    </div>
  );
}