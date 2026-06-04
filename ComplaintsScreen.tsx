import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COMPLAINTS = [
  { id: 1, teacher: 'Ali Khan', subject: 'Math', date: '2024-06-01', description: 'Projector not working in Room 101', status: 'pending' },
  { id: 2, teacher: 'Hassan Raza', subject: 'English', date: '2024-05-30', description: 'Need extra copies of worksheets', status: 'pending' },
  { id: 3, teacher: 'Fatima Malik', subject: 'Science', date: '2024-05-28', description: 'AC not cooling properly', status: 'resolved' },
];

export default function ComplaintsScreen({ onBack }: { onBack: () => void }) {
  const [complaints, setComplaints] = useState(COMPLAINTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const handleAction = (action: 'resolve' | 'reject') => {
    if (action === 'resolve' && !resolutionNote.trim()) {
      Alert.alert('⚠️ Note Required', 'Please add a resolution note');
      return;
    }
    setComplaints(prev => prev.map(c => 
      c.id === selectedComplaint.id ? { ...c, status: action } : c
    ));
    Alert.alert(
      action === 'resolve' ? '✅ Complaint Resolved' : '🗑️ Complaint Rejected',
      action === 'resolve' ? `Resolved:\n${resolutionNote}` : 'Complaint has been rejected.'
    );
    setModalVisible(false);
    setResolutionNote('');
    setSelectedComplaint(null);
  };

  const pendingComplaints = complaints.filter(c => c.status === 'pending');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Resolve Complaints</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {pendingComplaints.length === 0 ? (
          <Text style={styles.emptyText}>🎉 All complaints resolved!</Text>
        ) : (
          pendingComplaints.map(complaint => (
            <View key={complaint.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.teacher}>{complaint.teacher}</Text>
                <Text style={styles.date}>{complaint.date}</Text>
              </View>
              <Text style={styles.subject}>{complaint.subject} Department</Text>
              <Text style={styles.description}>{complaint.description}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, styles.resolveBtn]} onPress={() => { setSelectedComplaint(complaint); setModalVisible(true); }}>
                  <Text style={styles.actionBtnText}>✅ Resolve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => { setSelectedComplaint(complaint); setModalVisible(true); }}>
                  <Text style={styles.actionBtnText}>🗑️ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Resolution Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedComplaint ? `${selectedComplaint.teacher}'s Complaint` : ''}</Text>
            <Text style={styles.modalDesc}>{selectedComplaint?.description}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Add resolution note (for Resolve) or reason (for Reject)..."
              multiline
              numberOfLines={4}
              value={resolutionNote}
              onChangeText={setResolutionNote}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => { setModalVisible(false); setResolutionNote(''); }}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.resolveModalBtn]} onPress={() => handleAction('resolve')}>
                <Text style={styles.modalBtnText}>✅ Resolve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.rejectModalBtn]} onPress={() => handleAction('reject')}>
                <Text style={styles.modalBtnText}>🗑️ Reject</Text>
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
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  teacher: { fontSize: 16, fontWeight: '600', color: '#333' },
  date: { fontSize: 13, color: '#999' },
  subject: { fontSize: 14, color: '#1A237E', fontWeight: '500', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  resolveBtn: { backgroundColor: '#4CAF50' },
  rejectBtn: { backgroundColor: '#F44336' },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 15, fontStyle: 'italic' },
  modalInput: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  resolveModalBtn: { backgroundColor: '#4CAF50' },
  rejectModalBtn: { backgroundColor: '#F44336' },
  modalBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});