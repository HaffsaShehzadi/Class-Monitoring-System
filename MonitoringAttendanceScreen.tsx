import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Demo Data: Jo class monitoring official dekh raha hai
const CLASS_STUDENTS = [
  { id: 1, name: 'Student 1', roll: '01' },
  { id: 2, name: 'Student 2', roll: '02' },
  { id: 3, name: 'Student 3', roll: '03' },
];

export default function MonitoringAttendanceScreen({ onBack }: { onBack: () => void }) {
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});

  const markStatus = (id: number, status: string) => {
    setSelectedStatus(prev => ({ ...prev, [id]: status }));
  };

  const handleSubmit = () => {
    Alert.alert('✅ Success', 'Attendance submitted successfully!');
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Computer Science</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {CLASS_STUDENTS.map((student) => (
          <View key={student.id} style={styles.card}>
            <View style={styles.studentInfo}>
              <Text style={styles.name}>{student.name}</Text>
              <Text style={styles.roll}>Roll No: {student.roll}</Text>
            </View>
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Mark Status:</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity 
                  style={[styles.statusBtn, selectedStatus[student.id] === 'present' && styles.btnActive]}
                  onPress={() => markStatus(student.id, 'present')}
                >
                  <Text style={[styles.btnText, selectedStatus[student.id] === 'present' && styles.btnTextActive]}>Present</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusBtn, selectedStatus[student.id] === 'absent' && styles.btnAbsent]}
                  onPress={() => markStatus(student.id, 'absent')}
                >
                  <Text style={[styles.btnText, selectedStatus[student.id] === 'absent' && styles.btnTextActive]}>Absent</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusBtn, selectedStatus[student.id] === 'substitute' && styles.btnSub]}
                  onPress={() => markStatus(student.id, 'substitute')}
                >
                  <Text style={[styles.btnText, selectedStatus[student.id] === 'substitute' && styles.btnTextActive]}>Substitute</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Attendance</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  list: { padding: 15, gap: 15, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, elevation: 2 },
  studentInfo: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  roll: { fontSize: 13, color: '#888' },
  statusContainer: { gap: 8 },
  statusLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  buttonsRow: { flexDirection: 'row', gap: 10 },
  statusBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center' },
  btnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  btnAbsent: { backgroundColor: '#F44336', borderColor: '#F44336' },
  btnSub: { backgroundColor: '#FF9800', borderColor: '#FF9800' },
  btnText: { fontSize: 12, fontWeight: '600', color: '#555' },
  btnTextActive: { color: '#FFF' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  submitBtn: { backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});