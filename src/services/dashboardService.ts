import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const dashboardService = {
  // ✅ 1. EXISTING: Admin dashboard stats fetch karna (Bilkul safe, koi change nahi)
  getAdminStats: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/dashboard/admin`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }
    return data;
  },

  // ✅ 2. NEW: Pending users ki list fetch karna
  getPendingUsers: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/dashboard/pending-users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch pending users');
    }
    return data;
  },

  // ✅ 3. NEW: User ko approve karna
  approveUser: async (id: number) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/dashboard/approve/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve user');
    }
    return data;
  },

  // ✅ 4. NEW: User ko reject (remove) karna
  rejectUser: async (id: number) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/dashboard/reject/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject user');
    }
    return data;
  }
};