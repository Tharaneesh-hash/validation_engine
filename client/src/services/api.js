import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: measure start time for Computer Networks latency calculation
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: performance.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: measure round-trip latency
api.interceptors.response.use(
  (response) => {
    const start = response.config.metadata?.startTime || performance.now();
    const duration = performance.now() - start;
    response.latencyMs = parseFloat(duration.toFixed(2));
    return response;
  },
  (error) => {
    if (error.config?.metadata) {
      error.latencyMs = parseFloat((performance.now() - error.config.metadata.startTime).toFixed(2));
    }
    return Promise.reject(error);
  }
);

export default api;
