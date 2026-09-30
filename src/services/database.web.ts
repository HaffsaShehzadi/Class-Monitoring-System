// Web implementation of database (avoids bundling expo-sqlite wa-sqlite.wasm on web)
export const getDB = async (): Promise<any> => {
  return {
    runAsync: async () => ({ lastInsertRowId: 1 }),
    execAsync: async () => {},
    getAllAsync: async () => [],
  };
};

export const initDatabase = async () => {
  return null;
};
