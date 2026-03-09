import axios from 'axios';

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BASE_URL =
  typeof window !== "undefined"
    ? "/proxy" // browser → same-domain proxy → cookies work in middleware
    : process.env.NEXT_PUBLIC_API_URL;
// ─── Axios instance ───────────────────────────────────────────────────────────
// The backend sets the JWT in an httpOnly cookie.
// withCredentials: true tells the browser to send that cookie on every request.
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Response interceptor ─────────────────────────────────────────────────────
// On 401 the access token has expired. Call /auth/refresh-token (the browser
// sends the refresh cookie automatically), get a new access cookie, then retry
// the original request. If refresh also fails, redirect to /login.
let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => axiosInstance(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Refresh cookie is sent automatically via withCredentials.
      // Backend sets a new access token cookie in the response.
      await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      processQueue(null);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      if (typeof window !== 'undefined') {
        // window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
