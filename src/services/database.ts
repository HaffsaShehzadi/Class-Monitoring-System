import * as SQLite from 'expo-sqlite';

const DB_NAME = 'attendance.db';

// ✅ SINGLE shared connection (NPE error fix)
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
};

export const initDatabase = async () => {
  const db = await getDB();
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timetable_id INTEGER NOT NULL,
      teacher_name TEXT NOT NULL,
      date TEXT NOT NULL,
      period INTEGER NOT NULL,
      status TEXT NOT NULL,
      substitute TEXT,
      latitude REAL,
      longitude REAL,
      marked_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  
  return db;
};