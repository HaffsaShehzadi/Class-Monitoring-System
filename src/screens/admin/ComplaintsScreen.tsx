import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ✅ LOCAL complaints data (App.tsx se nahi)
const INITIAL_COMPLAINTS = [
  { 
    id: 1, 
    text: 'Attendance marked wrong for Monday Period 1. I was present but marked absent.',
    date: '2026-08-20',
    submittedBy: 'Hassan Raza',
    status: 'pending',
    resolvedDate: null,
  },
  { 
    id: 2, 
    text: 'Room number is incorrect in timetable for BSCS 2nd semester. Please update R39 to R41.',
    date: '2026-08-19',
    submittedBy: 'Mohsin Raza',
    status: 'pending',
    resolvedDate: null,
  },
  { 
    id: 3, 
    text: 'My name is misspelled in the attendance report. Please correct it.',
    date: '2026-08-15',
    submittedBy: 'Hasan Raza',
    status: 'resolved',
    resolvedDate: '2026-08-16',
  },
  { 
    id: 4, 
    text: 'The substitute teacher did not show up for my class on Tuesday.',
    date: '2026-08-14',
    submittedBy: 'Ahmad Ali',
    status: 'rejected',
    resolvedDate: '2026-08-15',
  },
];

export default function ComplaintsScreen({ onBack }: any) {
  // ✅ SARA STATE LOCAL - App.tsx se kuch nahi
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);

  const pendingCount = complaints.filter((c: any) => c.status === 'pending').length;

  const getStatusColor = (status: string) => {
    if (status === 'pending') return '#FF9800';
    if (status === 'resolved') return '#4CAF50';
    if (status === 'rejected') return '#F44336';
    return '#999';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'pending') return 'clock-outline';
    if (status === 'resolved') return 'check-circle';
    if (status === 'rejected') return 'close-circle';
    return 'help-circle';
  };

  const handleResolve = (id: number) => {
    Alert.alert('Resolve Complaint', 'Are you sure you want to mark this as resolved?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Resolve', 
        onPress: () => {
          setComplaints(prev => prev.map(c => 
            c.id === id 
              ? { ...c, status: 'resolved', resolvedDate: new Date().toLocaleDateString() } 
              : c
          ));
          Alert.alert('Success', 'Complaint resolved successfully');
        }
      },
    ]);
  };

  const handleReject = (id: number) => {
    Alert.alert('Reject Complaint', 'Are you sure you want to reject this complaint?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Reject', 
        style: 'destructive', 
        onPress: () => {
          setComplaints(prev => prev.map(c => 
            c.id === id 
              ? { ...c, status: 'rejected', resolvedDate: new Date().toLocaleDateString() } 
              : c
          ));
          Alert.alert('Rejected', 'Complaint has been rejected');
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaints</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>{pendingCount} Pending</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {complaints.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="comment-off-outline" size={60} color="#999" />
            <Text style={styles.emptyText}>No complaints received yet</Text>
          </View>
        ) : (
          complaints.map((item: any) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.teacherInfo}>
                  <MaterialCommunityIcons name="account-circle" size={20} color="#1A237E" />
                  <Text style={styles.teacherName}>{item.submittedBy || 'Teacher'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <MaterialCommunityIcons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={styles.complaintText}>{item.text}</Text>

              {item.status === 'pending' ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                    <MaterialCommunityIcons name="close" size={16} color="#FFF" />
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
                    <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                    <Text style={styles.actionText}>Resolve</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.resolvedBox, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <MaterialCommunityIcons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
                  <Text style={[styles.resolvedText, { color: getStatusColor(item.status) }]}>
                    {item.status === 'resolved' ? 'Resolved' : 'Rejected'} on {item.resolvedDate}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#1A237E', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', flex: 1, textAlign: 'center' },
  pendingBadge: { backgroundColor: '#FF9800', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  pendingBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  content: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  teacherInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teacherName: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 5 },
  statusText: { fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 12, color: '#666', marginBottom: 8 },
  complaintText: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F44336', paddingVertical: 10, borderRadius: 8, gap: 6 },
  resolveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', paddingVertical: 10, borderRadius: 8, gap: 6 },
  actionText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  resolvedBox: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, gap: 8 },
  resolvedText: { fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
});