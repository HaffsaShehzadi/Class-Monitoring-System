import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedRecords, markAsSynced } from './offlineStorage';
import { detectBackend } from './ipConfig';
import { tokenStorage } from './tokenStorage';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const syncOfflineData = async () => {
  try {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      console.log('⏳ No internet - sync skipped');
      return;
    }

    const records = await getUnsyncedRecords();
    if (records.length === 0) return;

    console.log(`🔄 Syncing ${records.length} offline records...`);
    const BACKEND_URL = await detectBackend();
    const token = await tokenStorage.getToken();

    const response = await fetch(`${BACKEND_URL}/api/attendance/sync-offline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        records: records.map(r => ({
          local_id: r.id,
          timetable_id: r.timetable_id,
          date: r.date,
          status: r.status.toLowerCase(), // Backend expects 'present' or 'absent'
          substitute_teacher_name: r.substitute || null, // ✅ FIXED: Sending name instead of null ID
          mo_lat: r.latitude,
          mo_lng: r.longitude,
        })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      for (const result of data.results) {
        if (result.success) {
          await markAsSynced(result.local_id);
          console.log(`✅ Record ${result.local_id} synced (server_id: ${result.server_id})`);
        } else {
          console.log(`⚠️ Record ${result.local_id} failed: ${result.error}`);
        }
      }
      console.log(`📊 ${data.message}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`⚠️ Sync failed:`, errorData.message || response.status);
    }
  } catch (error: any) {
    console.log('⏳ Sync skipped - will retry later:', error.message);
  }
};

export const startAutoSync = () => {
  NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncOfflineData();
    }
  });
};