import axiosInstance from './axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'company';
}

export interface AuthUser {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'company' | 'student';
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  profileCompleted: boolean;
  company?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  role: string;
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Authenticates a user and returns the user object + JWT token.
 */
export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  // Backend sets httpOnly access + refresh token cookies in the response.
  const { data } = await axiosInstance.post<AuthResponse>('/auth/login', payload);
  return data;
}

/**
 * POST /auth/register
 * Registers a new user (student or company). Account starts as 'pending'.
 */
export async function apiRegister(payload: RegisterPayload): Promise<{ message: string }> {
  const { data } = await axiosInstance.post<{ message: string }>('/users', payload);
  return data;
}

/**
 * POST /auth/logout
 * Invalidates the server-side session and clears the local token.
 */
export async function apiLogout(): Promise<void> {
  // Backend clears the token cookies on its end.
  await axiosInstance.post('/auth/logout');
}

/**
 * POST /auth/refresh-token
 * The browser sends the refresh token cookie automatically (withCredentials).
 * The backend responds with a new access token cookie.
 * The axiosInstance interceptor calls this automatically on 401.
 */
export async function apiRefreshToken(): Promise<void> {
  await axiosInstance.post('/auth/refresh');
}

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 */
export async function apiGetMe(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<AuthUser>('/auth/me');
  return data;
}

// Update User Status (Approve / Block / Reject)
export const updateUserStatus = async (id: string, status: string) => {
  try {
    const res = await axiosInstance.patch(`/users/${id}/status`, { status });
    return res.data;
  } catch (error: unknown) {
    const err = error as { response?: { data: unknown }; message: string };
    throw err.response?.data || err.message;
  }
};

// Get All Users (Admin)
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const res = await axiosInstance.get<AuthUser[]>('/users');
    return res.data;
  } catch (error: unknown) {
    const err = error as { response?: { data: unknown }; message: string };
    throw err.response?.data || err.message;
  }
};

// Get All Jobs (Admin)
export const getAllJobs = async () => {
  try {
    const res = await axiosInstance.get('/jobs');
    return res.data;
  } catch (error: unknown) {
    const err = error as { response?: { data: unknown }; message: string };
    throw err.response?.data || err.message;
  }
};
