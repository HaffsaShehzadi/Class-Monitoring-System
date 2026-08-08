import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StatusBar, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  const showBottomBar = filteredHistory.length > 0 && (isAdmin || isTeacher);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isAdmin ? 'History & Generate Report' : 'Attendance History'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.content, 
          showBottomBar && { paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
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
              <MaterialCommunityIcons name="school-outline" size={18} color="#666" />
              <Text style={[styles.filterBtnText, !selectedDept && { color: '#999' }]}>{selectedDept || 'Select Department'}</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.filterBtn} onPress={() => setTeacherModalVisible(true)}>
              <MaterialCommunityIcons name="account-tie" size={18} color="#666" />
              <Text style={[styles.filterBtnText, !selectedTeacher && { color: '#999' }]}>{selectedTeacher || 'Select Teacher'}</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          )}

          <View style={styles.filterRow}>
            <View style={styles.dateInputWrapper}>
              <MaterialCommunityIcons name="calendar-start" size={18} color="#666" style={styles.dateIcon} />
              <TextInput style={styles.dateInput} placeholder="Start Date (YYYY-MM-DD)" placeholderTextColor="#999" value={startDate} onChangeText={setStartDate} />
            </View>
            <View style={styles.dateInputWrapper}>
              <MaterialCommunityIcons name="calendar-end" size={18} color="#666" style={styles.dateIcon} />
              <TextInput style={styles.dateInput} placeholder="End Date (YYYY-MM-DD)" placeholderTextColor="#999" value={endDate} onChangeText={setEndDate} />
            </View>
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
            <MaterialCommunityIcons name="history" size={60} color="#CCC" />
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
                <Text style={styles.deptSemText}>{item.dept} • {item.sem} Semester</Text>
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
      </ScrollView>

      {/* Sticky Bottom Bar */}
      {showBottomBar && (
        <View style={styles.stickyBottom}>
          {isAdmin ? (
            <>
              <Text style={styles.selectedCount}>{selectAll ? 'All' : selectedRecords.length} Selected</Text>
              <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateReport}>
                <MaterialCommunityIcons name="file-pdf-box" size={22} color="#FFF" />
                <Text style={styles.generateBtnText}>Generate Report</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.generateBtn, { flex: 1 }]} onPress={() => Alert.alert('✅ Report Generated', 'Your attendance report downloaded as PDF.')}>
              <MaterialCommunityIcons name="file-pdf-box" size={22} color="#FFF" />
              <Text style={styles.generateBtnText}>Generate My Report</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Department Modal - CENTERED */}
      <Modal visible={deptModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Department</Text>
              <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={[styles.modalItem, !selectedDept && styles.modalItemActive]} 
                onPress={() => { setSelectedDept(''); setDeptModalVisible(false); }}
              >
                <Text style={[styles.modalItemText, !selectedDept && styles.modalItemTextActive]}>All Departments</Text>
                {!selectedDept && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
              </TouchableOpacity>
              {DEPTS.map((dept: string) => (
                <TouchableOpacity 
                  key={dept} 
                  style={[styles.modalItem, selectedDept === dept && styles.modalItemActive]} 
                  onPress={() => { setSelectedDept(dept); setDeptModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, selectedDept === dept && styles.modalItemTextActive]}>{dept}</Text>
                  {selectedDept === dept && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Teacher Modal - CENTERED */}
      <Modal visible={teacherModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Teacher</Text>
              <TouchableOpacity onPress={() => { setTeacherModalVisible(false); setTeacherSearch(''); }}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color="#666" />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search teacher name..." 
                placeholderTextColor="#999"
                value={teacherSearch} 
                onChangeText={setTeacherSearch} 
              />
              {teacherSearch.length > 0 && (
                <TouchableOpacity onPress={() => setTeacherSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={[styles.modalItem, !selectedTeacher && styles.modalItemActive]} 
                onPress={() => { setSelectedTeacher(''); setTeacherModalVisible(false); setTeacherSearch(''); }}
              >
                <Text style={[styles.modalItemText, !selectedTeacher && styles.modalItemTextActive]}>All Teachers</Text>
                {!selectedTeacher && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
              </TouchableOpacity>
              {filteredTeachers.length === 0 ? (
                <View style={styles.emptyModal}>
                  <Text style={styles.emptyModalText}>No teachers found</Text>
                </View>
              ) : (
                filteredTeachers.map((teacher: string) => (
                  <TouchableOpacity 
                    key={teacher} 
                    style={[styles.modalItem, selectedTeacher === teacher && styles.modalItemActive]} 
                    onPress={() => { setSelectedTeacher(teacher); setTeacherModalVisible(false); setTeacherSearch(''); }}
                  >
                    <Text style={[styles.modalItemText, selectedTeacher === teacher && styles.modalItemTextActive]}>{teacher}</Text>
                    {selectedTeacher === teacher && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal - CENTERED */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Attendance</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            {editingRecord && (
              <>
                <View style={styles.editInfo}>
                  <View style={styles.editInfoRow}>
                    <Text style={styles.editLabel}>Teacher:</Text>
                    <Text style={styles.editValue}>{editingRecord.teacher}</Text>
                  </View>
                  <View style={styles.editInfoRow}>
                    <Text style={styles.editLabel}>Date:</Text>
                    <Text style={styles.editValue}>{editingRecord.day}, {editingRecord.date}</Text>
                  </View>
                  <View style={styles.editInfoRow}>
                    <Text style={styles.editLabel}>Subject:</Text>
                    <Text style={styles.editValue}>{editingRecord.subject} ({editingRecord.code})</Text>
                  </View>
                </View>
                <Text style={styles.label}>New Status:</Text>
                <View style={styles.statusOptions}>
                  {['Present', 'Absent', 'Late'].map((status) => (
                    <TouchableOpacity 
                      key={status} 
                      style={[
                        styles.statusOption, 
                        editStatus === status && styles.statusOptionActive, 
                        { 
                          borderColor: status === 'Present' ? '#4CAF50' : status === 'Absent' ? '#F44336' : '#FF9800',
                          backgroundColor: editStatus === status 
                            ? (status === 'Present' ? '#4CAF50' : status === 'Absent' ? '#F44336' : '#FF9800')
                            : '#FFF'
                        }
                      ]} 
                      onPress={() => setEditStatus(status)}
                    >
                      <Text style={[styles.statusOptionText, editStatus === status && { color: '#FFF' }]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveEditAttendance}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 15, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  content: { padding: 15 },
  
  modeSelector: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#FFF', borderRadius: 10, padding: 4, elevation: 2 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#1A237E' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  modeTextActive: { color: '#FFF', fontWeight: '700' },
  
  filterCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  filterTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  clearText: { fontSize: 13, color: '#F44336', fontWeight: '600' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 14, marginBottom: 12, gap: 10 },
  filterBtnText: { fontSize: 14, color: '#333', fontWeight: '600', flex: 1 },
  filterRow: { flexDirection: 'row', gap: 10 },
  dateInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 12 },
  dateIcon: { marginRight: 8 },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#333' },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 5 },
  summaryText: { fontSize: 14, fontWeight: '700', color: '#666' },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectAllText: { fontSize: 14, fontWeight: '600', color: '#1A237E' },
  
  recordCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  checkbox: { marginRight: 10, justifyContent: 'center' },
  recordInfo: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  periodBadge: { backgroundColor: '#1A237E', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  periodText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: '#666', fontWeight: '600', flex: 1 },
  timeText: { fontSize: 11, color: '#888' },
  deptSemText: { fontSize: 13, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  teacherText: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 3 },
  subjectText: { fontSize: 12, color: '#555' },
  rightActions: { alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  editBtn: { padding: 8, marginTop: 10, backgroundColor: '#E3F2FD', borderRadius: 8 },
  
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 12, textAlign: 'center', fontWeight: '500' },
  
  stickyBottom: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFF', 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0', 
    elevation: 10,
    gap: 12
  },
  selectedCount: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  generateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A237E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  generateBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  
  // Centered Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    width: '100%', 
    maxWidth: 400,
    maxHeight: '85%'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  modalList: { maxHeight: 350 },
  modalItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 8 
  },
  modalItemActive: { backgroundColor: '#1A237E' },
  modalItemText: { fontSize: 15, color: '#333', fontWeight: '600' },
  modalItemTextActive: { color: '#FFF' },
  
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F5F5', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 14, color: '#333' },
  
  emptyModal: { alignItems: 'center', paddingVertical: 30 },
  emptyModalText: { fontSize: 14, color: '#999', fontWeight: '500' },
  
  editInfo: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, marginBottom: 20 },
  editInfoRow: { flexDirection: 'row', marginBottom: 6 },
  editLabel: { fontSize: 13, color: '#666', width: 80, fontWeight: '600' },
  editValue: { fontSize: 13, fontWeight: '700', color: '#333', flex: 1 },
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  statusOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statusOption: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  statusOptionActive: {},
  statusOptionText: { fontSize: 13, fontWeight: '700', color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '700' },
  saveBtn: { backgroundColor: '#4CAF50' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});