import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COMPLAINTS = [
  { 
    id: 1, 
    teacher: 'Ali Khan', 
    subject: 'Math', 
    date: '2024-06-01', 
    description: 'Period 2 mein mujhe ghalat "Absent" mark kiya gaya hai, jabke main class le raha tha.', 
    status: 'pending' 
  },
  { 
    id: 2, 
    teacher: 'Hassan Raza', 
    subject: 'English', 
    date: '2024-05-30', 
    description: '30 May ko mujhe ghalat "Late" mark kiya gaya, main time par class mein mojood tha.', 
    status: 'pending' 
  },
  { 
    id: 3, 
    teacher: 'Fatima Malik', 
    subject: 'Science', 
    date: '2024-05-28', 
    description: '28 May ki meri Period 3 ki attendance system mein missing show ho rahi hai.', 
    status: 'pending' 
  },
];

export default function ComplaintsScreen({ onBack }: { onBack: () => void }) {
  const [complaints, setComplaints] = useState(COMPLAINTS);
  
  // Detail Screen Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  
  // Action (Note) Modal
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionMode, setActionMode] = useState<'resolve' | 'reject'>('resolve');
  const [note, setNote] = useState('');

  const openDetailScreen = (complaint: any) => {
    setSelectedComplaint(complaint);
    setDetailModalVisible(true);
  };

  const openActionModal = (mode: 'resolve' | 'reject') => {
    setActionMode(mode);
    setNote('');
    setActionModalVisible(true);
  };

  const handleConfirmAction = () => {
    if (!note.trim()) {
      Alert.alert(
        '⚠️ Required', 
        `Please enter a ${actionMode === 'resolve' ? 'resolution note' : 'reason for rejection'}.`
      );
      return;
    }

    setComplaints(prev => prev.map(c => 
      c.id === selectedComplaint.id ? { ...c, status: actionMode === 'resolve' ? 'resolved' : 'rejected' } : c
    ));

    const successMsg = actionMode === 'resolve' 
      ? `✅ Resolved!\nNote: ${note}\n\n📩 Teacher ki attendance update kar di gayi hai.`
      : `❌ Rejected!\nReason: ${note}\n\n📩 Teacher ko rejection message bhej diya gaya hai.`;

    Alert.alert('Success', successMsg, [
      { 
        text: 'OK', 
        onPress: () => {
          setActionModalVisible(false);
          setDetailModalVisible(false);
          setNote('');
          setSelectedComplaint(null);
        } 
      }
    ]);
  };

  const pendingComplaints = complaints.filter(c => c.status === 'pending');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resolve Complaints</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.list}>
        {pendingComplaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="check-circle-outline" size={60} color="#4CAF50" />
            <Text style={styles.emptyText}>🎉 All complaints resolved!</Text>
          </View>
        ) : (
          pendingComplaints.map(complaint => (
            <View key={complaint.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="account-school" size={28} color="#1A237E" />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.teacher}>{complaint.teacher}</Text>
                  <Text style={styles.department}>{complaint.subject} Department</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewBtn} 
                onPress={() => openDetailScreen(complaint)}
              >
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#FFF" />
                <Text style={styles.viewBtnText}>View Complaint</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Detail Screen Modal */}
      <Modal visible={detailModalVisible} animationType="slide">
        <View style={styles.detailScreen}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Complaint Details</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.detailContent}>
            <View style={styles.teacherProfile}>
              <View style={styles.detailAvatar}>
                <MaterialCommunityIcons name="account-school" size={40} color="#1A237E" />
              </View>
              <Text style={styles.detailTeacherName}>{selectedComplaint?.teacher}</Text>
              <Text style={styles.detailDepartment}>{selectedComplaint?.subject} Department</Text>
            </View>
            
            <View style={styles.complaintBox}>
              <View style={styles.complaintLabelRow}>
                <MaterialCommunityIcons name="calendar" size={18} color="#1A237E" />
                <Text style={styles.complaintLabel}>Date</Text>
                <Text style={styles.complaintValue}>{selectedComplaint?.date}</Text>
              </View>
              
              <View style={styles.complaintLabelRow}>
                <MaterialCommunityIcons name="label" size={18} color="#1A237E" />
                <Text style={styles.complaintLabel}>Status</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              </View>
              
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Complaint</Text>
                <Text style={styles.descriptionText}>{selectedComplaint?.description}</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={[styles.bottomBtn, styles.bottomRejectBtn]} 
              onPress={() => openActionModal('reject')}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#FFF" />
              <Text style={styles.bottomBtnText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bottomBtn, styles.bottomResolveBtn]} 
              onPress={() => openActionModal('resolve')}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
              <Text style={styles.bottomBtnText}>Resolve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action Modal (Note Input) */}
      <Modal visible={actionModalVisible} transparent animationType="fade">
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>
                {actionMode === 'resolve' ? '✅ Resolve Complaint' : '❌ Reject Complaint'}
              </Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder={actionMode === 'resolve' 
                ? "Resolution note..." 
                : "Rejection reason..."}
              multiline
              numberOfLines={4}
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalBtn, 
                  actionMode === 'resolve' ? styles.confirmResolveBtn : styles.confirmRejectBtn
                ]} 
                onPress={handleConfirmAction}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  list: { padding: 15 },
  
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { textAlign: 'center', marginTop: 15, fontSize: 18, fontWeight: '600', color: '#666' },
  
  // Card Styles
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#E8EAF6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  infoContainer: { flex: 1 },
  teacher: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 2 },
  department: { fontSize: 14, color: '#666', fontWeight: '500' },
  
  viewBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#1A237E', 
    paddingVertical: 12, 
    borderRadius: 8, 
    gap: 8 
  },
  viewBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  
  // Detail Screen
  detailScreen: { flex: 1, backgroundColor: '#F5F5F5' },
  detailHeader: { 
    backgroundColor: '#FFF', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  detailHeaderTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  detailContent: { padding: 15 },
  
  teacherProfile: { alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 2 },
  detailAvatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#E8EAF6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 10 
  },
  detailTeacherName: { fontSize: 20, fontWeight: '800', color: '#1A237E', marginBottom: 4 },
  detailDepartment: { fontSize: 14, color: '#666', fontWeight: '600' },
  
  complaintBox: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, elevation: 2 },
  complaintLabelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  complaintLabel: { fontSize: 14, color: '#666', fontWeight: '600', marginLeft: 8, flex: 1 },
  complaintValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  
  pendingBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pendingText: { color: '#F57C00', fontSize: 12, fontWeight: '700' },
  
  descriptionBox: { marginTop: 15 },
  descriptionLabel: { fontSize: 14, color: '#1A237E', fontWeight: '700', marginBottom: 8 },
  descriptionText: { 
    fontSize: 15, 
    color: '#333', 
    lineHeight: 22, 
    backgroundColor: '#F9F9F9', 
    padding: 12, 
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1A237E'
  },
  
  bottomActions: { 
    flexDirection: 'row', 
    padding: 15, 
    paddingBottom: 30,
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0',
    gap: 12 
  },
  bottomBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15, 
    borderRadius: 10, 
    gap: 6 
  },
  bottomRejectBtn: { backgroundColor: '#F44336' },
  bottomResolveBtn: { backgroundColor: '#4CAF50' },
  bottomBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  
  // Action Modal
  actionModalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionModalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 20, 
    width: '90%', 
    maxWidth: 400, 
    elevation: 10 
  },
  actionModalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  actionModalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  
  modalInput: { 
    backgroundColor: '#F9F9F9', 
    borderWidth: 1.5, 
    borderColor: '#DDD', 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 14, 
    minHeight: 80, 
    textAlignVertical: 'top', 
    marginBottom: 20 
  },
  
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  
  cancelBtn: { backgroundColor: '#E0E0E0' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '700' },
  
  confirmResolveBtn: { backgroundColor: '#4CAF50' },
  confirmRejectBtn: { backgroundColor: '#F44336' },
  confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});