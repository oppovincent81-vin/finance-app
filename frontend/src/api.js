import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  getSummary: (month, year) => api.get('/dashboard/summary', { params: { month, year } }),
  getCashflow: (year) => api.get('/dashboard/cashflow', { params: { year } }),
};

export const transactionsApi = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export const budgetApi = {
  get: (month, year) => api.get('/budget', { params: { month, year } }),
  update: (category, month, year, amount) => api.put('/budget', { category, month, year, amount }),
};

export const financialApi = {
  getHealth: (month, year) => api.get('/financial/health', { params: { month, year } }),
};

export const netWorthApi = {
  get: () => api.get('/networth'),
  addSnapshot: (data) => api.post('/networth/snapshot', data),
};

export const savingsApi = {
  getAll: () => api.get('/savings'),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
};

export const debtApi = {
  getAll: () => api.get('/debt'),
  create: (data) => api.post('/debt', data),
  update: (id, data) => api.put(`/debt/${id}`, data),
};

export const importApi = {
  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/api/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  categorize: () => api.post('/import/categorize'),
};

export default api;