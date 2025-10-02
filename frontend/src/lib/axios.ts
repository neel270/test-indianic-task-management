import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh requests
let _isRefreshing = false;
let _failedQueue: Array<{
  resolve: (_token: string) => void;
  reject: (_error: unknown) => void;
}> = [];

// Process queue after token refresh
const processQueue = (error: unknown, token: string | null = null): void => {
  _failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  _failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  async (error: unknown): Promise<void> => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (_isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject });
        })
          .then(async token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            throw err;
          });
      }

      originalRequest._retry = true;
      _isRefreshing = true;


        // No refresh token, redirect to auth
        window.location.href = '/login';

    }

    return Promise.reject(error);
  }
);
export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = '';
  delete apiClient.defaults.headers.common['Authorization'];
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
export default apiClient;
