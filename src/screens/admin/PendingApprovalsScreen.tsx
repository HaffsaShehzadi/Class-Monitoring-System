import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, ActivityIndicator, Platform, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardService } from '../../services/dashboardService';

interface PendingApprovalsScreenProps {
  onBack: () => void;
}

export default function PendingApprovalsScreen({ onBack }: PendingApprovalsScreenProps) {
  const [currentView, setCurrentView] = useState<'pending' | 'rejected'>('pending');
  const [requests, setRequests] = useState<any[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRejected, setLoadingRejected] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<any>(null);

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

  const fetchRejectedUsers = async () => {
    setLoadingRejected(true);
    try {
      const data = await dashboardService.getRejectedUsers();
      setRejectedUsers(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load rejected users');
    } finally {
      setLoadingRejected(false);
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

  // Pending user ko Approve karna
  const handleApprove = (id: number, name: string) => {
    Alert.alert('Confirm Approval', `Are you sure you want to approve ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Approve', 
        onPress: async () => {
          try {
            await dashboardService.approveUser(id);
            setRequests(prev => prev.filter(req => req.id !== id));
            showToast(`${name} approved successfully`);
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to approve user');
          }
        }
      }
    ]);
  };

  // Pending user ko Reject karna
  const handleReject = (id: number, name: string) => {
    Alert.alert('Reject Request', `Are you sure you want to reject ${name}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Reject', 
        style: 'destructive',
        onPress: async () => {
          try {
            await dashboardService.rejectUser(id);
            setRequests(prev => prev.filter(req => req.id !== id));
            showToast(`${name} rejected`, 'error');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reject user');
          }
        }
      }
    ]);
  };

  // Rejected user ko Re-Approve karna (Sirf Approve ka button)
  const handleApproveRejected = (id: number, name: string) => {
    Alert.alert('Confirm Approval', `Are you sure you want to approve ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Approve', 
        onPress: async () => {
          try {
            await dashboardService.approveUser(id);
            setRejectedUsers(prev => prev.filter(u => u.id !== id));
            showToast(`${name} approved successfully`);
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to approve user');
          }
        }
      }
    ]);
  };

  const handleHeaderBack = () => {
    if (currentView === 'rejected') {
      setCurrentView('pending');
      fetchPendingUsers();
    } else {
      onBack();
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleHeaderBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {currentView === 'pending' ? 'Pending Approvals' : 'Rejected Users'}
        </Text>

        {currentView === 'pending' ? (
          <TouchableOpacity 
            onPress={() => setShowMenu(prev => !prev)} 
            style={styles.menuBtn} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      {/* Three dots dropdown menu */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.dropdownItem} 
              onPress={() => {
                setShowMenu(false);
                setCurrentView('rejected');
                fetchRejectedUsers();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownItemText}> Rejected Users</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {currentView === 'pending' ? (
          // ==================== PENDING USERS VIEW ====================
          loading ? (
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
                  <TouchableOpacity 
                    style={[styles.btn, styles.approve]} 
                    onPress={() => handleApprove(req.id, req.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btn, styles.remove]} 
                    onPress={() => handleReject(req.id, req.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : (
          // ==================== REJECTED USERS VIEW ====================
          loadingRejected ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#1A237E" />
              <Text style={styles.emptySubtext}>Loading rejected users...</Text>
            </View>
          ) : rejectedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No rejected users</Text>
              <Text style={styles.emptySubtext}>There are currently no rejected accounts</Text>
            </View>
          ) : (
            rejectedUsers.map(user => (
              <View key={user.id} style={styles.card}>
                <View style={styles.infoContainer}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.name}>{user.name}</Text>
                    <View style={styles.rejectedBadge}>
                      <Text style={styles.rejectedBadgeText}>Rejected</Text>
                    </View>
                  </View>
                  <Text style={styles.role}>
                    {user.role === 'teacher' ? 'Teacher' : 'Monitoring Official'}
                  </Text>
                  {user.role === 'teacher' && user.department && (
                    <Text style={styles.department}>{user.department} Department</Text>
                  )}
                </View>
                
                {/* Single Approve button per user requirement */}
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.btn, styles.approve]} 
                    onPress={() => handleApproveRejected(user.id, user.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Toast Notification */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#FFF', 
    paddingTop: Platform.OS === 'web' ? 16 : 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 2, 
    borderBottomColor: '#1A237E',
    zIndex: 10,
  },
  backBtn: { padding: 4, minWidth: 32 },
  backText: { fontSize: 24, color: '#1A237E', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  menuBtn: { padding: 4, minWidth: 32, alignItems: 'flex-end' },
  menuIcon: { fontSize: 24, color: '#1A237E', fontWeight: '900', lineHeight: 26 },
  
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 60 : 95,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 170,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EAF6',
    zIndex: 101,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A237E',
  },

  list: { 
    padding: 20,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, marginBottom: 12, elevation: 2 },
  infoContainer: { marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 17, fontWeight: '700', color: '#1A237E', flex: 1 },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  rejectedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D32F2F',
  },
  role: { fontSize: 14, color: '#555', fontWeight: '500', marginBottom: 3 },
  department: { fontSize: 14, color: '#555', fontWeight: '500', marginBottom: 3 },
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
    zIndex: 200,
  },
  toast: {
    paddingHorizontal: 30, paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, maxWidth: '80%', backgroundColor: '#FFF',
  },
  toastText: { color: '#333', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});