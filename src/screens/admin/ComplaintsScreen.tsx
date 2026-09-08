import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { complaintAdminService } from '../../services/complaintAdminService';

export default function ComplaintsScreen({ onBack }: any) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [viewingComplaint, setViewingComplaint] = useState<any>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg });
    Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setToast(null));
    }, 1500);
  };

  // ✅ Screen load hone par data fetch karein
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintAdminService.getAllComplaints();
      setComplaints(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const pendingList = complaints.filter((c: any) => c.status === 'pending');
  const resolvedList = complaints.filter((c: any) => c.status === 'resolved' || c.status === 'rejected');
  const currentList = showResolved ? resolvedList : pendingList;

  const getStatusColor = (status: string) => {
    if (status === 'pending') return '#FF9800';
    if (status === 'resolved') return '#4CAF50';
    if (status === 'rejected') return '#F44336';
    return '#999';
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getTodayDate = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // ✅ UPDATED: Backend API call ke sath
  const handleResolve = async (id: number) => {
    Alert.alert('Resolve Complaint', 'Are you sure you want to mark this as resolved?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Resolve', 
        onPress: async () => {
          try {
            await complaintAdminService.updateStatus(id, 'resolved');
            setViewingComplaint(null);
            showToast('Complaint resolved successfully');
            await fetchComplaints(); // List refresh karein
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to resolve complaint');
          }
        }
      },
    ]);
  };

  // ✅ UPDATED: Backend API call ke sath
  const handleReject = async (id: number) => {
    Alert.alert('Reject Complaint', 'Are you sure you want to reject this complaint?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Reject', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await complaintAdminService.updateStatus(id, 'rejected');
            setViewingComplaint(null);
            showToast('Complaint rejected');
            await fetchComplaints(); // List refresh karein
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reject complaint');
          }
        }
      },
    ]);
  };

  // ==========================================
  // DETAIL VIEW (Full Screen)
  // ==========================================
  if (viewingComplaint) {
    const item = complaints.find((c: any) => c.id === viewingComplaint.id) || viewingComplaint;

    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setViewingComplaint(null)}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complaint Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.detailContent}>
          <View style={styles.detailCard}>
            <Text style={styles.detailName}>{item.submittedBy}</Text>
            <Text style={styles.detailDept}>
              {item.department ? `${item.department} Department` : 'Monitoring Official'}
            </Text>
            <View style={styles.detailDivider} />
            <Text style={styles.detailDate}>Submitted on {item.date}</Text>
          </View>

          <View style={styles.descCard}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>{item.text}</Text>

            {item.status === 'pending' && (
              <View style={styles.descActions}>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
                  <Text style={styles.actionText}>Resolve</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status !== 'pending' && (
              <View style={[styles.resolvedBox, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.resolvedText, { color: getStatusColor(item.status) }]}>
                  {item.status === 'resolved' ? 'Resolved' : 'Rejected'} on {item.resolvedDate}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {toast && (
          <View style={styles.toastOverlay} pointerEvents="none">
            <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
              <Text style={styles.toastText}>{toast.msg}</Text>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // LIST VIEW (Pending / History)
  // ==========================================
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => showResolved ? setShowResolved(false) : onBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{showResolved ? 'Complaint History' : 'Pending Complaints'}</Text>
        {!showResolved ? (
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#1A237E" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBackdrop} />
        </TouchableWithoutFeedback>
      )}
      {menuVisible && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setShowResolved(true); }}>
            <MaterialCommunityIcons name="history" size={18} color="#1A237E" />
            <Text style={styles.menuItemText}>Complaint History</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={styles.emptyText}>Loading complaints...</Text>
          </View>
        ) : currentList.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name={showResolved ? 'check-circle-outline' : 'comment-off-outline'} size={60} color="#999" />
            <Text style={styles.emptyText}>
              {showResolved ? 'No resolved or rejected complaints yet' : 'No pending complaints'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showResolved ? 'Complaints you resolve/reject will appear here' : 'All complaints have been processed'}
            </Text>
          </View>
        ) : (
          currentList.map((item: any) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardAvatar}>
                  <Text style={styles.cardAvatarText}>{getInitials(item.submittedBy)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.teacherName}>{item.submittedBy}</Text>
                  <Text style={styles.deptText}>
                    {item.department ? `${item.department} Department` : 'Monitoring Official'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>{item.date}</Text>

              <TouchableOpacity style={styles.viewBtn} onPress={() => setViewingComplaint(item)}>
                <Text style={styles.viewBtnText}>View Complaint</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {toast && (
        <View style={styles.toastOverlay} pointerEvents="none">
          <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
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
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#1A237E' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  menuBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },

  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  menuDropdown: { position: 'absolute', top: 105, right: 12, backgroundColor: '#FFF', borderRadius: 10, elevation: 9, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, paddingVertical: 6, minWidth: 190, zIndex: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  menuItemText: { fontSize: 14, fontWeight: '700', color: '#1A237E' },

  content: { padding: 15, paddingBottom: 30 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardAvatarText: { fontSize: 16, fontWeight: '800', color: '#1A237E' },
  cardInfo: { flex: 1 },
  teacherName: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 2 },
  deptText: { fontSize: 12, color: '#666' },
  dateText: { fontSize: 12, color: '#666', marginBottom: 12 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },

  viewBtn: { backgroundColor: '#1A237E', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  detailContent: { padding: 15, paddingBottom: 20 },
  detailCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E' },
  detailName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  detailDept: { fontSize: 13, color: '#666', marginTop: 3 },
  detailDivider: { height: 1, backgroundColor: '#E8EAF6', marginVertical: 10 },
  detailDate: { fontSize: 13, color: '#1A237E', fontWeight: '700' },

  descCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  descLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8 },
  descText: { fontSize: 14, color: '#333', lineHeight: 22 },
  descActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F44336', paddingVertical: 12, borderRadius: 8 },
  resolveBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 8 },
  actionText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  resolvedBox: { padding: 12, borderRadius: 8, marginTop: 14 },
  resolvedText: { fontSize: 12, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: '#999', marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },

  toastOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  toast: { paddingHorizontal: 30, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, maxWidth: '80%', backgroundColor: '#FFF' },
  toastText: { color: '#333', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});