import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AVAILABLE_DEPARTMENTS } from './SharedData';
const DEPTS = typeof AVAILABLE_DEPARTMENTS !== 'undefined' ? AVAILABLE_DEPARTMENTS : ['IT', 'BSCS', 'Math', 'Physics', 'English', 'Urdu'];

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:30 - 10:15' },
  { id: 3, time: '10:30 - 11:15' },
  { id: 4, time: '11:30 - 12:15' },
  { id: 5, time: '12:30 - 01:15' },
  { id: 6, time: '02:00 - 02:45' },
  { id: 7, time: '03:00 - 03:45' },
];

const SEMESTERS = ['2nd', '4th', '6th', '8th'];

// Mock Attendance Data
const MOCK_ATTENDANCE = [
  { id: 1, date: '2024-06-01', dept: 'IT', sem: '2nd', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', status: 'Present' },
  { id: 2, date: '2024-06-01', dept: 'IT', sem: '2nd', period: 2, teacher: 'Mohsin Raza', code: 'GENG-201', status: 'Absent' },
  { id: 3, date: '2024-06-01', dept: 'IT', sem: '4th', period: 1, teacher: 'Hasan Raza', code: 'CC-213L', status: 'Late' },
  { id: 4, date: '2024-06-01', dept: 'BSCS', sem: '2nd', period: 1, teacher: 'Asif Iqbal', code: 'GISL-101', status: 'Present' },
  { id: 5, date: '2024-06-01', dept: 'BSCS', sem: '4th', period: 2, teacher: 'Ahmad Ali', code: 'CS-202', status: 'Present' },
  { id: 6, date: '2024-06-02', dept: 'IT', sem: '2nd', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', status: 'Present' },
];

export default function AttendanceHistoryReport({ onBack, userRole }: any) {
  const [selectedDate, setSelectedDate] = useState('2024-06-01');
  const [selectedDept, setSelectedDept] = useState('IT');
  
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  
  const isAdmin = userRole === 'admin';

  const filteredAttendance = useMemo(() => {
    return MOCK_ATTENDANCE.filter(item => 
      item.date === selectedDate && item.dept === selectedDept
    );
  }, [selectedDate, selectedDept]);

  const getAttendance = (sem: string, periodId: number) => {
    return filteredAttendance.find(a => a.sem === sem && a.period === periodId);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Present') return '#4CAF50';
    if (status === 'Absent') return '#F44336';
    if (status === 'Late') return '#FF9800';
    return '#E0E0E0';
  };

  const getStatusBgColor = (status: string) => {
    if (status === 'Present') return '#E8F5E9';
    if (status === 'Absent') return '#FFEBEE';
    if (status === 'Late') return '#FFF3E0';
    return '#FAFAFA';
  };

  const handleCellPress = (record: any) => {
    if (!record) return; // Empty cell
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

  const handleExportPDF = () => {
    Alert.alert('✅ Report Generated', `PDF report for ${selectedDept} on ${selectedDate} downloaded successfully.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <TouchableOpacity onPress={handleExportPDF}>
          <MaterialCommunityIcons name="file-pdf-box" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setDeptModalVisible(true)}>
          <MaterialCommunityIcons name="school-outline" size={20} color="#1A237E" />
          <Text style={styles.filterBtnText}>{selectedDept} Dept</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.dateInputWrapper}>
          <MaterialCommunityIcons name="calendar" size={20} color="#1A237E" />
          <TextInput 
            style={styles.dateInput} 
            placeholder="YYYY-MM-DD" 
            value={selectedDate} 
            onChangeText={setSelectedDate} 
          />
        </View>
      </View>

      {/* Grid View (Same as Timetable) */}
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
                  <Text style={styles.deptText}>{selectedDept}</Text>
                  <Text style={styles.semText}>{sem}</Text>
                </View>
                
                {PERIODS.map(p => {
                  const record = getAttendance(sem, p.id);
                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[
                        styles.dataCell, 
                        record ? { backgroundColor: getStatusBgColor(record.status) } : styles.emptyCell
                      ]}
                      onPress={() => handleCellPress(record)}
                      activeOpacity={0.7}
                      disabled={!record}
                    >
                      {record ? (
                        <View style={styles.cellContent}>
                          <Text style={styles.cellTeacher} numberOfLines={1}>{record.teacher}</Text>
                          <Text style={styles.cellCode} numberOfLines={1}>{record.code}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
                            <Text style={styles.statusText}>{record.status}</Text>
                          </View>
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
  
  filterContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    gap: 10, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  filterBtn: { 
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F5F5', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  filterBtnText: { fontSize: 14, color: '#1A237E', fontWeight: '700', flex: 1 },
  dateInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8
  },
  dateInput: { flex: 1, paddingVertical: 8, fontSize: 14, color: '#333' },

  gridScrollView: { flex: 1 },
  verticalScroll: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  
  periodHeaderCell: { width: 115, height: 55, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginTop: 2 },
  
  deptSemCell: { width: 90, minHeight: 90, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  
  dataCell: { width: 115, minHeight: 90, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 6 },
  emptyCell: { backgroundColor: '#FAFAFA' },
  emptyText: { fontSize: 10, color: '#B0BEC5', fontWeight: '600' },
  
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  cellTeacher: { fontSize: 10, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 2 },
  cellCode: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  
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