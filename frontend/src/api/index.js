import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:13395/api',
  timeout: 10000,
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const studentApi = {
  getList: (params) => api.get('/students/list', { params }),
  getById: (id) => api.get(`/students/${id}`),
  add: (data) => api.post('/students/add', data),
  update: (data) => api.post('/students/update', data),
  delete: (id) => api.delete(`/students/${id}`),
  getStats: () => api.get('/students/stats'),
};

export const classApi = {
  getAll: () => api.get('/classes/all'),
};

export default api;
