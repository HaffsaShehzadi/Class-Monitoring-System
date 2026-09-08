import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

export const tokenStorage = {
  saveToken: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  saveUser: async (user: any) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: async (): Promise<any | null> => {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearAll: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};