import { getDB } from './database';

export interface AttendanceRecord {
  timetable_id: number;  // ✅ NEW - backend sync ke liye zaroori
  teacher_name: string;
  date: string;
  period: number;
  status: 'Present' | 'Absent' | 'Late';
  substitute?: string;
  latitude: number;
  longitude: number;
}

export const saveOfflineAttendance = async (record: AttendanceRecord): Promise<number> => {
  const db = await getDB();
  
  const result = await db.runAsync(
    `INSERT INTO offline_attendance 
     (timetable_id, teacher_name, date, period, status, substitute, latitude, longitude, marked_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      record.timetable_id,  // ✅ NEW
      record.teacher_name,
      record.date,
      record.period,
      record.status,
      record.substitute || '',
      record.latitude,
      record.longitude,
      new Date().toISOString(),
    ]
  );

  await db.runAsync(
    `INSERT INTO sync_queue (table_name, record_id, created_at) VALUES (?, ?, ?)`,
    ['offline_attendance', result.lastInsertRowId, new Date().toISOString()]
  );

  return result.lastInsertRowId;
};

export const getUnsyncedRecords = async (): Promise<any[]> => {
  const db = await getDB();
  return await db.getAllAsync<any>(
    `SELECT * FROM offline_attendance WHERE synced = 0`
  );
};

export const markAsSynced = async (recordId: number) => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE offline_attendance SET synced = 1 WHERE id = ?`,
    [recordId]
  );
};