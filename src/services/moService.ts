import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const moService = {
  // ✅ Shift parameter add kiya gaya hai
  getMyDuties: async (params?: { date?: string; shift?: string }) => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      const queryParams = new URLSearchParams();
      if (params?.date) queryParams.append('date', params.date);
      if (params?.shift) queryParams.append('shift', params.shift);
      
      const url = `${BACKEND_URL}/api/monitoring-duty/my-duty${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch duties');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("❌ moService.getMyDuties FAILED:", error.message);
      throw error;
    }
  },

  // ✅ MO ke liye Timetable fetch karna
  getTimetableByDayAndShift: async (day: string, shift: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(
      `${BACKEND_URL}/api/timetable/by-day?day=${day}&shift=${shift}`, 
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return await response.json();
  },

  // ✅ NEW: Config fetch karna (periods + semesters) taake MO ko bhi real timings milen
  getConfig: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch config');
    return await response.json();
  }
};