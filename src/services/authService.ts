import { detectBackend } from './ipConfig';

export interface LoginResponse {
  status: 'approved' | 'pending' | 'rejected';
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string | null;
  };
  message?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'monitoring';
  department?: string;
}

export const authService = {
  // POST /api/auth/login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    console.log('\n [authService] Starting login request...');
    const BACKEND_URL = await detectBackend();
    console.log(' [authService] Backend URL:', BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  // POST /api/auth/signup
  signup: async (data: SignupData): Promise<{ message: string }> => {
    const BACKEND_URL = await detectBackend();
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Signup failed');
    return result;
  },

  // POST /api/auth/verify-otp
  verifyOTP: async (email: string, otp: string): Promise<{ message: string }> => {
    const BACKEND_URL = await detectBackend();
    const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invalid OTP');
    return data;
  },

  // POST /api/auth/resend-otp
  resendOTP: async (email: string): Promise<{ message: string }> => {
    const BACKEND_URL = await detectBackend();
    const response = await fetch(`${BACKEND_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
    return data;
  },

  // POST /api/auth/forgot-password (OTP bhejne ke liye)
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const BACKEND_URL = await detectBackend();
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  },

  // ✅ NEW: POST /api/auth/reset-password (OTP verify kar ke password change karne ke liye)
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    console.log('\n📡 [authService] Starting reset password request...');
    const BACKEND_URL = await detectBackend();
    
    const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  },

  // GET /api/auth/profile
  getProfile: async (token: string): Promise<any> => {
    const BACKEND_URL = await detectBackend();
    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch profile');
    return data;
  },
};