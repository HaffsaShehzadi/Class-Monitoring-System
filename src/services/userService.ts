import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

export const userService = {
  // Admin: Saare users ki list fetch karna
  getAllUsers: async () => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/users/all`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }
    return data;
  },

  // Admin: User ko delete karna
  deleteUser: async (id: number) => {
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }
    return data;
  }
};