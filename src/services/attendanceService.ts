import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const attendanceService = {
  markAttendance: async (timetable_id: number, status: string, substitute_teacher_name: string | null = null) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          timetable_id,
          status,
          substitute_teacher_name,
        }),
      });
    } catch (networkError: any) {
      // ✅ Network Error Flag
      const error = new Error('Network error - no connection to server');
      (error as any).isNetworkError = true;
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      // ✅ Backend Validation Error Flag
      const error = new Error(data.message || `Server error: ${response.status}`);
      (error as any).isNetworkError = false;
      throw error;
    }

    return data;
  },

  getMyHistory: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/attendance/my-history`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch history');
    return data;
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
  }
};