import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const teacherService = {
  // Teacher ka specific day aur shift ka timetable fetch karna
  getTimetableByDayAndShift: async (day: string, shift: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(
      `${BACKEND_URL}/api/timetable/by-day?day=${encodeURIComponent(day)}&shift=${encodeURIComponent(shift)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch timetable');
    }
    return data;
  }
};