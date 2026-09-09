import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';

// ✅ MOCK DATA - Testing ke liye (LOCAL)
const MOCK_PENDING_USERS = [
  { id: 101, name: 'Ali Khan', role: 'teacher', department: 'IT' },
  { id: 102, name: 'Sara Ahmed', role: 'monitoring', department: null },
  { id: 103, name: 'Hassan Raza', role: 'teacher', department: 'BSCS' },
  { id: 104, name: 'Ahmad Ali', role: 'monitoring', department: null },
  { id: 105, name: 'Fatima Noor', role: 'teacher', department: 'Math' },
];

interface PendingApprovalsScreenProps {
  onBack: () => void;
}

export default function PendingApprovalsScreen({ onBack }: PendingApprovalsScreenProps) {
  // ✅ SARA STATE LOCAL - App.tsx se kuch nahi
  const [requests, setRequests] = useState(MOCK_PENDING_USERS);

  // Toast state (auto-dismiss)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<any>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ msg, type });

    // Slide in
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss after 1.5s
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 1500);
  };

  const handleApprove = (id: number, name: string) => {
    Alert.alert(
      'Confirm Approval',
      `Are you sure you want to approve ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            setRequests(prev => prev.filter(req => req.id !== id));
            // TODO: Backend API call
            // API: POST /api/admin/approve/:id
            showToast(`${name} approved successfully`);
          }
        }
      ]
    );
  };

  const handleRemove = (id: number, name: string) => {
    Alert.alert(
      'Remove Request',
      `Are you sure you want to remove ${name}'s request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setRequests(prev => prev.filter(req => req.id !== id));
            // TODO: Backend API call
            // API: POST /api/admin/reject/:id
            showToast(`${name} removed`, 'error');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {requests.length === 0 ? (
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
                <TouchableOpacity 
                  style={[styles.btn, styles.approve]} 
                  onPress={() => handleApprove(req.id, req.name)}
                >
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.remove]} 
                  onPress={() => handleRemove(req.id, req.name)}
                >
                  <Text style={styles.btnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Auto-dismiss Toast */}
      {toast && (
        <Animated.View 
          style={[
            styles.toast,
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.toastText}>{toast.msg}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  
  header: { 
    backgroundColor: '#FFF', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E', flex: 1 },
  
  list: { padding: 15 },
  
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 18, 
    marginBottom: 12, 
    elevation: 2 
  },
  
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

  // Toast styles
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 10,
  },
  toastSuccess: { backgroundColor: '#4CAF50' },
  toastError: { backgroundColor: '#F44336' },
  toastText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});