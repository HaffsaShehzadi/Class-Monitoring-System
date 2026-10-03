import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

export const tokenStorage = {
  saveToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error saving token:', e);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error reading token:', e);
      return null;
    }
  },

  saveUser: async (user: any) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  getUser: async (): Promise<any | null> => {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error parsing stored user:', e);
      return null;
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};