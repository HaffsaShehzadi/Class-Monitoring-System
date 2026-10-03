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
