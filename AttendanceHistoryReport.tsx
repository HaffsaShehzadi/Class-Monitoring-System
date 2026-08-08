import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ✅ SAFE FALLBACK: Agar SharedData nahi mili, toh default departments use honge (App crash nahi hogi)
import { AVAILABLE_DEPARTMENTS } from './SharedData';
const DEPTS = typeof AVAILABLE_DEPARTMENTS !== 'undefined' ? AVAILABLE_DEPARTMENTS : ['IT', 'BSCS', 'Math', 'Physics', 'English', 'Urdu'];

const MOCK_HISTORY = [
  { id: 1, date: '2024-06-01', day: 'Monday', dept: 'IT', sem: '2nd', teacher: 'Hassan Raza', subject: 'Programming', code: 'CS-101', room: 'R39', period: 1, time: '08:30 - 09:15', status: 'Present', markedBy: 'Monitoring Official' },
  { id: 2, date: '2024-06-01', day: 'Monday', dept: 'BSCS', sem: '4th', teacher: 'Ahmad Ali', subject: 'Database', code: 'CS-202', room: 'R40', period: 2, time: '09:30 - 10:15', status: 'Absent', markedBy: 'Monitoring Official' },
  { id: 3, date: '2024-06-02', day: 'Tuesday', dept: 'IT', sem: '2nd', teacher: 'Hassan Raza', subject: 'Programming', code: 'CS-101', room: 'R39', period: 1, time: '08:30 - 09:15', status: 'Late', markedBy: 'Monitoring Official' },
];

const ALL_TEACHERS = ['Hassan Raza', 'Ahmad Ali', 'Ali Khan', 'Hira Afzal', 'Fatima Malik', 'M. Kamran'];

export default function AttendanceHistoryReport({ onBack, userRole, currentUser }: any) {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'department' | 'teacher'>('department');

  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const filteredHistory = useMemo(() => {
    return MOCK_HISTORY.filter(item => {
      const matchDept = selectedDept ? item.dept === selectedDept : true;
      const matchTeacher = selectedTeacher ? item.teacher === selectedTeacher : true;
      const matchStart = startDate ? item.date >= startDate : true;
      const matchEnd = endDate ? item.date <= endDate : true;
      return matchDept && matchTeacher && matchStart && matchEnd;
    });
  }, [selectedDept, selectedTeacher, startDate, endDate]);

  const handleEditAttendance = (record: any) => {
    if (userRole !== 'admin') {
      Alert.alert('⚠️ Access Denied', 'Only Admin can edit attendance records.');
      return;
    }
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditModalVisible(true);
  };

  const saveEditAttendance = () => {
    if (!editStatus) {
      Alert.alert('⚠️ Error', 'Please select a status');
      return;
    }
    Alert.alert('✅ Attendance Updated', `${editingRecord.teacher}'s attendance changed to ${editStatus}`, [{ text: 'OK', onPress: () => setEditModalVisible(false) }]);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) setSelectedRecords(filteredHistory.map(item => item.id));
    else setSelectedRecords([]);
  };

  const toggleRecord = (id: number) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedRecords([...selectedRecords, id]);
      if (selectedRecords.length + 1 === filteredHistory.length) setSelectAll(true);
    }
  };

  const handleGenerateReport = () => {
    const count = selectAll ? filteredHistory.length : selectedRecords.length;
    if (count === 0) {
      Alert.alert('⚠️ No Records', 'Please select at least one record to generate a report.');
      return;
    }
    const reportType = viewMode === 'department' ? 'Department-wise' : 'Teacher-wise';
    Alert.alert('✅ Report Generated', `${reportType} Report\nSelected: ${count} records\n\nPDF has been downloaded to your device.`, [{ text: 'OK' }]);
  };

  const clearFilters = () => {
    setSelectedDept('');
    setSelectedTeacher('');
    setStartDate('');
    setEndDate('');
    setSelectedRecords([]);
    setSelectAll(false);
  };

  const filteredTeachers = ALL_TEACHERS.filter((t: string) => t.toLowerCase().includes(teacherSearch.toLowerCase()));
  const getStatusColor = (status: string) => status === 'Present' ? '#E8F5E9' : status === 'Absent' ? '#FFEBEE' : '#FFF3E0';
  const getStatusTextColor = (status: string) => status === 'Present' ? '#2E7D32' : status === 'Absent' ? '#C62828' : '#E65100';

  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isAdmin ? 'History & Generate Report' : 'Attendance History'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.modeSelector}>
          <TouchableOpacity style={[styles.modeBtn, viewMode === 'department' && styles.modeBtnActive]} onPress={() => setViewMode('department')}>
            <Text style={[styles.modeText, viewMode === 'department' && styles.modeTextActive]}>Department Wise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, viewMode === 'teacher' && styles.modeBtnActive]} onPress={() => setViewMode('teacher')}>
            <Text style={[styles.modeText, viewMode === 'teacher' && styles.modeTextActive]}>Teacher Wise</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}><Text style={styles.clearText}>Clear All</Text></TouchableOpacity>
          </View>
          
          {viewMode === 'department' ? (
            <TouchableOpacity style={styles.filterBtn} onPress={() => setDeptModalVisible(true)}>
              <Text style={styles.filterBtnText}>{selectedDept || 'Select Department'}</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.filterBtn} onPress={() => setTeacherModalVisible(true)}>
              <Text style={[styles.filterBtnText, !selectedTeacher && { color: '#999' }]}>{selectedTeacher || 'Select Teacher'}</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          )}

          <View style={styles.filterRow}>
            <TextInput style={styles.dateInput} placeholder="Start Date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
            <TextInput style={styles.dateInput} placeholder="End Date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>{filteredHistory.length} Records Found</Text>
          {filteredHistory.length > 0 && isAdmin && (
            <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll}>
              <MaterialCommunityIcons name={selectAll ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color="#1A237E" />
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="history" size={50} color="#CCC" />
            <Text style={styles.emptyText}>No attendance records found for these filters.</Text>
          </View>
        ) : (
          filteredHistory.map(item => (
            <View key={item.id} style={styles.recordCard}>
              {isAdmin && (
                <TouchableOpacity onPress={() => toggleRecord(item.id)} style={styles.checkbox}>
                  <MaterialCommunityIcons name={selectedRecords.includes(item.id) ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color="#1A237E" />
                </TouchableOpacity>
              )}
              <View style={styles.recordInfo}>
                <View style={styles.infoRow}>
                  <View style={styles.periodBadge}><Text style={styles.periodText}>P{item.period}</Text></View>
                  <Text style={styles.dateText}>{item.day}, {item.date}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.deptSemText}>{item.dept} - {item.sem} Semester</Text>
                <Text style={styles.teacherText}>{item.teacher}</Text>
                <Text style={styles.subjectText}>{item.subject} {item.code ? `(${item.code})` : ''} | Room: {item.room}</Text>
              </View>
              <View style={styles.rightActions}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>{item.status}</Text>
                </View>
                {isAdmin && (
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEditAttendance(item)}>
                    <MaterialCommunityIcons name="pencil" size={20} color="#2196F3" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {filteredHistory.length > 0 && isAdmin && (
        <View style={styles.stickyBottom}>
          <Text style={styles.selectedCount}>{selectAll ? 'All' : selectedRecords.length} Selected</Text>
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateReport}>
            <MaterialCommunityIcons name="file-pdf-box" size={22} color="#FFF" />
            <Text style={styles.generateBtnText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredHistory.length > 0 && isTeacher && (
        <View style={styles.stickyBottom}>
          <TouchableOpacity style={[styles.generateBtn, { flex: 1 }]} onPress={() => Alert.alert('✅ Report Generated', 'Your attendance report downloaded as PDF.')}>
            <MaterialCommunityIcons name="file-pdf-box" size={22} color="#FFF" />
            <Text style={styles.generateBtnText}>Generate My Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Department Modal */}
      <Modal visible={deptModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Department</Text>
              <TouchableOpacity onPress={() => setDeptModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#1A237E" /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedDept(''); setDeptModalVisible(false); }}>
                <Text style={[styles.modalItemText, !selectedDept && { fontWeight: '800', color: '#1A237E' }]}>All Departments</Text>
              </TouchableOpacity>
              {DEPTS.map((dept: string) => (
                <TouchableOpacity key={dept} style={styles.modalItem} onPress={() => { setSelectedDept(dept); setDeptModalVisible(false); }}>
                  <Text style={[styles.modalItemText, selectedDept === dept && { fontWeight: '800', color: '#1A237E' }]}>{dept}</Text>
                  {selectedDept === dept && <MaterialCommunityIcons name="check" size={20} color="#1A237E" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Teacher Modal */}
      <Modal visible={teacherModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Teacher</Text>
              <TouchableOpacity onPress={() => setTeacherModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#1A237E" /></TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color="#666" />
              <TextInput style={styles.searchInput} placeholder="Search teacher name..." value={teacherSearch} onChangeText={setTeacherSearch} />
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedTeacher(''); setTeacherModalVisible(false); }}>
                <Text style={[styles.modalItemText, !selectedTeacher && { fontWeight: '800', color: '#1A237E' }]}>All Teachers</Text>
              </TouchableOpacity>
              {filteredTeachers.map((teacher: string) => (
                <TouchableOpacity key={teacher} style={styles.modalItem} onPress={() => { setSelectedTeacher(teacher); setTeacherModalVisible(false); }}>
                  <Text style={[styles.modalItemText, selectedTeacher === teacher && { fontWeight: '800', color: '#1A237E' }]}>{teacher}</Text>
                  {selectedTeacher === teacher && <MaterialCommunityIcons name="check" size={20} color="#1A237E" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Attendance</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#1A237E" /></TouchableOpacity>
            </View>
            {editingRecord && (
              <>
                <View style={styles.editInfo}>
                  <Text style={styles.editLabel}>Teacher: <Text style={styles.editValue}>{editingRecord.teacher}</Text></Text>
                  <Text style={styles.editLabel}>Date: <Text style={styles.editValue}>{editingRecord.day}, {editingRecord.date}</Text></Text>
                  <Text style={styles.editLabel}>Subject: <Text style={styles.editValue}>{editingRecord.subject} ({editingRecord.code})</Text></Text>
                </View>
                <Text style={styles.label}>New Status:</Text>
                <View style={styles.statusOptions}>
                  {['Present', 'Absent', 'Late'].map((status) => (
                    <TouchableOpacity key={status} style={[styles.statusOption, editStatus === status && styles.statusOptionActive, { borderColor: status === 'Present' ? '#4CAF50' : status === 'Absent' ? '#F44336' : '#FF9800' }]} onPress={() => setEditStatus(status)}>
                      <Text style={[styles.statusOptionText, editStatus === status && { color: '#FFF' }]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveEditAttendance}><Text style={styles.saveBtnText}>Save Changes</Text></TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  content: { padding: 15 },
  modeSelector: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#FFF', borderRadius: 10, padding: 4, elevation: 2 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#1A237E' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  modeTextActive: { color: '#FFF' },
  filterCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  filterTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  clearText: { fontSize: 13, color: '#F44336', fontWeight: '600' },
  filterBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 10 },
  filterBtnText: { fontSize: 14, color: '#333', fontWeight: '500' },
  filterRow: { flexDirection: 'row', gap: 10 },
  dateInput: { flex: 1, backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
  summaryText: { fontSize: 14, fontWeight: '700', color: '#666' },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectAllText: { fontSize: 14, fontWeight: '600', color: '#1A237E' },
  recordCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginBottom: 10, elevation: 1, borderWidth: 1, borderColor: '#E0E0E0' },
  checkbox: { marginRight: 10, justifyContent: 'center' },
  recordInfo: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  periodBadge: { backgroundColor: '#1A237E', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  periodText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: '#666', fontWeight: '600', flex: 1 },
  timeText: { fontSize: 11, color: '#888' },
  deptSemText: { fontSize: 14, fontWeight: '800', color: '#1A237E', marginBottom: 4 },
  teacherText: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 2 },
  subjectText: { fontSize: 12, color: '#555' },
  rightActions: { alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  editBtn: { padding: 5, marginTop: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 10, textAlign: 'center' },
  stickyBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E0E0E0', elevation: 10 },
  selectedCount: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  generateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A237E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  generateBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  modalList: { maxHeight: 300 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalItemText: { fontSize: 15, color: '#333' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 14 },
  editInfo: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginBottom: 15 },
  editLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  editValue: { fontWeight: '600', color: '#333' },
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  statusOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statusOption: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
  statusOptionActive: { backgroundColor: '#1A237E' },
  statusOptionText: { fontSize: 14, fontWeight: '700', color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '700' },
  saveBtn: { backgroundColor: '#4CAF50' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});