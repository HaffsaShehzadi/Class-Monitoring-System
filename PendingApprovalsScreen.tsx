import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const INITIAL_REQUESTS = [
  { id: 1, name: 'Ali Khan', role: 'Teacher', email: 'ali@test.com' },
  { id: 2, name: 'Sara Ahmed', role: 'Monitoring Official', email: 'sara@test.com' },
  { id: 3, name: 'Usman Raza', role: 'Admin', email: 'usman@test.com' },
];

export default function PendingApprovalsScreen({ onBack }: { onBack: () => void }) {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const handleAction = (id: number, action: 'approve' | 'remove') => {
    setRequests(prev => prev.filter(req => req.id !== id));
    Alert.alert(action === 'approve' ? '✅ Approved' : '🗑️ Removed', `User has been ${action}d successfully.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {requests.length === 0 ? (
          <Text style={styles.emptyText}>No pending requests ✅</Text>
        ) : (
          requests.map(req => (
            <View key={req.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{req.name}</Text>
                <Text style={styles.role}>{req.role} • {req.email}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => handleAction(req.id, 'approve')}>
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.remove]} onPress={() => handleAction(req.id, 'remove')}>
                  <Text style={styles.btnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  role: { fontSize: 13, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  approve: { backgroundColor: '#4CAF50' },
  remove: { backgroundColor: '#F44336' },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});