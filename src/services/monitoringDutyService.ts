import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const monitoringDutyService = {
  getAllDuties: async () => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      const response = await fetch(`${BACKEND_URL}/api/monitoring-duty/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Backend Error in getAllDuties:", errorData);
        throw new Error(errorData.message || 'Failed to fetch duties');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("❌ monitoringDutyService.getAllDuties FAILED:", error.message);
      return []; // Agar error aye toh khali array, lekin upar console mein error print ho jayega
    }
  },

  assignDuty: async (official_id: number, department_ids: number[], shift: string, duty_date: string) => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      const response = await fetch(`${BACKEND_URL}/api/monitoring-duty/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ official_id, department_id: department_ids, shift, duty_date })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign duty');
      }

      return await response.json();
    } catch (error: any) {
      console.error("❌ monitoringDutyService.assignDuty FAILED:", error.message);
      throw error;
    }
  },

  removeDuty: async (id: number) => {
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      const response = await fetch(`${BACKEND_URL}/api/monitoring-duty/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove duty');
      }

      return await response.json();
    } catch (error: any) {
      console.error("❌ monitoringDutyService.removeDuty FAILED:", error.message);
      throw error;
    }
  }
};