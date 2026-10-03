import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const moService = {
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch duties');
      }
      return await response.json();
    } catch (error: any) {
      console.error("❌ moService.getMyDuties FAILED:", error.message);
      throw error;
    }
  },

  getTimetableByDayAndShift: async (day: string, shift: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/by-day?day=${day}&shift=${shift}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return await response.json();
  },

  getConfig: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch config');
    return await response.json();
  },

  getMOHistory: async (date: string, departmentId: number) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    
    const response = await fetch(
      `${BACKEND_URL}/api/reports/mo-history?date=${date}&department_id=${departmentId}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch MO history');
    }
    return await response.json();
  }
};