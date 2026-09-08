import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const timetableService = {
  getAll: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/all`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return await response.json();
  },

  getByDayAndShift: async (day: string, shift: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/by-day?day=${day}&shift=${shift}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return await response.json();
  },

  create: async (data: any) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/create`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!response.ok) { const error = await response.json(); throw new Error(error.message || 'Failed to create class'); }
    return await response.json();
  },

  update: async (id: number, data: any) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/update/${id}`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update timetable');
    return await response.json();
  },

  remove: async (id: number) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/delete/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to delete class');
    return await response.json();
  },

  getConfig: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch config');
    return await response.json();
  },

  addSemester: async (name: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config/semester`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
    });
    if (!response.ok) { const error = await response.json(); throw new Error(error.message || 'Failed to add semester'); }
    return await response.json();
  },

  removeSemester: async (name: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config/semester`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to remove semester');
    return await response.json();
  },

  // ✅ NEW: Rename Semester API
  renameSemester: async (oldName: string, newName: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config/semester/rename`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ oldName, newName })
    });
    if (!response.ok) { const error = await response.json(); throw new Error(error.message || 'Failed to rename semester'); }
    return await response.json();
  },

  addPeriod: async (id: number, start_time: string, end_time: string, shift: string, day: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config/period`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, start_time, end_time, shift, day })
    });
    if (!response.ok) { const error = await response.json(); throw new Error(error.message || 'Failed to add period'); }
    return await response.json();
  },

  updatePeriod: async (id: number, start_time: string, end_time: string, shift: string, day: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config/period`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, start_time, end_time, shift, day })
    });
    if (!response.ok) throw new Error('Failed to update period');
    return await response.json();
  },

  deletePeriod: async (id: number) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/timetable/config/period/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to delete period');
    return await response.json();
  }
};