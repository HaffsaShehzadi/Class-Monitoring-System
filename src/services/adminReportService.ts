import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const adminReportService = {
  // Departments ki list lana
  getDepartments: async () => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      console.log(' Fetching departments from:', `${BACKEND_URL}/api/departments/all`);
      
      const response = await fetch(`${BACKEND_URL}/api/departments/all`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      // ✅ Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.error('❌ Backend returned HTML instead of JSON:', htmlText.substring(0, 200));
        throw new Error('Backend server error. Check if API is running.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to fetch departments`);
      }
      
      console.log('✅ Departments fetched:', data.length);
      return data;
    } catch (error: any) {
      console.error('❌ getDepartments error:', error.message);
      throw error;
    }
  },

  // Teachers ki list lana
  getTeachers: async () => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      console.log('🔍 Fetching teachers from:', `${BACKEND_URL}/api/users/all`);
      
      const response = await fetch(`${BACKEND_URL}/api/users/all`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      // ✅ Check if response is HTML
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.error(' Backend returned HTML instead of JSON:', htmlText.substring(0, 200));
        throw new Error('Backend server error. Check if API is running.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to fetch teachers`);
      }
      
      console.log('✅ Teachers fetched:', data.length);
      
      // ✅ FIXED: Case-insensitive check
      return data.filter((user: any) => user.role && user.role.toLowerCase() === 'teacher');
    } catch (error: any) {
      console.error('❌ getTeachers error:', error.message);
      throw error;
    }
  },

  // Department wise attendance fetch karna
  getDepartmentAttendance: async (departmentId: number, startDate: string, endDate: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    
    console.log(`🔍 Fetching department attendance for dept ${departmentId} from ${startDate} to ${endDate}`);
    
    const response = await fetch(
      `${BACKEND_URL}/api/reports/department/${departmentId}?startDate=${startDate}&endDate=${endDate}`,
      { 
        method: 'GET', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    // Check if response is HTML
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ Backend returned HTML:', htmlText.substring(0, 200));
      throw new Error('Backend server error while fetching attendance.');
    }
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch department attendance');
    return data;
  },

  // Teacher wise attendance fetch karna
  getTeacherAttendance: async (teacherId: number, startDate: string, endDate: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();
    
    console.log(`🔍 Fetching teacher attendance for teacher ${teacherId} from ${startDate} to ${endDate}`);
    
    const response = await fetch(
      `${BACKEND_URL}/api/reports/teacher/${teacherId}?startDate=${startDate}&endDate=${endDate}`,
      { 
        method: 'GET', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    // Check if response is HTML
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ Backend returned HTML:', htmlText.substring(0, 200));
      throw new Error('Backend server error while fetching attendance.');
    }
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch teacher attendance');
    return data;
  }
};
