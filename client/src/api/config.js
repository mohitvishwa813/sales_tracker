import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('subscription');
      window.location.href = '/auth';
    }
    // Server returns 403 + code:'SUBSCRIPTION_INACTIVE' when a gated endpoint
    // is hit by an expired user. Bounce them to the upgrade page.
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.code === 'SUBSCRIPTION_INACTIVE' &&
      window.location.pathname !== '/upgrade'
    ) {
      window.location.href = '/upgrade';
    }
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default api;
