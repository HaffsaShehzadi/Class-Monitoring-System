import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const adminReportService = {
  getDepartments: async () => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      const response = await fetch(`${BACKEND_URL}/api/departments/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) throw new Error('Backend server error.');
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch departments');
      return data;
    } catch (error: any) {
      console.error('❌ getDepartments error:', error.message);
      throw error;
    }
  },

  getTeachers: async () => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      const response = await fetch(`${BACKEND_URL}/api/users/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) throw new Error('Backend server error.');
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch teachers');
      
      return data.filter((user: any) => user.role && user.role.toLowerCase() === 'teacher');
    } catch (error: any) {
      console.error('❌ getTeachers error:', error.message);
      throw error;
    }
  },

  getDepartmentAttendance: async (departmentId: number, startDate: string, endDate: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    
    const response = await fetch(
      `${BACKEND_URL}/api/reports/department/${departmentId}?startDate=${startDate}&endDate=${endDate}`,
      { 
        method: 'GET', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
      }
    );
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) throw new Error('Backend server error.');
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch department attendance');
    return data;
  },

  getTeacherAttendance: async (teacherId: number, startDate: string, endDate: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    
    const response = await fetch(
      `${BACKEND_URL}/api/reports/teacher/${teacherId}?startDate=${startDate}&endDate=${endDate}`,
      { 
        method: 'GET', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
      }
    );
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) throw new Error('Backend server error.');
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch teacher attendance');
    return data;
  }
};