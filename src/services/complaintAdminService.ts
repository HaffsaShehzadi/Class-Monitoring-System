import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const complaintAdminService = {
  // Sari complaints fetch karna (Admin ke liye)
  getAllComplaints: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/complaints/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch complaints');
    }
    return data;
  },

  // Complaint ka status update karna (Resolve / Reject)
  updateStatus: async (id: number, status: 'resolved' | 'rejected') => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/complaints/status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update complaint status');
    }
    return data;
  }
};