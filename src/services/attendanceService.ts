import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const attendanceService = {
  markAttendance: async (
    timetable_id: number, 
    status: string, 
    substitute_teacher_name: string | null = null,
    latitude?: number,
    longitude?: number,
    date?: string
  ) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ timetable_id, status, substitute_teacher_name, latitude, longitude, date }),
      });
    } catch (networkError: any) {
      const error = new Error('Network error - no connection to server');
      (error as any).isNetworkError = true;
      throw error;
    }

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || `Server error: ${response.status}`);
      (error as any).isNetworkError = false;
      throw error;
    }
    return data;
  },

  // ✅ FIXED: Explicitly calls /my-history which relies ONLY on the JWT token
    // ✅ FIXED: Ab yeh sahi endpoint call karega
  getMyHistory: async (startDate: string, endDate: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const user = await tokenStorage.getUser(); // ✅ User info nikalo
    
    // ✅ Agar teacher hai toh apni ID use kare
    if (user && user.role === 'teacher') {
      const response = await fetch(
        `${BACKEND_URL}/api/reports/teacher/${user.id}?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch history');
      return data;
    }
    
    // ✅ Fallback for other roles
    throw new Error('Invalid user role');
  },

  updateAttendance: async (id: number, status: string, substitute_teacher_name?: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/attendance/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: status.toLowerCase(), substitute_teacher_name: substitute_teacher_name || null }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update attendance');
    return data;
  },

  getTodayAttendance: async (date?: string) => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      const url = `${BACKEND_URL}/api/attendance/today${date ? `?date=${date}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e: any) {
      console.warn('⚠️ getTodayAttendance error:', e.message);
      return [];
    }
  }
};