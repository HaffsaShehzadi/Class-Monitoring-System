import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCHEDULE = [
  { id: 1, time: '09:00 - 10:00', subject: 'Mathematics', class: '10-A' },
  { id: 2, time: '10:15 - 11:15', subject: 'English', class: '10-B' },
  { id: 3, time: '11:30 - 12:30', subject: 'Physics', class: '10-A' },
];

type AttendanceStatus = 'present' | 'absent' | 'substitute' | null;

export default function TimetableAttendanceScreen({ onBack }: { onBack: () => void }) {
  const [attendance, setAttendance] = useState<Record<number, { status: AttendanceStatus; subName: string }>>({});

  const markAttendance = (id: number, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], status, subName: prev[id]?.subName || '' }
    }));
  };

  const updateSubName = (id: number, name: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], status: prev[id]?.status || 'substitute', subName: name }
    }));
  };

  const handleSubmit = () => {
    Alert.alert('✅ Attendance Saved', 'Timetable attendance has been recorded successfully.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Timetable & Attendance</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {SCHEDULE.map(slot => {
          const current = attendance[slot.id];
          return (
            <View key={slot.id} style={styles.card}>
              <View style={styles.slotInfo}>
                <Text style={styles.time}>{slot.time}</Text>
                <Text style={styles.subject}>{slot.subject} ({slot.class})</Text>
              </View>
              <View style={styles.btnGroup}>
                {(['present', 'absent', 'substitute'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusBtn, current?.status === status && styles.statusBtnActive]}
                    onPress={() => markAttendance(slot.id, status)}
                  >
                    <Text style={[styles.statusText, current?.status === status && { color: '#FFF' }]}>
                      {status === 'present' ? '✅ Present' : status === 'absent' ? '❌ Absent' : '🔄 Substitute'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {current?.status === 'substitute' && (
                <TextInput
                  style={styles.subInput}
                  placeholder="Enter Substitute Teacher Name & Description..."
                  value={current.subName}
                  onChangeText={(text) => updateSubName(slot.id, text)}
                  multiline
                />
              )}
            </View>
          );
        })}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>💾 Save Attendance</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  slotInfo: { marginBottom: 12 },
  time: { fontSize: 14, color: '#666', fontWeight: '500' },
  subject: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginTop: 4 },
  btnGroup: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statusBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#DDD', alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#1A237E', borderColor: '#1A237E' },
  statusText: { fontSize: 13, fontWeight: '600', color: '#333' },
  subInput: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, fontSize: 14, marginTop: 8, minHeight: 60 },
  submitBtn: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});