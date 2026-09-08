import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const attendanceService = {
  // ✅ FIXED: substitute_teacher_id → substitute_teacher_name (backend ke mutabiq)
  markAttendance: async (timetable_id: number, status: string, substitute_teacher_name: string | null = null) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    console.log('📡 [attendanceService] Marking real-time attendance...');
    
    const response = await fetch(`${BACKEND_URL}/api/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        timetable_id,
        status,
        substitute_teacher_name  // ✅ FIXED: Name bhej rahe hain, ID nahi
      }),
    });

    const data = await response.json();
    console.log('📦 [attendanceService] Mark Attendance Response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark attendance');
    }

    return data;
  },

  getMyHistory: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/attendance/my-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        status: status.toLowerCase(), 
        substitute_teacher_name: substitute_teacher_name || null 
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update attendance');
    }
    return data;
  }
};