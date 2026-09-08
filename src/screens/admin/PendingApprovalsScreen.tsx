import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardService } from '../../services/dashboardService'; // ✅ NEW IMPORT

interface PendingApprovalsScreenProps {
  onBack: () => void;
}

export default function PendingApprovalsScreen({ onBack }: PendingApprovalsScreenProps) {
  const [requests, setRequests] = useState<any[]>([]); // ✅ Real data state
  const [loading, setLoading] = useState(true); // ✅ Loading state

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<any>(null);

  // ✅ Screen load hone par real data fetch karein
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getPendingUsers();
      setRequests(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setToast(null));
    }, 1500);
  };

  // ✅ UPDATED: Backend API call ke sath
  const handleApprove = (id: number, name: string) => {
    Alert.alert('Confirm Approval', `Are you sure you want to approve ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Approve', 
        onPress: async () => {
          try {
            await dashboardService.approveUser(id);
            setRequests(prev => prev.filter(req => req.id !== id)); // Local state update for smooth UI
            showToast(`${name} approved successfully`);
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to approve user');
          }
        }
      }
    ]);
  };

  // ✅ UPDATED: Backend API call ke sath
  const handleRemove = (id: number, name: string) => {
    Alert.alert('Remove Request', `Are you sure you want to remove ${name}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', 
        style: 'destructive',
        onPress: async () => {
          try {
            await dashboardService.rejectUser(id);
            setRequests(prev => prev.filter(req => req.id !== id)); // Local state update for smooth UI
            showToast(`${name} removed`, 'error');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove user');
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={styles.emptySubtext}>Loading requests...</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySubtext}>All users have been processed</Text>
          </View>
        ) : (
          requests.map(req => (
            <View key={req.id} style={styles.card}>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{req.name}</Text>
                <Text style={styles.role}>
                  {req.role === 'teacher' ? 'Teacher' : 'Monitoring Official'}
                </Text>
                {req.role === 'teacher' && req.department && (
                  <Text style={styles.department}>{req.department} Department</Text>
                )}
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => handleApprove(req.id, req.name)}>
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.remove]} onPress={() => handleRemove(req.id, req.name)}>
                  <Text style={styles.btnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {toast && (
        <View style={styles.toastOverlay} pointerEvents="none">
          <Animated.View 
            style={[styles.toast, {
              opacity: toastAnim,
              transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
            }]}
          >
            <Text style={styles.toastText}>{toast.msg}</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ✅ STYLES: Bilkul same jaise aapke original code mein the (Zero UI changes)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 2, borderBottomColor: '#1A237E'
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: '#1A237E', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, marginBottom: 12, elevation: 2 },
  infoContainer: { marginBottom: 14 },
  name: { fontSize: 17, fontWeight: '700', color: '#1A237E', marginBottom: 6 },
  role: { fontSize: 14, color: '#555', fontWeight: '500', marginBottom: 3 },
  department: { fontSize: 14, color: '#555', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  approve: { backgroundColor: '#4CAF50' },
  remove: { backgroundColor: '#F44336' },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666' },
  toastOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  toast: {
    paddingHorizontal: 30, paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, maxWidth: '80%', backgroundColor: '#FFF',
  },
  toastText: { color: '#333', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});