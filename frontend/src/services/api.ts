import axios from 'axios';

const getBaseUrl = (): string => {
  // If hosted on Vercel, use same-origin /api/v1 proxy to eliminate cross-origin CORS barriers
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return '/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
};

const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 25000,
});

// Response interceptor to normalize network errors and timeouts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      error.message = 'Backend request timed out. The free backend server or database may be waking up. Please retry in a few seconds.';
    } else if (!error.response) {
      error.message = 'Unable to reach backend server. Please ensure the backend and MongoDB database are active.';
    }
    return Promise.reject(error);
  }
);

// Attach Authorization Bearer token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface HealthResponse {
  success: boolean;
  status: string;
  database: string;
  timestamp: string;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
};
