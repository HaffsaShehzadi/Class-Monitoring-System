import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AVAILABLE_DEPARTMENTS } from './SharedData';
const DEPTS = typeof AVAILABLE_DEPARTMENTS !== 'undefined' ? AVAILABLE_DEPARTMENTS : ['IT', 'BSCS', 'Math', 'Physics', 'English', 'Urdu'];

const ALL_TEACHERS = ['Hafiz Abdul Rehman', 'Mohsin Raza', 'Hasan Raza', 'Asif Iqbal', 'Ahmad Ali', 'Hira Afzal', 'M. Kamran'];

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:30 - 10:15' },
  { id: 3, time: '10:30 - 11:15' },
  { id: 4, time: '11:30 - 12:15' },
  { id: 5, time: '12:30 - 01:15' },
  { id: 6, time: '14:00 - 14:45' },
  { id: 7, time: '15:00 - 15:45' },
];

const SEMESTERS = ['2nd', '4th', '6th', '8th'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Mock Attendance Data
const MOCK_ATTENDANCE = [
  { id: 1, date: '2024-06-01', dept: 'IT', sem: '2nd', day: 'Monday', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', status: 'Present' },
  { id: 2, date: '2024-06-01', dept: 'IT', sem: '2nd', day: 'Monday', period: 2, teacher: 'Mohsin Raza', code: 'GENG-201', status: 'Absent' },
  { id: 3, date: '2024-06-01', dept: 'IT', sem: '4th', day: 'Monday', period: 1, teacher: 'Hasan Raza', code: 'CC-213L', status: 'Late' },
  { id: 4, date: '2024-06-01', dept: 'BSCS', sem: '2nd', day: 'Monday', period: 1, teacher: 'Asif Iqbal', code: 'GISL-101', status: 'Present' },
  { id: 5, date: '2024-06-02', dept: 'IT', sem: '2nd', day: 'Tuesday', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', status: 'Present' },
  { id: 6, date: '2024-06-03', dept: 'IT', sem: '2nd', day: 'Wednesday', period: 2, teacher: 'Mohsin Raza', code: 'GENG-201', status: 'Late' },
];

export default function AttendanceHistoryReport({ onBack, userRole }: any) {
  const [viewMode, setViewMode] = useState<'department' | 'teacher'>('department');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const [showHistory, setShowHistory] = useState(false);
  
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  
  const isAdmin = userRole === 'admin';

  const filteredAttendance = useMemo(() => {
    return MOCK_ATTENDANCE.filter(item => {
      const matchDept = viewMode === 'department' ? item.dept === selectedDept : true;
      const matchTeacher = viewMode === 'teacher' ? item.teacher === selectedTeacher : true;
      const matchStart = startDate ? item.date >= startDate : true;
      const matchEnd = endDate ? item.date <= endDate : true;
      return matchDept && matchTeacher && matchStart && matchEnd;
    });
  }, [selectedDept, selectedTeacher, startDate, endDate, viewMode]);

  const getAttendance = (sem: string, periodId: number) => {
    return filteredAttendance.find(a => a.sem === sem && a.period === periodId && a.day === selectedDay);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Present') return '#4CAF50';
    if (status === 'Absent') return '#F44336';
    if (status === 'Late') return '#FF9800';
    return '#E0E0E0';
  };

  const handleCellPress = (record: any) => {
    if (!record) return;
    if (!isAdmin) {
      Alert.alert('Info', `Status: ${record.status}\nTeacher: ${record.teacher}`);
      return;
    }
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditModalVisible(true);
  };

  const saveEditAttendance = () => {
    Alert.alert('✅ Attendance Updated', `${editingRecord.teacher}'s status changed to ${editStatus}`, [
      { text: 'OK', onPress: () => setEditModalVisible(false) }
    ]);
  };

  const handleShowHistory = () => {
    if (viewMode === 'department' && !selectedDept) {
      Alert.alert('⚠️ Error', 'Please select a department');
      return;
    }
    if (viewMode === 'teacher' && !selectedTeacher) {
      Alert.alert('⚠️ Error', 'Please select a teacher');
      return;
    }
    setShowHistory(true);
  };

  const handleExportPDF = () => {
    const reportType = viewMode === 'department' ? selectedDept : selectedTeacher;
    Alert.alert('✅ Report Generated', `PDF report for ${reportType} from ${startDate || 'all dates'} to ${endDate || 'all dates'} downloaded successfully.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity 
          style={[styles.modeBtn, viewMode === 'department' && styles.modeBtnActive]} 
          onPress={() => { setViewMode('department'); setShowHistory(false); }}
        >
          <Text style={[styles.modeText, viewMode === 'department' && styles.modeTextActive]}>Department Wise</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeBtn, viewMode === 'teacher' && styles.modeBtnActive]} 
          onPress={() => { setViewMode('teacher'); setShowHistory(false); }}
        >
          <Text style={[styles.modeText, viewMode === 'teacher' && styles.modeTextActive]}>Teacher Wise</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {viewMode === 'department' ? (
          <TouchableOpacity style={styles.filterBtn} onPress={() => setDeptModalVisible(true)}>
            <MaterialCommunityIcons name="school-outline" size={20} color="#1A237E" />
            <Text style={styles.filterBtnText}>{selectedDept || 'Select Department'}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.filterBtn} onPress={() => setTeacherModalVisible(true)}>
            <MaterialCommunityIcons name="account-tie" size={20} color="#1A237E" />
            <Text style={styles.filterBtnText}>{selectedTeacher || 'Select Teacher'}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        )}
        
        <View style={styles.dateRow}>
          <View style={styles.dateInputWrapper}>
            <MaterialCommunityIcons name="calendar-start" size={18} color="#1A237E" />
            <TextInput 
              style={styles.dateInput} 
              placeholder="Start Date" 
              value={startDate} 
              onChangeText={setStartDate} 
            />
          </View>
          <View style={styles.dateInputWrapper}>
            <MaterialCommunityIcons name="calendar-end" size={18} color="#1A237E" />
            <TextInput 
              style={styles.dateInput} 
              placeholder="End Date" 
              value={endDate} 
              onChangeText={setEndDate} 
            />
          </View>
        </View>

        <TouchableOpacity style={styles.showBtn} onPress={handleShowHistory}>
          <MaterialCommunityIcons name="magnify" size={20} color="#FFF" />
          <Text style={styles.showBtnText}>Show History</Text>
        </TouchableOpacity>
      </View>

      {/* History Grid - Only show after clicking Show History */}
      {showHistory && (
        <>
          {/* Day Selector */}
          <View style={styles.daySelectorWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {DAYS.map(day => (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Grid View */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScrollView}>
            <ScrollView showsVerticalScrollIndicator={true} style={styles.verticalScroll}>
              <View style={styles.grid}>
                {/* Header Row */}
                <View style={styles.row}>
                  <View style={styles.cornerCell}>
                    <Text style={styles.cornerText}>Sem / Period</Text>
                  </View>
                  {PERIODS.map(p => (
                    <View key={p.id} style={styles.periodHeaderCell}>
                      <Text style={styles.periodNum}>P{p.id}</Text>
                      <Text style={styles.periodTime}>{p.time}</Text>
                    </View>
                  ))}
                </View>

                {/* Data Rows */}
                {SEMESTERS.map(sem => (
                  <View key={sem} style={styles.row}>
                    <View style={styles.deptSemCell}>
                      <Text style={styles.deptText}>{viewMode === 'department' ? selectedDept : 'All'}</Text>
                      <Text style={styles.semText}>{sem}</Text>
                    </View>
                    
                    {PERIODS.map(p => {
                      const record = getAttendance(sem, p.id);
                      return (
                        <TouchableOpacity 
                          key={p.id} 
                          style={[
                            styles.dataCell, 
                            record ? { backgroundColor: '#FFF' } : styles.emptyCell
                          ]}
                          onPress={() => handleCellPress(record)}
                          activeOpacity={0.7}
                          disabled={!record}
                        >
                          {record ? (
                            <View style={styles.cellContent}>
                              <Text style={styles.cellTeacher} numberOfLines={1}>{record.teacher}</Text>
                              <Text style={styles.cellCode} numberOfLines={1}>{record.code}</Text>
                              <TouchableOpacity 
                                style={[styles.statusButton, { backgroundColor: getStatusColor(record.status) }]}
                                onPress={() => handleCellPress(record)}
                              >
                                <Text style={styles.statusText}>{record.status}</Text>
                              </TouchableOpacity>
                              {isAdmin && (
                                <MaterialCommunityIcons name="pencil" size={12} color="#1A237E" style={{ marginTop: 4 }} />
                              )}
                            </View>
                          ) : (
                            <Text style={styles.emptyText}>No Class</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>

          {/* Generate PDF Button */}
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportPDF}>
            <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FFF" />
            <Text style={styles.exportBtnText}>Generate PDF Report</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Department Modal */}
      <Modal visible={deptModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Department</Text>
              <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
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

      {/* Teacher Modal */}
      <Modal visible={teacherModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Teacher</Text>
              <TouchableOpacity onPress={() => setTeacherModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {ALL_TEACHERS.map((teacher: string) => (
                <TouchableOpacity 
                  key={teacher} 
                  style={[styles.modalItem, selectedTeacher === teacher && styles.modalItemActive]} 
                  onPress={() => { setSelectedTeacher(teacher); setTeacherModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, selectedTeacher === teacher && styles.modalItemTextActive]}>{teacher}</Text>
                  {selectedTeacher === teacher && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
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
                  <Text style={styles.editLabel}>Teacher:</Text>
                  <Text style={styles.editValue}>{editingRecord.teacher}</Text>
                  <Text style={styles.editLabel}>Subject:</Text>
                  <Text style={styles.editValue}>{editingRecord.code}</Text>
                  <Text style={styles.editLabel}>Date:</Text>
                  <Text style={styles.editValue}>{editingRecord.date}</Text>
                </View>
                <Text style={styles.label}>Update Status:</Text>
                <View style={styles.statusOptions}>
                  {['Present', 'Absent', 'Late'].map((status) => (
                    <TouchableOpacity 
                      key={status} 
                      style={[
                        styles.statusOption, 
                        editStatus === status && styles.statusOptionActive, 
                        { borderColor: getStatusColor(status), backgroundColor: editStatus === status ? getStatusColor(status) : '#FFF' }
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
                    <Text style={styles.saveBtnText}>Save</Text>
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
  header: { 
    backgroundColor: '#1A237E', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  
  modeSelector: { 
    flexDirection: 'row', 
    margin: 15, 
    marginBottom: 10,
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    padding: 4, 
    elevation: 2 
  },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#1A237E' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  modeTextActive: { color: '#FFF', fontWeight: '700' },
  
  filterContainer: { 
    padding: 15, 
    paddingTop: 0,
    gap: 10,
  },
  filterBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 10, 
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8
  },
  filterBtnText: { fontSize: 14, color: '#1A237E', fontWeight: '700', flex: 1 },
  
  dateRow: { flexDirection: 'row', gap: 10 },
  dateInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8
  },
  dateInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#333' },

  showBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A237E',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    elevation: 3,
  },
  showBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  daySelectorWrapper: { 
    backgroundColor: '#FFF', 
    paddingVertical: 12, 
    paddingHorizontal: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0',
    marginTop: 10,
  },
  dayBtn: { 
    paddingHorizontal: 22, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: '#ECEFF1', 
    marginRight: 10, 
    minWidth: 100, 
    alignItems: 'center' 
  },
  dayBtnActive: { backgroundColor: '#1A237E' },
  dayText: { fontSize: 13, fontWeight: '700', color: '#546E7A' },
  dayTextActive: { color: '#FFF', fontWeight: '800' },

  gridScrollView: { flex: 1 },
  verticalScroll: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  
  periodHeaderCell: { width: 115, height: 55, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginTop: 2 },
  
  deptSemCell: { width: 90, minHeight: 100, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  
  dataCell: { width: 115, minHeight: 100, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 6 },
  emptyCell: { backgroundColor: '#FAFAFA' },
  emptyText: { fontSize: 10, color: '#B0BEC5', fontWeight: '600' },
  
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  cellTeacher: { fontSize: 10, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 2 },
  cellCode: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginBottom: 4 },
  
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    margin: 15,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    elevation: 3,
  },
  exportBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  modalList: { maxHeight: 250, marginBottom: 15 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 8 },
  modalItemActive: { backgroundColor: '#1A237E' },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalItemTextActive: { color: '#FFF' },
  
  editInfo: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginBottom: 15 },
  editLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 5 },
  editValue: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  statusOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statusOption: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
  statusOptionActive: {},
  statusOptionText: { fontSize: 14, fontWeight: '700', color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '700' },
  saveBtn: { backgroundColor: '#4CAF50' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});