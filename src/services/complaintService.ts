import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const complaintService = {
  // Nayi complaint submit karna
  createComplaint: async (text: string) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/complaints/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit complaint');
    }
    return data;
  },

  // Apni complaints fetch karna
  getMyComplaints: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/complaints/mine`, {
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
  }
};