import api from './axios'

export const getDashboardStats = () => api.get('/stats/dashboard')
