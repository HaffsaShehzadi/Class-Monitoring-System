import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ATTENDANCE_DATA = [
  { id: 1, date: '2024-06-01', class: '10-A', teacher: 'Ali Khan', subject: 'Math', present: 28, absent: 2, edited: false },
  { id: 2, date: '2024-06-01', class: '10-B', teacher: 'Hassan Raza', subject: 'English', present: 25, absent: 5, edited: true },
  { id: 3, date: '2024-05-31', class: '10-A', teacher: 'Ali Khan', subject: 'Math', present: 30, absent: 0, edited: false },
];

export default function AttendanceHistoryScreen({ onBack }: { onBack: () => void }) {
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPresent, setEditPresent] = useState('');
  const [editAbsent, setEditAbsent] = useState('');

  const filteredData = ATTENDANCE_DATA.filter(item => 
    (!filterDate || item.date === filterDate) &&
    (!filterClass || item.class === filterClass)
  );

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditPresent(item.present.toString());
    setEditAbsent(item.absent.toString());
  };

  const handleSave = (id: number) => {
    Alert.alert('✅ Attendance Updated', 'Changes have been saved successfully.');
    setEditingId(null);
  };

  const handleViewToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFilterDate(today);
    Alert.alert('📅 Today\'s Attendance', `Showing records for ${today}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TextInput style={styles.filterInput} placeholder="Filter by Date (YYYY-MM-DD)" value={filterDate} onChangeText={setFilterDate} />
        <TextInput style={styles.filterInput} placeholder="Filter by Class (e.g., 10-A)" value={filterClass} onChangeText={setFilterClass} />
        <TouchableOpacity style={styles.todayBtn} onPress={handleViewToday}>
          <Text style={styles.todayBtnText}>📅 View Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredData.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{item.date}</Text>
              {item.edited && <Text style={styles.editedBadge}>✏️ Edited</Text>}
            </View>
            <Text style={styles.classSubject}>{item.class} • {item.subject}</Text>
            <Text style={styles.teacher}>Teacher: {item.teacher}</Text>
            
            {editingId === item.id ? (
              <View style={styles.editForm}>
                <View style={styles.editRow}>
                  <Text style={styles.editLabel}>Present:</Text>
                  <TextInput style={styles.editInput} keyboardType="numeric" value={editPresent} onChangeText={setEditPresent} />
                </View>
                <View style={styles.editRow}>
                  <Text style={styles.editLabel}>Absent:</Text>
                  <TextInput style={styles.editInput} keyboardType="numeric" value={editAbsent} onChangeText={setEditAbsent} />
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(item.id)}>
                  <Text style={styles.saveBtnText}>💾 Save Changes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.stats}>
                <Text style={styles.present}>✅ Present: {item.present}</Text>
                <Text style={styles.absent}>❌ Absent: {item.absent}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        {filteredData.length === 0 && <Text style={styles.emptyText}>No records found for selected filters</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  filters: { padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  filterInput: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  todayBtn: { backgroundColor: '#4CAF50', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  todayBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  editedBadge: { fontSize: 11, backgroundColor: '#FF9800', color: '#FFF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  classSubject: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 4 },
  teacher: { fontSize: 13, color: '#666', marginBottom: 10 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  present: { fontSize: 14, color: '#4CAF50', fontWeight: '500' },
  absent: { fontSize: 14, color: '#F44336', fontWeight: '500' },
  editBtn: { backgroundColor: '#2196F3', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  editBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  editForm: { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 12 },
  editRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  editLabel: { fontSize: 13, color: '#333', fontWeight: '500', width: 70 },
  editInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 6, padding: 8, fontSize: 14 },
  saveBtn: { backgroundColor: '#4CAF50', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 14, color: '#666' },
});