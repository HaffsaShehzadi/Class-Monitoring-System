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
    console.log(' [authService] Sending Payload:', { email, password: '***' });

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log(' [authService] Response status:', response.status);
    const data = await response.json();
    console.log(' [authService] Response data:', data);

    if (!response.ok) {
      console.log(' [authService] Login API failed:', data.message);
      throw new Error(data.message || 'Login failed');
    }

    console.log(' [authService] Login successful!');
    return data;
  },

  // POST /api/auth/signup
  signup: async (data: SignupData): Promise<{ message: string; demo_otp?: string }> => {
    console.log('\n [authService] Starting signup request...');
    const BACKEND_URL = await detectBackend();
    console.log(' [authService] Backend URL:', BACKEND_URL);
    console.log(' [authService] Sending Payload:', { ...data, password: '***' });

    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log(' [authService] Response status:', response.status);
    const result = await response.json();
    console.log(' [authService] Response data:', result);

    if (!response.ok) {
      console.log(' [authService] Signup API failed:', result.message);
      throw new Error(result.message || 'Signup failed');
    }

    console.log(' [authService] Signup successful!');
    return result;
  },

  // POST /api/auth/verify-otp
  verifyOTP: async (email: string, otp: string): Promise<{ message: string }> => {
    console.log('\n📡 [authService] Starting verify OTP request...');
    const BACKEND_URL = await detectBackend();
    console.log(' [authService] Sending Payload:', { email, otp });

    const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    console.log(' [authService] Response status:', response.status);
    const data = await response.json();
    console.log(' [authService] Response data:', data);

    if (!response.ok) {
      console.log(' [authService] Verify OTP API failed:', data.message);
      throw new Error(data.message || 'Invalid OTP');
    }

    console.log(' [authService] OTP verified successfully!');
    return data;
  },

  // POST /api/auth/resend-otp
  resendOTP: async (email: string): Promise<{ message: string; demo_otp?: string }> => {
    console.log('\n [authService] Starting resend OTP request...');
    const BACKEND_URL = await detectBackend();
    console.log(' [authService] Sending Payload:', { email });

    const response = await fetch(`${BACKEND_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    console.log(' [authService] Response status:', response.status);
    const data = await response.json();
    console.log(' [authService] Response data:', data);

    if (!response.ok) {
      console.log('❌ [authService] Resend OTP API failed:', data.message);
      throw new Error(data.message || 'Failed to resend OTP');
    }

    console.log(' [authService] OTP resent successfully!');
    return data;
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    console.log('\n📡 [authService] Starting forgot password request...');
    const BACKEND_URL = await detectBackend();
    console.log(' [authService] Sending Payload:', { email });

    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    console.log('[authService] Response status:', response.status);
    const data = await response.json();
    console.log(' [authService] Response data:', data);

    if (!response.ok) {
      console.log(' [authService] Forgot Password API failed:', data.message);
      throw new Error(data.message || 'Failed to send reset link');
    }

    console.log('✅ [authService] Forgot password request successful!');
    return data;
  },

  // GET /api/auth/profile
  getProfile: async (token: string): Promise<any> => {
    console.log('\n [authService] Starting get profile request...');
    const BACKEND_URL = await detectBackend();

    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('📥 [authService] Response status:', response.status);

    if (!response.ok) {
      console.log(' [authService] Get Profile API failed');
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    console.log('✅ [authService] Profile fetched successfully:', data);
    return data;
  },
};