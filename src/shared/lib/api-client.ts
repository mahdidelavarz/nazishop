// lib/api-client.ts

import { useAuthStore } from '@/features/auth/store/auth.store';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import toast from 'react-hot-toast';

/**
 * Axios instance with automatic token refresh
 */
export const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true, // Send cookies with requests
});

let isRefreshing = false;
type FailedRequest = {
    resolve: (token?: string | null) => void;
    reject: (error: unknown) => void;
};
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

/**
 * Response interceptor for handling 401 errors and token refresh
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        const { refreshToken, logout } = useAuthStore.getState();

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Wait for the refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;


            if (!refreshToken) {
                isRefreshing = false;
                logout();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                // Try to refresh the access token
                const response = await axios.post(
                    '/api/auth/refresh',
                    { refreshToken },
                    { withCredentials: true }
                );

                if (response.data.success) {
                    processQueue(null);
                    isRefreshing = false;
                    return apiClient(originalRequest);
                } else {
                    throw new Error('Refresh failed');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                logout();
                toast.error('نشست شما منقضی شده است. لطفا دوباره وارد شوید.');
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);