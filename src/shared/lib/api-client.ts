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
 * Check if the current route is a public route that doesn't require authentication
 */
const isPublicRoute = (pathname: string): boolean => {
    const publicRoutes = ['/', '/login', '/register', '/otp'];
    const publicRoutePrefixes = ['/products'];
    
    // Exact match
    if (publicRoutes.includes(pathname)) {
        return true;
    }
    
    // Prefix match (e.g., /products, /products/slug)
    if (publicRoutePrefixes.some(prefix => pathname.startsWith(prefix))) {
        return true;
    }
    
    return false;
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

        const { logout } = useAuthStore.getState();
        
        console.log('[api-client] Error response:', error.response?.status, 'URL:', originalRequest?.url);
        console.log('[api-client] Refresh token is now in httpOnly cookie (not accessible to JS)');

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if we're on a public route
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            const isPublic = isPublicRoute(currentPath);
            
            // For /auth/me requests on public routes, just reject without trying to refresh
            // This is expected behavior - user is not logged in on public pages
            if (originalRequest.url?.includes('/auth/me') && isPublic) {
                return Promise.reject(error);
            }
            
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
            
            console.log('[api-client] Attempting to refresh token...');
            console.log('[api-client] Refresh token will be read from httpOnly cookie by server');

            try {
                // Try to refresh the access token
                // Refresh token is in httpOnly cookie, so we don't send it in body
                // Server will read it from cookies automatically
                const response = await axios.post(
                    '/api/auth/refresh',
                    {}, // No body needed - token is in cookie
                    { withCredentials: true } // Important: sends cookies
                );

                console.log('[api-client] Refresh response:', response.data.success ? 'SUCCESS' : 'FAILED');
                if (response.data.success) {
                    console.log('[api-client] Token refreshed successfully, retrying original request');
                    processQueue(null);
                    isRefreshing = false;
                    return apiClient(originalRequest);
                } else {
                    console.log('[api-client] Refresh returned success:false');
                    throw new Error('Refresh failed');
                }
            } catch (refreshError: unknown) {
                console.error('[api-client] Refresh error:', refreshError);
                if (refreshError instanceof Error) {
                    console.error('[api-client] Refresh error message:', refreshError.message);
                }
                if (axios.isAxiosError(refreshError)) {
                    console.error('[api-client] Refresh error response:', {
                        status: refreshError.response?.status,
                        data: refreshError.response?.data,
                    });
                }
                processQueue(refreshError, null);
                isRefreshing = false;
                logout();
                // Only redirect to login if we're NOT on a public route
                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    if (!isPublicRoute(currentPath) && currentPath !== '/login') {
                        toast.error('نشست شما منقضی شده است. لطفا دوباره وارد شوید.');
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);