import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const adminReportService = {
  // Departments ki list lana (Shift ke mutabiq filter frontend mein hoga)
  getDepartments: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/departments/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch departments');
    return data;
  },

  // Teachers ki list lana
  getTeachers: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(`${BACKEND_URL}/api/users/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch teachers');
    // Sirf teachers ko filter karein
    return data.filter((user: any) => user.role === 'Teacher');
  },

  // Department wise attendance fetch karna
  getDepartmentAttendance: async (departmentId: number, startDate: string, endDate: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(
      `${BACKEND_URL}/api/reports/department/${departmentId}?startDate=${startDate}&endDate=${endDate}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch department attendance');
    return data;
  },

  // Teacher wise attendance fetch karna
  getTeacherAttendance: async (teacherId: number, startDate: string, endDate: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    const response = await fetch(
      `${BACKEND_URL}/api/reports/teacher/${teacherId}?startDate=${startDate}&endDate=${endDate}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch teacher attendance');
    return data;
  }
};