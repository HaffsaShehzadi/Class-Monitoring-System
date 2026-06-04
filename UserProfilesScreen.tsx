import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const APPROVED_USERS = [
  { id: 1, name: 'Ali Khan', role: 'Teacher', email: 'ali@test.com', department: 'Math', assigned: false },
  { id: 2, name: 'Sara Ahmed', role: 'Monitoring Official', email: 'sara@test.com', department: '-', assigned: true },
  { id: 3, name: 'Usman Raza', role: 'Teacher', email: 'usman@test.com', department: 'Physics', assigned: false },
  { id: 4, name: 'Fatima Malik', role: 'Teacher', email: 'fatima@test.com', department: 'English', assigned: false },
];

export default function UserProfilesScreen({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState(APPROVED_USERS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [dutyNote, setDutyNote] = useState('');

  const handleAssignDuty = () => {
    if (!selectedUser || !dutyNote.trim()) {
      Alert.alert('⚠️ Note Required', 'Please enter duty assignment details');
      return;
    }
    setUsers(prev => prev.map(u => 
      u.id === selectedUser ? { ...u, assigned: true } : u
    ));
    Alert.alert('✅ Duty Assigned', `Duty assigned to user #${selectedUser}\nNote: ${dutyNote}`);
    setModalVisible(false);
    setSelectedUser(null);
    setDutyNote('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>User Profiles & Duty</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {users.map(user => (
          <View key={user.id} style={styles.card}>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.role}>{user.role} • {user.department}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, user.assigned ? { color: '#4CAF50' } : { color: '#FF9800' }]}>
                {user.assigned ? '✅ Assigned' : '⏳ Pending'}
              </Text>
            </View>
            {!user.assigned && user.role === 'Teacher' && (
              <TouchableOpacity 
                style={styles.assignBtn}
                onPress={() => { setSelectedUser(user.id); setModalVisible(true); }}
              >
                <Text style={styles.assignBtnText}>Assign Duty</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Assign Duty Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Duty</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter duty details (e.g., Class 10-A, Morning Shift)"
              value={dutyNote}
              onChangeText={setDutyNote}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAssignDuty}>
                <Text style={styles.modalBtnText}>Confirm</Text>
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
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  role: { fontSize: 13, color: '#666', marginTop: 2 },
  email: { fontSize: 12, color: '#999', marginTop: 4 },
  statusBadge: { marginTop: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  assignBtn: { backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginTop: 10, alignItems: 'center' },
  assignBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 15, textAlign: 'center' },
  modalInput: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  confirmBtn: { backgroundColor: '#1A237E' },
  modalBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});